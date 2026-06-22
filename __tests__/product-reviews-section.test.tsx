import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProductReviewsSection } from "@/app/cakes/[slug]/product-reviews-section";

describe("ProductReviewsSection", () => {
  it("renders review cards with verified purchase badges", () => {
    render(<ProductReviewsSection productName="Photo Cake" productSlug="photo-cake" />);

    expect(screen.getByText("Customer Reviews")).toBeTruthy();
    expect(screen.getAllByText("Verified purchase").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Helpful" }).length).toBeGreaterThan(0);
  });

  it("toggles helpful and not helpful votes", () => {
    render(<ProductReviewsSection productName="Photo Cake" productSlug="photo-cake" />);

    const helpfulButtons = screen.getAllByRole("button", { name: "Helpful" });
    const notHelpfulButtons = screen.getAllByRole("button", { name: "Not helpful" });

    fireEvent.click(helpfulButtons[0]);
    expect(helpfulButtons[0].className).toContain("border-[#2f8f2f]");

    fireEvent.click(notHelpfulButtons[0]);
    expect(notHelpfulButtons[0].className).toContain("border-[#b53131]");
    expect(helpfulButtons[0].className).not.toContain("border-[#2f8f2f]");
  });
});
