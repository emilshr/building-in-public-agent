"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ONBOARDING_STEP_MAX } from "@/lib/onboarding";

const stepLabels: Record<number, { title: string; placeholder: string }> = {
  1: {
    title: "Describe your product",
    placeholder: "e.g. A CLI tool for managing Docker containers",
  },
  2: { title: "Content types", placeholder: "Tweets and threads" },
  3: {
    title: "Generation frequency",
    placeholder: "e.g. weekly, daily",
  },
  4: {
    title: "Your timezone",
    placeholder: "e.g. America/New_York",
  },
  5: { title: "Preferred tone", placeholder: "e.g. casual, professional" },
  6: { title: "AI provider", placeholder: "openai" },
};

export default function OnboardingStepPage({
  params,
}: {
  params: { step: string };
}) {
  const router = useRouter();
  const step = useMemo(() => Number.parseInt(params.step, 10), [params.step]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  if (!Number.isInteger(step) || step < 1 || step > ONBOARDING_STEP_MAX) {
    return <p className="text-sm text-destructive">Invalid onboarding step.</p>;
  }

  const label = stepLabels[step] ?? {
    title: `Step ${step}`,
    placeholder: "Enter value",
  };

  async function saveAndContinue() {
    setLoading(true);
    const payload: Record<string, unknown> = { step };
    if (step === 1) payload.productDescription = value || "Product";
    if (step === 2) payload.contentTypes = ["tweet", "thread"];
    if (step === 3) payload.generationFrequency = value || "weekly";
    if (step === 4)
      payload.timezone =
        value || Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (step === 5) payload.tone = value || "casual";
    if (step === 6) payload.apiProvider = "openai";

    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (step >= ONBOARDING_STEP_MAX) {
      router.push("/dashboard");
      return;
    }
    router.push(`/step/${step + 1}`);
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex gap-1">
        {Array.from({ length: ONBOARDING_STEP_MAX }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < step ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Step {step} of {ONBOARDING_STEP_MAX}
        </p>
        <h2 className="mt-1 font-heading text-xl font-semibold">
          {label.title}
        </h2>
      </div>

      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={label.placeholder}
      />

      <Button disabled={loading} onClick={saveAndContinue}>
        {loading
          ? "Saving..."
          : step === ONBOARDING_STEP_MAX
            ? "Finish setup"
            : "Continue"}
      </Button>
    </div>
  );
}
