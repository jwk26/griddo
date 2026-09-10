import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const CDP_PORT = Number(process.env.GRIDDO_CDP_PORT ?? 9222);
const ROOT = process.cwd();
const OUTPUT = resolve(
  ROOT,
  "docs/verification/inbox-triage/task-164-stage-a-assets/T164-CA-I01-run-10/comparisons",
);
const RUN = "docs/verification/inbox-triage/task-164-stage-a-assets/T164-CA-I01-run-10";
mkdirSync(OUTPUT, { recursive: true });

const comparisons = [
  {
    id: "neumorphism-prototype-production-light",
    left: "docs/recipes/assets/inbox-triage-2-3/neumorphism-1600x1000.png",
    leftLabel: "PINNED PROTOTYPE · NEUMORPHISM",
    right: `${RUN}/neumorphism-light-1920-01-populated-level3.png`,
    rightLabel: "STAGE A PRODUCTION · LIGHT · LEVEL 3",
  },
  {
    id: "retro-mac-prototype-production-light",
    left: "docs/recipes/assets/inbox-triage-2-3/retro-mac-1600x1000.png",
    leftLabel: "PINNED PROTOTYPE · RETRO MAC",
    right: `${RUN}/retro-mac-light-1920-01-populated-level3.png`,
    rightLabel: "STAGE A PRODUCTION · LIGHT · LEVEL 3",
  },
  {
    id: "neumorphism-light-dark-1024",
    left: `${RUN}/neumorphism-light-1024-01-populated-level3.png`,
    leftLabel: "NEUMORPHISM · LIGHT · 1024",
    right: `${RUN}/neumorphism-dark-1024-01-populated-level3.png`,
    rightLabel: "NEUMORPHISM · DARK · 1024",
  },
  {
    id: "retro-mac-light-dark-1024",
    left: `${RUN}/retro-mac-light-1024-01-populated-level3.png`,
    leftLabel: "RETRO MAC · LIGHT · 1024",
    right: `${RUN}/retro-mac-dark-1024-01-populated-level3.png`,
    rightLabel: "RETRO MAC · DARK · 1024",
  },
];

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function asDataUrl(path) {
  return `data:image/png;base64,${readFileSync(resolve(ROOT, path)).toString("base64")}`;
}

const target = await (
  await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?about:blank`, { method: "PUT" })
).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolveOpen, rejectOpen) => {
  socket.onopen = resolveOpen;
  socket.onerror = rejectOpen;
});
let nextId = 0;
const pending = new Map();
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolveCall, rejectCall } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) rejectCall(new Error(JSON.stringify(message.error)));
  else resolveCall(message.result);
};
const call = (method, params = {}) =>
  new Promise((resolveCall, rejectCall) => {
    const id = ++nextId;
    pending.set(id, { resolveCall, rejectCall });
    socket.send(JSON.stringify({ id, method, params }));
  });

await call("Page.enable");
await call("Runtime.enable");
await call("Emulation.setDeviceMetricsOverride", {
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
  mobile: false,
});

const manifest = [];
for (const comparison of comparisons) {
  const leftBytes = readFileSync(resolve(ROOT, comparison.left));
  const rightBytes = readFileSync(resolve(ROOT, comparison.right));
  const html = `<!doctype html><html><head><style>
    *{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#161616;color:#fff;font:700 18px system-ui,sans-serif}
    main{display:grid;grid-template-columns:1fr 1fr;gap:12px;height:100%;padding:12px}
    figure{display:grid;grid-template-rows:42px minmax(0,1fr);margin:0;border:1px solid #666;background:#222;min-width:0}
    figcaption{display:flex;align-items:center;padding:0 16px;letter-spacing:.08em}
    img{display:block;width:100%;height:100%;object-fit:contain;background:#111}
  </style></head><body><main>
    <figure><figcaption>${comparison.leftLabel}</figcaption><img src="${asDataUrl(comparison.left)}"></figure>
    <figure><figcaption>${comparison.rightLabel}</figcaption><img src="${asDataUrl(comparison.right)}"></figure>
  </main></body></html>`;
  const loaded = await call("Runtime.evaluate", {
    expression: `document.open();document.write(${JSON.stringify(html)});document.close();Promise.all([...document.images].map((image)=>image.decode())).then(()=>true)`,
    awaitPromise: true,
    returnByValue: true,
  });
  if (loaded.exceptionDetails) throw new Error(`Could not render ${comparison.id}`);
  const capture = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const outputBytes = Buffer.from(capture.data, "base64");
  const outputPath = resolve(OUTPUT, `${comparison.id}.png`);
  writeFileSync(outputPath, outputBytes);
  manifest.push({
    id: comparison.id,
    output: outputPath.slice(ROOT.length + 1),
    outputSha256: sha256(outputBytes),
    inputs: [
      { path: comparison.left, name: basename(comparison.left), sha256: sha256(leftBytes) },
      { path: comparison.right, name: basename(comparison.right), sha256: sha256(rightBytes) },
    ],
  });
}

writeFileSync(
  resolve(OUTPUT, "comparison-manifest.json"),
  `${JSON.stringify({ schema: "griddo.task-164.stage-a.comparisons.v1", comparisons: manifest }, null, 2)}\n`,
);
socket.close();
console.log(JSON.stringify({ comparisons: manifest.length, output: OUTPUT }, null, 2));
