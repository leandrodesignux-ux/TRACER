import { Plus_Jakarta_Sans } from "next/font/google";

// Una sola familia para todo: texto en 400/500 y énfasis en 600.
export const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const fontVariables = jakarta.variable;
