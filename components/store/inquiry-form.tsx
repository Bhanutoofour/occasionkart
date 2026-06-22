"use client";

import { useState } from "react";

type InquiryField = {
  name: string;
  label: string;
  placeholder: string;
  type?: "text" | "email" | "tel" | "date";
  rows?: number;
  required?: boolean;
};

type InquiryFormProps = {
  emailTo: string;
  emailSubject: string;
  whatsappNumber: string;
  whatsappIntro: string;
  fields: InquiryField[];
  primaryLabel?: string;
  secondaryLabel?: string;
  onSubmit?: (values: Record<string, string>) => Promise<void>;
};

function buildInitialValues(fields: InquiryField[]) {
  return Object.fromEntries(fields.map((field) => [field.name, ""]));
}

export function InquiryForm({
  emailTo,
  emailSubject,
  whatsappNumber,
  whatsappIntro,
  fields,
  primaryLabel = "Send by Email",
  secondaryLabel = "Send on WhatsApp",
  onSubmit,
}: InquiryFormProps) {
  const [values, setValues] = useState<Record<string, string>>(
    buildInitialValues(fields),
  );
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateValue = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const body = [
    whatsappIntro,
    "",
    ...fields
      .map((field) => ({
        label: field.label,
        value: values[field.name]?.trim(),
      }))
      .filter((field) => field.value)
      .map((field) => `${field.label}: ${field.value}`),
  ].join("\n");

  const inquiryEntries = fields
    .map((field) => ({
      label: field.label,
      value: values[field.name]?.trim(),
    }))
    .filter((field) => field.value);

  const submitByEmail = async () => {
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: emailTo,
        subject: emailSubject,
        intro: whatsappIntro,
        entries: inquiryEntries,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to send your inquiry right now.");
    }
  };

  const handleWhatsApp = () => {
    const cleanNumber = whatsappNumber.replace(/\D+/g, "");
    window.open(
      `https://wa.me/${cleanNumber}?text=${encodeURIComponent(body)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setIsPending(true);

    try {
      if (onSubmit) {
        await onSubmit(
          Object.fromEntries(
            Object.entries(values).map(([key, value]) => [key, value.trim()]),
          ),
        );
      } else {
        await submitByEmail();
      }

      setValues(buildInitialValues(fields));
      setSuccess("Your inquiry has been sent. Our team will contact you shortly.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while submitting the form.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <label
            className="text-[0.9rem] font-semibold text-stone-900"
            htmlFor={field.name}
          >
            {field.label}
          </label>
          {field.rows ? (
            <textarea
              id={field.name}
              rows={field.rows}
              value={values[field.name]}
              required={field.required}
              placeholder={field.placeholder}
              className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => updateValue(field.name, event.target.value)}
            />
          ) : (
            <input
              id={field.name}
              type={field.type ?? "text"}
              value={values[field.name]}
              required={field.required}
              placeholder={field.placeholder}
              className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => updateValue(field.name, event.target.value)}
            />
          )}
        </div>
      ))}

      {error ? (
        <p className="rounded-[14px] bg-[#fff3f0] px-4 py-3 text-[0.95rem] text-[#b93815]">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-[14px] bg-[#f0fff4] px-4 py-3 text-[0.95rem] text-[#176b35]">
          {success}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white disabled:opacity-70"
        >
          {isPending ? "Sending..." : primaryLabel}
        </button>
        <button
          type="button"
          className="rounded-full border border-[rgba(0,0,0,0.12)] px-6 py-3 text-[1rem] font-semibold text-stone-900"
          onClick={handleWhatsApp}
        >
          {secondaryLabel}
        </button>
      </div>
    </form>
  );
}
