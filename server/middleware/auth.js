const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.userId });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate.' });
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.userId });

        if (!user) {
            req.user = null;
            return next();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
            }
            next();
        });
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate.' });
    }
};

const repoAccess = async (req, res, next) => {
    try {
        const repo = req.repository;
        const user = req.user;

        if (!repo) {
            return res.status(404).json({ error: 'Repository not found.' });
        }

        if (!repo.hasAccess(user._id)) {
            return res.status(403).json({ error: 'Access denied. You do not have permission to access this repository.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
};

const repoWriteAccess = async (req, res, next) => {
    try {
        const repo = req.repository;
        const user = req.user;

        if (!repo) {
            return res.status(404).json({ error: 'Repository not found.' });
        }

        if (repo.owner.toString() !== user._id.toString() &&
            !repo.collaborators.some(collab =>
                collab.user.toString() === user._id.toString() &&
                ['write', 'admin'].includes(collab.role)
            )) {
            return res.status(403).json({ error: 'Access denied. You do not have write permission for this repository.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
};

const repoAdminAccess = async (req, res, next) => {
    try {
        const repo = req.repository;
        const user = req.user;

        if (!repo) {
            return res.status(404).json({ error: 'Repository not found.' });
        }

        if (repo.owner.toString() !== user._id.toString() &&
            !repo.collaborators.some(collab =>
                collab.user.toString() === user._id.toString() &&
                collab.role === 'admin'
            )) {
            return res.status(403).json({ error: 'Access denied. You do not have admin permission for this repository.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
};

module.exports = {
    auth,
    optionalAuth,
    adminAuth,
    repoAccess,
    repoWriteAccess,
    repoAdminAccess
}; 