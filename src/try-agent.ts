import { FakeAgent } from './agent';
import { runChecks } from './checks';

(async () => {
  const agent = new FakeAgent();
  const ticket = {
    id: 'T1',
    text: 'What documents do I need for a health claim?',
  };

  // Attempt 1: no feedback yet
  const first = await agent.draft(ticket, []);
  const firstFailures = runChecks(first);
  console.log('Attempt 1:', first);
  console.log(
    'Checks:   ',
    firstFailures.length ? firstFailures.map((f) => f.feedback) : 'PASS',
  );

  // Attempt 2: give the feedback back to the agent
  const second = await agent.draft(
    ticket,
    firstFailures.map((f) => f.feedback),
    first,
  );
  const secondFailures = runChecks(second);
  console.log('\nAttempt 2:', second);
  console.log(
    'Checks:   ',
    secondFailures.length ? secondFailures.map((f) => f.feedback) : 'PASS',
  );
})();
