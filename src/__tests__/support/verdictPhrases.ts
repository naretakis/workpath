/**
 * Shared vocabulary for the no-verdict guard (ADR-0003, ADR-0007 Tier 1).
 *
 * HourKeep organizes evidence. States determine status
 * (42 CFR 435.557, 435.558; determinations are appealable under 431.220(a)(1)).
 * This module holds the machinery three test files share:
 *
 *   no-verdict.content.test.ts  walks the exported content objects
 *   no-verdict.render.test.tsx  asserts rendered output
 *   no-verdict.source.test.ts   scans source, with a W0 handoff allowlist
 *
 * WHY A PHRASE LIST AND NOT THE ORIGINAL REGEX
 * wave-2 § 2.5 originally specified /\b(you are|you're) (exempt|compliant)\b/i.
 * Against the actual code that matches almost nothing: `You&apos;re Exempt` is an
 * HTML entity in source, "You were exempt" is past tense, "Exempt" chips and
 * `✓ COMPLIANT` have no pronoun, and "automatically meet work requirements"
 * shares no words with the pattern. See validation-findings-2026-08.md § I6.
 *
 * WHY PHRASES AND NOT THE BARE WORD "exempt"
 * A case-insensitive scan for `exempt` returns 572 hits, nearly all identifiers
 * (`isExempt`, `exemptionCategory`, file paths). A guard that noisy gets disabled.
 * The harm is in the assertion, not the word, so the list targets assertions.
 */

/** A banned phrase and why it is banned. */
export interface VerdictPhrase {
  /** Matched with word boundaries. */
  phrase: string;
  /** Case-sensitive match. Only `COMPLIANT` needs this, to spare `isCompliant`. */
  caseSensitive?: boolean;
  /** The rule this phrase violates. Surfaces in the failure message. */
  why: string;
}

export const VERDICT_PHRASES: readonly VerdictPhrase[] = [
  // --- Asserted exclusion status -------------------------------------------
  {
    phrase: "you are exempt",
    why: "ADR-0003: banned verbatim. The State determines exclusion, not HourKeep",
  },
  {
    phrase: "you're exempt",
    why: "compliance-copy-standards.md: banned verbatim",
  },
  {
    phrase: "you were exempt",
    why: "wave-2a § 2.5: past-tense verdicts are still verdicts",
  },
  {
    phrase: "exempt from work requirements",
    why: "compliance-copy-standards.md banned phrase; also the wrong term (§ 2.4: community engagement requirement) and the wrong tier (three-tier model, 42 CFR 435.553 vs 435.554)",
  },
  {
    phrase: "must track hours",
    why: "ADR-0003: asserts the requirement applies. Whether someone is an applicable individual is the State's threshold question (42 CFR 435.556)",
  },
  {
    phrase: "you must track",
    why: "ADR-0003: same assertion in the second person",
  },
  {
    phrase: "you don't need to track hours",
    why: "ADR-0003: asserts the requirement does not apply. Say what to bring the agency instead",
  },

  // --- Asserted compliance status ------------------------------------------
  {
    phrase: "you are compliant",
    why: "ADR-0003: banned verbatim",
  },
  {
    phrase: "you're compliant",
    why: "ADR-0003: banned verbatim",
  },
  {
    phrase: "not compliant",
    why: "ADR-0003: state Logged / Threshold / Difference instead",
  },
  {
    phrase: "COMPLIANT",
    caseSensitive: true,
    why: "ADR-0003: the export's ✓ COMPLIANT / ✗ NOT COMPLIANT verdict",
  },
  {
    // ADDED IN W5, and it closes a hole this list had since W2a.
    //
    // The case-sensitivity carve-out above exists to spare the `isCompliant`
    // identifier. It also spared a bare title-case `Compliant`, which is exactly
    // what `Dashboard.tsx` rendered — in green, next to a tick, as the headline of
    // the main tracking surface. Every other entry either carries a pronoun or is
    // all-caps, so nothing caught it.
    //
    // Found by looking at the built app in a browser, not by reading code. W5 is
    // what made it worth finding: before, the Dashboard could only ever show the
    // wall-clock month, and now it shows whichever month the user pages to, so the
    // verdict is asserted about arbitrary months a state may be assessing.
    //
    // Word boundaries are what make this safe: `\bCompliant\b` does not match
    // inside `isCompliant`, because there is no boundary between `s` and `C`. The
    // all-caps entry above stays, since these are case-sensitive and distinct.
    phrase: "Compliant",
    caseSensitive: true,
    why: "ADR-0003: a bare title-case verdict. State Logged / Threshold / Difference instead",
  },
  {
    // Same discovery. "You've met the 80-hour requirement!" shares no words with
    // "you meet requirements", so the entries below missed it — and it asserts the
    // threshold satisfied AND hardcodes the policy value in the same breath.
    phrase: "you've met",
    why: "ADR-0003: declares a threshold met. Also tends to carry a hardcoded policy value (ADR-0001)",
  },
  {
    phrase: "automatically meet",
    why: "compliance-copy-standards.md banned phrase. Nothing is automatic: 42 CFR 435.557 ex parte review comes first and the State decides",
  },
  {
    phrase: "you meet requirements",
    why: "ADR-0003: a verdict. State the comparison, not the conclusion",
  },
  {
    phrase: "you meet work requirements",
    why: "ADR-0003: a verdict, and the wrong term",
  },

  // --- Softer verdicts, still verdicts -------------------------------------
  {
    phrase: "you qualify",
    why: "ADR-0003: qualification is the State's determination",
  },
  {
    phrase: "easiest for you",
    why: "ADR-0003: ranks pathways on facts HourKeep does not hold. 42 CFR 435.552 makes all seven equally available",
  },
  {
    // Word boundaries mean "easiest for you" does not match "easiest for your
    // situation", so the same claim needs its own entry.
    phrase: "easiest for your situation",
    why: "ADR-0003: the same ranking assertion, one word longer",
  },
  {
    phrase: "on track",
    why: "ADR-0003: implies a verdict about a trajectory toward compliance",
  },
  {
    // Same claim as "easiest for you", made about a pathway rather than a person.
    // Which pathway is easiest depends on what the state can already see and on
    // elections we do not know.
    phrase: "easiest option",
    why: "ADR-0003: ranks pathways on facts HourKeep does not hold",
  },
  {
    // Found in review, live in three components after the first pass: "Discover
    // the easiest way to keep your hours". Deliberately NOT the bare word
    // "easiest" — that would fire on legitimate prose such as "this is the part
    // that is easiest to get wrong", which describes the copy rather than ranking
    // a pathway.
    phrase: "easiest way",
    why: "ADR-0003: ranks pathways. 42 CFR 435.552(a) makes all seven equally available and states may not offer a subset",
  },
  {
    phrase: "perfect for your situation",
    why: "ADR-0003: asserts a fit HourKeep cannot assess",
  },
  // The "one pathway is less effort than another" family. All of these were found
  // in app/how-to-hearkeep/results/page.tsx's getNonExemptMethodMessage, which
  // wave-2 § 2.5's table did not reach.
  {
    phrase: "easier method",
    why: "ADR-0003: ranks pathways. 42 CFR 435.552(a) makes all seven equally available",
  },
  {
    phrase: "is easier",
    why: "ADR-0003: ranks pathways",
  },
  {
    phrase: "be easier",
    why: "ADR-0003: ranks pathways",
  },
  {
    phrase: "be simpler",
    why: "ADR-0003: ranks pathways",
  },
  {
    phrase: "simpler option",
    why: "ADR-0003: ranks pathways",
  },
  {
    // "which already meets the $580 threshold" declares a threshold satisfied.
    // For income it is not even arithmetic we hold: 42 CFR 435.552(f)(2) measures
    // against MAGI-based income for the HOUSEHOLD, and we store one person's
    // records. State the comparison and let the state conclude.
    phrase: "already meets",
    why: "ADR-0003: declares a threshold met. State Logged / Threshold / Difference instead",
  },
] as const;

