import type { ReactNode } from "react";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Finish setup</h1>
        <p className="text-sm text-muted-foreground">
          Complete onboarding to enable scheduled content generation.
        </p>
      </div>
      {children}
    </div>
  );
}
