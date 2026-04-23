import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

describe("theme transition wiring", () => {
  it("allows theme color transitions and defines the shared theme duration", () => {
    const providers = readFileSync(join(projectRoot, "src/app/providers.tsx"), "utf8");
    const globals = readFileSync(join(projectRoot, "src/app/globals.css"), "utf8");

    expect(providers).not.toContain("disableTransitionOnChange");
    expect(globals).toContain("--motion-duration-theme: 300ms;");
    expect(globals).toContain("transition: background-color var(--motion-duration-theme)");
  });
});
