import { spawnSync } from "node:child_process";

// Prisma needs a syntactically valid URL to generate the client, but does not
// connect to it. This keeps preview/Beta deployments available before a
// production database has been provisioned.
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public";

const prismaBinary = process.platform === "win32" ? "prisma.cmd" : "prisma";
const result = spawnSync(prismaBinary, ["generate", "--schema", "prisma/schema.prisma"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: databaseUrl },
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
