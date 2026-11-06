import { CheckFailure } from './types';

const BANNED = ['guaranteed', 'will be approved'];

// Returns an empty array if the draft passes. Otherwise one entry per failed check.
export function runChecks(draft: string): CheckFailure[] {
  const failures: CheckFailure[] = [];

  // Check 1: under 150 words
  const words = draft.trim().split(/\s+/).length;
  if (words > 150) {
    failures.push({
      check: 'length',
      feedback: `Reply is ${words} words. Keep it under 150.`,
    });
  }

  // Check 2: no promises
  for (const phrase of BANNED) {
    if (draft.toLowerCase().includes(phrase)) {
      failures.push({
        check: 'promise',
        feedback: `Remove "${phrase}". Never promise an outcome.`,
      });
    }
  }

  // Check 3: no card number (4 to 5 digits, spaces or dashes allowed)
  if (/\b(?:\d[ -]?){4,5}\b/.test(draft)) {
    failures.push({
      check: 'card',
      feedback: 'Remove the card number It need be between 4 and 5 digits.',
    });
  }

  return failures;
}
