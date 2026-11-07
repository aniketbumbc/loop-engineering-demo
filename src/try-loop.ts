import { OpenAIAgent } from './agent';
import { runLoop } from './loop';

(async () => {
  const ticket = {
    id: 'T2',
    text: 'Will urgent health insurance information be provided?',
  };
  console.log(`Ticket ${ticket.id}: ${ticket.text}`);

  const result = await runLoop(new OpenAIAgent(), ticket);

  if (result.status === 'ready') {
    console.log('\nREADY TO SEND:\n' + result.draft);
  } else {
    console.log(`\nNEEDS HUMAN (${result.reason})`);
    result.attempts.forEach((a, i) =>
      console.log(`  draft ${i + 1}: ${a.draft}`),
    );
  }
})();
