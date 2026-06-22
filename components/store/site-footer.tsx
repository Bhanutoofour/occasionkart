import Image from "next/image";
import Link from "next/link";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/occasionkart/",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/occasionkart/",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.6-1.5H16V5.1c-.3 0-.9-.1-1.8-.1-1.8 0-3.1 1.1-3.1 3.3V11H9v3h2.3v7h2.2Z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/occasionkart",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M17.8 4H20l-4.8 5.5L21 20h-4.6l-3.6-5.2L8.2 20H6l5.2-6L5 4h4.7l3.2 4.7L17.8 4Zm-1.6 14.3h1.2L8.9 5.6H7.6l8.6 12.7Z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@occasionkart",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M21.6 8.2a2.9 2.9 0 0 0-2-2C17.9 5.7 12 5.7 12 5.7s-5.9 0-7.6.5a2.9 2.9 0 0 0-2 2A30.2 30.2 0 0 0 2 12a30.2 30.2 0 0 0 .4 3.8 2.9 2.9 0 0 0 2 2c1.7.5 7.6.5 7.6.5s5.9 0 7.6-.5a2.9 2.9 0 0 0 2-2A30.2 30.2 0 0 0 22 12a30.2 30.2 0 0 0-.4-3.8ZM10 15.4V8.6l6 3.4-6 3.4Z" />
      </svg>
    ),
  },
  {
    label: "Pinterest",
    href: "https://in.pinterest.com/occasionkart/",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M12 3a9 9 0 0 0-3.3 17.4c0-.7 0-1.7.2-2.5l1.3-5.4s-.3-.7-.3-1.7c0-1.6.9-2.8 2-2.8 1 0 1.4.7 1.4 1.6 0 1-.6 2.4-.9 3.8-.2 1.1.6 2 1.7 2 2 0 3.5-2.1 3.5-5.1 0-2.7-1.9-4.5-4.7-4.5-3.2 0-5.1 2.4-5.1 4.9 0 1 .4 2 1 2.6.1.1.1.2.1.4l-.4 1.4c-.1.2-.2.3-.5.2-1.7-.7-2.8-2.8-2.8-4.6 0-3.7 2.7-7.2 7.9-7.2 4.1 0 7.3 2.9 7.3 6.9 0 4.1-2.6 7.5-6.2 7.5-1.2 0-2.4-.6-2.8-1.4l-.7 2.8c-.3 1-.9 2.2-1.4 2.9.9.3 1.8.5 2.8.5A9 9 0 0 0 12 3Z" />
      </svg>
    ),
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[rgba(0,0,0,0.08)] bg-white">
      <div className="page-pad mx-auto max-w-[1720px] py-14">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr_1fr_1.1fr]">
          <div>
            <Image
              src="/brand/occasionkart-logo.png"
              alt="OccasionKart"
              width={240}
              height={56}
              className="h-12 w-auto"
            />
            <p className="mt-8 max-w-[320px] text-[1rem] leading-8 text-[#6c7396]">
              Fresh cakes, custom celebrations, and dependable cake delivery
              across Hyderabad.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(0,0,0,0.1)] bg-[#fff7f1] text-[0.82rem] font-semibold text-stone-900 transition hover:border-[#ef7f41] hover:text-[#ef7f41]"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[1rem] font-semibold text-stone-900">Order Cakes</h2>
            <div className="mt-6 space-y-4 text-[1rem] text-[#6c7396]">
              <Link href="/cakes" className="block">
                All Cakes
              </Link>
              <Link href="/birthday-specials" className="block">
                Birthday Specials
              </Link>
              <Link href="/custom-orders" className="block">
                Custom Cake Builder
              </Link>
              <Link href="/corporate-orders" className="block">
                Corporate Bulk Orders
              </Link>
              <Link href="/offers" className="block">
                Offers
              </Link>
              <Link href="/menu" className="block">
                Full Menu
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-[1rem] font-semibold text-stone-900">Help & Policies</h2>
            <div className="mt-6 space-y-4 text-[1rem] text-[#6c7396]">
              <Link href="/track-order" className="block">
                Track Order
              </Link>
              <Link href="/faq" className="block">
                FAQ
              </Link>
              <Link href="/checkout" className="block">
                Checkout
              </Link>
              <Link href="/privacy-policy" className="block">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="block">
                Terms and Conditions
              </Link>
              <Link href="/refund-policy" className="block">
                Refund Policy
              </Link>
              <Link href="/contact" className="block">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-[1rem] font-semibold text-stone-900">Contact</h2>
            <div className="mt-6 space-y-4 text-[1rem] leading-7 text-[#6c7396]">
              <p>Hyderabad, Telangana, India</p>
              <p>Phone: +91 9059058058</p>
              <p>Email: support@occasionkart.com</p>
              <p>Support hours: 9:00 AM to 9:00 PM IST</p>
              <a
                href="https://wa.me/919059058058?text=Hi%20OccasionKart%2C%20I%20want%20to%20place%20an%20order."
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full bg-[#25D366] px-4 py-2 text-[0.9rem] font-semibold text-white"
              >
                Order on WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-[rgba(0,0,0,0.08)] pt-8 text-[1rem] text-[#6c7396] lg:flex-row lg:items-center lg:justify-between">
          <p>(c) 2026 OccasionKart. All rights reserved.</p>
          <div className="flex flex-wrap gap-8">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-and-conditions">Terms</Link>
            <Link href="/refund-policy">Refund Policy</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/testimonials">Testimonials</Link>
            <Link href="/menu">Menu</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
