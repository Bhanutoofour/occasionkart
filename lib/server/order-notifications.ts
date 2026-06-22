import type { Order, OrderStatus, PaymentStatus } from "@/lib/store-schema";
import nodemailer from "nodemailer";

function splitEnvList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanPhone(value: string | undefined) {
  return (value ?? "").replace(/\D+/g, "");
}

function buildOrderLines(order: Order) {
  return order.items
    .map((item) => `${item.name} x ${item.quantity} - Rs. ${item.lineTotal}`)
    .join("\n");
}

function buildEmailHtml(order: Order) {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<li><strong>${item.name}</strong> x ${item.quantity} - Rs. ${item.lineTotal}</li>`,
    )
    .join("");

  return `
    <div style="font-family:Segoe UI,Trebuchet MS,sans-serif;color:#2b1812;">
      <h2 style="margin-bottom:8px;">New Order Received</h2>
      <p style="margin:0 0 16px;">Order <strong>${order.orderNumber}</strong> was placed on OccasionKart.</p>
      <p><strong>Customer:</strong> ${order.customer.fullName}</p>
      <p><strong>Phone:</strong> ${order.customer.phone}</p>
      <p><strong>Email:</strong> ${order.customer.email ?? "Not provided"}</p>
      <p><strong>Delivery Date:</strong> ${order.delivery.date}</p>
      <p><strong>Address:</strong> ${order.delivery.address}, ${order.delivery.city}</p>
      <p><strong>Cake Message:</strong> ${order.delivery.cakeMessage ?? "None"}</p>
      <p><strong>Total:</strong> Rs. ${order.pricing.total}</p>
      <h3 style="margin:20px 0 8px;">Items</h3>
      <ul style="padding-left:20px;margin:0;">${itemsHtml}</ul>
    </div>
  `;
}

function buildEmailText(order: Order) {
  return [
    `New order received: ${order.orderNumber}`,
    "",
    `Customer: ${order.customer.fullName}`,
    `Phone: ${order.customer.phone}`,
    `Email: ${order.customer.email ?? "Not provided"}`,
    `Delivery Date: ${order.delivery.date}`,
    `Address: ${order.delivery.address}, ${order.delivery.city}`,
    `Cake Message: ${order.delivery.cakeMessage ?? "None"}`,
    `Total: Rs. ${order.pricing.total}`,
    "",
    "Items:",
    buildOrderLines(order),
  ].join("\n");
}

function buildWhatsAppText(order: Order) {
  return [
    "New OccasionKart order received",
    `Order: ${order.orderNumber}`,
    `Customer: ${order.customer.fullName}`,
    `Phone: ${order.customer.phone}`,
    `Delivery: ${order.delivery.date}`,
    `Total: Rs. ${order.pricing.total}`,
    "",
    "Items:",
    buildOrderLines(order),
  ].join("\n");
}

function buildInternalEmailSubject(order: Order) {
  return `New Order ${order.orderNumber} - Rs. ${order.pricing.total}`;
}

function buildCustomerEmailSubject(order: Order) {
  return `Order Confirmed ${order.orderNumber} | OccasionKart Hyderabad`;
}

function buildCustomerOrderReceivedSubject(order: Order) {
  return `Order Received ${order.orderNumber} | OccasionKart Hyderabad`;
}

function buildCustomerOrderReceivedHtml(order: Order) {
  return `
    <div style="font-family:Segoe UI,Trebuchet MS,sans-serif;color:#2b1812;">
      <h2 style="margin-bottom:8px;">We received your order</h2>
      <p style="margin:0 0 16px;">Hi ${order.customer.fullName}, your order has been placed successfully.</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Order Status:</strong> ${formatOrderStatus(order.status)}</p>
      <p><strong>Payment Status:</strong> ${formatPaymentStatus(order.paymentStatus)}</p>
      <p><strong>Delivery Date:</strong> ${order.delivery.date}</p>
      <p><strong>Total:</strong> Rs. ${order.pricing.total}</p>
      <p style="margin-top:16px;">You will receive another update when your order moves ahead.</p>
    </div>
  `;
}

function buildCustomerOrderReceivedText(order: Order) {
  return [
    `Hi ${order.customer.fullName}, we received your order.`,
    "",
    `Order Number: ${order.orderNumber}`,
    `Order Status: ${formatOrderStatus(order.status)}`,
    `Payment Status: ${formatPaymentStatus(order.paymentStatus)}`,
    `Delivery Date: ${order.delivery.date}`,
    `Total: Rs. ${order.pricing.total}`,
    "",
    "We will send the next update as your order progresses.",
  ].join("\n");
}

function buildCustomerEmailHtml(order: Order) {
  return `
    <div style="font-family:Segoe UI,Trebuchet MS,sans-serif;color:#2b1812;">
      <h2 style="margin-bottom:8px;">Your OccasionKart order is confirmed</h2>
      <p style="margin:0 0 16px;">Hi ${order.customer.fullName}, thanks for ordering with us.</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Delivery Date:</strong> ${order.delivery.date}</p>
      <p><strong>Delivery Address:</strong> ${order.delivery.address}, ${order.delivery.city}</p>
      <p><strong>Total Paid:</strong> Rs. ${order.pricing.total}</p>
      <h3 style="margin:20px 0 8px;">Items</h3>
      <ul style="padding-left:20px;margin:0;">
        ${order.items
          .map(
            (item) =>
              `<li><strong>${item.name}</strong> x ${item.quantity} - Rs. ${item.lineTotal}</li>`,
          )
          .join("")}
      </ul>
      <p style="margin-top:16px;">For support, contact us at support@occasionkart.com.</p>
    </div>
  `;
}

function buildCustomerEmailText(order: Order) {
  return [
    `Hi ${order.customer.fullName}, your OccasionKart order is confirmed.`,
    "",
    `Order Number: ${order.orderNumber}`,
    `Delivery Date: ${order.delivery.date}`,
    `Delivery Address: ${order.delivery.address}, ${order.delivery.city}`,
    `Total Paid: Rs. ${order.pricing.total}`,
    "",
    "Items:",
    buildOrderLines(order),
    "",
    "Support: support@occasionkart.com",
  ].join("\n");
}

function formatOrderStatus(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "preparing":
      return "Preparing";
    case "out_for_delivery":
      return "Out for Delivery";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

function formatPaymentStatus(status: PaymentStatus) {
  switch (status) {
    case "pending":
      return "Pending";
    case "paid":
      return "Paid";
    case "failed":
      return "Failed";
    case "refunded":
      return "Refunded";
    default:
      return status;
  }
}

function buildStatusUpdateSubject(order: Order, status: OrderStatus) {
  if (status === "confirmed" || status === "preparing") {
    return `Processing Order ${order.orderNumber} | OccasionKart`;
  }

  if (status === "out_for_delivery") {
    return `Out for Delivery ${order.orderNumber} | OccasionKart`;
  }

  if (status === "delivered") {
    return `Completed Order ${order.orderNumber} | OccasionKart`;
  }

  if (status === "cancelled") {
    return `Cancelled Order ${order.orderNumber} | OccasionKart`;
  }

  return `Order ${order.orderNumber} is ${formatOrderStatus(status)} | OccasionKart`;
}

function buildStatusUpdateHtml(order: Order, status: OrderStatus) {
  const statusLabel = formatOrderStatus(status);
  return `
    <div style="font-family:Segoe UI,Trebuchet MS,sans-serif;color:#2b1812;">
      <h2 style="margin-bottom:8px;">Order Status Update</h2>
      <p style="margin:0 0 16px;">Hi ${order.customer.fullName}, your order status has been updated.</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Current Status:</strong> ${statusLabel}</p>
      <p><strong>Delivery Date:</strong> ${order.delivery.date}</p>
      <p><strong>Delivery Address:</strong> ${order.delivery.address}, ${order.delivery.city}</p>
      <p><strong>Total:</strong> Rs. ${order.pricing.total}</p>
      <p style="margin-top:16px;">Need help? Contact support@occasionkart.com.</p>
    </div>
  `;
}

function buildStatusUpdateText(order: Order, status: OrderStatus) {
  return [
    `Hi ${order.customer.fullName}, your order status has been updated.`,
    "",
    `Order Number: ${order.orderNumber}`,
    `Current Status: ${formatOrderStatus(status)}`,
    `Delivery Date: ${order.delivery.date}`,
    `Delivery Address: ${order.delivery.address}, ${order.delivery.city}`,
    `Total: Rs. ${order.pricing.total}`,
    "",
    "Support: support@occasionkart.com",
  ].join("\n");
}

function buildInternalStatusChangeSubject(order: Order, previousStatus: OrderStatus, nextStatus: OrderStatus) {
  return `Order ${order.orderNumber}: ${formatOrderStatus(previousStatus)} -> ${formatOrderStatus(nextStatus)}`;
}

function buildInternalStatusChangeHtml(order: Order, previousStatus: OrderStatus, nextStatus: OrderStatus) {
  return `
    <div style="font-family:Segoe UI,Trebuchet MS,sans-serif;color:#2b1812;">
      <h2 style="margin-bottom:8px;">Order Status Changed</h2>
      <p><strong>Order:</strong> ${order.orderNumber}</p>
      <p><strong>Customer:</strong> ${order.customer.fullName}</p>
      <p><strong>Phone:</strong> ${order.customer.phone}</p>
      <p><strong>Status:</strong> ${formatOrderStatus(previousStatus)} -> ${formatOrderStatus(nextStatus)}</p>
      <p><strong>Delivery Date:</strong> ${order.delivery.date}</p>
      <p><strong>Total:</strong> Rs. ${order.pricing.total}</p>
    </div>
  `;
}

function buildInternalStatusChangeText(order: Order, previousStatus: OrderStatus, nextStatus: OrderStatus) {
  return [
    "Order status changed",
    `Order: ${order.orderNumber}`,
    `Customer: ${order.customer.fullName}`,
    `Phone: ${order.customer.phone}`,
    `Status: ${formatOrderStatus(previousStatus)} -> ${formatOrderStatus(nextStatus)}`,
    `Delivery Date: ${order.delivery.date}`,
    `Total: Rs. ${order.pricing.total}`,
  ].join("\n");
}

function buildInternalPaymentChangeSubject(
  order: Order,
  previousPaymentStatus: PaymentStatus,
  nextPaymentStatus: PaymentStatus,
) {
  if (nextPaymentStatus === "failed") {
    return `Failed Order ${order.orderNumber} | Payment Failed`;
  }

  if (nextPaymentStatus === "refunded") {
    return `Refunded Order ${order.orderNumber}`;
  }

  return `Payment Update ${order.orderNumber}: ${formatPaymentStatus(previousPaymentStatus)} -> ${formatPaymentStatus(nextPaymentStatus)}`;
}

function buildInternalPaymentChangeHtml(
  order: Order,
  previousPaymentStatus: PaymentStatus,
  nextPaymentStatus: PaymentStatus,
) {
  return `
    <div style="font-family:Segoe UI,Trebuchet MS,sans-serif;color:#2b1812;">
      <h2 style="margin-bottom:8px;">Order Payment Status Changed</h2>
      <p><strong>Order:</strong> ${order.orderNumber}</p>
      <p><strong>Customer:</strong> ${order.customer.fullName}</p>
      <p><strong>Payment:</strong> ${formatPaymentStatus(previousPaymentStatus)} -> ${formatPaymentStatus(nextPaymentStatus)}</p>
      <p><strong>Total:</strong> Rs. ${order.pricing.total}</p>
    </div>
  `;
}

function buildInternalPaymentChangeText(
  order: Order,
  previousPaymentStatus: PaymentStatus,
  nextPaymentStatus: PaymentStatus,
) {
  return [
    "Order payment status changed",
    `Order: ${order.orderNumber}`,
    `Customer: ${order.customer.fullName}`,
    `Payment: ${formatPaymentStatus(previousPaymentStatus)} -> ${formatPaymentStatus(nextPaymentStatus)}`,
    `Total: Rs. ${order.pricing.total}`,
  ].join("\n");
}

function getConfiguredFromEmail() {
  return process.env.ORDER_NOTIFICATION_FROM_EMAIL ?? getSmtpUser();
}

function getInternalOrderNotificationRecipients() {
  const configuredRecipients = splitEnvList(process.env.ORDER_NOTIFICATION_TO_EMAIL);
  if (configuredRecipients.length > 0) {
    return configuredRecipients;
  }

  return splitEnvList(
    process.env.ADMIN_PASSWORD_SUPPORT_EMAIL ??
      process.env.GMAIL_USER ??
      "support@occasionkart.com",
  );
}

function getSmtpUser() {
  return process.env.GMAIL_USER ?? process.env.SMTP_USER;
}

function getSmtpPass() {
  return process.env.GMAIL_APP_PASSWORD ?? process.env.SMTP_PASS;
}

async function sendViaResend({
  from,
  to,
  subject,
  html,
  text,
  idempotencyKey,
}: {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email notification failed with status ${response.status}`);
  }

  return true;
}

