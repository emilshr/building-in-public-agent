export function buildThreadPrompt(input: { summary: string; tone: string }) {
  return `Write a 3-post thread idea in ${input.tone} tone from this summary:\n${input.summary}`;
}
