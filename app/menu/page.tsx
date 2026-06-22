import Link from "next/link";

import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Menu | OccasionKart Cake Categories",
  description:
    "Explore OccasionKart menu categories including flavors, occasion cakes, desserts, gift hampers, combos, and custom cakes in Hyderabad.",
  keywords: ["OccasionKart menu", "cake categories Hyderabad", "desserts Hyderabad"],
});
const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const menuSections = [
  {
    title: "Flavors",
    items: [
      "Pineapple",
      "Butterscotch",
      "Chocolate",
      "Blackforest",
      "Chocolate Combinations",
      "Fresh Fruit",
      "Red Velvet",
      "Tresleches",
      "Tiramissu",
      "Imported/over seas",
      "Desi Sweet flavor",
      "Huzzlenut",
      "Honey almond",
    ],
  },
  {
    title: "By Occasion",
    items: [
      "Birthday",
      "Anniversary",
      "Wedding",
      "Bride to be",
      "Retirement cake",
      "Bon voyage",
      "Graduation",
      "Celebrations",
      "Corporate Success",
    ],
  },
  {
    title: "By Relation",
    items: [
      "Wife",
      "Husband",
      "Love",
      "Sister",
      "Mom",
      "Dad",
      "Brother",
      "Friend",
      "Grand parents",
    ],
  },
  {
    title: "Desserts",
    items: ["Jar cakes", "Cup cakes", "Brownies", "Cookies", "Cheese cakes"],
  },
  {
    title: "Gift hampers",
    items: ["Gift hampers"],
  },
  {
    title: "Customized cakes",
    items: ["Customized cakes"],
  },
  {
    title: "Flowers",
    items: ["Roses", "Orchids", "Basket arrangements"],
  },
  {
    title: "Combos",
    items: ["Cakes and flowers", "Cake and chocolates", "Cakes setup"],
  },
  {
    title: "Surprises",
    items: ["Cake and mascot", "Cake and guitarist", "Cakes, mascot and guitarist"],
  },
];

export default function MenuPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white page-pad py-12">
        <div className="mx-auto max-w-[1100px]">
          <h1 className="text-[2.2rem] font-semibold text-black">Menu</h1>
          <p className="mt-2 text-[1rem] text-[#6c7396]">
            Explore all categories and submenus in one place.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {menuSections.map((section) => (
              <div
                key={section.title}
                className="rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
              >
                <h2 className="text-[1.2rem] font-semibold text-black">{section.title}</h2>
                <ul className="mt-4 space-y-2 text-[0.95rem] text-[#6c7396]">
                  {section.items.map((item) => (
                    <li key={item}>
                      <Link href={`/category/${slugify(item)}`}>
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
