type RepoWithOwner = {
  id: string;
  userId: string;
};

type RepoOnboardingState = {
  onboardingComplete: boolean;
  ownerUserId: string;
};

export function getRepoDestination({
  repoRecord,
  onboardingState,
  currentUserId,
}: {
  repoRecord: RepoWithOwner;
  onboardingState?: RepoOnboardingState;
  currentUserId: string;
}) {
  const isOwner = repoRecord.userId === currentUserId;
  const hasCompleted = Boolean(onboardingState?.onboardingComplete);

  if (isOwner && !hasCompleted) {
    return `/dashboard/repos/${repoRecord.id}/onboarding/step/1`;
  }

  return `/dashboard/repos/${repoRecord.id}`;
}
