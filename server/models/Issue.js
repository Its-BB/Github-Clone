const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
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
    state: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
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
    reactions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        type: {
            type: String,
            enum: ['thumbsUp', 'thumbsDown'],
            required: true
        }
    }],
    linkedPullRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PullRequest'
    }],
    closedAt: Date,
    closedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
issueSchema.index({ repository: 1, number: 1 }, { unique: true });
issueSchema.index({ state: 1 });
issueSchema.index({ author: 1 });
issueSchema.index({ assignees: 1 });
issueSchema.index({ labels: 1 });

// Virtual for issue number
issueSchema.virtual('number').get(function () {
    return this._id.toString().slice(-6);
});

// Method to add a comment
issueSchema.methods.addComment = async function (userId, content) {
    this.comments.push({
        author: userId,
        content,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    return this.save();
};

// Method to add a reaction
issueSchema.methods.addReaction = async function (userId, type) {
    const existingReaction = this.reactions.find(
        reaction => reaction.user.toString() === userId.toString() && reaction.type === type
    );

    if (existingReaction) {
        this.reactions = this.reactions.filter(
            reaction => !(reaction.user.toString() === userId.toString() && reaction.type === type)
        );
    } else {
        this.reactions.push({ user: userId, type });
    }

    return this.save();
};

// Method to close issue
issueSchema.methods.close = async function (userId) {
    this.state = 'closed';
    this.closedAt = new Date();
    this.closedBy = userId;
    return this.save();
};

// Method to reopen issue
issueSchema.methods.reopen = async function () {
    this.state = 'open';
    this.closedAt = undefined;
    this.closedBy = undefined;
    return this.save();
};

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue; 