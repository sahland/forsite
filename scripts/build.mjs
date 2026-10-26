import { mkdir, copyFile, cp, rm } from "node:fs/promises";
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
console.log("Static site built: dist/");
