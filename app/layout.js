import "./globals.css";
import { Bricolage_Grotesque } from "next/font/google";
import { STORE } from "@/lib/products";

const font = Bricolage_Grotesque({ subsets: ["latin"], display: "swap", variable: "--font" });

export const metadata = {
  title: `${STORE.name} | Phones, cables and lights`,
  description: "Samsung Galaxy A07, iPhone fast-charge cables and VIZCO LED floodlights. Pay safely, delivered to your door.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-ZA" className={font.variable}>
      <body>{children}</body>
    </html>
  );
}
