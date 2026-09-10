import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const CDP_PORT = Number(process.env.GRIDDO_CDP_PORT ?? 9222);
const APP_ORIGIN = process.env.GRIDDO_APP_ORIGIN ?? "http://localhost:3102";
const OUT_DIR = resolve(
  process.cwd(),
  "docs/verification/inbox-triage/task-164-stage-a-assets/T164-CA-I01-run-10",
);

const IDS = Object.freeze({
  root: "11111111-1111-4111-8111-111111111111",
  level1: "22222222-2222-4222-8222-222222222222",
  level2: "33333333-3333-4333-8333-333333333333",
  scratch: "44444444-4444-4444-8444-444444444444",
  breakdown1: "55555555-5555-4555-8555-555555555555",
  breakdown2: "66666666-6666-4666-8666-666666666666",
  breakdown3: "77777777-7777-4777-8777-777777777777",
  candidate: "88888888-8888-4888-8888-888888888888",
  rootBit: "99999999-9999-4999-8999-999999999999",
  level1Bit: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  level2Bit: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
});

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function connect() {
  const pages = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
  const page = pages.find((candidate) => candidate.url.startsWith(APP_ORIGIN));
  if (!page) throw new Error(`No Chrome page is open at ${APP_ORIGIN}`);

  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolveOpen, rejectOpen) => {
    socket.onopen = resolveOpen;
    socket.onerror = rejectOpen;
  });

  let nextId = 0;
  const pending = new Map();
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolveCall, rejectCall } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) rejectCall(new Error(JSON.stringify(message.error)));
      else resolveCall(message.result);
    }
  };

  const call = (method, params = {}) =>
    new Promise((resolveCall, rejectCall) => {
      const id = ++nextId;
      pending.set(id, { resolveCall, rejectCall });
      socket.send(JSON.stringify({ id, method, params }));
    });

  return { call, close: () => socket.close() };
}

const { call, close } = await connect();
const records = [];
const interactions = [];

async function evaluate(expression, { awaitPromise = false } = {}) {
  const result = await call("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? "Browser evaluation failed");
  }
  return result.result.value;
}

