/**
 * No-verdict guard, part 2 of 3 — content data.
 *
 * Walks the exported content objects recursively rather than asserting on a
 * hand-listed set of fields. That choice is the whole point: wave-2 § 2.5 listed
 * `helpText.ts x3`, meaning three `automatically meet` strings, and missed nine
 * further verdicts in `seasonalWorker`, `incomeVsHours`, and `gigEconomy` because
 * nobody had enumerated those objects. A recursive walk covers a field that does
 * not exist yet.
 *
 * These are plain data modules, not components, so a data assertion is cheaper
 * and more complete than rendering them.
 */

import { describe, it, expect } from "vitest";

import {
  activityDefinitions,
  incomeDefinitions,
  combinationRules,
  dashboardGuidance,
  requirementFacts,
  programScope,
  documentVerificationHelp,
} from "@/content/helpText";
import { termDefinitions } from "@/lib/exemptions/definitions";
import { allQuestions } from "@/lib/exemptions/questions";
import {
  collectStrings,
  findVerdictPhrases,
  formatHits,
} from "./support/verdictPhrases";

const CONTENT_MODULES: Array<{ name: string; value: unknown }> = [
  { name: "activityDefinitions", value: activityDefinitions },
  { name: "incomeDefinitions", value: incomeDefinitions },
  { name: "combinationRules", value: combinationRules },
  { name: "dashboardGuidance", value: dashboardGuidance },
  { name: "requirementFacts", value: requirementFacts },
  { name: "programScope", value: programScope },
  { name: "termDefinitions", value: termDefinitions },
  { name: "allQuestions", value: allQuestions },
  // Added in review. It was the only data export of helpText.ts left out of this
  // list — ~35 user-facing strings across 11 fields, rendered by
  // components/help/DocumentVerificationHelp.tsx, which the render test also does
  // not cover. A double blind spot, and exactly the omission a hand-listed module
  // list is prone to.
  { name: "documentVerificationHelp", value: documentVerificationHelp },
];

describe("ADR-0003 no-verdict guard: content data", () => {
  it.each(CONTENT_MODULES)(
    "$name asserts no determination",
    ({ name, value }) => {
      const hits = collectStrings(value, name).flatMap((entry) =>
        findVerdictPhrases(entry.text, entry.path),
      );
      expect(hits, formatHits(hits)).toEqual([]);
    },
  );

  it("walks deeply enough to reach nested arrays of objects", () => {
    // Guard-the-guard. incomeDefinitions.threshold.edgeCases[n].explanation is
    // three levels down; the nine missed verdicts were at exactly this depth.
    const paths = collectStrings(incomeDefinitions, "incomeDefinitions").map(
      (s) => s.path,
    );
    expect(paths).toContain(
      "incomeDefinitions.threshold.edgeCases[0].explanation",
    );
    expect(paths).toContain(
      "incomeDefinitions.threshold.whatCounts.examples[0]",
    );
    expect(paths.length).toBeGreaterThan(60);
  });
});

