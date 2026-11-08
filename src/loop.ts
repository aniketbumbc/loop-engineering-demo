import { Agent, CheckFailure, Ticket } from './types';
import { runChecks } from './checks';

export const MAX_RETRIES = 3; // 1 first try + up to 3 retries

export interface Attempt {
  draft: string;
  failures: CheckFailure[];
}

export type LoopResult =
  | { status: 'ready'; draft: string; attempts: Attempt[] }
  | {
      status: 'needs_human';
      reason: 'max_retries' | 'no_progress' | 'agent_error';
      attempts: Attempt[];
      error?: string;
    };

// Sorted, de-duplicated check names, e.g. "length,promise", so two attempts can be compared.
function failedChecks(failures: CheckFailure[]): string {
  return [...new Set(failures.map((f) => f.check))].sort().join(',');
}

export async function runLoop(
  agent: Agent,
  ticket: Ticket,
): Promise<LoopResult> {
  const attempts: Attempt[] = [];
  let feedback: string[] = [];
  let previousDraft: string | undefined;

  for (let i = 0; i <= MAX_RETRIES; i++) {
    // 1. Agent writes a draft (on a retry it also sees its last draft and the feedback)
    let draft: string;
    try {
      draft = await agent.draft(ticket, feedback, previousDraft);
    } catch (err) {
      return {
        status: 'needs_human',
        reason: 'agent_error',
        attempts,
        error: (err as Error).message,
      };
    }

    // 2. Check the draft
    const failures = runChecks(draft);
    attempts.push({ draft, failures });
    console.log(
      `  attempt ${i + 1}: ${failures.length === 0 ? 'PASS' : 'FAIL (' + failures.map((f) => f.check).join(', ') + ')'}`,
    );

    // 3. Passed: done
    if (failures.length === 0) return { status: 'ready', draft, attempts };

    // 4. Stop early if the exact same set of checks failed in the previous attempt too
    const last = attempts[attempts.length - 2];
    if (last && failedChecks(last.failures) === failedChecks(failures)) {
      return { status: 'needs_human', reason: 'no_progress', attempts };
    }

    // 5. Otherwise send the specific feedback back and try again
    feedback = failures.map((f) => f.feedback);
    previousDraft = draft;
  }

  // Out of retries
  return { status: 'needs_human', reason: 'max_retries', attempts };
}
