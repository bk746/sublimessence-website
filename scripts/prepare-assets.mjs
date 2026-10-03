import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const imgDir = path.join(publicDir, "img");

async function heroVariants(baseName) {
  const src = path.join(imgDir, `${baseName}.webp`);
  if (!fs.existsSync(src)) return;
  for (const w of [640, 960, 1280]) {
    const out = path.join(imgDir, `${baseName}-${w}.webp`);
    await sharp(src)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(out);
  }
}

async function linTile() {
  const src = path.join(imgDir, "hero-lin.png");
  if (!fs.existsSync(src)) return;
  await sharp(src)
    .resize(160, 160, { fit: "cover" })
    .modulate({ brightness: 0.82 })
    .webp({ quality: 55 })
    .toFile(path.join(imgDir, "hero-lin-tile.webp"));
}

async function minifyCss() {
  const cssPath = path.join(publicDir, "site.css");
  const css = fs.readFileSync(cssPath, "utf8");
  const min = css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .trim();
  fs.writeFileSync(cssPath, min);
  return crypto.createHash("sha256").update(min).digest("hex").slice(0, 12);
}

const CARD_IMAGES = [
  "pr-decor",
  "pr-finitions",
  "pr-restauration",
  "itl-marqueterie",
  "stock-pigments",
  "stock-annecy",
  "nathalie",
  "arte-povera",
];

async function optimizeCard(base) {
  for (const ext of [".webp", ".jpg", ".jpeg"]) {
    const src = path.join(imgDir, `${base}${ext}`);
    if (!fs.existsSync(src)) continue;
    const out = path.join(imgDir, `${base}${ext === ".webp" ? "" : ext}-opt.webp`);
    const target = path.join(imgDir, `${base}.webp`);
    const outPath = ext === ".webp" ? target : out;
    await sharp(src)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(outPath + ".tmp");
    fs.renameSync(outPath + ".tmp", outPath);
    break;
  }
}

async function main() {
  await heroVariants("hero-piece");
  await heroVariants("hero-dessin");
  await linTile();
  for (const name of CARD_IMAGES) await optimizeCard(name);
  const hash = await minifyCss();
  const envPath = path.join(root, ".env.local");
  fs.writeFileSync(
    envPath,
    `NEXT_PUBLIC_SITE_ASSET_VERSION=${hash}\n`,
    "utf8",
  );
  console.log("Assets prepared, version:", hash);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
