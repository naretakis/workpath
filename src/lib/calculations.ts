import { Activity, MonthlySummary } from "@/types";
import { isValidMonth } from "@/lib/month";

/**
 * Total a single month's logged hours.
 *
 * The `month` parameter is **required and validated**. It used to be optional,
 * falling back to `format(new Date(), "yyyy-MM")`, and `tracking/page.tsx` was the
 * caller that forgot it — so the whole tracking surface silently reported today
 * regardless of which month the user was looking at. ADR-0005 names the reason:
 * "an optional month argument hides the bug where a caller forgets to pass one and
 * silently gets today."
 *
 * That default was wrong in the direction that costs someone coverage. Every use of
 * this app is retrospective: 42 CFR 435.556(a)(1) assesses the months **preceding**
 * application, and 42 CFR 435.558 gives roughly 35 days to document months already
 * gone. The user who most needs this is looking at December, not at today.
 *
 * WHY THE FILTER IS STILL `startsWith` AND NOT `monthOfDate(date) === month`.
 * Two reasons, and both are about not trading one bug for another.
 *
 * - String comparison cannot drift across a timezone boundary. W0 pinned that as a
 *   property to preserve after W2a found a real month-boundary bug of exactly this
 *   shape in the export builder. `.kiro/steering/data-migration-standards.md` names
 *   the class.
 * - `monthOfDate` throws on a malformed date, so a single corrupt row would blow up
 *   the whole summary and hide every hour the user had logged. A prefix comparison
 *   skips the bad row and still shows the rest.
 *
 * What made `startsWith` dangerous was never the comparison — it was the
 * unvalidated needle. A bare `"2026"` used to match the entire year and return it
 * as `month`. Validating the needle closes that without giving up the immunity.
 *
 * @param activities Any activities; only those in `month` are counted.
 * @param month The calendar month to total, as `YYYY-MM`.
 * @throws if `month` is not a well-formed `YYYY-MM`.
 */
export function calculateMonthlySummary(
  activities: Activity[],
  month: string,
): MonthlySummary {
  if (!isValidMonth(month)) {
    throw new Error(
      `calculateMonthlySummary needs a month as YYYY-MM, got ${JSON.stringify(month)}. ` +
        `A bare year would silently total twelve months and report them as one ` +
        `(ADR-0005).`,
    );
  }

  // Prefix comparison against a validated YYYY-MM. See the note above.
  const monthActivities = activities.filter((activity) =>
    activity.date.startsWith(month),
  );

  // Calculate totals by type
  let workHours = 0;
  let volunteerHours = 0;
  let educationHours = 0;

  monthActivities.forEach((activity) => {
    switch (activity.type) {
      case "work":
        workHours += activity.hours;
        break;
      case "volunteer":
        volunteerHours += activity.hours;
        break;
      case "education":
        educationHours += activity.hours;
        break;
    }
  });

  // Calculate total hours
  const totalHours = workHours + volunteerHours + educationHours;

  // Determine compliance (80 hours required)
  const isCompliant = totalHours >= 80;

  // Calculate hours needed (0 if compliant)
  const hoursNeeded = isCompliant ? 0 : 80 - totalHours;

  return {
    month,
    totalHours,
    workHours,
    volunteerHours,
    educationHours,
    isCompliant,
    hoursNeeded,
  };
}
