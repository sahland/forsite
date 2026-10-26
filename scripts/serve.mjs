import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { extname, resolve, sep } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const port = 4173;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
createServer(async (request, response) => {
  try {
    let path = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    // Match the production project-site prefix during local QA.
    if (path.startsWith("/forsite/")) path = path.slice(8);
    if (path === "/") path = "/index.html";
    const target = resolve(root, `.${path}`);
    if (
      !target.startsWith(root.endsWith(sep) ? root : `${root}${sep}`) ||
      (!["/index.html", "/404.html", "/sitemap.xml", "/robots.txt"].includes(
        path,
      ) &&
        !path.startsWith("/assets/"))
    ) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    const info = await stat(target);
    if (!info.isFile()) throw new Error("Not a file");
    const body = await readFile(target);
    response.writeHead(200, {
      "Content-Type": types[extname(target)] || "application/octet-stream",
      "Content-Length": body.length,
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Local: http://127.0.0.1:${port}/forsite/`),
);
