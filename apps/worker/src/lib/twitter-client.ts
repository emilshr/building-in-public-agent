import { env } from "../env.js";

export async function postTweet(input: { accessToken: string; text: string }) {
  const response = await fetch(`${env.TWITTER_API_BASE_URL}/tweets`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${input.accessToken}`,
    },
    body: JSON.stringify({ text: input.text }),
  });

  const data = (await response.json()) as { data?: { id: string }; title?: string };
  if (!response.ok) {
    throw new Error(data.title ?? `Twitter request failed with ${response.status}`);
  }

  return data.data?.id;
}
