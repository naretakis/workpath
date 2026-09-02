/**
 * Guard — no month value in `src/` may originate from the wall clock, except in
 * `src/lib/month.ts`.
 *
 * W5. This test IS acceptance criterion 2, which originally read "No domain
 * function defaults to the current month" and was rewritten on 2026-09-02 because
 * it named no observable.
 *
 * WHY THE ORIGINAL CRITERION WAS UNSATISFIABLE AS A CHECK. Exactly one function in
 * `src/lib/` had an optional month — `calculateMonthlySummary` — with exactly one
 * production caller. Making it required is a two-line diff, after which the
 * criterion is literally true and the bug is entirely intact, because the ten sites
 * that actually derived a month from the clock are not domain functions. `tsc`
 * cannot find them. `engineering-standards.md`: "Acceptance criteria name an
 * observable... Every negative criterion needs a positive twin."
 *
 * THE TEN SITES THIS DROVE TO ZERO, recorded because a guard that passes tells you
 * nothing about what it was for. Counted by grep on 2026-09-02, before any change:
 *
 *   src/app/tracking/page.tsx            72, 151, 379, 392, 568, 649   format(new Date(), "yyyy-MM")
 *   src/app/tracking/page.tsx            129-131                       const now = new Date() -> startOfMonth/endOfMonth
 *   src/app/how-to-hourkeep/page.tsx     109                           format(new Date(), "yyyy-MM")
 *   src/app/onboarding/page.tsx          122                           format(new Date(), "yyyy-MM")
 *   src/app/how-to-hourkeep/results/page.tsx  117                      new Date().toISOString().slice(0, 7)   <- UTC
 *   src/components/Calendar.tsx          62                            useState(new Date())
 *
 * Note the last two. `results/page.tsx` used **UTC** while the other nine used
 * **local** time, so on the first of a month in a negative-offset zone the app held
 * two different answers for the same instant — and `wave-5-month-scoping.md` never
 * mentioned that site at all. `Calendar.tsx:62` is the one that made paging the
 * calendar have no effect on anything else, which is the bug the wave exists to fix.
 *
 * HOW THIS STAYS USEFUL RATHER THAN BECOMING NOISE. The repo-wide policy-literal
 * grep died of noise (`docs/audit/validation-findings-2026-08.md` § C10, and
 * `scripts/compliance-gate.sh` says so in a comment), so every pattern below has
 * both a `mustFire` and a `mustNotFire` fixture. The `mustNotFire` list is the
 * important half: there are eight legitimate
 * `new Date().toISOString().split("T")[0]` sites in `src/` setting `<input
 * type="date">` bounds and export filenames, and a guard that flagged those would
 * be switched off within a week.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const SRC = resolve(process.cwd(), "src");

/**
 * The single file permitted to derive a month from the clock, or to do month and
 * week boundary arithmetic.
 *
 * One file, not a list. The value of this guard is precisely that there is nowhere
 * else to put such code, so adding a second entry should feel like the deliberate
 * act it is.
 */
const MONTH_HELPER = join("lib", "month.ts");

interface BannedPattern {
  /** What the pattern is called in failure output. */
  name: string;
  pattern: RegExp;
  /** Why this is a month derivation and not merely a date operation. */
  reason: string;
  /** Source that MUST match, so a broken pattern cannot pass by matching nothing. */
  mustFire: string[];
  /** Real code from `src/` that must NOT match, so the guard stays switch-on-able. */
  mustNotFire: string[];
}

