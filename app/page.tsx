/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { HomeHeroCarousel } from "@/components/store/home-hero-carousel";
import { ProductCard } from "@/components/store/product-card";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { toJsonLd } from "@/lib/json-ld";
import { createMetadata, siteSeo } from "@/lib/seo";
import { listProducts } from "@/lib/server/catalog";

export const metadata = createMetadata({
  title: "Order Fresh Cakes Online in Hyderabad | OccasionKart",
  description:
    "OccasionKart is a Hyderabad-based cake shop for cakes in Hyderabad, cake delivery in Hyderabad, same day cake delivery, birthday cakes, custom cakes, and celebration desserts.",
  keywords: [
    "cakes in Hyderabad",
    "cake delivery in Hyderabad",
    "order cakes same day delivery",
    "best cakes in Hyderabad",
    "Hyderabad based cake shop",
    "Hyderabad based bakery",
  ],
  path: "/",
});

const categoryCards = [
  {
    title: "By Flavor",
    description: "Chocolate, Vanilla, Red Velvet & More",
    icon: "Cake",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "By Theme",
    description: "Cartoon, Floral, Sports & More",
    icon: "Theme",
    image:
      "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "By Occasion",
    description: "Birthday, Wedding, Anniversary",
    icon: "Party",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "By Recipient",
    description: "Mom, Dad, Wife, Love",
    icon: "People",
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80",
  },
];

const occasionCards = [
  {
    title: "Birthdays",
    icon: "Birthday",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Weddings",
    icon: "Wedding",
    image:
      "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Anniversaries",
    icon: "Love",
    image:
      "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Celebrations",
    icon: "Celebrate",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80",
  },
];

const features = [
  {
    icon: "Fresh",
    title: "Handcrafted Fresh",
    description: "Made fresh daily with premium ingredients",
  },
  {
    icon: "Fast",
    title: "Same Day Delivery",
    description: "Fast delivery across all areas in Hyderabad",
  },
  {
    icon: "Quality",
    title: "Quality Guaranteed",
    description: "100% satisfaction or money back",
  },
  {
    icon: "Custom",
    title: "Custom Orders",
    description: "Personalize your cake for any occasion",
  },
];

const priceChips = ["Rs. 499", "Rs. 799", "Rs. 1299", "Rs. 1999+"];
type HomeReview = {
  name: string;
  age: string;
  quote: string;
  avatarUrl?: string;
};

const reviews: HomeReview[] = [
  {
    name: "Ranjith",
    age: "8 months ago",
    quote: "Beautiful cake, soft sponge, and super fresh taste.",
  },
  {
    name: "Srinivas",
    age: "recent review",
    quote: "Neat finish, on-time delivery, and lovely flavor.",
  },
  {
    name: "Keerthi",
    age: "recent review",
    quote: "Quick response, cute photo cake, and fair pricing.",
  },
  {
    name: "Aishwarya",
    age: "recent review",
    quote: "Looked gorgeous and arrived right on time.",
  },
];
const clients = [
  {
    name: "TekspotEdu",
    wordmark: "tekspot",
    wordmarkAccent: "EDU",
    wordmarkClass: "text-[2.05rem] font-semibold leading-none tracking-[-0.04em] sm:text-[2.2rem]",
    wordmarkColor: "text-[#032a57]",
    wordmarkAccentClass:
      "bg-[linear-gradient(90deg,#1ba8c9_0%,#79db5a_100%)] bg-clip-text text-transparent",
  },
  {
    name: "SBI General Insurance",
    logo: "/brand/sbi-general.png",
    logoClass: "max-h-[68px]",
  },
  {
    name: "SATTVA",
    logo: "/brand/sattva.png",
    logoClass: "max-h-[76px]",
  },
  {
    name: "Makonis",
    logo: "/brand/makonis.png",
    logoClass: "max-h-[78px]",
  },
  {
    name: "Expressluv",
    logo: "/brand/expressluv.png",
    logoClass: "max-h-[90px]",
  },
  {
    name: "Apre Health",
    logo: "/brand/apre-health.png",
    logoClass: "max-h-[66px] w-[172px]",
  },
  {
    name: "Insure With Sri",
    logo: "/brand/insurewithsri.jpeg",
    logoClass: "max-h-[84px]",
  },
  {
    name: "Vihara",
    logo: "/brand/vihara-icon-192.png",
    logoClass: "max-h-[84px]",
  },
];

