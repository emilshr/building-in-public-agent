import { inngest } from "../inngest.js";

export const setupScheduleOnOnboarding = inngest.createFunction(
  { id: "setup-schedule-on-onboarding" },
  { event: "user.onboarded" },
  async ({ event }) => {
    return {
      ok: true,
      userId: event.data.userId as string,
      message: "User onboarding event acknowledged",
    };
  },
);
