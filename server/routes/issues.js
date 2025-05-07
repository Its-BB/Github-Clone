const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const Repository = require('../models/Repository');
const { auth, repoAccess, repoWriteAccess } = require('../middleware/auth');

// Get repository issues
router.get('/:owner/:repo', async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const { state = 'open', page = 1, limit = 10, sort = '-createdAt' } = req.query;

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

        const issues = await Issue.find({
            repository: repository._id,
            state
        })
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('author', 'username avatar')
            .populate('assignees', 'username avatar')
            .exec();

        const count = await Issue.countDocuments({
            repository: repository._id,
            state
        });

        res.json({
            issues,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new issue
router.post('/:owner/:repo', auth, repoAccess, async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const { title, description, assignees, labels, milestone } = req.body;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        const issue = new Issue({
            title,
            description,
            repository: repository._id,
            author: req.user._id,
            assignees,
            labels,
            milestone
        });

        await issue.save();

        // Populate author and assignees
        await issue.populate('author', 'username avatar');
        await issue.populate('assignees', 'username avatar');

        res.status(201).json({ issue });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get issue by number
router.get('/:owner/:repo/issues/:number', async (req, res) => {
    try {
        const { owner, repo, number } = req.params;

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

        const issue = await Issue.findOne({
            repository: repository._id,
            number
        })
            .populate('author', 'username avatar')
            .populate('assignees', 'username avatar')
            .populate('comments.author', 'username avatar')
            .exec();

        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        res.json({ issue });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update issue
router.patch('/:owner/:repo/issues/:number', auth, repoAccess, async (req, res) => {
    try {
        const { owner, repo, number } = req.params;
        const updates = Object.keys(req.body);
        const allowedUpdates = ['title', 'description', 'state', 'assignees', 'labels', 'milestone'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates' });
        }

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        const issue = await Issue.findOne({
            repository: repository._id,
            number
        });

        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        // Check if user has permission to update
        if (issue.author.toString() !== req.user._id.toString() &&
            !repository.hasWriteAccess(req.user._id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        updates.forEach(update => issue[update] = req.body[update]);

        if (req.body.state === 'closed') {
            issue.closedAt = new Date();
            issue.closedBy = req.user._id;
        } else if (req.body.state === 'open') {
            issue.closedAt = undefined;
            issue.closedBy = undefined;
        }

        await issue.save();

        res.json({ issue });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add comment to issue
router.post('/:owner/:repo/issues/:number/comments', auth, repoAccess, async (req, res) => {
    try {
        const { owner, repo, number } = req.params;
        const { content } = req.body;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        const issue = await Issue.findOne({
            repository: repository._id,
            number
        });

        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        await issue.addComment(req.user._id, content);

        // Populate the new comment's author
        await issue.populate('comments.author', 'username avatar');

        res.json({ issue });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add reaction to issue
router.post('/:owner/:repo/issues/:number/reactions', auth, repoAccess, async (req, res) => {
    try {
        const { owner, repo, number } = req.params;
        const { type } = req.body;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        const issue = await Issue.findOne({
            repository: repository._id,
            number
        });

        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        await issue.addReaction(req.user._id, type);

        res.json({ issue });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add reaction to comment
router.post('/:owner/:repo/issues/:number/comments/:commentId/reactions', auth, repoAccess, async (req, res) => {
    try {
        const { owner, repo, number, commentId } = req.params;
        const { type } = req.body;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        const issue = await Issue.findOne({
            repository: repository._id,
            number
        });

        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        const comment = issue.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const existingReaction = comment.reactions.find(
            reaction => reaction.user.toString() === req.user._id.toString() && reaction.type === type
        );

        if (existingReaction) {
            comment.reactions = comment.reactions.filter(
                reaction => !(reaction.user.toString() === req.user._id.toString() && reaction.type === type)
            );
        } else {
            comment.reactions.push({
                user: req.user._id,
                type
            });
        }

        await issue.save();

        res.json({ issue });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Lock issue
router.post('/:owner/:repo/issues/:number/lock', auth, repoWriteAccess, async (req, res) => {
    try {
        const { owner, repo, number } = req.params;
        const { lockReason } = req.body;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        const issue = await Issue.findOne({
            repository: repository._id,
            number
        });

        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        issue.isLocked = true;
        issue.lockReason = lockReason;
        await issue.save();

        res.json({ issue });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Unlock issue
router.post('/:owner/:repo/issues/:number/unlock', auth, repoWriteAccess, async (req, res) => {
    try {
        const { owner, repo, number } = req.params;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        const issue = await Issue.findOne({
            repository: repository._id,
            number
        });

        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        issue.isLocked = false;
        issue.lockReason = null;
        await issue.save();

        res.json({ issue });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 