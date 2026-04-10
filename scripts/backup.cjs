#!/usr/bin/env node

/**
 * Backup Script - O CATARINÃO CMS
 *
 * Exporta todos os dados do Supabase para arquivos JSON locais.
 * Uso: node scripts/backup.js
 *
 * Salva em: backups/YYYY-MM-DD_HH-mm-ss/
 *   ├── categories.json
 *   ├── articles.json
 *   ├��─ profiles.json
 *   ├── user_roles.json
 *   ├── site_settings.json
 *   ├── navigation_menus.json
 *   ├── media.json
 *   ├── print_editions.json
 *   └── metadata.json
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

// --- Configuration ---
// Reads from .env file or environment variables
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^(\w+)=["']?(.+?)["']?\s*$/);
      if (match) process.env[match[1]] = match[2];
    });
  }
}

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const TABLES = [
  "categories",
  "articles",
  "profiles",
  "user_roles",
  "site_settings",
  "navigation_menus",
  "media",
  "print_editions",
];

// --- HTTP fetch helper ---
function fetchTable(table) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
    const options = {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    };

    https
      .get(url, options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error(`Failed to parse ${table}: ${data.slice(0, 200)}`));
          }
        });
      })
      .on("error", reject);
  });
}

// --- Main ---
async function main() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[T:]/g, "-")
    .replace(/\.\d+Z$/, "");
  const backupDir = path.join(__dirname, "..", "backups", timestamp);

  console.log("🔄 O CATARINÃO - Backup Script");
  console.log(`📁 Pasta: backups/${timestamp}/\n`);

  fs.mkdirSync(backupDir, { recursive: true });

  const metadata = {
    created_at: new Date().toISOString(),
    supabase_url: SUPABASE_URL,
    tables: {},
  };

  for (const table of TABLES) {
    try {
      process.stdout.write(`  📦 ${table}...`);
      const data = await fetchTable(table);

      if (Array.isArray(data)) {
        fs.writeFileSync(
          path.join(backupDir, `${table}.json`),
          JSON.stringify(data, null, 2),
          "utf8"
        );
        metadata.tables[table] = { count: data.length, status: "ok" };
        console.log(` ✅ ${data.length} registros`);
      } else {
        metadata.tables[table] = { count: 0, status: "error", error: data };
        console.log(` ⚠️  Erro: ${JSON.stringify(data).slice(0, 100)}`);
      }
    } catch (err) {
      metadata.tables[table] = { count: 0, status: "error", error: err.message };
      console.log(` ❌ ${err.message}`);
    }
  }

  // Save metadata
  fs.writeFileSync(
    path.join(backupDir, "metadata.json"),
    JSON.stringify(metadata, null, 2),
    "utf8"
  );

  const totalRecords = Object.values(metadata.tables).reduce(
    (sum, t) => sum + (t.count || 0),
    0
  );

  console.log(`\n✅ Backup concluído! ${totalRecords} registros em ${TABLES.length} tabelas.`);
  console.log(`📁 Salvo em: backups/${timestamp}/`);
}

main().catch((err) => {
  console.error("❌ Erro fatal:", err);
  process.exit(1);
});
