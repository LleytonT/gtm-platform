import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SkipLink } from "@/components/skip-link";
import { WeightsProvider } from "@/components/weights-provider";

const sourceSerif = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono-data",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GTM Hire — Benchmarks for Your Next Sales Role",
  description:
    "Quantitative GTM benchmarks for tech sales professionals. Compare gravy train scores, GTM momentum, funding velocity, and quota reality across Forbes AI 50, hyperscalers, and SaaS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden touch-manipulation">
        <WeightsProvider>
          <SkipLink />
          <Nav />
          <main id="main-content" className="flex-1 scroll-mt-20">
            {children}
          </main>
          <Footer />
        </WeightsProvider>
      </body>
    </html>
  );
}
