const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { dirs } = require("../utils/storage");

function makeUpload(kind) {
  const isResume = kind === "resume";
  const destination = dirs[isResume ? "resumes" : "logos"];
  const maxSize = isResume ? 2 * 1024 * 1024 : 1 * 1024 * 1024;
  const allowed = isResume
    ? ["application/pdf"]
    : ["image/png", "image/jpeg", "image/webp"];

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destination),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${crypto.randomUUID()}${ext}`);
    }
  });

  const upload = multer({
    storage,
    limits: { fileSize: maxSize, files: 1 },
    fileFilter: (_req, file, cb) => {
      if (!allowed.includes(file.mimetype)) {
        return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "file"));
      }
      cb(null, true);
    }
  });

  return upload.single("file");
}

module.exports = { makeUpload };
