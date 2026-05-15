import type { Metadata } from "next";
import { Poppins, Righteous } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const righteous = Righteous({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-righteous",
});

export const metadata: Metadata = {
  title: "Music Personality | Discover Your Music DNA",
  description: "Connect your Spotify to reveal your music personality archetype",
  openGraph: {
    title: "Music Personality | Discover Your Music DNA",
    description: "Connect your Spotify to reveal your music personality archetype",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${poppins.variable} ${righteous.variable} antialiased min-h-dvh bg-[#0a0a0a]`}>
        {children}
      </body>
    </html>
  );
}