async function waitFor(selector, timeoutMs = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${selector}`);
}

async function setViewport(width, height) {
  await call("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
}

async function setTheme(theme, mode) {
  await evaluate(`(() => {
    localStorage.setItem("griddo-color-theme", ${JSON.stringify(theme)});
    localStorage.setItem("theme", ${JSON.stringify(mode)});
    document.documentElement.dataset.colorTheme = ${JSON.stringify(theme)};
    document.documentElement.classList.toggle("dark", ${mode === "dark"});
    document.documentElement.classList.toggle("light", ${mode === "light"});
  })()`);
  await delay(100);
}

async function reload(theme, mode) {
  await evaluate(`localStorage.setItem("griddo-color-theme", ${JSON.stringify(theme)}); localStorage.setItem("theme", ${JSON.stringify(mode)});`);
  await call("Page.reload", { ignoreCache: true });
  await delay(500);
  await waitFor('[data-testid="triage-workspace"]');
  await setTheme(theme, mode);
  await delay(250);
  await evaluate(`[...document.querySelectorAll('button[aria-label]')]
    .find((element) => element.getAttribute('aria-label') === 'Plan launch narrative and interface review')?.click()`);
  await delay(150);
}

function fixtureExpression({ empty = false, readyForArchive = false } = {}) {
  return `(async () => {
    const ids = ${JSON.stringify(IDS)};
    const request = indexedDB.open("GridDO");
    const database = await new Promise((resolveOpen, rejectOpen) => {
      request.onsuccess = () => resolveOpen(request.result);
      request.onerror = () => rejectOpen(request.error);
    });
    const readAll = (store) => new Promise((resolveRead, rejectRead) => {
      const read = database.transaction(store).objectStore(store).getAll();
      read.onsuccess = () => resolveRead(read.result);
      read.onerror = () => rejectRead(read.error);
    });
    const existingNodes = await readAll("nodes");
    const inbox = existingNodes.find((node) => node.systemRole === "inbox");
    if (!inbox) throw new Error("Inbox system node was not seeded");
    const now = Date.now();
    const stores = ["nodes", "bits", "scratchBreakdowns", "stagedCandidates"];
    const transaction = database.transaction(stores, "readwrite");
    const nodes = transaction.objectStore("nodes");
    const bits = transaction.objectStore("bits");
    const breakdowns = transaction.objectStore("scratchBreakdowns");
    const candidates = transaction.objectStore("stagedCandidates");
    for (const node of existingNodes) {
      if (node.systemRole === null) nodes.delete(node.id);
    }
    bits.clear();
    breakdowns.clear();
    candidates.clear();
    if (!${empty}) {
      const nodeBase = {
        color: "hsl(210, 40%, 50%)", icon: "circle", deadline: null,
        deadlineAllDay: false, mtime: now, createdAt: now, version: 1,
        x: 0, y: 0, deletedAt: null, archivedAt: null,
        pastDeadlineDismissed: false, systemRole: null, hiddenFromGrid: false,
      };
      nodes.put({ ...nodeBase, id: ids.root, title: "Launch Program", parentId: null, level: 0, x: 2, y: 1 });
      nodes.put({ ...nodeBase, id: ids.level1, title: "Research", parentId: ids.root, level: 1, x: 1, y: 1 });
      nodes.put({ ...nodeBase, id: ids.level2, title: "Interface", parentId: ids.level1, level: 2, x: 0, y: 1 });
      const bitBase = {
        description: "", icon: "check", deadline: null, deadlineAllDay: false,
        priority: "high", status: "active", mtime: now, createdAt: now,
        version: 1, x: 0, y: 0, deletedAt: null, archivedAt: null,
        pastDeadlineDismissed: false,
      };
      bits.put({ ...bitBase, id: ids.scratch, title: "Plan launch narrative and interface review", parentId: inbox.id });
      bits.put({ ...bitBase, id: ids.rootBit, title: "Define success metric", parentId: ids.root, x: 3, y: 2 });
      bits.put({ ...bitBase, id: ids.level1Bit, title: "Interview five users", parentId: ids.level1, x: 2, y: 2 });
      bits.put({ ...bitBase, id: ids.level2Bit, title: "Review interaction states", parentId: ids.level2, x: 1, y: 2 });
      const consumedAt = ${readyForArchive} ? now : null;
      breakdowns.put({ id: ids.breakdown1, scratchBitId: ids.scratch, content: "Draft launch narrative", order: 0, createdAt: now, consumedAt, version: 1 });
      breakdowns.put({ id: ids.breakdown2, scratchBitId: ids.scratch, content: "Map interaction states", order: 1, createdAt: now + 1, consumedAt, version: 1 });
      breakdowns.put({ id: ids.breakdown3, scratchBitId: ids.scratch, content: "Schedule interface review", order: 2, createdAt: now + 2, consumedAt, version: 1 });
      if (!${readyForArchive}) {
        candidates.put({
          id: ids.candidate, scratchBitId: ids.scratch,
          sourceBreakdownId: ids.breakdown3, resultType: "bit", lifecycle: "staged",
          createdAt: now, updatedAt: now, version: 1,
        });
      }
    }
    await new Promise((resolveWrite, rejectWrite) => {
      transaction.oncomplete = resolveWrite;
      transaction.onerror = () => rejectWrite(transaction.error);
      transaction.onabort = () => rejectWrite(transaction.error);
    });
    return { inboxId: inbox.id };
  })()`;
}

async function seed(options = {}) {
  await evaluate(fixtureExpression(options), { awaitPromise: true });
}

async function transitionToArchiveReady() {
  await evaluate(`(async () => {
    const ids = ${JSON.stringify(IDS)};
    const request = indexedDB.open("GridDO");
    const database = await new Promise((resolveOpen, rejectOpen) => {
      request.onsuccess = () => resolveOpen(request.result);
      request.onerror = () => rejectOpen(request.error);
    });
    const transaction = database.transaction(["scratchBreakdowns", "stagedCandidates"], "readwrite");
    const breakdowns = transaction.objectStore("scratchBreakdowns");
    const candidates = transaction.objectStore("stagedCandidates");
    const now = Date.now();
    for (const id of [ids.breakdown1, ids.breakdown2, ids.breakdown3]) {
      const row = await new Promise((resolveRead, rejectRead) => {
        const read = breakdowns.get(id);
        read.onsuccess = () => resolveRead(read.result);
        read.onerror = () => rejectRead(read.error);
      });
      if (row) breakdowns.put({ ...row, consumedAt: now, version: row.version + 1 });
    }
    candidates.clear();
    await new Promise((resolveWrite, rejectWrite) => {
      transaction.oncomplete = resolveWrite;
      transaction.onerror = () => rejectWrite(transaction.error);
      transaction.onabort = () => rejectWrite(transaction.error);
    });
  })()`, { awaitPromise: true });
  await call("Page.reload", { ignoreCache: true });
  await delay(500);
  await waitFor('[data-testid="triage-workspace"]');
  await delay(250);
  await evaluate(`[...document.querySelectorAll('button[aria-label]')]
    .find((element) => element.getAttribute('aria-label') === 'Plan launch narrative and interface review')?.click()`);
  await waitFor('[data-triage-role="archive-completion-reopen"]');
  await evaluate(`document.querySelector('[data-triage-role="archive-completion-reopen"]')?.click()`);
  await waitFor('[data-triage-role="archive-completion-overlay"]');
  await delay(300);
}

async function expandExplorer() {
  for (const title of ["Launch Program", "Research", "Interface"]) {
    await evaluate(`[...document.querySelectorAll('[data-triage-role="explorer-node-card"]')].find((element) => element.textContent.includes(${JSON.stringify(title)}))?.click()`);
    await delay(150);
  }
}

async function screenshot(id, meta) {
  const result = await call("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  const bytes = Buffer.from(result.data, "base64");
  const path = resolve(OUT_DIR, `${id}.png`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, bytes);
  records.push({
    id,
    path: path.slice(process.cwd().length + 1),
    sha256: sha256(bytes),
    bytes: bytes.length,
    ...meta,
  });
}

async function rect(selector, occurrence = 0) {
  return evaluate(`(() => {
    const element = document.querySelectorAll(${JSON.stringify(selector)})[${occurrence}];
    if (!element) throw new Error("Missing pointer target: " + ${JSON.stringify(selector)});
    const box = element.getBoundingClientRect();
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  })()`);
}

async function movePointer(selector, occurrence = 0) {
  const point = await rect(selector, occurrence);
  await call("Input.dispatchMouseEvent", { type: "mouseMoved", ...point });
  return point;
}

async function drag(sourceSelector, targetSelector, sourceOccurrence = 0) {
  const source = await rect(sourceSelector, sourceOccurrence);
  const target = await rect(targetSelector);
  const firstPointer = { x: source.x + 18, y: source.y + 10 };
  await call("Input.dispatchMouseEvent", { type: "mouseMoved", ...source });
  await call("Input.dispatchMouseEvent", { type: "mousePressed", ...source, button: "left", clickCount: 1 });
  await call("Input.dispatchMouseEvent", { type: "mouseMoved", ...firstPointer, buttons: 1 });
  await delay(100);
  const firstToken = await evaluate(`(() => {
    const token = document.querySelector('[data-triage-role="drag-token"]');
    if (!token) return null;
    const box = token.getBoundingClientRect();
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  })()`);
  await call("Input.dispatchMouseEvent", { type: "mouseMoved", ...target, buttons: 1 });
  await delay(250);
  const secondToken = await evaluate(`(() => {
    const token = document.querySelector('[data-triage-role="drag-token"]');
    if (!token) return null;
    const box = token.getBoundingClientRect();
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  })()`);
  return {
    source,
    target,
    motionSamples: {
      pointer: [firstPointer, target],
      dragToken: [firstToken, secondToken],
    },
  };
}

async function release(point) {
  await call("Input.dispatchMouseEvent", { type: "mouseReleased", ...point, button: "left", clickCount: 1 });
  await delay(250);
}

async function cancelDrag() {
  await call("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
  await call("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape" });
  await delay(150);
}

async function tabTo(selector) {
  await evaluate(`document.body.tabIndex = -1; document.body.focus()`);
  for (let index = 0; index < 80; index += 1) {
    await call("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab" });
    await call("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab" });
    const matched = await evaluate(`document.activeElement?.matches(${JSON.stringify(selector)}) ?? false`);
    if (matched) return;
  }
  throw new Error(`Could not reach ${selector} with the keyboard`);
}

async function clickText(text, scope = "document") {
  const clicked = await evaluate(`(() => {
    const root = ${scope};
    const element = [...root.querySelectorAll("button,[role=button]")]
      .find((candidate) => !candidate.disabled && candidate.textContent.trim() === ${JSON.stringify(text)});
    if (!element) return false;
    element.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`Missing action with text: ${text}`);
  await delay(200);
}

async function captureMatrix(theme, mode, width) {
  const height = width === 1920 ? 1080 : 768;
  await setViewport(width, height);
  await seed();
  await reload(theme, mode);
  await expandExplorer();
  const prefix = `${theme}-${mode}-${width}`;
  await screenshot(`${prefix}-01-populated-level3`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [1, 2, 3, 4, 5, 6], state: "populated; Explorer through Level 3",
  });

  await movePointer('[data-triage-role="breakdown-active-row"]');
  await tabTo('[data-triage-role="breakdown-add-field"]');
  await screenshot(`${prefix}-02-hover-focus-visible`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [4], state: "physical pointer hover plus true keyboard focus-visible",
  });

  const validDrag = await drag('button[aria-label="Drag breakdown"]:not(:disabled)', '[data-triage-role="staging-node-well"]');
  const validState = await evaluate(`document.querySelector('[data-triage-role="staging-node-well"]')?.dataset.triageTargetState`);
  const ordinaryMotion = await evaluate(`(() => {
    const token = document.querySelector('[data-triage-role="drag-token"]');
    return {
      dragTokenPresent: Boolean(token),
      dragTokenTransform: token ? getComputedStyle(token).transform : null,
      activeTargetCount: document.querySelectorAll('[data-triage-target-state="valid"]').length,
    };
  })()`);
  ordinaryMotion.samples = validDrag.motionSamples;
  const [firstToken, secondToken] = validDrag.motionSamples.dragToken;
  ordinaryMotion.dragTokenDistance = firstToken && secondToken
    ? Math.hypot(secondToken.x - firstToken.x, secondToken.y - firstToken.y)
    : 0;
  if (ordinaryMotion.dragTokenDistance < 10) {
    throw new Error(`Ordinary DnD token did not visibly move: ${JSON.stringify(ordinaryMotion)}`);
  }
  await screenshot(`${prefix}-03-dnd-source-eligible-active`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [4, 5, 7], state: `physical DnD source and active target (${validState})`,
  });
  interactions.push({ id: `${prefix}-valid-dnd`, method: "CDP physical mouse", targetState: validState, ordinaryMotion });
  await cancelDrag();
  const interruptionResult = await evaluate(`({
    dragTokenPresent: Boolean(document.querySelector('[data-triage-role="drag-token"]')),
    activeTargetCount: document.querySelectorAll('[data-triage-target-state="valid"]').length,
  })`);
  if (interruptionResult.dragTokenPresent || interruptionResult.activeTargetCount !== 0) {
    throw new Error(`Escape did not restore DnD state: ${JSON.stringify(interruptionResult)}`);
  }
  await screenshot(`${prefix}-03b-dnd-interrupted`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [4, 5, 7], state: "physical DnD interrupted with Escape; source and target restored",
    interruptionResult,
  });
  interactions.push({ id: `${prefix}-dnd-interruption`, method: "CDP Escape key", ...interruptionResult });

  const directDrag = await drag('button[aria-label="Drag breakdown"]:not(:disabled)', '[data-triage-role="explorer-node-card"]');
  await release(directDrag.target);
  await waitFor('[data-triage-role="placement-affordance"]');
  await screenshot(`${prefix}-04-direct-placement`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [6, 7], state: "direct Placement geometry inside target column",
  });
  await clickText("Cancel", `document.querySelector('[data-triage-role="placement-affordance"]')`);

  return validDrag;
}

