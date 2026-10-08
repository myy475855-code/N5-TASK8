require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const internshipRoutes = require("./routes/internships");
const uploadRoutes = require("./routes/uploads");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

const swagger = require("../docs/openapi.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swagger));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/internships", internshipRoutes);
app.use("/", uploadRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => console.log(`Internship Catalog running at http://localhost:${PORT}`));
