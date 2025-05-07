const express = require('express');
const router = express.Router();
const Commit = require('../models/Commit');
const Repository = require('../models/Repository');
const { auth, repoAccess } = require('../middleware/auth');

// Get repository commits
router.get('/:owner/:repo', async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const { branch = 'main', page = 1, limit = 10 } = req.query;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        if (repository.isPrivate && (!req.user || !repository.hasAccess(req.user._id))) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const commits = await Commit.find({
            repository: repository._id,
            branch
        })
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('author', 'username avatar')
            .exec();

        const count = await Commit.countDocuments({
            repository: repository._id,
            branch
        });

        res.json({
            commits,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get commit by hash
router.get('/:owner/:repo/commits/:hash', async (req, res) => {
    try {
        const { owner, repo, hash } = req.params;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        if (repository.isPrivate && (!req.user || !repository.hasAccess(req.user._id))) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const commit = await Commit.findOne({
            repository: repository._id,
            hash
        })
            .populate('author', 'username avatar')
            .populate('parents.author', 'username avatar')
            .exec();

        if (!commit) {
            return res.status(404).json({ error: 'Commit not found' });
        }

        res.json({ commit });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new commit
router.post('/:owner/:repo/commits', auth, repoAccess, async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const {
            message,
            branch,
            files,
            parentHashes
        } = req.body;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        // Generate commit hash (in a real implementation, this would be more complex)
        const hash = require('crypto')
            .createHash('sha1')
            .update(message + Date.now().toString())
            .digest('hex');

        const commit = new Commit({
            hash,
            message,
            repository: repository._id,
            author: req.user._id,
            branch,
            files,
            parentHashes,
            timestamp: new Date()
        });

        await commit.save();

        // Populate author information
        await commit.populate('author', 'username avatar');

        res.status(201).json({ commit });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get commit diff
router.get('/:owner/:repo/commits/:hash/diff', async (req, res) => {
    try {
        const { owner, repo, hash } = req.params;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        if (repository.isPrivate && (!req.user || !repository.hasAccess(req.user._id))) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const commit = await Commit.findOne({
            repository: repository._id,
            hash
        });

        if (!commit) {
            return res.status(404).json({ error: 'Commit not found' });
        }

        // In a real implementation, this would calculate the actual diff
        // For now, we'll just return the files that were changed
        const diff = commit.files.map(file => ({
            path: file.path,
            status: file.status,
            additions: file.additions,
            deletions: file.deletions,
            changes: file.changes
        }));

        res.json({ diff });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get commit comments
router.get('/:owner/:repo/commits/:hash/comments', async (req, res) => {
    try {
        const { owner, repo, hash } = req.params;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        if (repository.isPrivate && (!req.user || !repository.hasAccess(req.user._id))) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const commit = await Commit.findOne({
            repository: repository._id,
            hash
        })
            .populate('comments.author', 'username avatar')
            .exec();

        if (!commit) {
            return res.status(404).json({ error: 'Commit not found' });
        }

        res.json({ comments: commit.comments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add comment to commit
router.post('/:owner/:repo/commits/:hash/comments', auth, repoAccess, async (req, res) => {
    try {
        const { owner, repo, hash } = req.params;
        const { content, line, path } = req.body;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        const commit = await Commit.findOne({
            repository: repository._id,
            hash
        });

        if (!commit) {
            return res.status(404).json({ error: 'Commit not found' });
        }

        commit.comments.push({
            author: req.user._id,
            content,
            line,
            path,
            timestamp: new Date()
        });

        await commit.save();

        // Populate the new comment's author
        await commit.populate('comments.author', 'username avatar');

        res.json({ commit });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get commit status
router.get('/:owner/:repo/commits/:hash/status', async (req, res) => {
    try {
        const { owner, repo, hash } = req.params;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        if (repository.isPrivate && (!req.user || !repository.hasAccess(req.user._id))) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const commit = await Commit.findOne({
            repository: repository._id,
            hash
        });

        if (!commit) {
            return res.status(404).json({ error: 'Commit not found' });
        }

        res.json({ status: commit.status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update commit status
router.patch('/:owner/:repo/commits/:hash/status', auth, repoAccess, async (req, res) => {
    try {
        const { owner, repo, hash } = req.params;
        const { status, context, description, targetUrl } = req.body;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        const commit = await Commit.findOne({
            repository: repository._id,
            hash
        });

        if (!commit) {
            return res.status(404).json({ error: 'Commit not found' });
        }

        // Update or add status
        const existingStatus = commit.status.find(s => s.context === context);
        if (existingStatus) {
            existingStatus.status = status;
            existingStatus.description = description;
            existingStatus.targetUrl = targetUrl;
            existingStatus.updatedAt = new Date();
        } else {
            commit.status.push({
                context,
                status,
                description,
                targetUrl,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        await commit.save();

        res.json({ commit });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 