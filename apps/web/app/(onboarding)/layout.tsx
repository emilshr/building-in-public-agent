import type { ReactNode } from "react";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Finish setup
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete onboarding to start generating ready-to-post content
            drafts.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
