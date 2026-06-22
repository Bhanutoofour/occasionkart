"use client";

import { useEffect, useMemo, useState } from "react";

import { DELIVERY_SLOT_OPTIONS } from "@/lib/shipping-rules";

const SAME_DAY_CUTOFF_HOUR = 19;
const SAME_DAY_CUTOFF_LABEL = "7:00 PM";

function getTimeUntilCutoff(now: Date) {
  const cutoff = new Date(now);
  cutoff.setHours(SAME_DAY_CUTOFF_HOUR, 0, 0, 0);

  const msRemaining = cutoff.getTime() - now.getTime();
  if (msRemaining <= 0) {
    return null;
  }

  const totalMinutes = Math.floor(msRemaining / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
}

export function SameDayDeliveryPanel({
  title = "Same-Day Delivery in Hyderabad",
  compact = false,
}: {
  title?: string;
  compact?: boolean;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const remaining = useMemo(() => getTimeUntilCutoff(now), [now]);

  return (
    <div
      className={`rounded-[18px] border border-[rgba(239,127,65,0.22)] bg-[#fff7f1] ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <h3 className={`font-semibold text-[var(--brand-brown)] ${compact ? "text-[1.02rem]" : "text-[1.15rem]"}`}>
        {title}
      </h3>
      <p className="mt-2 text-[0.93rem] leading-7 text-[#6c7396]">
        Same-day orders close at <span className="font-semibold text-stone-900">{SAME_DAY_CUTOFF_LABEL}</span>.
      </p>

      <p
        className={`mt-2 text-[0.95rem] font-semibold ${
          remaining ? "text-[#2f8f2f]" : "text-[#b53131]"
        }`}
      >
        {remaining
          ? `Order within ${remaining.hours}h ${remaining.minutes}m for same-day delivery.`
          : "Today’s same-day cutoff is over. You can still schedule tomorrow’s delivery."}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {DELIVERY_SLOT_OPTIONS.map((slot) => (
          <span
            key={slot}
            className="rounded-full border border-[rgba(0,0,0,0.1)] bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-stone-700"
          >
            {slot}
          </span>
        ))}
      </div>
    </div>
  );
}

