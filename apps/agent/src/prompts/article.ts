export function buildArticlePrompt(input: { summary: string; tone: string }) {
  return `Write a 500-800 word article outline with key points.
Tone: ${input.tone}
Summary: ${input.summary}`;
}
