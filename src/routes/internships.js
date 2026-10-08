const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router();

const allowedSorts = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  title_asc: { title: "asc" },
  title_desc: { title: "desc" },
  stipend_desc: { stipend: "desc" },
  stipend_asc: { stipend: "asc" }
};

router.get("/", async (req, res, next) => {
  try {
    const search = String(req.query.search || "").trim();
    const location = String(req.query.location || "").trim();
    const category = String(req.query.category || "").trim();
    const sort = String(req.query.sort || "newest");
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "12", 10), 1), 50);

    const where = {
      ...(location ? { location: { equals: location, mode: "insensitive" } } : {}),
      ...(category ? { category: { equals: category, mode: "insensitive" } } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { company: { name: { contains: search, mode: "insensitive" } } }
        ]
      } : {})
    };

    const orderBy = allowedSorts[sort] || allowedSorts.newest;
    const [total, data] = await prisma.$transaction([
      prisma.internship.count({ where }),
      prisma.internship.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          company: { select: { id: true, name: true, location: true, logoPath: true } }
        }
      })
    ]);

    res.json({
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
