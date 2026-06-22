import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HomeHeroCarousel } from "@/components/store/home-hero-carousel";

describe("HomeHeroCarousel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    cleanup();
  });

  it("shows first-order coupon CTA content", () => {
    render(<HomeHeroCarousel />);

    expect(screen.getByText("Get 15% OFF on Your First Order")).toBeTruthy();
    expect(screen.getByText("Coupon code: FIRST15")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Claim FIRST15" })).toBeTruthy();
  });

  it("auto-advances slides every 3 seconds", () => {
    render(<HomeHeroCarousel />);
    const track = screen.getByTestId("home-hero-track");

    expect(track.getAttribute("style")).toContain("translateX(-0%)");

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(track.getAttribute("style")).toContain("translateX(-100%)");

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(track.getAttribute("style")).toContain("translateX(-200%)");
  });

  it("moves to selected slide when indicator is clicked", () => {
    render(<HomeHeroCarousel />);
    const track = screen.getByTestId("home-hero-track");

    fireEvent.click(screen.getByRole("button", { name: "Go to slide 3" }));
    expect(track.getAttribute("style")).toContain("translateX(-200%)");
  });
});
