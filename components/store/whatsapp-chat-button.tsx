"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const WHATSAPP_NUMBER = "919059058058";
const WHATSAPP_TEXT =
  "Hello OccasionKart, I would like to place an order.";

export function WhatsAppChatButton() {
  const pathname = usePathname();
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-[100] inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,211,102,0.45)] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="h-5 w-5 fill-current"
      >
        <path d="M19.11 17.35c-.26-.13-1.5-.74-1.74-.82-.23-.09-.4-.13-.57.13-.17.26-.66.82-.81.98-.15.17-.3.19-.56.06-.26-.13-1.09-.4-2.08-1.27-.77-.69-1.29-1.53-1.44-1.79-.15-.26-.02-.4.11-.53.11-.11.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.57-1.37-.78-1.88-.21-.5-.42-.43-.57-.44h-.49c-.17 0-.45.06-.68.32-.23.26-.87.85-.87 2.08 0 1.23.89 2.41 1.01 2.58.13.17 1.75 2.67 4.24 3.74.59.26 1.06.42 1.42.54.59.19 1.13.16 1.56.1.48-.07 1.5-.61 1.71-1.19.21-.58.21-1.08.15-1.19-.06-.11-.23-.17-.49-.3Z" />
        <path d="M16.01 3.2c-7.03 0-12.75 5.7-12.75 12.72 0 2.24.59 4.43 1.7 6.36L3.2 28.8l6.7-1.75a12.76 12.76 0 0 0 6.11 1.56h.01c7.02 0 12.74-5.7 12.74-12.72 0-3.41-1.33-6.61-3.74-9.01a12.66 12.66 0 0 0-9.01-3.68Zm0 23.26h-.01a10.62 10.62 0 0 1-5.42-1.48l-.39-.23-3.98 1.04 1.07-3.88-.25-.4a10.5 10.5 0 0 1-1.63-5.62c0-5.82 4.75-10.56 10.6-10.56 2.83 0 5.49 1.1 7.49 3.1a10.47 10.47 0 0 1 3.1 7.46c0 5.83-4.75 10.57-10.58 10.57Z" />
      </svg>
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </Link>
  );
}
