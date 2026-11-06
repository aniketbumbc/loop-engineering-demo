# Loop Engineering

A small Node.js + TypeScript experiment in **loop engineering**: an agent drafts replies to insurance customers (health and vehicle), a separate set of checks verifies each draft, failed checks go back as specific feedback, and the loop retries until the draft passes or hands off to a human.

The goal is to understand the loop, not to build a big system.

## The loop

```
Ticket → legal/emergency? → human
       → Agent drafts using the knowledge base
       → Checks
       → fail? → specific feedback → retry (max 3)
       → still failing? → human
```

## Project layout

| Path | Purpose |
| --- | --- |
| [src/types.ts](src/types.ts) | Shared types (`Ticket`, `CheckFailure`) |
| [src/checks.ts](src/checks.ts) | Rule-based checks: length, banned promises, card numbers |
| [src/try-checks.ts](src/try-checks.ts) | Runs the checks against sample drafts |
| [Loop-engineering-insurance.md](Loop-engineering-insurance.md) | Short design: rules, knowledge base, tickets, checks, stop conditions |
| [prd.md](prd.md) | Broader design for a support-ticket triage loop |

## Getting started

```bash
npm install
npx tsx src/try-checks.ts
```

Expected output: `good` passes; `promise`, `card` and `long` each print their feedback.

## Checks

1. Reply is under 150 words.
2. No promises such as "guaranteed" or "will be approved".
3. No card numbers.

Each failure returns a `CheckFailure` with a specific feedback message (e.g. `Remove "guaranteed"`), which is what the agent receives on retry.

## Principles

1. **A goal you can check:** a draft is good only if it passes the checks.
2. **Checks are separate from the agent:** the agent never grades its own work.
3. **Feedback is specific:** "Remove 'guaranteed'", not "try again".
4. **Hard stop:** at most 3 retries; stop early if the same check fails twice in a row.
5. **Escalation:** a human takes over when the loop cannot finish, with the failed drafts attached.

## Next steps

- Add the knowledge base and sample tickets.
- Build the draft → check → feedback → retry loop with a mock agent.
- Swap the mock for a real Claude agent.
