/**
 * No-verdict guard, part 3 of 3 — source scan.
 *
 * ADR-0003 is the load-bearing decision: HourKeep organizes evidence, states
 * determine status. ADR-0007 promotes this guard to Tier 1 and assigns it to W2a.
 *
 * Parts 1 and 2 (rendered output, content data) cover the surfaces a user reads
 * through a component or a content object. This part is the backstop: it catches
 * a verdict written anywhere in src/, including inside page components that are
 * Dexie-backed and expensive to render.
 *
 * THE W0 HANDOFF
 * FOUR files in the dead `components/exemptions` chain are scheduled for deletion
 * in W0 (codebase-audit-2026-08.md § 5). THREE of them render a verdict and are
 * allowlisted below; the fourth, `ExemptionDetailsDialog`, is dead but asserts
 * nothing, so it needs no entry. Two of the three render `You Are Exempt`, verbatim
 * row one of ADR-0003's banned table.
 *
 * Keep those two numbers distinct. An earlier version of this comment said "four
 * files render verdicts", which is the class of count error
 * engineering-standards.md exists to prevent — in the file that enforces it.
 *
 * W2a does not rewrite copy in a file the next wave deletes. But the guard must
 * still see them, or it is not a guard. So they are allowlisted here with W0
 * named as removal owner, and three tests keep the allowlist honest:
 *
 *   - every entry must still exist  → after W0 deletes it, this fails until the
 *                                     entry is removed. That is the forcing
 *                                     function; nobody has to remember
 *   - every entry must still be dirty → a stale entry cannot linger
 *   - every entry must name W0        → the handoff lives in the test, not prose
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

import {
  VERDICT_PHRASES,
  normaliseForGuard,
  phraseMatcher,
  formatHits,
  type VerdictHit,
} from "./support/verdictPhrases";

// Resolved from the working directory, not import.meta.url: under the jsdom
// environment import.meta.url is an http URL, which fileURLToPath rejects.
// Vitest runs with the project root as cwd.
const SRC = resolve(process.cwd(), "src");

/**
 * Dead files that still contain verdict copy. W0 deletes all four.
 *
 * Verified 2026-08-17 against commit 5b4b27f: each has zero importers by precise
 * import grep, and each is listed in codebase-audit-2026-08.md § 5.
 */
interface AllowlistEntry {
  file: string;
  /** The wave that removes this file. Must be W0 — nothing else may be allowlisted. */
  removalOwner: "W0";
  reason: string;
}

const DEAD_FILE_ALLOWLIST: readonly AllowlistEntry[] = [
  {
    file: "components/exemptions/ExemptionBadge.tsx",
    removalOwner: "W0",
    reason:
      "Zero importers. 308 lines, head of a dead chain. Renders `You Are Exempt` (:150) and `Must Track Hours` (:249)",
  },
  // NOTE: components/exemptions/ExemptionDetailsDialog.tsx is dead too, and W0
  // deletes it as part of the same chain, but it asserts no verdict of its own.
  // It is deliberately NOT allowlisted — the "cannot rot" test below rejects an
  // entry with nothing to suppress, and it caught this one on 2026-08-17.
  {
    file: "components/exemptions/ExemptionResults.tsx",
    removalOwner: "W0",
    reason:
      "Imported only by the dead ExemptionDetailsDialog. Renders `You Are Exempt` / `You Must Track Hours` (:73)",
  },
  {
    file: "components/assessment/AssessmentHistory.tsx",
    removalOwner: "W0",
    reason:
      "Zero importers; getAssessmentHistory has no caller. Renders an `Exempt` chip and `You were exempt from work requirements`",
  },
] as const;

const ALLOWLISTED = new Set(
  DEAD_FILE_ALLOWLIST.map((e) => e.file.split("/").join(sep)),
);

/**
 * The whole dead chain W0 removes, including the one member that asserts no
 * verdict of its own and so is not allowlisted.
 *
 * The deadness test below asks whether an allowlisted file is reachable from LIVE
 * code — not whether it has zero importers. `ExemptionResults` is imported by
 * `ExemptionDetailsDialog`, which is itself dead and imported only by
 * `ExemptionBadge`, which has no importers at all. The chain is unreachable as a
 * whole, so an import from inside it does not make anything live.
 */
