const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1
    },

    fileFilter: (req, file, callback) => {
        const isCsvExtension = /\.csv$/i.test(file.originalname);
        const isCsvMimeType = [
            'text/csv',
            'application/csv',
            'application/vnd.ms-excel',
            'text/plain',
            'application/octet-stream'
        ].includes(file.mimetype);

        if (isCsvExtension && isCsvMimeType) {
            return callback(null, true);
        }

        callback(new Error('Please upload a CSV file.'));
    }
});

module.exports = upload;
