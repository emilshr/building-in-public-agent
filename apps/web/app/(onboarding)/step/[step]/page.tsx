import { redirect } from "next/navigation";

export default function LegacyOnboardingRoute() {
  redirect("/dashboard/repos");
}
