const mongoose = require('mongoose');

const pullRequestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true
    },
    repository: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repository',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sourceBranch: {
        type: String,
        required: true
    },
    targetBranch: {
        type: String,
        required: true
    },
    sourceRepo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repository',
        required: true
    },
    targetRepo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repository',
        required: true
    },
    state: {
        type: String,
        enum: ['open', 'closed', 'merged'],
        default: 'open'
    },
    reviewers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'changes_requested'],
            default: 'pending'
        },
        reviewComment: String,
        reviewedAt: Date
    }],
    assignees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    labels: [{
        name: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        description: String
    }],
    milestone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Milestone'
    },
    comments: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        reactions: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            type: {
                type: String,
                enum: ['+1', '-1', 'laugh', 'hooray', 'confused', 'heart', 'rocket', 'eyes'],
                required: true
            }
        }]
    }],
    commits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Commit'
    }],
    changedFiles: {
        additions: {
            type: Number,
            default: 0
        },
        deletions: {
            type: Number,
            default: 0
        },
        changes: {
            type: Number,
            default: 0
        }
    },
    mergedAt: Date,
    mergedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    closedAt: Date,
    closedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isDraft: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    lockReason: {
        type: String,
        enum: ['off-topic', 'too heated', 'resolved', 'spam', null],
        default: null
    }
}, {
    timestamps: true
});

// Indexes
pullRequestSchema.index({ repository: 1, number: 1 }, { unique: true });
pullRequestSchema.index({ state: 1 });
pullRequestSchema.index({ author: 1 });
pullRequestSchema.index({ assignees: 1 });
pullRequestSchema.index({ labels: 1 });

// Virtual for PR number
pullRequestSchema.virtual('number').get(function () {
    return this._id.toString().slice(-6);
});

// Method to add a comment
pullRequestSchema.methods.addComment = async function (userId, content) {
    this.comments.push({
        author: userId,
        content,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    return this.save();
};

// Method to add a review
pullRequestSchema.methods.addReview = async function (userId, status, comment) {
    const existingReview = this.reviewers.find(
        review => review.user.toString() === userId.toString()
    );

    if (existingReview) {
        existingReview.status = status;
        existingReview.reviewComment = comment;
        existingReview.reviewedAt = new Date();
    } else {
        this.reviewers.push({
            user: userId,
            status,
            reviewComment: comment,
            reviewedAt: new Date()
        });
    }

    return this.save();
};

// Method to merge PR
pullRequestSchema.methods.merge = async function (userId) {
    this.state = 'merged';
    this.mergedAt = new Date();
    this.mergedBy = userId;
    return this.save();
};

// Method to close PR
pullRequestSchema.methods.close = async function (userId) {
    this.state = 'closed';
    this.closedAt = new Date();
    this.closedBy = userId;
    return this.save();
};

// Method to reopen PR
pullRequestSchema.methods.reopen = async function () {
    this.state = 'open';
    this.closedAt = undefined;
    this.closedBy = undefined;
    return this.save();
};

const PullRequest = mongoose.model('PullRequest', pullRequestSchema);

module.exports = PullRequest; 