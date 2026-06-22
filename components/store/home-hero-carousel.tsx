"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type HeroSlide = {
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  backgroundImage: string;
};

const HERO_SLIDES: HeroSlide[] = [
  {
    badge: "FIRST ORDER OFFER",
    title: "Get 15% OFF on Your First Order",
    subtitle: "Coupon code: FIRST15",
    ctaText: "Claim FIRST15",
    ctaHref: "/cakes",
    backgroundImage:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1800&q=80",
  },
  {
    badge: "SECOND ORDER BONUS",
    title: "Get an Extra 10% OFF on Your Second Order",
    subtitle: "Keep celebrating with sweeter savings on your next cake",
    ctaText: "Order Again",
    ctaHref: "/cakes",
    backgroundImage:
      "https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=1800&q=80",
  },
  {
    badge: "FESTIVE SPECIAL",
    title: "Freshly Baked Theme Cakes for Every Celebration",
    subtitle: "Birthday, anniversary, surprise, or corporate events",
    ctaText: "Explore Collections",
    ctaHref: "/cakes",
    backgroundImage:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1800&q=80",
  },
];

const AUTO_SCROLL_MS = 3000;

export function HomeHeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const totalSlides = useMemo(() => HERO_SLIDES.length, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % totalSlides);
    }, AUTO_SCROLL_MS);

    return () => window.clearInterval(intervalId);
  }, [totalSlides]);

  return (
    <section className="page-pad pb-8 pt-6">
      <div className="relative mx-auto h-[260px] max-w-[1690px] overflow-hidden rounded-[26px] shadow-[0_10px_24px_rgba(0,0,0,0.14)] sm:h-[360px] lg:h-[500px]">
        <div
          data-testid="home-hero-track"
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {HERO_SLIDES.map((slide) => (
            <article key={slide.title} className="relative h-full w-full shrink-0 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.backgroundImage})` }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(25,45,46,0.74)_0%,rgba(25,45,46,0.53)_36%,rgba(25,45,46,0.16)_72%)]" />
              <div className="absolute inset-y-0 left-0 flex max-w-[780px] items-center px-8 sm:px-12 lg:px-20">
                <div className="text-white">
                  <p className="inline-flex rounded-full bg-[#ef7f41] px-5 py-2 text-[0.95rem] font-semibold tracking-[0.03em]">
                    {slide.badge}
                  </p>
                  <h1 className="mt-7 max-w-[680px] text-[2rem] font-bold leading-[1.1] sm:text-[3rem] lg:text-[4rem]">
                    {slide.title}
                  </h1>
                  <p className="mt-5 text-[1rem] sm:text-[1.15rem]">{slide.subtitle}</p>
                  <Link
                    href={slide.ctaHref}
                    className="mt-8 inline-flex rounded-[14px] border border-white/90 bg-white px-7 py-3 text-[1rem] font-semibold !text-[#4d251c] shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition hover:bg-[#fff7f2] hover:!text-[#4d251c] visited:!text-[#4d251c]"
                    style={{ color: "#4d251c" }}
                  >
                    {slide.ctaText}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[rgba(0,0,0,0.32)] px-3 py-2 backdrop-blur-sm">
          {HERO_SLIDES.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => setActiveSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                activeSlide === index ? "w-8 bg-white" : "w-2.5 bg-white/55 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
