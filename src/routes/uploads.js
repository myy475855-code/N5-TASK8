const express = require("express");
const fs = require("fs");
const { PrismaClient, Role } = require("@prisma/client");
const multer = require("multer");
const { makeUpload } = require("../middleware/upload");
const { requireAuth } = require("../middleware/auth");

const prisma = new PrismaClient();
const router = express.Router();

function uploadError(err, res) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") return res.status(422).json({ error: "File exceeds the allowed size limit." });
    return res.status(422).json({ error: "Invalid file type or multipart upload." });
  }
  if (err) return res.status(422).json({ error: "File upload rejected." });
}

function validMagic(kind, buffer) {
  if (kind === "resume") return buffer.subarray(0, 4).toString("ascii") === "%PDF";
  const png = buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpg = buffer.subarray(0, 3).equals(Buffer.from([255,216,255]));
  const webp = buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
               buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return png || jpg || webp;
}

function removeFile(file) {
  if (file?.path) try { fs.unlinkSync(file.path); } catch {}
}

router.post("/companies/:id/logo", requireAuth, (req, res) => {
  const id = Number(req.params.id);

  makeUpload("logo")(req, res, async (err) => {
    if (err) return uploadError(err, res);
    if (!req.file) return res.status(422).json({ error: "A logo file is required." });

    try {
      const company = await prisma.company.findUnique({ where: { id } });
      if (!company) { removeFile(req.file); return res.status(404).json({ error: "Company not found." }); }

      if (req.user.role !== Role.COMPANY || company.userId !== req.user.id) {
        removeFile(req.file);
        return res.status(403).json({ error: "You may only upload a logo for your own company profile." });
      }

      if (!validMagic("logo", fs.readFileSync(req.file.path))) {
        removeFile(req.file);
        return res.status(422).json({ error: "File content does not match an allowed image type." });
      }

      if (company.logoPath) try { fs.unlinkSync(company.logoPath); } catch {}
      await prisma.company.update({ where: { id }, data: { logoPath: req.file.path } });
      res.status(201).json({ message: "Logo uploaded successfully.", path: req.file.path });
    } catch (e) {
      removeFile(req.file);
      res.status(500).json({ error: "Could not save logo." });
    }
  });
});

router.post("/students/:id/resume", requireAuth, (req, res) => {
  const id = Number(req.params.id);

  makeUpload("resume")(req, res, async (err) => {
    if (err) return uploadError(err, res);
    if (!req.file) return res.status(422).json({ error: "A PDF resume is required." });

    try {
      const student = await prisma.student.findUnique({ where: { id } });
      if (!student) { removeFile(req.file); return res.status(404).json({ error: "Student not found." }); }

      if (req.user.role !== Role.STUDENT || student.userId !== req.user.id) {
        removeFile(req.file);
        return res.status(403).json({ error: "You may only upload a resume for your own student profile." });
      }

      if (!validMagic("resume", fs.readFileSync(req.file.path))) {
        removeFile(req.file);
        return res.status(422).json({ error: "File content does not match a PDF." });
      }

      if (student.resumePath) try { fs.unlinkSync(student.resumePath); } catch {}
      await prisma.student.update({ where: { id }, data: { resumePath: req.file.path } });
      res.status(201).json({ message: "Resume uploaded successfully.", path: req.file.path });
    } catch (e) {
      removeFile(req.file);
      res.status(500).json({ error: "Could not save resume." });
    }
  });
});

module.exports = router;
