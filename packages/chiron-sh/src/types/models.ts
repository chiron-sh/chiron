export type Models = "subscriptions";
// Example
// | "user"
// | "account"
// | "session"
// | "verification"
// | "rate-limit"
// | "organization"
// | "member"
// | "invitation"
// | "jwks"
// | "passkey"
// | "two-factor";

interface RateLimit {
  /**
   * The key to use for rate limiting
   */
  key: string;
  /**
   * The number of requests made
   */
  count: number;
  /**
   * The last request time in milliseconds
   */
  lastRequest: number;
}

export type { RateLimit };
