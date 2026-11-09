import { CheckFailure } from './types';

// Patterns that promise an outcome. Regexes catch variations like
// "will definitely be approved", "guarantee", "100% covered".
const BANNED: { label: string; pattern: RegExp }[] = [
  { label: 'guarantee', pattern: /\bguarantee[ds]?\b/i },
  {
    label: 'promised approval/payment',
    pattern:
      /\b(will|is|are|has been|have been)\s+(definitely\s+|surely\s+|certainly\s+|always\s+)?(be\s+)?(approved|paid|covered|accepted|settled|reimbursed)\b/i,
  },
  { label: '100% / fully covered', pattern: /\b(100\s?%|fully|completely)\s+(covered|reimbursed|paid)\b/i },
  { label: 'certain outcome', pattern: /\b(definitely|certainly|surely)\s+(get|receive)\b/i },
];

// Secrets the agent must never echo back.
const SECRETS: RegExp[] = [
  // A 3-8 digit code shortly after a code keyword: "your OTP is 482913", "CVV: 123"
  /\b(otp|one[- ]time password|pin|cvv|passcode|verification code)\b\D{0,20}\d{3,8}\b/i,
  // A password value containing a digit or symbol: "password is hunter2", "password: Pa$$word"
  /\b(password|passcode)\s*(?:is|was|:|=)\s*["'`]?(?=\S*[\d@#$%^&*!])\S{4,}/i,
];

// Returns an empty array if the draft passes. Otherwise one entry per failed check.
export function runChecks(draft: string): CheckFailure[] {
  const failures: CheckFailure[] = [];

  // Check 1: under 150 words
  const words = draft.trim().split(/\s+/).length;
  if (words >= 150) {
    failures.push({
      check: 'length',
      feedback: `Reply is ${words} words. Keep it under 150.`,
    });
  }

  // Check 2: no promises
  for (const { pattern } of BANNED) {
    const match = draft.match(pattern);
    if (match) {
      failures.push({
        check: 'promise',
        feedback: `Remove "${match[0]}". Never promise an outcome.`,
      });
    }
  }

  // Check 3: no card number (13 to 19 digits, spaces or dashes allowed)
  if (/\b\d(?:[ -]?\d){12,18}\b/.test(draft)) {
    failures.push({
      check: 'card',
      feedback: 'Remove the card number. Never repeat card details.',
    });
  }

  // Check 4: no OTPs, PINs, CVVs or passwords
  for (const pattern of SECRETS) {
    const match = draft.match(pattern);
    if (match) {
      failures.push({
        check: 'secret',
        feedback: `Remove "${match[0]}". Never repeat OTPs, PINs, CVVs or passwords.`,
      });
      break; // one secret failure is enough feedback
    }
  }

  return failures;
}