async function captureExtended(theme, mode, width) {
  const height = width === 1920 ? 1080 : 768;
  const prefix = `${theme}-${mode}-${width}`;
  await setViewport(width, height);

  await seed();
  await reload(theme, mode);
  await expandExplorer();
  await drag('[data-triage-role="staging-bit-row"][role="button"]', '[data-triage-role="staging-node-well"]');
  const invalidState = await evaluate(`document.querySelector('[data-triage-role="staging-node-well"]')?.dataset.triageTargetState`);
  await screenshot(`${prefix}-05-dnd-invalid`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [5, 7], state: `staged Bit over Node target (${invalidState})`,
  });
  interactions.push({ id: `${prefix}-invalid-dnd`, method: "CDP physical mouse", targetState: invalidState });
  await cancelDrag();

  const stagedDrag = await drag('[data-triage-role="staging-bit-row"][role="button"]', '[data-triage-role="explorer-node-card"]');
  await release(stagedDrag.target);
  await waitFor('[data-triage-role="placement-affordance"]');
  await screenshot(`${prefix}-06-staged-placement`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [5, 6, 7], state: "staged Placement geometry inside target column",
  });
  await clickText("Cancel", `document.querySelector('[data-triage-role="placement-affordance"]')`);

  await seed();
  await reload(theme, mode);
  await clickText("Edit", `document.querySelector('[data-triage-role="context-action-cluster"]')`);
  await waitFor('[data-testid="selected-scratch-context"] [data-triage-role="inline-editor-field"]');
  await screenshot(`${prefix}-07-edit-save-cancel-open`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [3], state: "Edit open with Save and Cancel",
  });
  await clickText("Cancel", `document.querySelector('[data-triage-role="context-action-slot"]')`);
  await clickText("Edit", `document.querySelector('[data-triage-role="context-action-cluster"]')`);
  const titleInput = await evaluate(`(() => {
    const input = document.querySelector('[data-triage-role="inline-editor-field"]');
    input.focus(); input.select(); return Boolean(input);
  })()`);
  if (!titleInput) throw new Error("Scratch title editor did not open");
  await call("Input.insertText", { text: "Launch narrative review" });
  await clickText("Save", `document.querySelector('[data-triage-role="context-action-slot"]')`);
  await screenshot(`${prefix}-08-edit-save-result`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [3], state: "Edit to Save result",
  });
  await clickText("Edit", `document.querySelector('[data-triage-role="context-action-cluster"]')`);
  const cancelInput = await evaluate(`(() => {
    const input = document.querySelector('[data-triage-role="inline-editor-field"]');
    input.focus(); input.select(); return Boolean(input);
  })()`);
  if (!cancelInput) throw new Error("Scratch title editor did not reopen");
  await call("Input.insertText", { text: "Discard this draft" });
  await screenshot(`${prefix}-09-edit-cancel-dirty`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [3], state: "Edit dirty draft before Cancel",
  });
  await clickText("Cancel", `document.querySelector('[data-triage-role="context-action-slot"]')`);
  await screenshot(`${prefix}-09b-edit-cancel-result`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [3], state: "Edit to Cancel result after dirty draft",
  });

  await evaluate(`document.querySelector('[data-triage-role="breakdown-add-field"]')?.click()`);
  await delay(100);
  await screenshot(`${prefix}-10-add-active`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [4], state: "Add active editor",
  });
  await evaluate(`document.querySelector('input[data-triage-role="breakdown-add-field"]')?.focus()`);
  await call("Input.insertText", { text: "Verify launch checklist" });
  await clickText("Add");
  await screenshot(`${prefix}-11-add-result`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [4], state: "Add result and status",
  });

  await seed();
  await reload(theme, mode);
  await expandExplorer();
  await screenshot(`${prefix}-12-newly-undo-before`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [8], state: "before placement; no Newly or Undo marker",
  });
  const directDrag = await drag('button[aria-label="Drag breakdown"]:not(:disabled)', '[data-triage-role="explorer-node-card"]');
  await release(directDrag.target);
  await delay(750);
  await clickText("Bit", `document.querySelector('[data-triage-role="placement-affordance"]')`);
  await delay(500);
  await clickText("Confirm", `document.querySelector('[data-triage-role="placement-affordance"]')`);
  await waitFor(".newly-card-shell");
  await screenshot(`${prefix}-12-newly-undo-active`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [8], state: "Newly marker and Undo available",
  });
  await evaluate(`document.querySelector('[data-triage-role="newly-undo-action"]')?.click()`);
  await delay(350);
  await screenshot(`${prefix}-13-newly-undo-after`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [8], state: "Undo after activation",
  });

  await seed();
  await reload(theme, mode);
  await transitionToArchiveReady();
  await screenshot(`${prefix}-14-archive-ready`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [9], state: "archive-ready completion state",
  });
  const archiveAction = await evaluate(`(() => {
    const button = [...document.querySelectorAll('[data-triage-role="archive-completion-overlay"] button')]
      .find((candidate) => /archive scratch/i.test(candidate.textContent));
    if (!button) return null; button.click(); return button.textContent.trim();
  })()`);
  if (archiveAction) {
    await delay(450);
    await screenshot(`${prefix}-15-archive-completion`, {
      theme, mode, viewport: `${width}x${height}`,
      recipes: [9], state: `archive/completion after ${archiveAction}`,
    });
  }

  await seed({ empty: true });
  await reload(theme, mode);
  await screenshot(`${prefix}-16-empty-states`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [2, 3, 4, 5, 6], state: "empty Scratch, context, Breakdown, Staging and Explorer",
  });

  await call("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await seed();
  await reload(theme, mode);
  const reducedTransitions = await evaluate(`[...document.querySelectorAll('.triage-shell *')]
    .map((element) => {
      const style = getComputedStyle(element);
      return { property: style.transitionProperty, duration: style.transitionDuration };
    })
    .filter((value) => value.property !== 'none' && value.duration !== '0s' && value.duration !== '1e-05s')`);
  await screenshot(`${prefix}-17-reduced-motion`, {
    theme, mode, viewport: `${width}x${height}`,
    recipes: [1, 4, 5, 6, 7, 8, 9],
    state: "prefers-reduced-motion: reduce",
    effectiveTransitions: reducedTransitions,
  });
  interactions.push({
    id: `${prefix}-reduced-motion`,
    method: "CDP emulated media feature",
    effectiveTransitionCount: reducedTransitions.length,
  });
  await call("Emulation.setEmulatedMedia", { features: [] });
}

