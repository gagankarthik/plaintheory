import { Fraunces, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";

export const fontSerif = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

// Cinematic display face for the landing hero (regular + italic emphasis).
export const fontDisplay = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

export const fontSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});
