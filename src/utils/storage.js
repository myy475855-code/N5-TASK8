const path = require("path");
const fs = require("fs");

const base = path.resolve(process.env.UPLOAD_DIR || "./uploads");
const dirs = {
  logos: path.join(base, "logos"),
  resumes: path.join(base, "resumes")
};

for (const dir of Object.values(dirs)) fs.mkdirSync(dir, { recursive: true });

function safeGeneratedName(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  return `${token}${ext}`;
}

module.exports = { dirs, safeGeneratedName };