async function sendViaSmtp({
  to,
  subject,
  html,
  text,
}: {
  to: string[];
  subject: string;
  html: string;
  text: string;
}) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT ?? 465);
  const smtpSecure = (process.env.SMTP_SECURE ?? "true").toLowerCase() === "true";
  const smtpUser = getSmtpUser();
  const smtpPass = getSmtpPass();

  if (!smtpUser || !smtpPass) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost ?? "smtp.gmail.com",
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: smtpUser,
    to: to.join(","),
    subject,
    html,
    text,
  });

  return true;
}

async function sendOrderEmail({
  order,
  recipients,
  subject,
  html,
  text,
  idempotencyKey,
}: {
  order: Order;
  recipients: string[];
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}) {
  const from = getConfiguredFromEmail();
  if (!from || recipients.length === 0) {
    return;
  }

  const errors: string[] = [];

  try {
    const sentBySmtp = await sendViaSmtp({
      to: recipients,
      subject,
      html,
      text,
    });

    if (sentBySmtp) {
      return;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`SMTP: ${message}`);
    console.error(`Order email SMTP send failed for ${order.orderNumber}`, error);
  }

  try {
    const sentByResend = await sendViaResend({
      from,
      to: recipients,
      subject,
      html,
      text,
      idempotencyKey,
    });

    if (sentByResend) {
      return;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`Resend: ${message}`);
    console.error(`Order email Resend send failed for ${order.orderNumber}`, error);
  }

  throw new Error(
    errors.length > 0
      ? `All email providers failed for order ${order.orderNumber}. ${errors.join(" | ")}`
      : `No email provider configured for order ${order.orderNumber}. Set RESEND_API_KEY or SMTP/GMAIL env variables.`,
  );
}

