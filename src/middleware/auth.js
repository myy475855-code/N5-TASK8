function requireAuth(req, res, next) {
  // Demo authentication for this assignment.
  // Production deployment should replace this with Task 6 JWT/session middleware.
  const role = req.header("x-user-role") || "STUDENT";
  const id = Number(req.header("x-user-id") || 1);
  req.user = { id: Number.isFinite(id) ? id : 1, role };
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden: required role is " + role });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