const seoCopyBlocks = [
  {
    title: "Cakes Delivery in Hyderabad Online from OccasionKart",
    body: "OccasionKart helps you order fresh cakes online in Hyderabad for birthdays, anniversaries, baby showers, office celebrations, and surprise moments. If you are searching for cakes in Hyderabad, cake delivery in Hyderabad, or same day cake delivery in Hyderabad, our team makes ordering simple with clear pricing, flavor choices, and slot-based local delivery.",
  },
  {
    title: "Order Cakes Same Day Delivery in Hyderabad",
    body: "Need a cake today? We support same day orders in serviceable Hyderabad pincodes. Choose your flavor, weight, message on cake, and delivery slot. From classic chocolate cakes to custom celebration cakes, we focus on fresh baking, careful packing, and timely doorstep delivery so your event runs smoothly.",
  },
  {
    title: "Best Cakes in Hyderabad for Every Occasion",
    body: "Our catalog includes birthday cakes, anniversary cakes, kids theme cakes, photo cakes, custom cakes, and corporate cakes. Whether you need a simple elegant design or a premium celebration cake, OccasionKart gives you flexible options for flavor, portion size, and personalized message.",
  },
];

const seoFaqItems = [
  {
    question: "Do you deliver cakes across Hyderabad?",
    answer:
      "We deliver to selected Hyderabad pincodes based on active shipping zones. Enter your pincode on product or checkout pages to instantly confirm service availability.",
  },
  {
    question: "Can I order cake online for same day delivery?",
    answer:
      "Yes. Same day cake delivery is available for eligible products and time slots in serviceable Hyderabad locations.",
  },
  {
    question: "Do you offer midnight cake delivery?",
    answer:
      "Yes, midnight delivery is available for selected pincodes and slots. Charges vary by zone and are shown automatically during checkout.",
  },
];

