"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ONBOARDING_STEP_MAX } from "@/lib/onboarding";

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
    return <p>Invalid onboarding step.</p>;
  }

  async function saveAndContinue() {
    setLoading(true);
    const payload: Record<string, unknown> = { step };
    if (step === 1) payload.productDescription = value || "Product";
    if (step === 2) payload.contentTypes = ["tweet", "thread"];
    if (step === 3) payload.generationFrequency = value || "weekly";
    if (step === 4) payload.timezone = value || Intl.DateTimeFormat().resolvedOptions().timeZone;
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
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Step {step} of 6</p>
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Enter value for this step"
      />
      <Button disabled={loading} onClick={saveAndContinue}>
        {loading ? "Saving..." : step === ONBOARDING_STEP_MAX ? "Finish setup" : "Continue"}
      </Button>
    </div>
  );
}