async function auditTouchTargets(theme, mode, width) {
  const height = width === 1920 ? 1080 : 768;
  await setViewport(width, height);
  await call("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  const samples = [];
  async function collectTouchTargets(scenario) {
    const result = await evaluate(`(() => {
    const elements = [...document.querySelectorAll('.triage-shell a, .triage-shell button, .triage-shell input, .triage-shell select, .triage-shell textarea, .triage-shell [role="button"], .triage-shell [role="link"]')]
      .filter((element) => !element.disabled && getComputedStyle(element).display !== 'none');
    const rows = elements.map((element) => {
      const box = element.getBoundingClientRect();
      return {
        scenario: ${JSON.stringify(scenario)},
        name: element.getAttribute('aria-label') || element.textContent.trim().slice(0, 80),
        role: element.dataset.triageRole || element.tagName.toLowerCase(),
        width: Number(box.width.toFixed(2)), height: Number(box.height.toFixed(2)),
      };
    });
    return { count: rows.length, failures: rows.filter((row) => row.width < 44 || row.height < 44), rows };
  })()`);
    samples.push({ scenario, ...result });
    return result;
  }

  await seed();
  await reload(theme, mode);
  await expandExplorer();
  await collectTouchTargets("populated-level3");
  await screenshot(`${theme}-${mode}-${width}-18a-touch-populated`, {
    theme, mode, viewport: `${width}x${height}`, recipes: [1, 2, 3, 4, 5, 6], state: "coarse pointer populated touch targets",
  });

  await clickText("Edit", `document.querySelector('[data-triage-role="context-action-cluster"]')`);
  await collectTouchTargets("edit-save-cancel");
  await screenshot(`${theme}-${mode}-${width}-18b-touch-edit`, {
    theme, mode, viewport: `${width}x${height}`, recipes: [3], state: "coarse pointer Edit Save/Cancel touch targets",
  });

  await seed();
  await reload(theme, mode);
  await expandExplorer();
  const placementDrag = await drag('button[aria-label="Drag breakdown"]:not(:disabled)', '[data-triage-role="explorer-node-card"]');
  await release(placementDrag.target);
  await waitFor('[data-triage-role="placement-affordance"]');
  await collectTouchTargets("direct-placement");
  await screenshot(`${theme}-${mode}-${width}-18c-touch-placement`, {
    theme, mode, viewport: `${width}x${height}`, recipes: [7], state: "coarse pointer direct Placement touch targets",
  });
  await delay(750);
  await clickText("Bit", `document.querySelector('[data-triage-role="placement-affordance"]')`);
  await delay(500);
  await clickText("Confirm", `document.querySelector('[data-triage-role="placement-affordance"]')`);
  await waitFor(".newly-card-shell");
  await collectTouchTargets("newly-undo");
  await screenshot(`${theme}-${mode}-${width}-18d-touch-newly`, {
    theme, mode, viewport: `${width}x${height}`, recipes: [8], state: "coarse pointer Newly/Undo touch targets",
  });

  await seed();
  await reload(theme, mode);
  await transitionToArchiveReady();
  await collectTouchTargets("archive-overlay");
  await screenshot(`${theme}-${mode}-${width}-18e-touch-archive`, {
    theme, mode, viewport: `${width}x${height}`, recipes: [9], state: "coarse pointer Archive touch targets",
  });

  const failures = samples.flatMap((sample) => sample.failures);
  interactions.push({
    id: `${theme}-${mode}-${width}-touch-targets`,
    viewport: `${width}x${height}`,
    includesDivRoleButton: true,
    scenarios: samples,
    count: samples.reduce((sum, sample) => sum + sample.count, 0),
    failures,
  });
  if (failures.length > 0) throw new Error(`Touch target failures: ${JSON.stringify(failures)}`);
  await call("Emulation.setTouchEmulationEnabled", { enabled: false });
}

try {
  mkdirSync(OUT_DIR, { recursive: true });
  await call("Page.enable");
  await call("Runtime.enable");
  for (const theme of ["neumorphism", "retro-mac"]) {
    for (const mode of ["light", "dark"]) {
      for (const width of [1024, 1920]) {
        await captureMatrix(theme, mode, width);
        await captureExtended(theme, mode, width);
        await auditTouchTargets(theme, mode, width);
      }
    }
  }

  const browser = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`)).json();
  const manifest = {
    schema: "griddo.task-164.stage-a.browser-evidence.v1",
    iterationId: "T164-CA-I01",
    generatedAt: new Date().toISOString(),
    appOrigin: APP_ORIGIN,
    browser: browser.Browser,
    protocolVersion: browser["Protocol-Version"],
    fixtureIds: IDS,
    screenshots: records,
    interactions,
  };
  const manifestPath = resolve(OUT_DIR, "browser-evidence-manifest.json");
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({ manifestPath, screenshotCount: records.length, interactionCount: interactions.length }, null, 2));
} finally {
  close();
}
