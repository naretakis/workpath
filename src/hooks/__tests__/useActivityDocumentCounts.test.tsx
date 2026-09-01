/**
 * W0 § 0.6 — the dependency array that lint cannot see, and the render loop behind it.
 *
 * `useActivityDocumentCounts` depended on `[activityIds, activityIdsKey]`.
 * `activityIds` is a `number[]` prop and its only caller builds it fresh on every
 * render (`ActivityList.tsx:52`), so the reference changed every render.
 *
 * That is worse than one redundant query per render. The effect ends in
 * `setCounts(new Map(...))` — a fresh object, so React never bails out of
 * re-rendering — which produced a fresh `activityIds` identity, which re-ran the
 * effect. An unbounded loop, paced only by how fast IndexedDB answers, on a device
 * that is often an old phone. The primary symptom is battery and heat, which is why
 * nobody had spotted it.
 *
 * `activityIdsKey` (the joined string) was already present and is stable across
 * renders with equal contents. It was doing the right job; the array beside it
 * defeated it.
 *
 * ## Why this needed a test rather than a glance
 *
 * `react-hooks/exhaustive-deps` CANNOT flag this. The rule reports dependencies that
 * are MISSING; this array was over-specified, which satisfies it completely. Measured
 * during W0 planning against `eslint-plugin-react-hooks` 7.1.1 with inline disables
 * ignored — 11 errors across 8 files — and this hook was not among them.
 *
 * ## A regression here fails CI, but UGLY, and three attempts to fix that failed
 *
 * Be warned before trying a fourth. Against the unfixed hook this file does not
 * produce an assertion failure — the Vitest worker dies after roughly 95 seconds with
 * "Worker exited unexpectedly". `vitest --run` exits 1, so **CI does catch it**, which
 * is the property that matters. What you do not get is a message naming the cause.
 *
 * What was tried, and why each failed:
 *
 * 1. **A render counter throwing past a threshold.** Rejected by
 *    `react-hooks/globals`, correctly: incrementing a module variable during render
 *    is a side effect in render.
 *
 * 2. **A spy on `db.documents.where` throwing past a query cap.** Cannot work. The
 *    hook wraps its query in `try/catch` and the catch calls `setCounts(new Map())`,
 *    so an injected throw is swallowed AND re-triggers the loop it was meant to stop.
 *    Installing the cap in `beforeEach` for every test did not help — 209 seconds,
 *    then the same worker death.
 *
 * 3. **A short per-test timeout.** Does not fire. The loop starves the event loop, so
 *    Vitest never gets to enforce its own timeout; the worker dies first. Measured,
 *    not assumed.
 *
 * The honest summary: this file is a gate, not a diagnosis. If it hangs and the worker
 * dies, the cause is almost certainly an object or array identity back in this hook's
 * dependency array — start there, and read the note in the hook itself.
 */

import "fake-indexeddb/auto";

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  afterAll,
  vi,
} from "vitest";
import { render, waitFor, act } from "@testing-library/react";

import { db } from "@/lib/db";
import { useActivityDocumentCounts } from "@/hooks/useActivityDocumentCounts";

/** Query count for the current test, so assertions can tell "once" from "per render". */
let queryCalls = 0;

function countQueries() {
  const real = db.documents.where.bind(db.documents);
  queryCalls = 0;
  vi.spyOn(db.documents, "where").mockImplementation(((
    ...args: Parameters<typeof real>
  ) => {
    queryCalls += 1;
    return real(...args);
  }) as typeof db.documents.where);
}

function Harness({ ids, tick }: { ids: number[]; tick: number }) {
  // A fresh array identity every render, exactly as ActivityList.tsx produces.
  const counts = useActivityDocumentCounts([...ids]);
  return (
    <div data-testid="out" data-tick={tick}>
      {[...counts.entries()].map(([id, n]) => `${id}:${n}`).join(",")}
    </div>
  );
}

async function seedDocuments(activityId: number, count: number) {
  for (let i = 0; i < count; i++) {
    const blobId = (await db.documentBlobs.add({
      blob: new Blob(["x"], { type: "image/jpeg" }),
      createdAt: new Date(),
    })) as number;
    await db.documents.add({
      activityId,
      blobId,
      type: "pay-stub",
      fileSize: 1,
      mimeType: "image/jpeg",
      captureMethod: "camera",
      createdAt: new Date(),
    });
  }
}

