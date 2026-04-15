import sharp from "sharp";
import { readdir, stat } from "fs/promises";
import path from "path";

const FLOWERS_DIR = path.join(process.cwd(), "public", "flowers");
const MAX_DIMENSION = 600;
const THUMB_DIMENSION = 120;
const WEBP_QUALITY = 80;

async function findPngs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findPngs(full)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
      files.push(full);
    }
  }
  return files;
}

async function optimizeImage(filePath) {
  const dir = path.dirname(filePath);
  const name = path.basename(filePath, path.extname(filePath));
  const webpPath = path.join(dir, `${name}.webp`);
  const thumbPath = path.join(dir, `${name}-thumb.webp`);

  const originalStat = await stat(filePath);
  const originalSize = originalStat.size;

  // Full-size WebP
  await sharp(filePath)
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toFile(webpPath);

  // Thumbnail WebP
  await sharp(filePath)
    .resize({
      width: THUMB_DIMENSION,
      height: THUMB_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toFile(thumbPath);

  const webpStat = await stat(webpPath);
  const thumbStat = await stat(thumbPath);

  return {
    file: path.relative(FLOWERS_DIR, filePath),
    originalSize,
    webpSize: webpStat.size,
    thumbSize: thumbStat.size,
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

async function main() {
  console.log(`Scanning ${FLOWERS_DIR} for PNG files...\n`);

  const pngs = await findPngs(FLOWERS_DIR);
  console.log(`Found ${pngs.length} PNG files.\n`);

  let totalOriginal = 0;
  let totalWebp = 0;
  let totalThumb = 0;
  let processed = 0;

  for (const file of pngs) {
    const result = await optimizeImage(file);
    processed++;
    totalOriginal += result.originalSize;
    totalWebp += result.webpSize;
    totalThumb += result.thumbSize;

    const savings = (
      ((result.originalSize - result.webpSize) / result.originalSize) *
      100
    ).toFixed(1);

    console.log(
      `[${processed}/${pngs.length}] ${result.file}` +
        `  ${formatBytes(result.originalSize)} → ${formatBytes(result.webpSize)} (−${savings}%)` +
        `  thumb: ${formatBytes(result.thumbSize)}`
    );
  }

  console.log(`\n--- Summary ---`);
  console.log(`Images processed : ${processed}`);
  console.log(`Original total   : ${formatBytes(totalOriginal)}`);
  console.log(`WebP total       : ${formatBytes(totalWebp)}`);
  console.log(`Thumbnails total : ${formatBytes(totalThumb)}`);
  console.log(
    `Overall savings  : ${formatBytes(totalOriginal - totalWebp)} (${(((totalOriginal - totalWebp) / totalOriginal) * 100).toFixed(1)}%)`
  );
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
