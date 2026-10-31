import { cpSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
for (const folder of ["web", "data", "research"]) {
  mkdirSync(join(root, "public", folder), { recursive: true });
}
cpSync(join(root, "web"), join(root, "public", "web"), { recursive: true });
cpSync(join(root, "data", "sources.json"), join(root, "public", "data", "sources.json"));
cpSync(join(root, "research", "implementation-roadmap.md"), join(root, "public", "research", "implementation-roadmap.md"));
