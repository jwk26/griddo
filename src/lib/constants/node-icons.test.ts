import { describe, expect, it } from "vitest";
import { NODE_ICON_MAP, NODE_ICON_NAMES } from "./node-icons";

const expectedNewIcons = [
  "Anchor",
  "Award",
  "Battery",
  "Bookmark",
  "Brain",
  "Building2",
  "Calculator",
  "Clapperboard",
  "Cloud",
  "Compass",
  "CreditCard",
  "Crown",
  "Diamond",
  "Flame",
  "Gift",
  "GraduationCap",
  "Hammer",
  "Key",
  "Lightbulb",
  "Map",
  "MessageSquare",
  "Mic",
  "Moon",
  "Rocket",
  "Wallet",
] as const;

describe("NODE_ICON_MAP", () => {
  it("includes the requested expanded icon catalog in alphabetical order", () => {
    expect(NODE_ICON_NAMES).toEqual([...NODE_ICON_NAMES].toSorted((left, right) => left.localeCompare(right)));

    for (const iconName of expectedNewIcons) {
      expect(NODE_ICON_NAMES).toContain(iconName);
      expect(NODE_ICON_MAP[iconName]).toBeDefined();
    }
  });
});
