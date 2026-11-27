"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import AssistantChat from "@/components/contact-fab/AssistantChat";
import Link from "@/components/ui/Link";
import { OPEN_QUOTE_EVENT } from "@/components/quote/open-quote";
import { trackEvent } from "@/lib/track-event";
import { contact } from "@/lib/site-config";
import { withoutTrailingSlash } from "@/lib/trailing-slash";
import { localeHref, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

/** WhatsApp goes to the Pakistan mobile (owner decision, 26 Nov 2026). wa.me wants digits only. */
const WHATSAPP_NUMBER = contact.phones.pakistanMobile.replace(/\D/g, "");

/**
 * The round contact button in the bottom corner (end side, so bottom-left in Arabic). It opens four
 * options: WhatsApp, Book an appointment (/booking/), Email us, and the AI agent chat.
 *
 * It stays out of the way of the home page hero: there it only appears once the visitor scrolls past
 * most of the first screen (no CTA in the home hero, owner rule). It is not shown on /admin (mounted
 * inside SiteChrome). Each option sends an analytics event (src/lib/track-event.ts).
 */
export default function FloatingContact({ lang, dict }: { lang: Locale; dict: Dictionary["contactFab"] }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const isHome = pathname === "/" || withoutTrailingSlash(pathname) === "/ar";
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  // What the "Email us" pill says after a click (null: its normal label).
  const [emailNote, setEmailNote] = useState<string | null>(null);

  // A mail link does nothing on a computer with no mail app set up, so the click also copies the
  // address and shows it on the pill. If copying is refused, the address itself is shown.
  function copyEmail() {
    const show = (note: string) => setEmailNote(note);
    if (!navigator.clipboard) return show(contact.email);
    navigator.clipboard.writeText(contact.email).then(
      () => show(dict.emailCopied.replace("{email}", contact.email)),
      () => show(contact.email),
    );
  }
  useEffect(() => {
    if (!emailNote) return;
    const timer = window.setTimeout(() => setEmailNote(null), 5000);
    return () => window.clearTimeout(timer);
  }, [emailNote]);

  useEffect(() => {
    const onScroll =() => setPastHero(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  // Escape or a click elsewhere closes the options; the quote pop-up opening closes everything.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [menuOpen]);

  useEffect(() => {
    const closeAll = () => {
      setMenuOpen(false);
      setChatOpen(false);
    };
    window.addEventListener(OPEN_QUOTE_EVENT, closeAll);
    return () => window.removeEventListener(OPEN_QUOTE_EVENT, closeAll);
  }, []);

  const visible = !isHome || pastHero || menuOpen || chatOpen;
  const pageUrl = `mim.archi${pathname}`;
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(dict.whatsappMessage.replace("{page}", pageUrl))}`;

  function onMainClick() {
    if (chatOpen) {
      setChatOpen(false);
      return;
    }
    if (!menuOpen) trackEvent("contact_fab_open", { lang });
    setMenuOpen(!menuOpen);
  }

  const options: { key: string; label: string; icon: ReactNode; page?: string; href?: string; external?: boolean; onClick?: () => void }[] = [
    { key: "whatsapp", label: dict.whatsapp, icon: <WhatsAppIcon />, href: whatsappHref, external: true },
    { key: "book", label: dict.book, icon: <CalendarIcon />, page: localeHref(lang, "/booking") },
    { key: "email", label: emailNote ?? dict.email, icon: <MailIcon />, href: `mailto:${contact.email}`, onClick: copyEmail },
    {
      key: "assistant",
      label: dict.assistant,
      icon: <SparkIcon />,
      onClick: () => {
        setMenuOpen(false);
        setChatOpen(true);
      },
    },
  ];

  const open = menuOpen || chatOpen;

  return (
    <div
      ref={root}
      className={`fixed bottom-5 end-5 z-40 flex flex-col items-end gap-3 transition-[opacity,transform] duration-300 md:bottom-7 md:end-7 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      aria-hidden={visible ? undefined : true}
    >
      <AnimatePresence>
        {chatOpen && <AssistantChat lang={lang} dict={dict} onClose={() => setChatOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.ul
            id="contact-fab-options"
            className="flex flex-col items-end gap-3"
            initial="hidden"
            animate="shown"
            exit="hidden"
            variants={{ shown: { transition: { staggerChildren: 0.04, staggerDirection: -1 } }, hidden: {} }}
          >
            {options.map((option) => {
              const inner = (
                <>
                  <span aria-live="polite" className="rounded-full bg-paper px-5 py-2.5 text-sm font-medium text-ink shadow-[0_4px_18px_rgba(14,15,18,.14)] transition-colors group-hover:text-accent">
                    {option.label}
                  </span>
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-paper text-accent shadow-[0_4px_18px_rgba(14,15,18,.14)]">
                    {option.icon}
                  </span>
                </>
              );
              const track = () => trackEvent(`contact_fab_${option.key}`, { lang });
              return (
                <motion.li
                  key={option.key}
                  variants={{ hidden: { opacity: 0, y: reduceMotion ? 0 : 8 }, shown: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.18 }}
                >
                  {option.page ? (
                    // A page of this site: move there without reloading, so the button stays in place.
                    <Link
                      href={option.page}
                      onClick={() => {
                        track();
                        setMenuOpen(false);
                      }}
                      className="group flex items-center gap-3"
                    >
                      {inner}
                    </Link>
                  ) : option.href ? (
                    <a
                      href={option.href}
                      onClick={() => {
                        track();
                        // "Email us" keeps the menu open so the copied address can be read.
                        if (option.onClick) option.onClick();
                        else setMenuOpen(false);
                      }}
                      {...(option.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="group flex items-center gap-3"
                    >
                      {inner}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        track();
                        option.onClick?.();
                      }}
                      className="group flex items-center gap-3"
                    >
                      {inner}
                    </button>
                  )}
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={onMainClick}
        aria-label={open ? (chatOpen ? dict.assistantClose : dict.close) : dict.open}
        aria-expanded={menuOpen}
        aria-controls={menuOpen ? "contact-fab-options" : undefined}
        tabIndex={visible ? undefined : -1}
        className="flex size-14 items-center justify-center rounded-full bg-accent text-paper shadow-[0_8px_24px_rgba(198,78,49,.35)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {open ? (
          <svg viewBox="0 0 16 16" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M3 3 13 13M13 3 3 13" />
          </svg>
        ) : (
          <ChatIcon />
        )}
      </button>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z" />
      <path d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01" strokeLinecap="round" strokeWidth="2.4" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.98L2 22l5.17-1.5A9.93 9.93 0 1 0 12.04 2Zm0 18.13a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.07.9.92-2.99-.2-.31a8.22 8.22 0 1 1 6.83 3.72Zm4.5-6.15c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.16.25-.63.8-.78.96-.14.17-.29.19-.53.06a6.74 6.74 0 0 1-3.37-2.94c-.25-.44.25-.41.72-1.36.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.86 2.04 4.77 4.77 0 0 0 1 2.53 10.9 10.9 0 0 0 4.18 3.69c1.55.67 2.16.73 2.94.61.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M8 3v4M16 3v4M3.5 10h17M9 15l2 2 4-4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden>
      <path d="M12 3.5 13.9 9a2 2 0 0 0 1.2 1.2l5.4 1.8-5.4 1.9a2 2 0 0 0-1.2 1.2L12 20.5l-1.9-5.4a2 2 0 0 0-1.2-1.2L3.5 12l5.4-1.8A2 2 0 0 0 10.1 9z" />
      <path d="M19 3v3M17.5 4.5h3" strokeLinecap="round" />
    </svg>
  );
}
