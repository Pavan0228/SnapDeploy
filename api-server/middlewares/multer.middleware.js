import multer from "multer";

// Set up in-memory storage for files
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(
            new Error("Unsupported file format. Only images are allowed."),
            false
        );
    }
};

// Set up multer with storage and file filter
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
});
