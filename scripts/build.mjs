import {
  mkdir,
  copyFile,
  cp,
  rm,
  readFile,
  writeFile,
  rename,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "dist");
// Only the generated output is replaced; sources and repository data are never copied.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of [
  "index.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  ".nojekyll",
]) {
  await copyFile(join(root, file), join(output, file));
}
await cp(join(root, "assets"), join(output, "assets"), { recursive: true });
// A new design must not accidentally load a previous release's cached CSS or JS.
let html = await readFile(join(output, "index.html"), "utf8");
for (const file of ["style.css", "opening.css", "main.js"]) {
  const data = await readFile(join(output, "assets", file));
  const hash = createHash("sha256").update(data).digest("hex").slice(0, 10);
  const fingerprinted = file.replace(/\.(css|js)$/, `.${hash}.$1`);
  await rename(
    join(output, "assets", file),
    join(output, "assets", fingerprinted),
  );
  html = html.replaceAll(`assets/${file}`, `assets/${fingerprinted}`);
}
await writeFile(join(output, "index.html"), html);
console.log("Static site built: dist/");
