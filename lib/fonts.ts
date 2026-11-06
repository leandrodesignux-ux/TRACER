import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Solo para títulos y el saludo (peso 300, tracking negativo).
export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const fontVariables = [
  geistSans.variable,
  geistMono.variable,
  spaceGrotesk.variable,
].join(" ");
