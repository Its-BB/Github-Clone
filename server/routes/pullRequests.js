const express = require('express');
const router = express.Router();
const PullRequest = require('../models/PullRequest');
const Repository = require('../models/Repository');
const { auth, repoAccess, repoWriteAccess } = require('../middleware/auth');

// Get repository pull requests
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

        const pullRequests = await PullRequest.find({
            repository: repository._id,
            state
        })
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('author', 'username avatar')
            .populate('assignees', 'username avatar')
            .exec();

        const count = await PullRequest.countDocuments({
            repository: repository._id,
            state
        });

        res.json({
            pullRequests,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new pull request
router.post('/:owner/:repo', auth, repoAccess, async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const {
            title,
            description,
            sourceBranch,
            targetBranch,
            sourceRepo,
            targetRepo,
            assignees,
            labels,
            milestone
        } = req.body;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        const pullRequest = new PullRequest({
            title,
            description,
            repository: repository._id,
            author: req.user._id,
            sourceBranch,
            targetBranch,
            sourceRepo,
            targetRepo,
            assignees,
            labels,
            milestone
        });

        await pullRequest.save();

        // Populate author and assignees
        await pullRequest.populate('author', 'username avatar');
        await pullRequest.populate('assignees', 'username avatar');

        res.status(201).json({ pullRequest });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get pull request by number
router.get('/:owner/:repo/pulls/:number', async (req, res) => {
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

        const pullRequest = await PullRequest.findOne({
            repository: repository._id,
            number
        })
            .populate('author', 'username avatar')
            .populate('assignees', 'username avatar')
            .populate('comments.author', 'username avatar')
            .populate('reviewers.user', 'username avatar')
            .exec();

        if (!pullRequest) {
            return res.status(404).json({ error: 'Pull request not found' });
        }

        res.json({ pullRequest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update pull request
router.patch('/:owner/:repo/pulls/:number', auth, repoAccess, async (req, res) => {
    try {
        const { owner, repo, number } = req.params;
        const updates = Object.keys(req.body);
        const allowedUpdates = [
            'title',
            'description',
            'state',
            'assignees',
            'labels',
            'milestone',
            'isDraft'
        ];
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

        const pullRequest = await PullRequest.findOne({
            repository: repository._id,
            number
        });

        if (!pullRequest) {
            return res.status(404).json({ error: 'Pull request not found' });
        }

        // Check if user has permission to update
        if (pullRequest.author.toString() !== req.user._id.toString() &&
            !repository.hasWriteAccess(req.user._id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        updates.forEach(update => pullRequest[update] = req.body[update]);

        if (req.body.state === 'closed') {
            pullRequest.closedAt = new Date();
            pullRequest.closedBy = req.user._id;
        } else if (req.body.state === 'open') {
            pullRequest.closedAt = undefined;
            pullRequest.closedBy = undefined;
        }

        await pullRequest.save();

        res.json({ pullRequest });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add comment to pull request
router.post('/:owner/:repo/pulls/:number/comments', auth, repoAccess, async (req, res) => {
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

        const pullRequest = await PullRequest.findOne({
            repository: repository._id,
            number
        });

        if (!pullRequest) {
            return res.status(404).json({ error: 'Pull request not found' });
        }

        await pullRequest.addComment(req.user._id, content);

        // Populate the new comment's author
        await pullRequest.populate('comments.author', 'username avatar');

        res.json({ pullRequest });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add review to pull request
router.post('/:owner/:repo/pulls/:number/reviews', auth, repoAccess, async (req, res) => {
    try {
        const { owner, repo, number } = req.params;
        const { status, comment } = req.body;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        const pullRequest = await PullRequest.findOne({
            repository: repository._id,
            number
        });

        if (!pullRequest) {
            return res.status(404).json({ error: 'Pull request not found' });
        }

        await pullRequest.addReview(req.user._id, status, comment);

        res.json({ pullRequest });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Merge pull request
router.post('/:owner/:repo/pulls/:number/merge', auth, repoWriteAccess, async (req, res) => {
    try {
        const { owner, repo, number } = req.params;

        const repository = await Repository.findOne({
            'owner.username': owner,
            name: repo
        });

        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        const pullRequest = await PullRequest.findOne({
            repository: repository._id,
            number
        });

        if (!pullRequest) {
            return res.status(404).json({ error: 'Pull request not found' });
        }

        if (pullRequest.state !== 'open') {
            return res.status(400).json({ error: 'Pull request is not open' });
        }

        // Check if all required reviewers have approved
        const requiredApprovals = repository.requiredReviewers || 1;
        const approvals = pullRequest.reviewers.filter(
            review => review.status === 'approved'
        ).length;

        if (approvals < requiredApprovals) {
            return res.status(400).json({
                error: `Pull request needs ${requiredApprovals} approvals to be merged`
            });
        }

        await pullRequest.merge(req.user._id);

        res.json({ pullRequest });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add reaction to pull request
router.post('/:owner/:repo/pulls/:number/reactions', auth, repoAccess, async (req, res) => {
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

        const pullRequest = await PullRequest.findOne({
            repository: repository._id,
            number
        });

        if (!pullRequest) {
            return res.status(404).json({ error: 'Pull request not found' });
        }

        const existingReaction = pullRequest.reactions.find(
            reaction => reaction.user.toString() === req.user._id.toString() && reaction.type === type
        );

        if (existingReaction) {
            pullRequest.reactions = pullRequest.reactions.filter(
                reaction => !(reaction.user.toString() === req.user._id.toString() && reaction.type === type)
            );
        } else {
            pullRequest.reactions.push({
                user: req.user._id,
                type
            });
        }

        await pullRequest.save();

        res.json({ pullRequest });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add reaction to comment
router.post('/:owner/:repo/pulls/:number/comments/:commentId/reactions', auth, repoAccess, async (req, res) => {
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

        const pullRequest = await PullRequest.findOne({
            repository: repository._id,
            number
        });

        if (!pullRequest) {
            return res.status(404).json({ error: 'Pull request not found' });
        }

        const comment = pullRequest.comments.id(commentId);

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

        await pullRequest.save();

        res.json({ pullRequest });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 