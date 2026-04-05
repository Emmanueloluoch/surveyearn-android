const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReferralCode(userId: number): string {
  let seed = (userId + 100037) * 7919;
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += CHARS[Math.abs(seed) % CHARS.length];
    seed = (seed * 31 + (i + 1) * 1234) % 999983;
  }
  return code;
}
