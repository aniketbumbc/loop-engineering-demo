export interface Ticket {
  id: string;
  text: string;
}

// One failed check: its name, and the message we will send back to the agent.
export interface CheckFailure {
  check: string;
  feedback: string;
}