beforeEach(async () => {
  await db.transaction("rw", db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
  });
  countQueries();
});

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(async () => {
  db.close();
});

describe("useActivityDocumentCounts returns correct counts", () => {
  it("counts documents per activity", async () => {
    await seedDocuments(1, 3);
    await seedDocuments(2, 1);

    const { getByTestId } = render(<Harness ids={[1, 2]} tick={0} />);

    await waitFor(() =>
      expect(getByTestId("out").textContent).toContain("1:3"),
    );
    expect(getByTestId("out").textContent).toContain("2:1");
  });

  it("omits activities with no documents rather than reporting zero", async () => {
    await seedDocuments(1, 2);

    const { getByTestId } = render(<Harness ids={[1, 2]} tick={0} />);

    await waitFor(() =>
      expect(getByTestId("out").textContent).toContain("1:2"),
    );
    expect(getByTestId("out").textContent).not.toContain("2:");
  });

  it("returns an empty map for no ids, without querying at all", async () => {
    const { getByTestId } = render(<Harness ids={[]} tick={0} />);

    await waitFor(() => expect(getByTestId("out").textContent).toBe(""));
    expect(queryCalls).toBe(0);
  });
});

describe("the effect runs once per distinct id set, not once per render", () => {
  it("does not re-query when the parent re-renders with an equal array", async () => {
    // THE BUG. Before the fix this queried on every render and never settled.
    await seedDocuments(1, 1);

    const { rerender, getByTestId } = render(<Harness ids={[1, 2]} tick={0} />);
    await waitFor(() =>
      expect(getByTestId("out").textContent).toContain("1:1"),
    );
    const afterFirstRender = queryCalls;

    // Five re-renders with the same ids. A parent re-rendering for unrelated
    // reasons is the normal case, not an edge case.
    for (let tick = 1; tick <= 5; tick++) {
      await act(async () => {
        rerender(<Harness ids={[1, 2]} tick={tick} />);
      });
    }

    expect(queryCalls).toBe(afterFirstRender);
  });

  it("DOES re-query when the id set actually changes", async () => {
    // The other half of the contract: a stable key must not become a stale one.
    await seedDocuments(1, 1);
    await seedDocuments(3, 2);

    const { rerender, getByTestId } = render(<Harness ids={[1]} tick={0} />);
    await waitFor(() =>
      expect(getByTestId("out").textContent).toContain("1:1"),
    );
    const afterFirst = queryCalls;

    await act(async () => {
      rerender(<Harness ids={[1, 3]} tick={1} />);
    });

    await waitFor(() =>
      expect(getByTestId("out").textContent).toContain("3:2"),
    );
    expect(queryCalls).toBeGreaterThan(afterFirst);
  });

  it("re-queries when ids are reordered, because the joined key changes", async () => {
    // Recorded rather than desired. The key is `ids.join(",")`, so [1,2] and [2,1]
    // are different keys and cost an extra query for an identical result. Harmless
    // — the caller derives ids in a stable order — and cheaper to record than to
    // fix with a sort that would then hide a real change.
    await seedDocuments(1, 1);

    const { rerender, getByTestId } = render(<Harness ids={[1, 2]} tick={0} />);
    await waitFor(() =>
      expect(getByTestId("out").textContent).toContain("1:1"),
    );
    const afterFirst = queryCalls;

    await act(async () => {
      rerender(<Harness ids={[2, 1]} tick={1} />);
    });

    expect(queryCalls).toBeGreaterThan(afterFirst);
  });

  it("recovers to an empty map when the ids go away", async () => {
    await seedDocuments(1, 1);

    const { rerender, getByTestId } = render(<Harness ids={[1]} tick={0} />);
    await waitFor(() =>
      expect(getByTestId("out").textContent).toContain("1:1"),
    );

    await act(async () => {
      rerender(<Harness ids={[]} tick={1} />);
    });

    await waitFor(() => expect(getByTestId("out").textContent).toBe(""));
  });
});
