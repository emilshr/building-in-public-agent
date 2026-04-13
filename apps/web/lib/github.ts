import { createHmac, timingSafeEqual } from "node:crypto";
import { App } from "@octokit/app";
import { env } from "@/src/env";

function getPrivateKey() {
  return env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n");
}

const githubApp = new App({
  appId: env.GITHUB_APP_ID,
  privateKey: getPrivateKey(),
});

export function getInstallUrl() {
  return `https://github.com/apps/${env.GITHUB_APP_SLUG}/installations/new`;
}

export function verifyGitHubWebhookSignature(
  payload: string,
  signatureHeader: string | null,
) {
  if (!signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const expected = createHmac("sha256", env.GITHUB_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
  const provided = signatureHeader.slice("sha256=".length);

  const expectedBuffer = Buffer.from(expected, "utf8");
  const providedBuffer = Buffer.from(provided, "utf8");

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export async function getInstallationOctokit(installationId: number) {
  return githubApp.getInstallationOctokit(installationId);
}
