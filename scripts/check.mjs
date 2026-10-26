import { readFile, access, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const html = await readFile(join(root, "index.html"), "utf8");
const css = await readFile(join(root, "assets/style.css"), "utf8");
const failures = [];
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
if (new Set(ids).size !== ids.length) failures.push("Duplicate HTML ids");
for (const match of html.matchAll(/(?:href|src|srcset)="([^"]+)"/g)) {
  const value = match[1];
  if (value.startsWith("#")) {
    if (value !== "#" && !ids.includes(value.slice(1)))
      failures.push(`Missing anchor: ${value}`);
  } else if (!/^(https?:|tel:|mailto:|data:)/.test(value)) {
    try {
      await access(resolve(root, value));
    } catch {
      failures.push(`Missing local asset: ${value}`);
    }
  }
}
for (const match of css.matchAll(/url\(([^)]+)\)/g)) {
  try {
    await access(resolve(root, "assets", match[1]));
  } catch {
    failures.push(`Missing CSS asset: ${match[1]}`);
  }
}
for (const match of html.matchAll(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
)) {
  try {
    JSON.parse(match[1]);
  } catch {
    failures.push("Invalid JSON-LD");
  }
}
if ((html.match(/<h1\b/g) || []).length !== 1)
  failures.push("Expected exactly one h1");
if (!html.includes("https://sahland.github.io/forsite/"))
  failures.push("Missing production URL");
for (const image of [
  "forest-road.webp",
  "forest-road-mobile.webp",
  "workshop.webp",
]) {
  const info = await stat(join(root, "assets/images", image));
  if (info.size > 300_000)
    failures.push(`Image exceeds 300 KB budget: ${image}`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Passed: assets, anchors, metadata, JSON-LD and image budgets.");
