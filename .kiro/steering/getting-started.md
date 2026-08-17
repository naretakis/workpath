# Getting Started with HourKeep

Orientation for anyone picking this project up, including me after a break.

---

## What you're building

An offline-first PWA that helps Medicaid beneficiaries **assemble and organize the evidence their state
will ask for** under the community engagement requirement. It does not decide anyone's status — states do
that. See `docs/hr1-readiness/decisions/ADR-0003-evidence-not-adjudication.md`; it's the load-bearing
decision and everything else follows from it.

**Deadline:** states must implement by January 1, 2027, but the application review period assesses the
months *preceding* application, so the operative date is roughly **December 1, 2026**.

## Where to look first

| Question | File |
|---|---|
| Where are we, what's next? | `docs/hr1-readiness/README.md` |
| What does the law actually require? | `docs/domain/cms-2454-ifc/rule-extract.md` |
| What's wrong with the app today? | `docs/hr1-readiness/gap-analysis.md` |
| Why is it built this way? | `docs/hr1-readiness/decisions/` |
| What am I working on? | `docs/hr1-readiness/waves/` |

Domain rules live in `medicaid-domain-knowledge.md`. Engineering rules live in
`engineering-standards.md`. Both are always in context.

Three more load only when you're in the relevant files: `compliance-copy-standards.md` for user-facing
strings, `data-migration-standards.md` for anything under `src/lib/`, `component-standards.md` for
components and theme.

## Stack

Next.js 16 (App Router, `output: "export"`, React Compiler on) · React 19 · MUI · Dexie 4 over IndexedDB ·
`date-fns` · `next-pwa`. No server, no accounts, no backend. Deployed to GitHub Pages at hourkeep.app.

Tailwind is installed but unused and is being removed — style with MUI's `sx` prop.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export to out/
npx tsc --noEmit     # type check
npm run lint
npm run format
```

Note: `npm run dev` and any watcher will block your terminal. Run them yourself rather than through an
agent.

## Working rhythm

1. **Pick up the current wave** from `docs/hr1-readiness/README.md`.
2. **Read the wave file** — it has scope, acceptance criteria, and known risks.
3. **For compliance logic, write the failing test first.** See ADR-0007 for what counts as
   compliance logic and why this is non-negotiable there.
4. **Build it.** Check the browser, check DevTools → Application → IndexedDB.
5. **Run the review protocol** before calling the wave done (`.kiro/hooks/wave-review.kiro.hook`) — four
   independent reviewers in parallel, then verify their findings before believing them.
6. **Commit** when something works and is verified.

Saving anything under the compliance-critical `src/lib/` modules fires `.kiro/hooks/compliance-gate.json`
automatically: type check (blocks on failure), tests (warns — red is expected mid-TDD), and a policy-literal
scan (warns). It runs `scripts/compliance-gate.sh`, which you can also run by hand.

## Debugging

- **Console** for errors · **Application → IndexedDB** to inspect the database ·
  **Network** to confirm the service worker · **Lighthouse** for the PWA score.
- `Module not found` → `npm install <package>`.
- Nothing renders → check the console, then whether the component is actually imported and rendered.
- Data looks wrong → inspect IndexedDB directly before assuming the UI is at fault. Several bugs in this
  codebase were storage-layer, not render-layer.

## A note on testing

An earlier version of this document said not to worry about automated testing. **That was appropriate when
this was a learning project and is wrong now.**

The reason is narrow and specific: five modules decide whether a user believes they will keep their health
coverage. If those are wrong, someone can be told they're fine when they aren't, and not respond to a notice
they could have answered. That is the one failure this project cannot absorb.

So: **tests are required for compliance logic and optional for UI.** ADR-0007 has the exact scope. Everywhere
else, the old advice still stands — build it, click around, ship it.

## When you're stuck

Read the error. Search it. Check the docs
([Next.js](https://nextjs.org/docs) · [MUI](https://mui.com/) · [Dexie](https://dexie.org/)). Ask.
Take a break.

And if you're stuck on *what the rule requires* rather than on code, the answer is almost certainly in
`docs/domain/cms-2454-ifc/rule-extract.md` with a citation attached. Use it rather than reasoning from
memory — the rule is more specific and more counterintuitive than it looks.

## Remember

- Simple beats complex.
- Correct beats complete — fewer accurate statements, not more approximate ones.
- Working beats perfect, **except** in the five compliance-critical modules.
- Say "I don't know" in the UI when the app doesn't know. Uncertainty is content, not a gap to paper over.

You've got this.
