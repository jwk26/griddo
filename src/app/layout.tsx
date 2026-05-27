import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Inter, Playfair_Display, Space_Mono, VT323 } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "GridDO",
  description: "Local-first task management with a 2D grid",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
});

const colorThemeInitScript = `
(function () {
  try {
    var allowed = ["griddo","tiny-desk","neumorphism","claymorphism","origami","terminal","retro-mac","graphite"];
    var theme = "griddo";
    var raw = window.localStorage.getItem("griddo-color-theme");
    if (raw) {
      var parsed = JSON.parse(raw);
      var value = parsed && parsed.state && parsed.state.colorTheme;
      if (allowed.indexOf(value) !== -1) theme = value;
    }
    document.documentElement.dataset.colorTheme = theme;
  } catch (_) {
    document.documentElement.dataset.colorTheme = "griddo";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${inter.variable} ${playfairDisplay.variable} ${spaceMono.variable} ${vt323.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: colorThemeInitScript }}
          id="griddo-color-theme-init"
        />
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
