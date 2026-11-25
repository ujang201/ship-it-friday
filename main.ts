// Ship It Friday — one-line commit message generator.
//
// The bounty wants exactly one thing: the funniest git commit message an
// AI coding agent would write right before breaking production on a Friday.
// This program builds that line from named parts, checks it against the
// gate (1..159 characters, a single non-blank line), and writes it to
// /output/entry.txt with no trailing newline, so the file holds exactly
// the commit message and nothing else.
//
// Deterministic by design: every part is fixed, there is no randomness,
// no clock, no network and no input, so every run writes byte-identical
// output.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// --- the joke, in pieces -------------------------------------------------
//
// Voice: a confident, cheerful coding agent that has no idea what is
// about to happen. Friday feeling: the 4:59pm end-of-week rush. Punch:
// the agent's "test suite" is its own confidence.

const SCOPE = "feat:";
const SHIP_CALL = "ship Friday 4:59pm deploy,";
const CONFESSION = "skipped the tests —";
const PUNCHLINE = "confidence is my test suite 🚀";

// The gate's hard limits, from the bounty rules.
const MIN_CHARS = 1;
const MAX_CHARS = 159;

// --- assembly ------------------------------------------------------------

function buildCommitMessage(): string {
  // Joining fixed fragments with single spaces keeps the line exactly
  // one line and makes the wording easy to audit word by word.
  const fragments = [SCOPE, SHIP_CALL, CONFESSION, PUNCHLINE];
  return fragments.join(" ");
}

// --- validation ----------------------------------------------------------

// Count characters as code points, not UTF-16 units: the 🚀 emoji is one
// character to a reader (and to the gate) but two units in JS .length.
// Validating on code points keeps the check honest for any emoji.
function charCount(line: string): number {
  return [...line].length;
}

function validate(line: string): void {
  if (line.trim().length === 0) {
    throw new Error("commit message must not be only whitespace");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("commit message must be a single line");
  }
  const chars = charCount(line);
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new Error(
      `commit message must be ${MIN_CHARS}..${MAX_CHARS} characters, got ${chars}`,
    );
  }
}

// --- output --------------------------------------------------------------

// The grader mounts a writable /output directory. Locally that directory
// may not exist, so fall back to ./output instead of crashing — the
// written text is identical either way.
function resolveOutputDir(): string {
  const preferred = process.env.OUTPUT_DIR ?? "/output";
  try {
    mkdirSync(preferred, { recursive: true });
    return preferred;
  } catch {
    const fallback = join(process.cwd(), "output");
    mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

function main(): void {
  const line = buildCommitMessage();
  validate(line);
  const dir = resolveOutputDir();
  // No trailing newline: the file is the entry, byte for byte.
  writeFileSync(join(dir, "entry.txt"), line, "utf8");
  console.log(`wrote ${charCount(line)} chars to ${join(dir, "entry.txt")}`);
  console.log(line);
}

main();
