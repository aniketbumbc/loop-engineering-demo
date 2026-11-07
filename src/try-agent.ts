import { OpenAIAgent } from './agent';
import { runChecks } from './checks';

(async () => {
  const agent = new OpenAIAgent();
  const ticket = { id: 'T2', text: 'Will my claim definitely be approved?' };

  // Attempt 1: no feedback yet
  const first = await agent.draft(ticket, []);
  console.log('first:', first);
  const firstFailures = runChecks(first);
  console.log('Attempt 1:', first);
  console.log(
    'Checks:   ',
    firstFailures.length ? firstFailures.map((f) => f.feedback) : 'PASS',
  );
  if (firstFailures.length === 0) return;

  // Attempt 2: give the agent its previous draft and the feedback
  const secondResponse = await agent.draft(
    ticket,
    firstFailures.map((f) => f.feedback),
    first,
  );

  console.log('second:', secondResponse);

  const secondFailures = runChecks(secondResponse);
  console.log('\nAttempt 2:', secondResponse);
  console.log(
    'Checks:   ',
    secondFailures.length ? secondFailures.map((f) => f.feedback) : 'PASS',
  );
})();