const BANNED: BannedPattern[] = [
  {
    name: "format(new Date(), ...)",
    pattern: /format\(\s*new Date\(\)\s*,/,
    reason:
      "Formats the wall clock directly. This was the shape of eight of the ten " +
      "original sites. Use currentMonth() from @/lib/month, or accept the month " +
      "as a parameter — which is what almost every one of those sites should " +
      "have done, since the user was looking at a month the page already knew.",
    mustFire: [
      'month: format(new Date(), "yyyy-MM"),',
      'const currentMonth = format(new Date(), "yyyy-MM");',
      'currentMonth={format(new Date(), "yyyy-MM")}',
      'format(new Date(), "yyyy-MM-dd")',
    ],
    mustNotFire: [
      // Formatting a Date the caller was GIVEN is fine; the clock is not read.
      'const dateStr = format(date, "yyyy-MM-dd");',
      'format(monthToDate(month), "MMMM yyyy")',
      'format(selectedDate, "MMMM d, yyyy")',
      "format(generatedAt, \"MMMM d, yyyy 'at' h:mm a\")",
    ],
  },
  {
    name: "new Date().toISOString() sliced to a month",
    pattern:
      /new Date\(\)\s*\.toISOString\(\)\s*\.(slice|substring|substr)\(\s*0\s*,\s*7\s*\)/,
    reason:
      "Derives a month in UTC, which names the wrong month for part of every " +
      "month in any zone with an offset. This was a single site — " +
      "how-to-hourkeep/results/page.tsx:117 — and it disagreed with the other " +
      "nine, which used local time. Use currentMonth().",
    mustFire: [
      "const currentMonth = new Date().toISOString().slice(0, 7);",
      "new Date().toISOString().substring(0, 7)",
    ],
    mustNotFire: [
      // The eight legitimate sites. All take the DATE, not the month, and all
      // feed either an <input type="date"> bound or an export filename.
      'max: new Date().toISOString().split("T")[0],',
      'min: new Date().toISOString().split("T")[0],',
      "exportDate: new Date().toISOString(),",
      'new Date().toISOString().split("T")[0]',
    ],
  },
  {
    name: "useState(new Date())",
    pattern: /useState\(\s*new Date\(\)\s*\)/,
    reason:
      "A component owning its own 'current' date is how Calendar.tsx:62 came to " +
      "page independently of the page around it: the user moved to March while " +
      "the summary, activity list and income view all stayed on today. ADR-0005: " +
      "one selectedMonth at page level, passed down. Components take the month as " +
      "a prop.",
    mustFire: [
      "const [currentMonth, setCurrentMonth] = useState(new Date());",
      "useState(new Date())",
    ],
    mustNotFire: [
      "const [selectedDate, setSelectedDate] = useState<Date | null>(null);",
      "const [selectedMonth, setSelectedMonth] = useState(currentMonth());",
      "useState<Date | undefined>(undefined)",
    ],
  },
  {
    name: "month boundary arithmetic",
    pattern: /\b(startOfMonth|endOfMonth|eachDayOfInterval)\s*\(/,
    reason:
      "Month boundaries live in @/lib/month, so the conversion between a YYYY-MM " +
      "string and a Date happens in one place. Two sites used to do it " +
      "independently: tracking/page.tsx:130-131 built a month window from " +
      "`const now = new Date()`, and Calendar.tsx:64-69 built the day grid from " +
      "its own useState. A regex cannot follow `now` from one line to the next, " +
      "so the arithmetic is centralised rather than the clock read being chased. " +
      "Use calendarGridDays(month) or monthsBetween().",
    mustFire: [
      'const monthStart = format(startOfMonth(now), "yyyy-MM-dd");',
      'const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");',
      "const monthStart = startOfMonth(currentMonth);",
      "const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });",
    ],
    mustNotFire: [
      "const days = calendarGridDays(month);",
      "const months = monthsBetween(periodStart, periodEnd);",
      "isSameMonth(day, currentMonth)",
      // NARROWED 2026-09-02, and this is the reason. The pattern originally also
      // banned startOfWeek/endOfWeek, and fired on
      // DuplicateActivityDialog.tsx:35 — `startOfWeek(parseISO(activity.date))`,
      // which finds the week containing an activity the user already picked. That
      // reads no clock, and date-fns `parseISO` returns LOCAL midnight for a
      // date-only string, unlike `new Date("2026-07-01")`, so it is not even the
      // timezone bug class. Flagging it would have been the guard reaching past
      // its own charter — months, from the clock — and over-reach is exactly how
      // the repo-wide policy-literal grep died. Week arithmetic on a given date
      // is somebody else's concern.
      "const weekStart = startOfWeek(activityDate, { weekStartsOn: 0 });",
      "weekDates.push(addDays(weekStart, i));",
    ],
  },
];

/** Every `.ts`/`.tsx` file under `src/`, excluding tests. */
function sourceFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "__tests__") continue;
      sourceFiles(full, found);
    } else if (/\.tsx?$/.test(entry)) {
      found.push(full);
    }
  }
  return found;
}

