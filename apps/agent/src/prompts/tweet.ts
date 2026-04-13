export function buildTweetPrompt(input: { summary: string; tone: string }) {
  return `Write one concise tweet (max 280 chars) about this product update.
Tone: ${input.tone}
Summary: ${input.summary}`;
}
