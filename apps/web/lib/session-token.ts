const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
  "__Host-better-auth.session_token",
];

export function getSessionToken(
  getCookieValue: (name: string) => string | undefined,
) {
  for (const cookieName of SESSION_COOKIE_NAMES) {
    const token = getCookieValue(cookieName);
    if (token) {
      return token;
    }
  }

  return null;
}
