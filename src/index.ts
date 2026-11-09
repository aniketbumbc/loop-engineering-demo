import { OpenAIAgent } from './agent';
import { runGate } from './gate';
import { runLoop } from './loop';
import { resetQueues, saveReady, sendToHuman } from './queue';
import { Ticket } from './types';

const tickets: Ticket[] = [
  { id: 'T1', text: 'What documents do I need for a health claim?' },
  { id: 'T2', text: 'Will my claim definitely be approved?' },
  { id: 'T3', text: "I'll sue you if this isn't fixed." },
];

(async () => {
  // Queues persist across runs so pending human work is never lost.
  // Pass --reset to start from empty queues on purpose.
  if (process.argv.includes('--reset')) {
    resetQueues();
    console.log('Queues reset.');
  }
  const agent = new OpenAIAgent();

  for (const ticket of tickets) {
    console.log(`\n${ticket.id}: ${ticket.text}`);

    // 1. Gate: risky tickets go straight to a human, no draft
    const gate = runGate(ticket);
    if (gate.escalate) {
      sendToHuman({
        ticketId: ticket.id,
        text: ticket.text,
        reason: `gate:${gate.reason}`,
      });
      console.log(`  -> HUMAN (gate: ${gate.reason})`);
      continue;
    }

    // 2. Loop: draft, check, feedback, retry
    const result = await runLoop(agent, ticket);

    // 3. Either ready for a human to review and send, or handed to a human
    if (result.status === 'ready') {
      saveReady({
        ticketId: ticket.id,
        text: ticket.text,
        draft: result.draft,
      });
      console.log('  -> READY TO SEND (human reviews and sends)');
    } else {
      sendToHuman({
        ticketId: ticket.id,
        text: ticket.text,
        reason: result.reason,
        attempts: result.attempts,
        error: result.error,
      });
      console.log(`  -> HUMAN (${result.reason})`);
    }
  }

  console.log(
    '\nQueues written to ./queue/ (ready-to-send.json, needs-human.json)',
  );
})();
