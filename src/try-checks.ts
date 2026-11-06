import { runChecks } from './checks';

const drafts = {
  good: 'Hello, you need a claim form, hospital bills, and the discharge summary.',
  promise: 'Your claim is guaranteed and will be approved.',
  card: 'Thanks, I noted your card 4111 1111 1111 1111.',
  long: 'word '.repeat(160),
};

for (const [name, draft] of Object.entries(drafts)) {
  const failures = runChecks(draft);
  console.log(
    name.padEnd(8),
    failures.length === 0 ? 'PASS' : failures.map((f) => f.feedback),
  );
}
