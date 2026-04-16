"use client";

import type {
  ApiKeyProvider,
  ContentType,
  GenerationFrequency,
} from "@repo/types";
import {
  API_KEY_PROVIDERS,
  CONTENT_TYPES,
  GENERATION_FREQUENCIES,
} from "@repo/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ONBOARDING_STEP_MAX } from "@/lib/onboarding";

type OnboardingPreferences = {
  productName: string | null;
  productDescription: string | null;
  targetAudience: string | null;
  contentTypes: string | null;
  generationFrequency: string | null;
  timezone: string | null;
  tone: string | null;
  apiProvider: string | null;
};

const stepLabels: Record<number, string> = {
  1: "Tell us about this repository",
  2: "Choose content formats for this repository",
  3: "Set generation frequency",
  4: "Set timezone for scheduling",
  5: "Set voice and tone",
  6: "Choose AI provider (BYOK)",
};

export default function RepoOnboardingStepPage({
  params,
}: {
  params: { repoId: string; step: string };
}) {
  const router = useRouter();
  const step = useMemo(() => Number.parseInt(params.step, 10), [params.step]);
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [contentTypes, setContentTypes] = useState<ContentType[]>([
    "tweet",
    "thread",
  ]);
  const [generationFrequency, setGenerationFrequency] =
    useState<GenerationFrequency>("weekly");
  const [timezone, setTimezone] = useState("");
  const [tone, setTone] = useState("");
  const [apiProvider, setApiProvider] = useState<ApiKeyProvider>("openai");

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  useEffect(() => {
    async function loadPreferences() {
      const response = await fetch(
        `/api/onboarding?repoId=${encodeURIComponent(params.repoId)}`,
      );
      if (!response.ok) return;

      const data = (await response.json()) as {
        preferences: OnboardingPreferences | null;
      };
      if (!data.preferences) return;

      setProductName(data.preferences.productName ?? "");
      setProductDescription(data.preferences.productDescription ?? "");
      setTargetAudience(data.preferences.targetAudience ?? "");
      setGenerationFrequency(
        (data.preferences.generationFrequency as GenerationFrequency | null) ??
          "weekly",
      );
      setTimezone(
        data.preferences.timezone ??
          Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
      setTone(data.preferences.tone ?? "");
      setApiProvider(
        (data.preferences.apiProvider as ApiKeyProvider | null) ?? "openai",
      );
      if (data.preferences.contentTypes) {
        const parsed = JSON.parse(
          data.preferences.contentTypes,
        ) as ContentType[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setContentTypes(parsed);
        }
      }
    }

    void loadPreferences();
  }, [params.repoId]);

  if (!Number.isInteger(step) || step < 1 || step > ONBOARDING_STEP_MAX) {
    return <p className="text-sm text-destructive">Invalid onboarding step.</p>;
  }

  const title = stepLabels[step] ?? `Step ${step}`;

  async function saveAndContinue() {
    setLoading(true);
    const payload: Record<string, unknown> = {
      repoId: params.repoId,
      step,
    };

    if (step === 1) {
      payload.productName = productName || "Repository";
      payload.productDescription = productDescription || "Project repository";
      payload.targetAudience = targetAudience || "Developers";
    }
    if (step === 2) {
      payload.contentTypes = contentTypes.length > 0 ? contentTypes : ["tweet"];
    }
    if (step === 3) {
      payload.generationFrequency = generationFrequency;
    }
    if (step === 4) {
      payload.timezone =
        timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    if (step === 5) {
      payload.tone = tone || "casual";
    }
    if (step === 6) {
      payload.apiProvider = apiProvider;
    }

    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (!response.ok) return;

    if (step >= ONBOARDING_STEP_MAX) {
      router.push(`/dashboard/repos/${params.repoId}`);
      return;
    }
    router.push(
      `/dashboard/repos/${params.repoId}/onboarding/step/${step + 1}`,
    );
  }

  function toggleContentType(type: ContentType) {
    setContentTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-6 py-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Repository onboarding
        </p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">
          Finish setup for this repository
        </h1>
      </div>

      <div className="space-y-6 rounded-xl border border-border p-6">
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
          <h2 className="mt-1 font-heading text-xl font-semibold">{title}</h2>
        </div>

        {step === 1 ? (
          <div className="space-y-3">
            <Input
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
              placeholder="Product name"
            />
            <Input
              value={productDescription}
              onChange={(event) => setProductDescription(event.target.value)}
              placeholder="One-line product description"
            />
            <Input
              value={targetAudience}
              onChange={(event) => setTargetAudience(event.target.value)}
              placeholder="Target audience"
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid grid-cols-2 gap-2">
            {CONTENT_TYPES.filter((type) =>
              [
                "tweet",
                "thread",
                "linkedin",
                "reddit",
                "instagram",
                "tiktok",
              ].includes(type),
            ).map((type) => {
              const selected = contentTypes.includes(type);
              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => toggleContentType(type)}
                  className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    selected
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        ) : null}

        {step === 3 ? (
          <select
            value={generationFrequency}
            onChange={(event) =>
              setGenerationFrequency(event.target.value as GenerationFrequency)
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {GENERATION_FREQUENCIES.map((frequency) => (
              <option key={frequency} value={frequency}>
                {frequency}
              </option>
            ))}
          </select>
        ) : null}

        {step === 4 ? (
          <Input
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            placeholder="Timezone (e.g. America/New_York)"
          />
        ) : null}

        {step === 5 ? (
          <Input
            value={tone}
            onChange={(event) => setTone(event.target.value)}
            placeholder="Tone (e.g. casual, technical)"
          />
        ) : null}

        {step === 6 ? (
          <select
            value={apiProvider}
            onChange={(event) =>
              setApiProvider(event.target.value as ApiKeyProvider)
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {API_KEY_PROVIDERS.map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
        ) : null}

        <Button disabled={loading} onClick={saveAndContinue}>
          {loading
            ? "Saving..."
            : step === ONBOARDING_STEP_MAX
              ? "Finish setup"
              : "Continue"}
        </Button>
      </div>
    </div>
  );
}
