"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProfileFormProps = {
  initialName: string;
  email: string;
  initialPhone: string;
};

export function ProfileForm({ initialName, email, initialPhone }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError("");
    setProfileMessage("");
    setIsSavingProfile(true);

    try {
      const response = await fetch("/api/auth/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
        }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setProfileError(payload.error ?? "Unable to update your profile right now.");
        return;
      }

      setProfileMessage("Profile updated.");
      router.refresh();
    } finally {
      setIsSavingProfile(false);
    }
  };

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setPasswordError(
          payload.error ??
            "Unable to change password. Use forgot password if this account was created with Google or Facebook.",
        );
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password changed.");
      router.refresh();
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        onSubmit={saveProfile}
        className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:p-8"
      >
        <h1 className="text-[2rem] font-semibold text-black">Profile</h1>
        <p className="mt-2 text-[1rem] leading-7 text-[#6c7396]">
          Your customer details for order updates and checkout.
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-[0.9rem] font-semibold text-stone-900" htmlFor="profile-name">
              Name
            </label>
            <input
              id="profile-name"
              required
              value={name}
              className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[0.9rem] font-semibold text-stone-900" htmlFor="profile-email">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              readOnly
              className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] bg-[#f7f7f9] px-4 py-3 text-[#6c7396]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[0.9rem] font-semibold text-stone-900" htmlFor="profile-phone">
              Phone Number
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              autoComplete="tel"
              className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
        </div>

        {profileError ? (
          <p className="mt-4 rounded-[12px] bg-[#fff3f0] px-4 py-3 text-[0.95rem] text-[#b93815]">
            {profileError}
          </p>
        ) : null}

        {profileMessage ? (
          <p className="mt-4 rounded-[12px] bg-[#f3fff2] px-4 py-3 text-[0.95rem] text-[#2f8f2f]">
            {profileMessage}
          </p>
        ) : null}

        <button
          disabled={isSavingProfile}
          className="mt-6 w-full rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white disabled:opacity-70"
        >
          {isSavingProfile ? "Saving..." : "Save Profile"}
        </button>
      </form>

      <form
        onSubmit={changePassword}
        className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-[#fffdfb] p-6 sm:p-8"
      >
        <h2 className="text-[1.6rem] font-semibold text-black">Change Password</h2>
        <p className="mt-2 text-[0.95rem] leading-7 text-[#6c7396]">
          Use your current password to set a new one.
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label
              className="text-[0.9rem] font-semibold text-stone-900"
              htmlFor="current-password"
            >
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[0.9rem] font-semibold text-stone-900" htmlFor="new-password">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-[0.9rem] font-semibold text-stone-900"
              htmlFor="confirm-new-password"
            >
              Confirm New Password
            </label>
            <input
              id="confirm-new-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
        </div>

        {passwordError ? (
          <p className="mt-4 rounded-[12px] bg-[#fff3f0] px-4 py-3 text-[0.95rem] text-[#b93815]">
            {passwordError}
          </p>
        ) : null}

        {passwordMessage ? (
          <p className="mt-4 rounded-[12px] bg-[#f3fff2] px-4 py-3 text-[0.95rem] text-[#2f8f2f]">
            {passwordMessage}
          </p>
        ) : null}

        <button
          disabled={isChangingPassword}
          className="mt-6 w-full rounded-full border border-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-[#ef7f41] disabled:opacity-70"
        >
          {isChangingPassword ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
