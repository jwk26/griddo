export function hexToHsl(hex: string): string {
  const normalized = hex.trim().replace("#", "");
  const expandedHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalized;

  if (!/^[0-9a-f]{6}$/i.test(expandedHex)) {
    throw new Error("Invalid color value.");
  }

  const red = Number.parseInt(expandedHex.slice(0, 2), 16) / 255;
  const green = Number.parseInt(expandedHex.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(expandedHex.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;
  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));

    if (max === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }

    hue *= 60;

    if (hue < 0) {
      hue += 360;
    }
  }

  return `hsl(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`;
}
