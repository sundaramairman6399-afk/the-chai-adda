
import type { Metadata } from "next";
import { Baloo_2, Poppins } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin", "devanagari"],
  variable: "--font-baloo",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Chai Adda | Feel the Taste of Kulhad",
  description:
    "Experience authentic chai, delicious food and great vibes at The Chai Adda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${baloo.variable} ${poppins.variable}`}>
        {children}
      </body>
    </html>
  );
}
