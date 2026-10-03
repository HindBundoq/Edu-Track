// =====================================================
// server.js
// Runs json-server API + serves the static frontend.
// Reads config from .env (locally) or Render environment variables.
// =====================================================

require("dotenv").config();

const jsonServer = require("json-server");
const path = require("path");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults({ static: __dirname });

const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || "";

// ── Inject API_URL into the browser via /js/env.js ──────────────
// All HTML pages load this script first so window.API_URL is available
// before api.js / auth.js / loginPage.js run.
server.get("/js/env.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.send(`window.API_URL = ${JSON.stringify(API_URL)};`);
});

// ── CORS (needed when testing frontend from a different origin) ──
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ── json-server middleware + routes ─────────────────────────────
server.use(middlewares);
server.use(router);

server.listen(PORT, () => {
  console.log(`✅ Edu-Track is running → http://localhost:${PORT}`);
  console.log(`   API_URL injected into browser: "${API_URL || "(relative — same server)"}"`);
});