describe("42 CFR 435.552(f)(2), 435.603(e): income content states the rule correctly", () => {
  const threshold = incomeDefinitions.threshold;
  const counts = threshold.whatCounts?.examples ?? [];
  const doesNotCount = threshold.whatDoesNotCount?.examples ?? [];
  const allThresholdText = collectStrings(threshold, "threshold")
    .map((s) => s.text)
    .join(" ")
    .toLowerCase();

  it("lists unemployment compensation as counting", () => {
    // In gross income under IRC 85, therefore in AGI, therefore in MAGI.
    expect(counts.join(" ")).toMatch(/unemployment/i);
    expect(doesNotCount.join(" ")).not.toMatch(/unemployment/i);
  });

  it("lists interest and dividends as counting, INCLUDING tax-exempt interest", () => {
    // 26 U.S.C. 36B(d)(2)(B): MAGI is AGI increased by excluded foreign earned
    // income, TAX-EXEMPT INTEREST, and the non-taxable portion of Social Security.
    // Writing only "taxable interest and dividends" understates the rule in the
    // user-unfavourable direction — the third such error this project has shipped.
    const text = counts.join(" ").toLowerCase();
    expect(text).toMatch(/interest/);
    expect(text).toMatch(/isn't taxed|not taxed|tax-exempt/);
  });

  it("lists rental income as counting, with no business carve-out", () => {
    expect(counts.join(" ")).toMatch(/rent/i);
    expect(doesNotCount.join(" ")).not.toMatch(/rent/i);
  });

  it("lists Social Security including the non-taxable portion, so SSDI", () => {
    const text = counts.join(" ");
    expect(text).toMatch(/social security/i);
    expect(text).toMatch(/SSDI/);
  });

  it("does not claim only earned income counts", () => {
    expect(allThresholdText).not.toMatch(/only earned income/);
    expect(allThresholdText).not.toMatch(/unearned income does not count/);
  });

  it("whatDoesNotCount survives as a field with exactly 3 entries", () => {
    // Deleting the section would satisfy "no copy says X" while destroying the two
    // entries that were correct. Fixed entry by entry: 7 - 4 moved = 3.
    // compliance-copy-standards.md, "When you delete, replace".
    expect(doesNotCount).toHaveLength(3);
  });

  it("keeps SSI and child support in whatDoesNotCount", () => {
    const text = doesNotCount.join(" ");
    expect(text).toMatch(/SSI/);
    expect(text).toMatch(/child support/i);
  });

  it("42 CFR 435.603(d)(3): hedges the cash-support entry to the narrow election", () => {
    // A STATE OPTION, reaching only actually-available cash support above nominal
    // amounts from the person CLAIMING the individual as a tax dependent, and only
    // for individuals described in (f)(2)(i) — those claimed as a dependent who
    // are NOT the taxpayer's spouse or child. A gift from a friend is not in it.
    const entry = doesNotCount.find((e) => /gift/i.test(e));
    expect(entry).toBeDefined();
    expect(entry!).toMatch(/tax dependent/i);
    expect(entry!).toMatch(/spouse or child/i);
    expect(entry!).toMatch(/\b(state is allowed|state may|ask your state)\b/i);
  });

  it("42 CFR 435.603(d)-(f): states the household basis and defers the total", () => {
    expect(allThresholdText).toMatch(/household/);
    expect(allThresholdText).toMatch(/tax dependent/);
    expect(allThresholdText).toMatch(/married|spouse/);
    // Household MAGI is Deferred: ask the screener questions, name the agency,
    // compute nothing. The hard part is elicitation, not arithmetic.
    expect(allThresholdText).toMatch(/hourkeep does not add this up/);
  });

  it("surfaces the married-user case rather than sending them after 80 hours", () => {
    // The false negative that matters most: a married applicant whose spouse works
    // may already satisfy the income pathway without working an hour.
    const scenarios = (threshold.edgeCases ?? [])
      .map((e) => e.scenario)
      .join(" ");
    expect(scenarios).toMatch(/spouse/i);
  });

  it("states the two-sided message without implying a spouse's income disqualifies", () => {
    expect(allThresholdText).toMatch(/only helps/);
    expect(allThresholdText).toMatch(/marketplace|premium tax credit/);
  });

  it("42 CFR 435.552(e)(2): the edge case that was wrong twice over is fixed", () => {
    const entry = (threshold.edgeCases ?? []).find((e) =>
      /\$400.*unemployment/i.test(e.scenario),
    );
    expect(entry).toBeDefined();
    // (1) unemployment counts, so $400 + $200 = $600, above the threshold
    expect(entry!.counts).toBe(true);
    expect(entry!.explanation).toMatch(/\$600/);
    // (2) and even under the threshold it is not "hours from zero"
    expect(entry!.explanation).toMatch(/not an either\/or|credit it as hours/i);
  });
});

describe("42 CFR 435.552(e)(2)(i): the income-to-hours proxy is an upper bound", () => {
  it("says 'up to', never 'about'", () => {
    // The state must allocate credited hours between household members by a
    // method we cannot know, so any figure we show is a ceiling.
    const proxyText = collectStrings(incomeDefinitions, "incomeDefinitions")
      .map((s) => s.text)
      .filter((t) => /7\.25|÷/.test(t))
      .join(" ");
    expect(proxyText).toMatch(/up to/i);
    expect(proxyText).not.toMatch(/\babout \d/i);
  });
});

describe("42 CFR 435.552: activity content states the rule correctly", () => {
  it("435.552(b): work covers in-kind and unpaid work, not just paid employment", () => {
    const work = activityDefinitions.work;
    expect(work.definition).not.toMatch(/^paid employment/i);
    expect(work.definition).toMatch(
      /paid in something other than money|in-kind/i,
    );
    expect(work.definition).toMatch(/unpaid/i);
  });

  it("435.552(b): unpaid internships count, so they are not a counter-example", () => {
    const counters = (activityDefinitions.work.counterExamples ?? []).join(" ");
    expect(counters).not.toMatch(/internship/i);
    expect(activityDefinitions.work.examples?.join(" ")).toMatch(/internship/i);
  });

  it("435.552(a)(5), (e)(1): no activity definition states 80 hours individually", () => {
    // Each of work, volunteer, and workProgram said "at least 80 hours per month",
    // implying a per-activity minimum. The threshold is a monthly TOTAL.
    for (const [key, def] of Object.entries(activityDefinitions)) {
      expect(def.definition, key).not.toMatch(/80 hours/);
    }
  });

  it("435.552(a)(5): the monthly total is stated once, in combinationRules", () => {
    expect(combinationRules.definition).toMatch(/80/);
    expect(combinationRules.definition).toMatch(/total/i);
  });

  it("435.552(a)(4), (e)(1)(ii): half-time school needs no hours and cannot combine", () => {
    const education = collectStrings(activityDefinitions.education, "education")
      .map((s) => s.text)
      .join(" ")
      .toLowerCase();
    expect(education).toMatch(/no hours|there are no hours|without hours/);
    expect(education).toMatch(/cannot be combined|not be combined/);
  });

  it("435.552(c): the school determines enrollment status, not the user or state", () => {
    const education = collectStrings(activityDefinitions.education, "education")
      .map((s) => s.text)
      .join(" ")
      .toLowerCase();
    expect(education).toMatch(
      /school is the one that decides|the school decides/,
    );
  });

  it("435.552(b): community service counts when court-ordered", () => {
    const volunteer = collectStrings(activityDefinitions.volunteer, "volunteer")
      .map((s) => s.text)
      .join(" ")
      .toLowerCase();
    expect(volunteer).toMatch(/court-ordered/);
  });

  it("435.552(b): community service is not limited to 501(c)(3) organizations", () => {
    const volunteer = collectStrings(activityDefinitions.volunteer, "volunteer")
      .map((s) => s.text)
      .join(" ")
      .toLowerCase();
    expect(volunteer).toMatch(/501\(c\)\(3\)|registered charit/);
  });

  it("435.552(b): community service names the point of contact requirement", () => {
    // The organization must be able to track activity type, dates, hours, and a
    // POC who can confirm the hours. Without that the evidence gets rejected.
    const volunteer = collectStrings(activityDefinitions.volunteer, "volunteer")
      .map((s) => s.text)
      .join(" ")
      .toLowerCase();
    expect(volunteer).toMatch(/confirm/);
  });

  it("435.552(b): work programs keep the job-search exclusion with its nuance", () => {
    const wp = collectStrings(activityDefinitions.workProgram, "workProgram")
      .map((s) => s.text)
      .join(" ")
      .toLowerCase();
    expect(wp).toMatch(/only job search|only supervised job search/);
    expect(wp).toMatch(/half the hours|less than half/);
  });
});

describe("W2a § 2.3b: the reassuring facts are present and actionable", () => {
  it("42 CFR 435.559(c): states the renewal-timing fact", () => {
    const fact = requirementFacts.find(
      (f) => f.id === "already-enrolled-timing",
    );
    expect(fact).toBeDefined();
    expect(fact!.citation).toContain("435.559(c)");
    expect(fact!.body).toMatch(/renewal/i);
  });

  it("42 CFR 435.557(a)-(b): states ex parte first, citing the pair", () => {
    // The June 29, 2026 correction (91 FR 39028) shifted paragraph designations
    // inside 435.557, so citing one paragraph alone is fragile.
    const fact = requirementFacts.find((f) => f.id === "ex-parte-first");
    expect(fact).toBeDefined();
    expect(fact!.citation).toMatch(/435\.557\(a\)–\(b\)|435\.557\(a\)-\(b\)/);
    expect(fact!.body).toMatch(/payroll/i);
    expect(fact!.body).toMatch(/12 months/i);
    expect(fact!.body).toMatch(/SNAP/);
  });

  it("gap 15.20: warns that a negative self-report can support a denial", () => {
    const fact = requirementFacts.find(
      (f) => f.id === "careful-what-you-report",
    );
    expect(fact).toBeDefined();
    expect(fact!.tone).toBe("caution");
    expect(fact!.body).toMatch(/deny|denial/i);
  });

  it("every fact pairs with a concrete next action", () => {
    for (const fact of requirementFacts) {
      expect(fact.nextAction.length, fact.id).toBeGreaterThan(20);
      expect(fact.nextAction, fact.id).toMatch(/\b(ask|find|check|bring)\b/i);
      expect(fact.citation.length, fact.id).toBeGreaterThan(8);
    }
  });
});

describe("W2a § 2.4: scope and terminology facts (gaps 11.1–11.5)", () => {
  it("gap 11.1: lists Georgia, Tennessee and Wisconsin as IN scope", () => {
    // This was a factual error in the project's own steering docs, not just an
    // omission: Georgia and Wisconsin were listed OUT and Tennessee was missing
    // entirely. validation-findings-2026-08.md § A1.
    expect(programScope.jurisdictions).toMatch(/Georgia/);
    expect(programScope.jurisdictions).toMatch(/Tennessee/);
    expect(programScope.jurisdictions).toMatch(/Wisconsin/);
  });

  it("gap 11.1: states 44 jurisdictions as 43 states plus DC", () => {
    expect(programScope.jurisdictions).toMatch(/44/);
    expect(programScope.jurisdictions).toMatch(/43 states/i);
    expect(programScope.jurisdictions).toMatch(/District of Columbia/);
  });

  it("gap 11.4, 42 CFR 435.119: says the adult group includes parents", () => {
    // The expansion group is adults 19-64 at or below 133% FPL not described in a
    // mandatory group. It is NOT "childless adults": a parent whose youngest child
    // is 14 or older is an applicable individual, because the 435.554(a)(3)
    // exclusion only reaches caregivers of a child 13 or under.
    expect(programScope.whoItReaches).toMatch(/parents are in this group/i);
    expect(programScope.whoItReaches).toMatch(/19 to 64/);
    expect(programScope.whoItReaches).toMatch(/14 or older/);
  });

  it("gap 11.2, 42 CFR 435.550: states the territories are out of scope", () => {
    expect(programScope.territories).toMatch(/Puerto Rico/);
    expect(programScope.territories).toMatch(/not covered/i);
    expect(programScope.citation).toContain("435.550");
  });

  it("gap 11.5: includes the January 1, 2028 documentation hardening date", () => {
    const entry = programScope.keyDates.find(
      (d) => d.date === "January 1, 2028",
    );
    expect(entry).toBeDefined();
    expect(entry!.what).toMatch(/document/i);
    // 42 CFR 435.557: a state may never deny SOLELY because documentation that
    // does not exist cannot be produced. The hardening date must not read as an
    // absolute requirement.
    expect(entry!.what).toMatch(/can't turn you down|cannot turn you down/i);
    expect(entry!.citation).toContain("435.557");
  });

  it("gap 11.5: includes the December 31, 2028 good-faith ceiling", () => {
    const entry = programScope.keyDates.find(
      (d) => d.date === "December 31, 2028",
    );
    expect(entry).toBeDefined();
    expect(entry!.citation).toContain("435.560");
  });

  it("42 CFR 435.559(c): the 2027 date says existing enrollees wait for renewal", () => {
    const entry = programScope.keyDates.find(
      (d) => d.date === "January 1, 2027",
    );
    expect(entry).toBeDefined();
    expect(entry!.what).toMatch(/renewal/i);
    expect(entry!.citation).toContain("435.559");
  });

  it("every key date carries a CFR citation", () => {
    for (const entry of programScope.keyDates) {
      expect(entry.citation, entry.date).toMatch(/42 CFR 435\./);
    }
  });

  it("gap 11.3: no termDefinitions source cites the statute alone", () => {
    // PL 119-21 § 71119 added SSA § 1902(xx); CMS-2454-IFC codifies it at
    // 42 CFR 435.550-435.563. The statute is provenance, the CFR controls.
    for (const [key, def] of Object.entries(termDefinitions)) {
      expect(def.source, key).not.toMatch(/^HR1/);
    }
  });

  it("gap 11.3: definitions sourced to the rule name the CFR part", () => {
    const ruleSourced = Object.values(termDefinitions).filter((d) =>
      d.source.includes("42 CFR"),
    );
    expect(ruleSourced.length).toBeGreaterThan(15);
    for (const def of ruleSourced) {
      expect(def.source).toContain("435.550-435.563");
    }
  });
});
