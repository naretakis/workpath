#!/usr/bin/env bash
#
# Mechanical gate for HourKeep's compliance-critical modules.
# Invoked by .kiro/hooks/compliance-gate.json on save under src/lib/.
#
# Exit codes follow the Kiro PreToolUse/PostToolUse convention:
#   0  everything that must pass, passed (warnings may still be printed)
#   2  a type error — blocks, because a type error is never intentional
#
# Deliberately NON-blocking:
#   - test failures, because TDD means red is often the correct state
#   - the policy-literal scan, because it is a smoke alarm and not a proof
#
# Reads the hook's JSON payload on stdin and ignores it; the gate is cheap
# enough to run whole rather than per-file.

set -uo pipefail
cd "$(dirname "$0")/.." || exit 0

# Drain stdin so the caller never blocks on a full pipe.
if [ ! -t 0 ]; then cat >/dev/null 2>&1 || true; fi

status=0

# --- 1. Types. Blocking. ------------------------------------------------------
if ! tsc_out=$(npx --no-install tsc --noEmit 2>&1); then
  echo "BLOCKED: tsc --noEmit failed." >&2
  echo "$tsc_out" | grep -E "error TS" | head -20 >&2
  status=2
fi

# --- 2. Tests. Non-blocking. --------------------------------------------------
if node -e "process.exit(require('./package.json').scripts?.test ? 0 : 1)" 2>/dev/null; then
  if ! test_out=$(npm test --silent 2>&1); then
    echo "WARNING: tests are red. Intentional under TDD; not blocking."
    echo "$test_out" | tail -25
  fi
else
  echo "NOTE: no test script yet (W0 adds Vitest). Skipping tests."
fi

# --- 3. Policy literals. Non-blocking, tightly scoped. ------------------------
# Scoped to the compliance-critical modules only. A repo-wide grep for 80 and 580
# matches widths, 1980, and the 1920x1080 camera constraint — noise on day one,
# disabled by day three. See docs/audit/validation-findings-2026-08.md § C10.
#
# src/lib/policy/ is the allowlist: literals are supposed to live there.
# Suppress a deliberate line with a trailing  // policy-literal-ok  comment.
targets=(
  src/lib/calculations.ts
  src/lib/utils/payPeriodConversion.ts
  src/lib/storage/income.ts
  src/lib/exemptions/calculator.ts
  src/lib/assessment/recommendationEngine.ts
)
existing=()
for f in "${targets[@]}"; do [ -f "$f" ] && existing+=("$f"); done

if [ ${#existing[@]} -gt 0 ]; then
  hits=$(grep -nE '(^|[^0-9._$A-Za-z])(80|580|7\.25|4\.33)([^0-9%A-Za-z]|$)' "${existing[@]}" 2>/dev/null \
    | grep -vE ':[[:space:]]*(//|\*|/\*)' \
    | grep -v 'policy-literal-ok' \
    || true)
  if [ -n "$hits" ]; then
    count=$(printf '%s\n' "$hits" | grep -c '')
    echo "WARNING: $count possible policy literal(s) outside src/lib/policy/ (ADR-0001):"
    printf '%s\n' "$hits" | sed 's/^/  /'
    echo "  Move to the policy profile, or mark the line // policy-literal-ok"
  fi
fi

exit $status
