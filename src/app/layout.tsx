import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Inter, Playfair_Display, Space_Mono, VT323 } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });
const vt323 = VT323({ subsets: ["latin"], weight: "400", variable: "--font-vt323" });

// Reads the persisted plain theme-id string and sets data-color-theme before
// React hydrates, preventing a flash of the default theme on first load.
const noFlashScript = `(function(){var V=["griddo","tiny-desk","neumorphism","claymorphism","origami","terminal","retro-mac","graphite"];var d="griddo";try{var t=localStorage.getItem("griddo-color-theme");if(t&&V.indexOf(t)!==-1){document.documentElement.dataset.colorTheme=t;return;}}catch(e){}document.documentElement.dataset.colorTheme=d;})();`;

export const metadata: Metadata = {
  title: "GridDO",
  description: "Local-first task management with a 2D grid",
};

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
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
