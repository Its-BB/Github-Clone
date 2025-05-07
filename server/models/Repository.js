const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    defaultBranch: {
        type: String,
        default: 'main'
    },
    branches: [{
        name: String,
        commit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Commit'
        }
    }],
    collaborators: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['read', 'write', 'admin'],
            default: 'read'
        }
    }],
    stars: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    forks: [{
        originalRepo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Repository'
        },
        forkedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        forkedAt: {
            type: Date,
            default: Date.now
        }
    }],
    topics: [{
        type: String,
        trim: true
    }],
    readme: {
        content: String,
        lastUpdated: Date
    },
    license: {
        type: String,
        enum: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'None'],
        default: 'None'
    },
    language: {
        type: String,
        default: 'Other'
    },
    size: {
        type: Number,
        default: 0
    },
    lastCommit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Commit'
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    isTemplate: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
repositorySchema.index({ owner: 1, name: 1 }, { unique: true });
repositorySchema.index({ topics: 1 });
repositorySchema.index({ language: 1 });

// Virtual for full repository URL
repositorySchema.virtual('repoUrl').get(function () {
    return `/repos/${this.owner.username}/${this.name}`;
});

// Method to check if user has access
repositorySchema.methods.hasAccess = function (userId) {
    if (!this.isPrivate) return true;
    if (this.owner.toString() === userId.toString()) return true;
    return this.collaborators.some(collab =>
        collab.user.toString() === userId.toString()
    );
};

// Method to get public repository data
repositorySchema.methods.getPublicData = function () {
    const repoObject = this.toObject();
    if (this.isPrivate) {
        delete repoObject.collaborators;
    }
    return repoObject;
};

const Repository = mongoose.model('Repository', repositorySchema);

module.exports = Repository; 