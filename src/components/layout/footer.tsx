import Link from "next/link";
import { BookOpen, Mail, Phone, MapPin, Twitter, Instagram, Youtube, Facebook } from "lucide-react";

const footerLinks = {
  company:  [
    { label: "About Us",    href: "/about" },
    { label: "Blog",        href: "/blog" },
    { label: "Careers",     href: "/careers" },
    { label: "Contact",     href: "/contact" },
  ],
  notes:    [
    { label: "Class 6",     href: "/classes/class-6" },
    { label: "Class 7",     href: "/classes/class-7" },
    { label: "Class 10",    href: "/classes/class-10" },
    { label: "Class 12",    href: "/classes/class-12" },
    { label: "All Notes",   href: "/notes" },
  ],
  subjects: [
    { label: "Science",     href: "/subjects/science" },
    { label: "Mathematics", href: "/subjects/mathematics" },
    { label: "English",     href: "/subjects/english" },
    { label: "Social Sci.", href: "/subjects/social-science" },
    { label: "Physics",     href: "/subjects/physics" },
  ],
  legal:    [
    { label: "Privacy Policy",  href: "/privacy" },
    { label: "Terms of Service",href: "/terms" },
    { label: "Refund Policy",   href: "/refund" },
    { label: "DMCA Policy",     href: "/dmca" },
    { label: "Disclaimer",      href: "/disclaimer" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="gradient-text">Nuvixo</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
              India&apos;s premium NCERT notes platform. Study smarter with well-structured, 
              exam-ready notes for Class 6–12.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:hello@nuvixo.com" className="hover:text-foreground transition-colors">
                  hello@nuvixo.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+919876543210" className="hover:text-foreground transition-colors">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>New Delhi, India</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Twitter, href: "https://twitter.com/nuvixo",    label: "Twitter" },
                { icon: Instagram, href: "https://instagram.com/nuvixo", label: "Instagram" },
                { icon: Youtube, href: "https://youtube.com/@nuvixo",   label: "YouTube" },
                { icon: Facebook, href: "https://facebook.com/nuvixo",  label: "Facebook" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: "Company",  links: footerLinks.company },
            { title: "Notes",    links: footerLinks.notes },
            { title: "Subjects", links: footerLinks.subjects },
            { title: "Legal",    links: footerLinks.legal },
          ].map(({ title, links }) => (
            <div key={title}>
              <h3 className="font-semibold text-sm mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} Nuvixo. All rights reserved.</p>
          <p className="text-xs">
            Made with ❤️ for students across India
          </p>
          <div className="flex items-center gap-4">
            <Link href="/sitemap.xml" className="hover:text-foreground transition-colors">Sitemap</Link>
            <Link href="/rss"         className="hover:text-foreground transition-colors">RSS Feed</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
