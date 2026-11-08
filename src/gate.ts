import { Ticket } from './types';

// Runs BEFORE the agent. If it fires, no draft is written and a human takes over.
const GATES: { reason: string; words: RegExp }[] = [
  {
    reason: 'legal_threat',
    words: /\b(sue|lawyer|lawsuit|legal action|consumer court|ombudsman)\b/i,
  },
  {
    reason: 'emergency',
    words: /\b(icu|emergency|bleeding|unconscious|ambulance)\b/i,
  },
];

export function runGate(ticket: Ticket): {
  escalate: boolean;
  reason?: string;
} {
  for (const gate of GATES) {
    if (gate.words.test(ticket.text))
      return { escalate: true, reason: gate.reason };
  }
  return { escalate: false };
}
