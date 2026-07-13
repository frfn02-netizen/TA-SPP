const uploadMiddleware = require('../utils/upload.util');

const uploadFile = (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

module.exports = { uploadFile };