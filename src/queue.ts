import fs from 'node:fs';
import path from 'node:path';
import { Attempt } from './loop';

const DIR = path.resolve(process.cwd(), 'queue');
const HUMAN_FILE = path.join(DIR, 'needs-human.json');
const READY_FILE = path.join(DIR, 'ready-to-send.json');

function append(file: string, item: unknown): void {
  fs.mkdirSync(DIR, { recursive: true });
  const items = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, 'utf8'))
    : [];
  items.push(item);
  fs.writeFileSync(file, JSON.stringify(items, null, 2));
}

// A person works from this file: needs-human.json (risky or failed tickets).
export function sendToHuman(task: {
  ticketId: string;
  text: string;
  reason: string;
  attempts?: Attempt[];
  error?: string;
}): void {
  append(HUMAN_FILE, { ...task, createdAt: new Date().toISOString() });
}

// A person still reviews and sends these: ready-to-send.json.
export function saveReady(task: {
  ticketId: string;
  text: string;
  draft: string;
}): void {
  append(READY_FILE, { ...task, createdAt: new Date().toISOString() });
}

export function resetQueues(): void {
  fs.rmSync(DIR, { recursive: true, force: true });
}
