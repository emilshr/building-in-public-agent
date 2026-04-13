import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { env } from "../env.js";

const execFileAsync = promisify(execFile);

export async function cloneRepo(fullName: string, cloneUrl: string) {
  const targetDir = path.join(
    env.GIT_CLONE_ROOT,
    fullName.replace("/", "__"),
    crypto.randomUUID(),
  );

  await rm(targetDir, { recursive: true, force: true });
  await mkdir(path.dirname(targetDir), { recursive: true });

  await execFileAsync("git", ["clone", "--depth=1", cloneUrl, targetDir]);

  return { path: targetDir };
}
