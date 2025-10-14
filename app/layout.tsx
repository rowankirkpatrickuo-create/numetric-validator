import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import "katex/dist/katex.css";
import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";
import PHProviders from "./providers";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "Numetric — Learn by steps, not shortcuts",
  description: "AI math tutor with Socratic hints and validator-checked steps.",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Numetric",
    description:
      "AI math tutor with Socratic hints and validator-checked steps.",
    images: ["/brand/numetric-logo-h.png"],
  },
};

const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={pk}
      appearance={{
        variables: { colorPrimary: "#0F3342" },
        elements: { formButtonPrimary: "bg-brand-navy hover:bg-brand-navy700" },
      }}
    >
      <html lang="en" className="h-full">
        <body className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-brand-navy text-white px-3 py-2 rounded"
          >
            Skip to content
          </a>
          <PHProviders>
            <SiteNav />
            <main
              id="main"
              className="grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
            >
              {children}
            </main>
            <SiteFooter />
          </PHProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