/**
 * Normalise text before matching.
 *
 * Source carries `You&apos;re Exempt` because JSX requires the entity; rendered
 * output carries the resolved apostrophe. Both must match the same phrase, and
 * curly quotes have to fold too.
 */
export function normaliseForGuard(text: string): string {
  return text
    .replace(/&apos;|&#39;|&rsquo;|\u2019/g, "'")
    .replace(/&quot;|&#34;|\u201C|\u201D/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;|\u00A0/g, " ")
    .replace(/\s+/g, " ");
}

/** Escape a literal phrase for use inside a RegExp. */
function escapeRegExp(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build a word-boundary matcher for a phrase.
 *
 * Word boundaries matter: without them "on track" matches
 * `export default function TrackingPage()` — verified as a false positive
 * against src/app/tracking/page.tsx:47 on 2026-08-17.
 */
export function phraseMatcher(entry: VerdictPhrase): RegExp {
  return new RegExp(
    `\\b${escapeRegExp(entry.phrase)}\\b`,
    entry.caseSensitive ? "" : "i",
  );
}

/** One phrase found in one piece of text. */
export interface VerdictHit {
  phrase: string;
  why: string;
  /** Where the text came from: a file:line, or a content path like `threshold.note`. */
  location: string;
  /** Trimmed excerpt, for the failure message. */
  excerpt: string;
}

/** Find every banned phrase in a single string. */
export function findVerdictPhrases(
  text: string,
  location: string,
): VerdictHit[] {
  const normalised = normaliseForGuard(text);
  const hits: VerdictHit[] = [];

  for (const entry of VERDICT_PHRASES) {
    if (phraseMatcher(entry).test(normalised)) {
      hits.push({
        phrase: entry.phrase,
        why: entry.why,
        location,
        excerpt: normalised.trim().slice(0, 160),
      });
    }
  }

  return hits;
}

/** Render hits as a failure message a reader can act on without opening the test. */
export function formatHits(hits: VerdictHit[]): string {
  const lines = hits.map(
    (h) =>
      `  ${h.location}\n      [${h.phrase}] ${h.excerpt}\n      ↳ ${h.why}`,
  );
  return `\n${hits.length} verdict phrase(s) found:\n${lines.join("\n")}\n`;
}

/**
 * Walk an arbitrary content value and collect every string with its path.
 *
 * Content modules are plain nested data (objects, arrays, string fields), so a
 * recursive walk covers new fields without the test being edited — which is the
 * point. Asserting a hand-listed set of fields is how `gigEconomy` kept three
 * verdict strings that nobody had enumerated.
 */
export function collectStrings(
  value: unknown,
  path: string,
  into: Array<{ path: string; text: string }> = [],
): Array<{ path: string; text: string }> {
  if (typeof value === "string") {
    into.push({ path, text: value });
    return into;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => collectStrings(item, `${path}[${i}]`, into));
    return into;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      collectStrings(child, path ? `${path}.${key}` : key, into);
    }
  }
  return into;
}