async function sendInternalEmailNotification(order: Order) {
  const to = getInternalOrderNotificationRecipients();
  if (to.length === 0) {
    return;
  }

  await sendOrderEmail({
    order,
    recipients: to,
    subject: buildInternalEmailSubject(order),
    html: buildEmailHtml(order),
    text: buildEmailText(order),
    idempotencyKey: `order-email-internal-${order.id}`,
  });
}

async function sendCustomerEmailNotification(order: Order) {
  const customerEmail = order.customer.email?.trim();
  if (!customerEmail) {
    return;
  }

  await sendOrderEmail({
    order,
    recipients: [customerEmail],
    subject: buildCustomerEmailSubject(order),
    html: buildCustomerEmailHtml(order),
    text: buildCustomerEmailText(order),
    idempotencyKey: `order-email-customer-${order.id}`,
  });
}

const CUSTOMER_STATUS_EMAILS = new Set<OrderStatus>([
  "confirmed",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

const CUSTOMER_PAYMENT_EMAILS = new Set<PaymentStatus>(["failed", "refunded"]);

async function sendCustomerStatusUpdateEmail(order: Order, status: OrderStatus) {
  const customerEmail = order.customer.email?.trim();
  if (!customerEmail || !CUSTOMER_STATUS_EMAILS.has(status)) {
    return;
  }

  await sendOrderEmail({
    order,
    recipients: [customerEmail],
    subject: buildStatusUpdateSubject(order, status),
    html: buildStatusUpdateHtml(order, status),
    text: buildStatusUpdateText(order, status),
    idempotencyKey: `order-email-customer-status-${order.id}-${status}`,
  });
}

async function sendCustomerPaymentUpdateEmail(order: Order, paymentStatus: PaymentStatus) {
  const customerEmail = order.customer.email?.trim();
  if (!customerEmail || !CUSTOMER_PAYMENT_EMAILS.has(paymentStatus)) {
    return;
  }

  const subject =
    paymentStatus === "failed"
      ? `Failed Order ${order.orderNumber} | Payment Failed`
      : `Refunded Order ${order.orderNumber}`;

  const html = `
    <div style="font-family:Segoe UI,Trebuchet MS,sans-serif;color:#2b1812;">
      <h2 style="margin-bottom:8px;">Payment Update</h2>
      <p style="margin:0 0 16px;">Hi ${order.customer.fullName}, your payment status has changed.</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Payment Status:</strong> ${formatPaymentStatus(paymentStatus)}</p>
      <p><strong>Total:</strong> Rs. ${order.pricing.total}</p>
      <p style="margin-top:16px;">For help, contact support@occasionkart.com.</p>
    </div>
  `;

  const text = [
    `Hi ${order.customer.fullName}, your payment status has changed.`,
    "",
    `Order Number: ${order.orderNumber}`,
    `Payment Status: ${formatPaymentStatus(paymentStatus)}`,
    `Total: Rs. ${order.pricing.total}`,
    "",
    "Support: support@occasionkart.com",
  ].join("\n");

  await sendOrderEmail({
    order,
    recipients: [customerEmail],
    subject,
    html,
    text,
    idempotencyKey: `order-email-customer-payment-${order.id}-${paymentStatus}`,
  });
}

async function sendInternalStatusUpdateEmail(order: Order, previousStatus: OrderStatus, nextStatus: OrderStatus) {
  const to = getInternalOrderNotificationRecipients();
  if (to.length === 0) {
    return;
  }

  await sendOrderEmail({
    order,
    recipients: to,
    subject: buildInternalStatusChangeSubject(order, previousStatus, nextStatus),
    html: buildInternalStatusChangeHtml(order, previousStatus, nextStatus),
    text: buildInternalStatusChangeText(order, previousStatus, nextStatus),
    idempotencyKey: `order-email-internal-status-${order.id}-${previousStatus}-${nextStatus}`,
  });
}

async function sendInternalPaymentUpdateEmail(
  order: Order,
  previousPaymentStatus: PaymentStatus,
  nextPaymentStatus: PaymentStatus,
) {
  const to = getInternalOrderNotificationRecipients();
  if (to.length === 0) {
    return;
  }

  await sendOrderEmail({
    order,
    recipients: to,
    subject: buildInternalPaymentChangeSubject(order, previousPaymentStatus, nextPaymentStatus),
    html: buildInternalPaymentChangeHtml(order, previousPaymentStatus, nextPaymentStatus),
    text: buildInternalPaymentChangeText(order, previousPaymentStatus, nextPaymentStatus),
    idempotencyKey: `order-email-internal-payment-${order.id}-${previousPaymentStatus}-${nextPaymentStatus}`,
  });
}

async function sendWhatsAppWebhook(order: Order) {
  const webhookUrl = process.env.WHATSAPP_NOTIFY_WEBHOOK_URL;
  if (!webhookUrl) {
    return false;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "new_order",
      order,
      message: buildWhatsAppText(order),
    }),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp webhook failed with status ${response.status}`);
  }

  return true;
}

async function sendWhatsAppCloudTemplate(order: Order) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const notifyTo = cleanPhone(process.env.WHATSAPP_NOTIFY_TO);
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const languageCode = process.env.WHATSAPP_TEMPLATE_LANG ?? "en";

  if (!accessToken || !phoneNumberId || !notifyTo || !templateName) {
    return;
  }

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: notifyTo,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: order.orderNumber },
                { type: "text", text: order.customer.fullName },
                { type: "text", text: order.customer.phone },
                { type: "text", text: String(order.pricing.total) },
              ],
            },
          ],
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`WhatsApp notification failed with status ${response.status}`);
  }
}

export async function sendNewOrderNotifications(order: Order) {
  const results = await Promise.allSettled([
    sendInternalEmailNotification(order),
    (async () => {
      const handledByWebhook = await sendWhatsAppWebhook(order);
      if (!handledByWebhook) {
        await sendWhatsAppCloudTemplate(order);
      }
    })(),
  ]);

  const errors = results
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => result.reason instanceof Error ? result.reason.message : String(result.reason));

  if (errors.length > 0) {
    throw new Error(errors.join(" | "));
  }
}

export async function sendCustomerOrderReceivedNotification(order: Order) {
  const customerEmail = order.customer.email?.trim();
  if (!customerEmail) {
    return;
  }

  await sendOrderEmail({
    order,
    recipients: [customerEmail],
    subject: buildCustomerOrderReceivedSubject(order),
    html: buildCustomerOrderReceivedHtml(order),
    text: buildCustomerOrderReceivedText(order),
    idempotencyKey: `order-email-customer-received-${order.id}`,
  });
}

export async function sendInitialOrderNotifications(order: Order) {
  const tasks = [
    {
      label: "New order internal notification",
      send: () => sendNewOrderNotifications(order),
    },
    {
      label: "Customer order received notification",
      send: () => sendCustomerOrderReceivedNotification(order),
    },
  ];

  const results = await Promise.allSettled(tasks.map((task) => task.send()));

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `${tasks[index].label} failed for ${order.orderNumber}`,
        result.reason,
      );
    }
  });
}

export async function sendOrderStatusNotifications(
  previousOrder: Order,
  updatedOrder: Order,
  options?: { sendInternal?: boolean; sendCustomer?: boolean },
) {
  const sendInternal = options?.sendInternal ?? true;
  const sendCustomer = options?.sendCustomer ?? true;
  const tasks: Promise<unknown>[] = [];

  if (previousOrder.status !== updatedOrder.status) {
    if (sendCustomer) {
      tasks.push(sendCustomerStatusUpdateEmail(updatedOrder, updatedOrder.status));
    }
    if (sendInternal) {
      tasks.push(sendInternalStatusUpdateEmail(updatedOrder, previousOrder.status, updatedOrder.status));
    }
  }

  if (previousOrder.paymentStatus !== updatedOrder.paymentStatus) {
    if (sendCustomer) {
      tasks.push(sendCustomerPaymentUpdateEmail(updatedOrder, updatedOrder.paymentStatus));
    }
    if (sendInternal) {
      tasks.push(
        sendInternalPaymentUpdateEmail(
          updatedOrder,
          previousOrder.paymentStatus,
          updatedOrder.paymentStatus,
        ),
      );
    }
  }

  if (tasks.length === 0) {
    return;
  }

  const results = await Promise.allSettled(tasks);
  const errors = results
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => (result.reason instanceof Error ? result.reason.message : String(result.reason)));

  if (errors.length > 0) {
    throw new Error(errors.join(" | "));
  }
}
