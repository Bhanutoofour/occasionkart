import type { Order } from "@/lib/store-schema";

export type DashboardRange = "today" | "week" | "month";

export function getRangeStartDate(range: DashboardRange, now = new Date()) {
  const base = new Date(now);
  base.setHours(0, 0, 0, 0);

  if (range === "today") {
    return base;
  }

  if (range === "week") {
    const day = base.getDay();
    const delta = day === 0 ? 6 : day - 1;
    base.setDate(base.getDate() - delta);
    return base;
  }

  base.setDate(1);
  return base;
}

export function parseDeliveryDateTime(order: Order) {
  const datePart = order.delivery.date?.trim();
  if (!datePart) {
    return null;
  }

  const timeSource = order.delivery.slot ?? "";
  const timeMatch = timeSource.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

  const candidate = new Date(datePart);
  if (Number.isNaN(candidate.getTime())) {
    return null;
  }

  if (!timeMatch) {
    candidate.setHours(23, 59, 0, 0);
    return candidate;
  }

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const meridiem = timeMatch[3].toUpperCase();

  if (meridiem === "PM" && hours < 12) {
    hours += 12;
  }
  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  candidate.setHours(hours, minutes, 0, 0);
  return candidate;
}

export function getUrgency(order: Order, now = new Date()) {
  const deliveryAt = parseDeliveryDateTime(order);
  if (!deliveryAt) {
    return "upcoming" as const;
  }

  const diffMinutes = Math.round((deliveryAt.getTime() - now.getTime()) / 60000);
  if (diffMinutes < 0) {
    return "past_due" as const;
  }
  if (diffMinutes <= 60) {
    return "urgent" as const;
  }
  if (diffMinutes <= 120) {
    return "soon" as const;
  }
  return "upcoming" as const;
}

export function isCustomizationOrder(order: Order) {
  const names = order.items.map((item) => item.name).join(" ").toLowerCase();
  const message = (order.delivery.cakeMessage ?? "").toLowerCase();
  return /photo|custom|theme/.test(names) || message.length > 0;
}

export function isPhotoCakeOrder(order: Order) {
  return order.items.some((item) => /photo/i.test(item.name));
}

export function getOrdersInRange(orders: Order[], range: DashboardRange, now = new Date()) {
  const start = getRangeStartDate(range, now);
  return orders.filter((order) => new Date(order.createdAt) >= start);
}
