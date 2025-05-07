const express = require('express');
const router = express.Router();
const Repository = require('../models/Repository');
const { auth, repoAccess, repoWriteAccess, repoAdminAccess } = require('../middleware/auth');

// Get all public repositories
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt', language, topic } = req.query;
        const query = { isPrivate: false };

        if (language) {
            query.language = language;
        }

        if (topic) {
            query.topics = topic;
        }

        const repositories = await Repository.find(query)
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('owner', 'username avatar')
            .exec();

        const count = await Repository.countDocuments(query);

        res.json({
            repositories,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's repositories
router.get('/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

        const repositories = await Repository.find({ 'owner.username': username })
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('owner', 'username avatar')
            .exec();

        const count = await Repository.countDocuments({ 'owner.username': username });

        res.json({
            repositories,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new repository
router.post('/', auth, async (req, res) => {
    try {
        const { name, description, isPrivate, license } = req.body;

        // Check if repository name is available
        const existingRepo = await Repository.findOne({
            owner: req.user._id,
            name
        });

        if (existingRepo) {
            return res.status(400).json({ error: 'Repository name already exists' });
        }

        const repository = new Repository({
            name,
            description,
            isPrivate,
            license,
            owner: req.user._id,
            defaultBranch: 'main',
            branches: [{
                name: 'main',
                commit: null
            }]
        });

        await repository.save();

        res.status(201).json({ repository });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get repository by owner and name
router.get('/:owner/:name', async (req, res) => {
    try {
        const { owner, name } = req.params;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name
        })
            .populate('owner', 'username avatar bio')
            .populate('collaborators.user', 'username avatar')
            .exec();

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        // Check if user has access
        if (repository.isPrivate && (!req.user || !repository.hasAccess(req.user._id))) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({ repository });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update repository
router.patch('/:owner/:name', auth, repoAdminAccess, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description', 'isPrivate', 'license', 'topics'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
        updates.forEach(update => req.repository[update] = req.body[update]);
        await req.repository.save();
        res.json({ repository: req.repository });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete repository
router.delete('/:owner/:name', auth, repoAdminAccess, async (req, res) => {
    try {
        await req.repository.remove();
        res.json({ message: 'Repository deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Star repository
router.post('/:owner/:name/star', auth, async (req, res) => {
    try {
        const repository = await Repository.findOne({
            'owner.username': req.params.owner,
            name: req.params.name
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        const hasStarred = repository.stars.includes(req.user._id);

        if (hasStarred) {
            repository.stars = repository.stars.filter(
                star => star.toString() !== req.user._id.toString()
            );
        } else {
            repository.stars.push(req.user._id);
        }

        await repository.save();

        res.json({ starred: !hasStarred });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fork repository
router.post('/:owner/:name/fork', auth, async (req, res) => {
    try {
        const originalRepo = await Repository.findOne({
            'owner.username': req.params.owner,
            name: req.params.name
        });

        if (!originalRepo) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        if (originalRepo.isPrivate && !originalRepo.hasAccess(req.user._id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Check if user has already forked this repository
        const existingFork = await Repository.findOne({
            owner: req.user._id,
            'forks.originalRepo': originalRepo._id
        });

        if (existingFork) {
            return res.status(400).json({ error: 'Repository already forked' });
        }

        const fork = new Repository({
            name: originalRepo.name,
            description: originalRepo.description,
            owner: req.user._id,
            isPrivate: false,
            defaultBranch: originalRepo.defaultBranch,
            branches: originalRepo.branches,
            topics: originalRepo.topics,
            license: originalRepo.license,
            forks: [{
                originalRepo: originalRepo._id,
                forkedBy: req.user._id
            }]
        });

        await fork.save();

        res.status(201).json({ repository: fork });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add collaborator
router.post('/:owner/:name/collaborators', auth, repoAdminAccess, async (req, res) => {
    try {
        const { username, role } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existingCollab = req.repository.collaborators.find(
            collab => collab.user.toString() === user._id.toString()
        );

        if (existingCollab) {
            existingCollab.role = role;
        } else {
            req.repository.collaborators.push({
                user: user._id,
                role
            });
        }

        await req.repository.save();

        res.json({ repository: req.repository });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Remove collaborator
router.delete('/:owner/:name/collaborators/:username', auth, repoAdminAccess, async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        req.repository.collaborators = req.repository.collaborators.filter(
            collab => collab.user.toString() !== user._id.toString()
        );

        await req.repository.save();

        res.json({ repository: req.repository });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get repository branches
router.get('/:owner/:name/branches', async (req, res) => {
    try {
        const repository = await Repository.findOne({
            'owner.username': req.params.owner,
            name: req.params.name
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        if (repository.isPrivate && (!req.user || !repository.hasAccess(req.user._id))) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({ branches: repository.branches });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new branch
router.post('/:owner/:name/branches', auth, repoWriteAccess, async (req, res) => {
    try {
        const { name, sourceBranch } = req.body;

        const existingBranch = req.repository.branches.find(
            branch => branch.name === name
        );

        if (existingBranch) {
            return res.status(400).json({ error: 'Branch already exists' });
        }

        const sourceBranchData = req.repository.branches.find(
            branch => branch.name === sourceBranch
        );

        if (!sourceBranchData) {
            return res.status(404).json({ error: 'Source branch not found' });
        }

        req.repository.branches.push({
            name,
            commit: sourceBranchData.commit
        });

        await req.repository.save();

        res.status(201).json({ branch: { name, commit: sourceBranchData.commit } });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete branch
router.delete('/:owner/:name/branches/:branch', auth, repoWriteAccess, async (req, res) => {
    try {
        const { branch } = req.params;

        if (branch === req.repository.defaultBranch) {
            return res.status(400).json({ error: 'Cannot delete default branch' });
        }

        req.repository.branches = req.repository.branches.filter(
            b => b.name !== branch
        );

        await req.repository.save();

        res.json({ message: 'Branch deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 