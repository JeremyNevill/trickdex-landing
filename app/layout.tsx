import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const SITE_URL = "https://www.wakeboard.com";
const TITLE = "wakeboard.com — the wakeboard trick list";
const DESCRIPTION =
  "The complete wakeboard trick list. Search every trick by name, alias or WKB number, read what it is and watch a clip — then track and log it in the wakeboard.com app.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "wakeboard",
    "wakeboard tricks",
    "trick list",
    "trick bag",
    "wakeboarding app",
    "session log",
    "cable park",
    "wakeboard progression",
  ],
  authors: [{ name: "wakeboard.com" }],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "wakeboard.com",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "wakeboard.com — your wakeboard trick bag",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8fafc",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Privacy-friendly analytics by Plausible — placed in <head> per
            Plausible's setup so the first pageview is captured. The inline
            init must render before the external script reads its queue. */}
        <script
          defer
          src="https://plausible.io/js/pa-fLUsMP8Jxqcaf9vRw-s2u.js"
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