export default async function Home() {
  const products = await listProducts();
  const bestsellers = products.slice(0, 5);
  const seasonalPicks = [products[2], products[3], products[4], products[5]].filter(Boolean);
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteSeo.siteUrl}/#website`,
    url: siteSeo.siteUrl,
    name: siteSeo.siteName,
    description: siteSeo.defaultDescription,
    inLanguage: "en-IN",
  };
  const bakerySchema = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": `${siteSeo.siteUrl}/#bakery`,
    name: siteSeo.siteName,
    url: siteSeo.siteUrl,
    image: `${siteSeo.siteUrl}${siteSeo.defaultOgImage}`,
    servesCuisine: "Cakes and Desserts",
    areaServed: "Hyderabad",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hyderabad",
      addressRegion: "Telangana",
      addressCountry: "IN",
    },
    sameAs: [siteSeo.siteUrl],
  };

  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(bakerySchema) }}
        />
        <HomeHeroCarousel />

        <section className="page-pad py-6">
          <div>
            <h2 className="text-left text-[24px] font-semibold leading-[1.15] text-black sm:text-[2rem] sm:leading-tight">
              Shop By Category
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:mt-7 sm:gap-5 lg:grid-cols-4">
              {categoryCards.map((card) => (
                <Link
                  key={card.title}
                  href="/cakes"
                  className="group overflow-hidden rounded-[20px] border border-[rgba(0,0,0,0.1)] bg-white shadow-[0_10px_26px_rgba(0,0,0,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.1)]"
                >
                  <div className="relative h-[148px] overflow-hidden sm:h-[220px] lg:h-[260px]">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(77,37,28,0.08)_0%,rgba(77,37,28,0.42)_100%)]" />
                    <div className="absolute bottom-4 left-4 rounded-full bg-[rgba(255,255,255,0.88)] px-3 py-1.5 text-[0.9rem] font-semibold text-[var(--brand-brown)] backdrop-blur-sm">
                      {card.icon}
                    </div>
                  </div>
                  <div className="px-3 py-3 text-center sm:px-5 sm:py-4">
                    <h3 className="text-[0.98rem] font-semibold leading-5 text-stone-900 sm:text-[1.05rem]">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 text-[0.82rem] leading-4 text-[#6c7396] sm:mt-2 sm:text-[0.92rem] sm:leading-6">
                      {card.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="page-pad py-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="whitespace-nowrap text-left text-[24px] font-semibold leading-[1.15] text-black sm:text-[2rem] sm:leading-tight">
              Shop By Occasion
            </h2>
            <Link href="/cakes" className="shrink-0 text-[1rem] text-[#ef7f41]">
              View All →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {occasionCards.map((card) => (
              <Link
                key={card.title}
                href="/cakes"
                className="relative aspect-square overflow-hidden rounded-[18px]"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.48)_100%)]" />
                <div className="absolute left-4 top-4 rounded-full bg-[rgba(255,255,255,0.9)] px-3 py-1.5 text-[0.95rem] font-semibold text-[var(--brand-brown)] backdrop-blur-sm">
                  {card.icon}
                </div>
                <div className="absolute bottom-5 left-5 text-white">
                  <div className="text-[1.15rem] font-semibold">{card.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="page-pad py-6">
          <div className="flex items-start justify-between text-left">
            <h2 className="text-left text-[2rem] font-semibold text-black">Bestselling Cakes</h2>
            <Link href="/cakes" className="text-[1rem] text-[#ef7f41]">
              View All →
            </Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-5">
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="page-pad py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[2rem] font-semibold text-black">Shop by Price</h2>
            <Link href="/cakes" className="text-[1rem] text-[#ef7f41]">
              View All →
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {priceChips.map((chip) => (
              <Link
                key={chip}
                href="/cakes"
                className="rounded-full border border-[rgba(0,0,0,0.12)] bg-white px-6 py-3 text-[1rem] font-semibold text-stone-900 shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
              >
                {chip}
              </Link>
            ))}
          </div>
        </section>

        <section className="page-pad py-6">
          <div className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-[#fff7f2] px-6 py-8 sm:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[2rem] font-semibold text-black">Customize Your Cake</h2>
                <p className="mt-3 text-[1rem] text-[#6c7396]">
                  Choose size, flavor, message, and delivery slot. We handle the rest.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {["Size", "Flavor", "Message"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white px-5 py-2 text-[0.95rem] font-semibold text-stone-900"
                  >
                    {item}
                  </span>
                ))}
                <Link
                  href="/custom-orders"
                  className="rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white"
                >
                  Start Custom Order
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="page-pad py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[2rem] font-semibold text-black">Customer Reviews</h2>
            <Link href="/testimonials" className="text-[1rem] text-[#ef7f41]">
              View All →
            </Link>
          </div>
          <div className="review-marquee mt-6 overflow-hidden">
            <div className="review-marquee-track">
              {[...reviews, ...reviews].map((review, index) => (
                <article
                  key={`${review.name}-${index}`}
                  className="w-[280px] shrink-0 rounded-[24px] border border-[rgba(0,0,0,0.08)] bg-[#f7f5f3] p-5 shadow-[0_10px_24px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[1.15rem] font-semibold leading-none text-black">
                        Excellent rating
                      </p>
                      <p className="mt-1.5 text-[0.88rem] text-stone-700">Based on 340 reviews</p>
                      <p className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-[#4285F4]">
                        <span className="text-[#4285F4]">G</span>
                        <span className="text-[#EA4335]">o</span>
                        <span className="text-[#FBBC05]">o</span>
                        <span className="text-[#4285F4]">g</span>
                        <span className="text-[#34A853]">l</span>
                        <span className="text-[#EA4335]">e</span>
                      </p>
                    </div>
                    <div className="text-[0.98rem] font-semibold tracking-[0.12em] text-[#f4b400]">
                      5/5
                    </div>
                  </div>

                  <div className="mt-4 border-t border-[rgba(0,0,0,0.08)] pt-4">
                    <p className="text-[0.92rem] leading-7 text-stone-800">
                      {review.quote}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    {review.avatarUrl ? (
                      <img
                        src={review.avatarUrl}
                        alt={`${review.name} profile`}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4c46b] text-[0.9rem] font-semibold text-stone-900">
                        {review.name
                          .split(" ")
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")}
                      </div>
                    )}
                    <div>
                      <p className="text-[0.92rem] font-semibold text-stone-900">{review.name}</p>
                      <p className="text-[0.84rem] text-[#6c7396]">{review.age}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="page-pad py-6">
          <div className="flex items-center gap-6">
            <h2 className="whitespace-nowrap text-[2rem] font-semibold text-black">
              Corporate Clients We Serve
            </h2>
            <div className="hidden h-px flex-1 bg-[rgba(0,0,0,0.12)] md:block" />
          </div>
          <div className="-mx-5 mt-6 flex gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
            {clients.map((client) => (
              <div
                key={client.name}
                className="flex min-h-[122px] min-w-[220px] shrink-0 items-center justify-center rounded-[2px] border border-[rgba(0,0,0,0.12)] bg-white px-5 py-4 sm:min-w-0"
              >
                <div className="flex w-full items-center justify-center">
                  {client.logo ? (
                    <img
                      src={client.logo}
                      alt={client.name}
                      className={`h-auto w-auto max-w-full object-contain ${client.logoClass ?? "max-h-[84px]"}`}
                    />
                  ) : (
                    <p
                      className={`${client.wordmarkClass ?? "text-[2.25rem] font-semibold tracking-[-0.04em]"}`}
                    >
                      <span className={client.wordmarkColor ?? ""}>
                        {client.wordmark ?? client.name}
                      </span>
                      {client.wordmarkAccent ? (
                        <span className={client.wordmarkAccentClass ?? ""}>{client.wordmarkAccent}</span>
                      ) : null}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="page-pad py-6">
          <div className="flex items-start justify-between text-left">
            <h2 className="whitespace-nowrap text-left text-[2rem] font-semibold text-black">
              Festive / Seasonal Picks
            </h2>
            <Link href="/cakes" className="text-[1rem] text-[#ef7f41]">
              View All →
            </Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-5">
            {seasonalPicks.map((product) => (
              <ProductCard key={`seasonal-${product.id}`} product={product} />
            ))}
          </div>
        </section>

        <section className="page-pad py-6">
          <div className="flex items-start justify-between text-left">
            <h2 className="text-left text-[2rem] font-semibold text-black">New in Occasionkart</h2>
            <Link href="/cakes" className="text-[1rem] text-[#ef7f41]">
              View All →
            </Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-5">
            {products.slice(1, 6).map((product) => (
              <ProductCard key={`new-${product.id}`} product={product} />
            ))}
          </div>
        </section>

        <section className="page-pad pb-6 pt-2">
          <div className="rounded-[22px] border border-[rgba(0,0,0,0.1)] bg-[#fffaf6] p-6 sm:p-8">
            <h2 className="text-[1.45rem] font-semibold text-[var(--brand-brown)] sm:text-[1.7rem]">
              Order Cake Online in Hyderabad with Trusted Local Delivery
            </h2>
            <p className="mt-3 text-[0.98rem] leading-8 text-[#6c7396]">
              Looking for the best cakes in Hyderabad with reliable doorstep delivery? OccasionKart
              is a Hyderabad-based cake shop built for online ordering convenience, fast support,
              and celebration-ready freshness.
            </p>

            <div className="mt-6 space-y-5">
              {seoCopyBlocks.map((block) => (
                <article key={block.title}>
                  <h3 className="text-[1.06rem] font-semibold text-stone-900">{block.title}</h3>
                  <p className="mt-2 text-[0.95rem] leading-8 text-[#6c7396]">{block.body}</p>
                </article>
              ))}
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {seoFaqItems.map((item) => (
                <article
                  key={item.question}
                  className="rounded-[16px] border border-[rgba(0,0,0,0.1)] bg-white p-4"
                >
                  <h3 className="text-[0.98rem] font-semibold text-stone-900">{item.question}</h3>
                  <p className="mt-2 text-[0.9rem] leading-7 text-[#6c7396]">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-3 border-t border-[rgba(0,0,0,0.08)] bg-white page-pad py-10">
          <div className="mx-auto grid max-w-[1650px] gap-10 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-[#fff1f5] px-3 text-[0.95rem] font-semibold text-[#ef7f41]">
                  {feature.icon}
                </div>
                <h3 className="mt-7 text-[1rem] font-semibold text-black">{feature.title}</h3>
                <p className="mt-3 text-[0.95rem] text-[#6c7396]">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

