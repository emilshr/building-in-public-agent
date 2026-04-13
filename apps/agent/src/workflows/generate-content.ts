import { buildArticlePrompt } from "../prompts/article";
import { buildThreadPrompt } from "../prompts/thread";
import { buildTweetPrompt } from "../prompts/tweet";

type GenerateContentInput = {
  productSummary: string;
  tone: string;
  contentTypes: string[];
};

export async function generateContentWorkflow(input: GenerateContentInput) {
  const now = new Date();
  const items = input.contentTypes.map((type, index) => {
    if (type === "thread") {
      return {
        type,
        body: buildThreadPrompt({
          summary: input.productSummary,
          tone: input.tone,
        }),
        suggestedScheduledTime: new Date(
          now.getTime() + (index + 1) * 3600_000,
        ).toISOString(),
      };
    }
    if (type === "article") {
      return {
        type,
        body: buildArticlePrompt({
          summary: input.productSummary,
          tone: input.tone,
        }),
        suggestedScheduledTime: new Date(
          now.getTime() + (index + 1) * 3600_000,
        ).toISOString(),
      };
    }
    return {
      type,
      body: buildTweetPrompt({
        summary: input.productSummary,
        tone: input.tone,
      }),
      suggestedScheduledTime: new Date(
        now.getTime() + (index + 1) * 3600_000,
      ).toISOString(),
    };
  });

  return { items };
}
