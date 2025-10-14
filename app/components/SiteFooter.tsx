import Link from "next/link";
import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer
      role="contentinfo"
      className="mt-20 border-t border-brand-border bg-white/70 backdrop-blur-sm"
    >
      <div className="mx-auto flex flex-wrap items-center gap-4 px-4 py-8 text-sm text-brand-navy sm:px-6 lg:px-8 max-w-7xl">
        {/* Logo + Year */}
        <div className="flex items-center gap-2">
          <Image
            src="/brand/numetric-shield.png"
            width={20}
            height={20}
            alt="Numetric"
          />
          <span>© {new Date().getFullYear()} Numetric</span>
        </div>

        {/* Legal links */}
        <Link
          className="hover:text-brand-green transition-colors"
          href="/legal/privacy"
          data-cta="footer_privacy"
        >
          Privacy
        </Link>
        <Link
          className="hover:text-brand-green transition-colors"
          href="/legal/terms"
          data-cta="footer_terms"
        >
          Terms
        </Link>
        <Link
          className="hover:text-brand-green transition-colors"
          href="/security"
          data-cta="footer_security"
        >
          Security
        </Link>
        <a
          className="hover:text-brand-green transition-colors"
          href="https://status.numetric.ai"
          target="_blank"
          rel="noreferrer"
          data-cta="footer_status"
        >
          Status
        </a>

        {/* Tagline */}
        <span className="ml-auto text-brand-green font-medium">
          Built for students & teachers
        </span>
      </div>
    </footer>
  );
}
