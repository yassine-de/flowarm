import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDir = "C:/Users/adil/Desktop/FBH FRÄSEN";
const outDir = path.resolve("public/assets/flowarm");

const scenes = [
  "scene-01-empty-room",
  "scene-02-milling-machine",
  "scene-03-milled-grooves",
  "scene-04-pipe-installation",
  "scene-05-pipes-finished",
  "scene-06-heat-visualization",
  "scene-07-final-room"
];

await fs.mkdir(outDir, { recursive: true });

for (const scene of scenes) {
  await sharp(path.join(sourceDir, `${scene}.png`))
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 86 })
    .toFile(path.join(outDir, `${scene}.webp`));
}

const logoPath = path.join(sourceDir, "logo-flowarm-orange.png");
try {
  await fs.copyFile(logoPath, path.join(outDir, "logo-flowarm-orange.png"));
} catch {
  console.warn("logo-flowarm-orange.png nicht gefunden. Bitte finale Logo-Datei in public/assets/flowarm ablegen.");
}
