const mongoose = require('mongoose');

const commitSchema = new mongoose.Schema({
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
    committer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true,
        unique: true
    },
    parentHashes: [{
        type: String
    }],
    branch: {
        type: String,
        required: true
    },
    files: [{
        path: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['added', 'modified', 'deleted', 'renamed'],
            required: true
        },
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
        },
        patch: String
    }],
    stats: {
        total: {
            type: Number,
            default: 0
        },
        additions: {
            type: Number,
            default: 0
        },
        deletions: {
            type: Number,
            default: 0
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationReason: String,
    signature: String,
    tags: [{
        name: String,
        message: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes
commitSchema.index({ repository: 1, hash: 1 }, { unique: true });
commitSchema.index({ author: 1 });
commitSchema.index({ committer: 1 });
commitSchema.index({ branch: 1 });
commitSchema.index({ 'files.path': 1 });

// Virtual for short hash
commitSchema.virtual('shortHash').get(function () {
    return this.hash.substring(0, 7);
});

// Method to get commit diff
commitSchema.methods.getDiff = function () {
    return this.files.map(file => ({
        path: file.path,
        status: file.status,
        patch: file.patch
    }));
};

// Method to get commit stats
commitSchema.methods.getStats = function () {
    return {
        total: this.stats.total,
        additions: this.stats.additions,
        deletions: this.stats.deletions
    };
};

// Method to add a tag
commitSchema.methods.addTag = async function (name, message) {
    this.tags.push({
        name,
        message,
        createdAt: new Date()
    });
    return this.save();
};

// Method to remove a tag
commitSchema.methods.removeTag = async function (name) {
    this.tags = this.tags.filter(tag => tag.name !== name);
    return this.save();
};

const Commit = mongoose.model('Commit', commitSchema);

module.exports = Commit; 