const DEAD_CHAIN = new Set(
  [
    "components/exemptions/ExemptionBadge.tsx",
    "components/exemptions/ExemptionDetailsDialog.tsx",
    "components/exemptions/ExemptionResults.tsx",
    "components/assessment/AssessmentHistory.tsx",
  ].map((f) => f.split("/").join(sep)),
);

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "__tests__") continue;
      sourceFiles(full, out);
    } else if (
      // Markdown under src/ is scanned too. Three developer docs in
      // src/lib/exemptions/ carried the banned phrasing after the TypeScript was
      // clean, and DEFINITIONS_README.md actively INSTRUCTED contributors to write
      // "If yes, you're exempt from work requirements" as the house style for help
      // text. Documentation that regenerates the bug is worth guarding.
      /\.(tsx?|md)$/.test(full) &&
      !/\.(test|spec)\.tsx?$/.test(full)
    ) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Drop trailing line comments so a CFR citation or a TODO cannot trip the guard.
 *
 * `[^:]` guards `https://` — without it, any phrase after a URL on the same line
 * would be silently skipped.
 */
function stripLineComment(line: string): string {
  return line.replace(/(^|[^:])\/\/.*$/, "$1");
}

/**
 * Only meaningful for TypeScript. A leading `*` in markdown is a bullet or the
 * start of `**bold**`, not a JSDoc continuation — treating it as a comment
 * silently skipped 59 markdown lines under src/, one of which contained a banned
 * phrase. The guard was green for an accidental formatting reason rather than an
 * intentional exception, which is the same thing as not being green. Found in
 * review.
 */
function isCommentOnly(line: string, isMarkdown: boolean): boolean {
  if (isMarkdown) return false;
  return /^\s*(\/\/|\/\*|\*)/.test(line);
}

/**
 * Blank out block comments, including multi-line and JSX `{/* ... *​/}` ones.
 *
 * Necessary because W2a's own comments quote the strings being removed — a
 * comment reading `was "You Are Exempt"` is documentation, not an assertion, and
 * a guard that fires on its own rationale is a guard that gets deleted. Line
 * position is preserved so reported line numbers stay accurate.
 */
function stripBlockComments(lines: string[]): string[] {
  let inBlock = false;

  return lines.map((line) => {
    let out = "";
    let i = 0;

    while (i < line.length) {
      if (inBlock) {
        const end = line.indexOf("*/", i);
        if (end === -1) return out;
        inBlock = false;
        i = end + 2;
        continue;
      }
      const start = line.indexOf("/*", i);
      if (start === -1) {
        out += line.slice(i);
        break;
      }
      out += line.slice(i, start);
      inBlock = true;
      i = start + 2;
    }

    return out;
  });
}

function scanFile(absolute: string): VerdictHit[] {
  const rel = relative(SRC, absolute);
  const isMarkdown = absolute.endsWith(".md");
  const hits: VerdictHit[] = [];
  // Comment stripping is a TypeScript concern. In markdown, `/*` and `//` are
  // ordinary characters.
  const lines = isMarkdown
    ? readFileSync(absolute, "utf8").split("\n")
    : stripBlockComments(readFileSync(absolute, "utf8").split("\n"));

  lines.forEach((raw, index) => {
    if (isCommentOnly(raw, isMarkdown)) return;
    const normalised = normaliseForGuard(
      isMarkdown ? raw : stripLineComment(raw),
    );
    if (!normalised.trim()) return;

    for (const entry of VERDICT_PHRASES) {
      if (phraseMatcher(entry).test(normalised)) {
        hits.push({
          phrase: entry.phrase,
          why: entry.why,
          location: `src/${rel.split(sep).join("/")}:${index + 1}`,
          excerpt: normalised.trim().slice(0, 140),
        });
      }
    }
  });

  return hits;
}

describe("ADR-0003 no-verdict guard: source scan", () => {
  const allFiles = sourceFiles(SRC);

  it("finds source files to scan", () => {
    expect(allFiles.length).toBeGreaterThan(50);
  });

  it("asserts no determination anywhere in src/, outside the W0 allowlist", () => {
    const hits = allFiles
      .filter((f) => !ALLOWLISTED.has(relative(SRC, f)))
      .flatMap(scanFile);

    expect(hits, formatHits(hits)).toEqual([]);
  });

  it("catches the phrases it is supposed to catch (guard-the-guard)", () => {
    // Every live violation this wave removed, in the form it appeared in source.
    // If a future refactor weakens the matcher, these fail rather than the guard
    // silently passing. A guard never observed failing is not a guard.
    const knownViolations = [
      "You&apos;re Exempt", // AssessmentBadge.tsx:154, HTML entity
      '"You were exempt from work requirements"', // past tense
      '{item.isExempt ? "Exempt" : "Must Track Hours"}', // no pronoun
      '"✓ COMPLIANT" : "✗ NOT COMPLIANT"', // no pronoun
      "you automatically meet work requirements", // shares no words with the old regex
      'label="Easiest for you"',
      "You don't need to track hours for Medicaid",
      "you're exempt from work requirements",
      "You Are Exempt",
      'result: "You meet work requirements as a seasonal worker"',
    ];

    for (const violation of knownViolations) {
      const normalised = normaliseForGuard(violation);
      const caught = VERDICT_PHRASES.some((entry) =>
        phraseMatcher(entry).test(normalised),
      );
      expect(caught, `guard missed: ${violation}`).toBe(true);
    }
  });

  it("does not fire on identifiers or citations (guard-the-guard)", () => {
    // False positives verified against the real tree on 2026-08-17. Each of these
    // would have made the guard noisy enough to disable, which is how the
    // repo-wide policy-literal grep died (validation-findings § C10).
    const mustNotFire = [
      "export default function TrackingPage() {", // contains "on Track"
      "const isCompliant = totalHours >= threshold;", // "Compliant", not "COMPLIANT"
      "import { ExemptionScreening } from '@/types/exemptions';",
      "if (result.isExempt) {",
      "  exemptionCategory: 'family-caregiving',",
      "  amountNeeded: number; // threshold - totalIncome (if not compliant)", // comment
      "// 6. No exclusion found - must track hours", // comment-only
      "see https://www.ecfr.gov // 42 CFR 435.552", // URL must survive stripping
    ];

    for (const line of mustNotFire) {
      if (isCommentOnly(line, false)) continue;
      const normalised = normaliseForGuard(stripLineComment(line));
      const fired = VERDICT_PHRASES.filter((entry) =>
        phraseMatcher(entry).test(normalised),
      );
      expect(
        fired.map((f) => f.phrase),
        `false positive on: ${line}`,
      ).toEqual([]);
    }
  });
});