/**
 * Whether a line is entirely a comment.
 *
 * Deliberately the same crude test `scripts/compliance-gate.sh` uses — a trimmed
 * line starting with `//`, `*` or `/*`. It is not a parser, and it does not need to
 * be: a line that STARTS with a comment marker is wholly a comment, and a line with
 * a trailing comment is still scanned in full. So a violation cannot hide behind
 * one.
 *
 * This is load-bearing rather than cosmetic. Both `src/lib/month.ts` and
 * `src/lib/calculations.ts` quote these exact patterns in prose, explaining what
 * they replaced — the guard must read that as documentation, not as a violation.
 */
function isCommentLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*")
  );
}

interface Hit {
  file: string;
  line: number;
  text: string;
  pattern: string;
}

function scan(file: string): Hit[] {
  const rel = relative(SRC, file);
  if (rel === MONTH_HELPER) return [];

  const hits: Hit[] = [];
  const lines = readFileSync(file, "utf8").split("\n");

  lines.forEach((line, index) => {
    if (isCommentLine(line)) return;
    for (const banned of BANNED) {
      if (banned.pattern.test(line)) {
        hits.push({
          file: rel,
          line: index + 1,
          text: line.trim(),
          pattern: banned.name,
        });
      }
    }
  });

  return hits;
}

describe("the guard's own patterns", () => {
  // A pattern that matches nothing passes the main assertion below trivially.
  // These fixtures are what stop that.

  it.each(BANNED.map((b) => [b.name, b] as const))(
    "%s fires on every example it is meant to catch",
    (_name, banned) => {
      for (const example of banned.mustFire) {
        expect(
          banned.pattern.test(example),
          `Pattern for "${banned.name}" failed to match:\n  ${example}`,
        ).toBe(true);
      }
    },
  );

  it.each(BANNED.map((b) => [b.name, b] as const))(
    "%s does not fire on legitimate code",
    (_name, banned) => {
      for (const example of banned.mustNotFire) {
        expect(
          banned.pattern.test(example),
          `Pattern for "${banned.name}" false-positived on:\n  ${example}\n` +
            `A noisy guard gets disabled; see validation-findings § C10.`,
        ).toBe(false);
      }
    },
  );

  it("every pattern explains itself, so a failure tells you what to do instead", () => {
    for (const banned of BANNED) {
      expect(banned.reason.length, banned.name).toBeGreaterThan(40);
      expect(banned.mustFire.length, banned.name).toBeGreaterThan(0);
      expect(banned.mustNotFire.length, banned.name).toBeGreaterThan(0);
    }
  });

  it("comment lines are skipped, because month.ts documents what it replaced", () => {
    expect(
      isCommentLine('   * `format(new Date(), "yyyy-MM")` was the shape'),
    ).toBe(true);
    expect(isCommentLine("  // useState(new Date()) used to live here")).toBe(
      true,
    );
    expect(isCommentLine("  /* startOfMonth(now) */")).toBe(true);
    // Code with a trailing comment is still scanned in full.
    expect(
      isCommentLine('  const m = format(new Date(), "yyyy-MM"); // oops'),
    ).toBe(false);
  });
});

describe("ADR-0005: no month in src/ comes from the wall clock", () => {
  const files = sourceFiles(SRC);

  it("finds source files to scan at all", () => {
    // Guards the guard: a broken walker returns [] and everything below passes.
    expect(files.length).toBeGreaterThan(50);
  });

  it("derives every month through @/lib/month, with no other wall-clock reads", () => {
    const hits = files.flatMap(scan);

    const detail = hits
      .map((h) => `  ${h.file}:${h.line}  [${h.pattern}]\n      ${h.text}`)
      .join("\n");

    const guidance = BANNED.map((b) => `  ${b.name}\n      ${b.reason}`).join(
      "\n",
    );

    expect(
      hits,
      `A month is being derived from the wall clock outside src/${MONTH_HELPER}.\n\n` +
        `${detail}\n\nWhat to do instead:\n${guidance}\n`,
    ).toEqual([]);
  });

  it("the helper itself is the only exemption, and it really does exist", () => {
    // If month.ts were renamed or deleted, `scan` would exempt nothing and the
    // assertion above would still pass — vacuously, because there would be no
    // month helper for anyone to call. Assert the exemption points at real code.
    const helper = join(SRC, MONTH_HELPER);
    const source = readFileSync(helper, "utf8");
    expect(source).toMatch(/export function currentMonth\(/);
    expect(source).toMatch(/export function calendarGridDays\(/);
  });
});