describe("W0 handoff: the dead-file allowlist", () => {
  it("names W0 as removal owner for every entry", () => {
    for (const entry of DEAD_FILE_ALLOWLIST) {
      expect(entry.removalOwner, entry.file).toBe("W0");
      expect(entry.reason.length, entry.file).toBeGreaterThan(20);
    }
  });

  it("holds exactly the three dead files that assert a verdict", () => {
    expect(DEAD_FILE_ALLOWLIST.map((e) => e.file)).toEqual([
      "components/exemptions/ExemptionBadge.tsx",
      "components/exemptions/ExemptionResults.tsx",
      "components/assessment/AssessmentHistory.tsx",
    ]);
  });

  it("FAILS once W0 deletes a file, so the allowlist cannot outlive its subject", () => {
    // This is the mechanism that makes "the allowlist is empty after W0" testable
    // instead of aspirational. When W0 removes one of these files, this test goes
    // red until the entry is deleted too — and once all three are gone the
    // allowlist is empty by construction.
    const orphaned = DEAD_FILE_ALLOWLIST.filter(
      (entry) => !existsSync(join(SRC, entry.file)),
    ).map((entry) => entry.file);

    expect(
      orphaned,
      `These allowlist entries point at files that no longer exist. W0 has deleted them; remove the entries:\n${orphaned.join("\n")}`,
    ).toEqual([]);
  });

  it("FAILS if an allowlisted file gains an importer, so resurrection is not silently permitted", () => {
    // The property the allowlist actually depends on is DEADNESS, and the first
    // version of these tests never asserted it — it checked only that the file
    // existed, still contained a verdict, and named W0. All three stay true if
    // someone re-imports ExemptionBadge into a live page, at which point
    // `You Are Exempt` renders to users while the suite stays green. Found in
    // review; the file header had claimed a resurrection "turns the suite red",
    // which was not true until now.
    const offenders: string[] = [];

    for (const entry of DEAD_FILE_ALLOWLIST) {
      const basename = entry.file
        .split("/")
        .pop()!
        .replace(/\.tsx?$/, "");
      const importers = sourceFiles(SRC).filter((candidate) => {
        const rel = relative(SRC, candidate);
        // An import from elsewhere in the dead chain does not make this reachable.
        if (DEAD_CHAIN.has(rel)) return false;
        if (!/\.tsx?$/.test(candidate)) return false;
        const text = readFileSync(candidate, "utf8");
        // Match an import whose module path ends in this file's basename.
        return new RegExp(`from\\s+["'][^"']*\\b${basename}["']`, "m").test(
          text,
        );
      });

      if (importers.length > 0) {
        offenders.push(
          `${entry.file} is imported by: ${importers
            .map((i) => relative(SRC, i))
            .join(", ")}`,
        );
      }
    }

    expect(
      offenders,
      `An allowlisted file is no longer dead. The allowlist exists only to defer W0's deletion of unreachable code — it must never suppress a verdict a user can reach:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it("rejects an entry that no longer contains a verdict, so it cannot rot", () => {
    const clean = DEAD_FILE_ALLOWLIST.filter((entry) => {
      const path = join(SRC, entry.file);
      return existsSync(path) && scanFile(path).length === 0;
    }).map((entry) => entry.file);

    expect(
      clean,
      `Allowlisted but no longer asserting a verdict. Remove the entry:\n${clean.join("\n")}`,
    ).toEqual([]);
  });
});
