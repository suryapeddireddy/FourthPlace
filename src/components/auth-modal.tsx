"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Mail, ShieldCheck, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  company?: string;
  isVerifiedMentor: boolean;
};

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
};

type AuthMode = "sign-in" | "mentor";

const inputClassName =
  "w-full rounded-xl border border-espresso/10 bg-sand-surface px-3.5 py-3 text-sm text-espresso outline-none transition placeholder:text-muted-cocoa/70 focus:border-terracotta focus:ring-2 focus:ring-terracotta/15";
const labelClassName = "mb-1.5 block text-sm font-semibold";

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <AuthModalDialog
          key="auth-modal"
          onAuthSuccess={onAuthSuccess}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}

function AuthModalDialog({
  onClose,
  onAuthSuccess,
}: Omit<AuthModalProps, "isOpen">) {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [completed, setCompleted] = useState<{
    message: string;
    isVerifiedMentor: boolean;
  } | null>(null);

  const completeSupabaseAuth = useCallback(
    (session: Session) => {
      const metadata = session.user.user_metadata ?? {};
      const metadataValue = (key: string) =>
        typeof metadata[key] === "string" ? metadata[key].trim() : "";
      const userEmail = session.user.email ?? email.trim();
      const userRole = metadataValue("role") || (mode === "mentor" ? role.trim() : "");
      const userCompany =
        metadataValue("company") || (mode === "mentor" ? company.trim() : "");
      const isVerifiedMentor = Boolean(
        session.user.email_confirmed_at && userRole && userCompany,
      );
      const userName =
        metadataValue("full_name") ||
        (mode === "mentor" ? fullName.trim() : "") ||
        userEmail.split("@")[0] ||
        "FourthPlace member";

      onAuthSuccess({
        id: session.user.id,
        name: userName,
        email: userEmail,
        role: userRole || undefined,
        company: userCompany || undefined,
        isVerifiedMentor,
      });
      setNotice("");
      setCompleted({
        message: isVerifiedMentor
          ? "Your work email is confirmed. Your verified mentor profile is ready."
          : "You’re signed in and ready to find your next table.",
        isVerifiedMentor,
      });
    },
    [company, email, fullName, mode, onAuthSuccess, role],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        completeSupabaseAuth(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [completeSupabaseAuth]);

  function activateDemoProfile() {
    const isMentorMode = mode === "mentor";
    const profileEmail = email.trim();

    onAuthSuccess({
      id: `demo-${crypto.randomUUID()}`,
      name: isMentorMode ? fullName.trim() : profileEmail.split("@")[0],
      email: profileEmail,
      role: isMentorMode ? role.trim() : undefined,
      company: isMentorMode ? company.trim() : undefined,
      isVerifiedMentor: false,
    });
    setCompleted({
      message: isMentorMode
        ? "Your demo session is active. Mentor details are saved for this demo, but a confirmed work email is required for verification."
        : "Your demo session is active. You’re ready to find your next table.",
      isVerifiedMentor: false,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!isSupabaseConfigured) {
      activateDemoProfile();
      return;
    }

    if (!supabase) {
      setError("Authentication is configured, but the Supabase client is unavailable.");
      return;
    }

    setIsSending(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        ...(mode === "mentor"
          ? {
              options: {
                data: {
                  full_name: fullName.trim(),
                  role: role.trim(),
                  company: company.trim(),
                },
              },
            }
          : {}),
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setNotice(
        `Magic link sent to ${email.trim()}. Check your inbox to finish signing in${
          mode === "mentor" ? " and verify your work email" : ""
        }.`,
      );
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "We couldn’t send your magic link. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setNotice("");
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-espresso/45 p-4 backdrop-blur-sm sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        aria-labelledby="auth-modal-title"
        aria-modal="true"
        className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-espresso/10 bg-warm-cream text-espresso shadow-2xl"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        role="dialog"
      >
        <button
          type="button"
          aria-label="Close authentication dialog"
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-muted-cocoa transition hover:bg-sand-surface hover:text-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
          onClick={onClose}
        >
          <X aria-hidden="true" className="size-5" />
        </button>

        <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8">
          <div className="pr-10">
            <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-terracotta">
              <Sparkles aria-hidden="true" className="size-4" />
              A SEAT AT THE TABLE
            </p>
            <h2
              id="auth-modal-title"
              className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl"
            >
              {completed
                ? "You’re all set"
                : mode === "mentor"
                  ? "Meet as a mentor"
                  : "Welcome to FourthPlace"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-cocoa">
              {completed
                ? completed.message
                : "Good conversations start with a simple hello."}
            </p>
          </div>

          {completed ? (
            <div className="mt-6 space-y-5">
              <div
                className="flex items-center gap-3 rounded-2xl border border-sage-green/15 bg-sage-green/10 p-4"
                role="status"
              >
                <ShieldCheck
                  aria-hidden="true"
                  className="size-6 shrink-0 text-sage-green"
                />
                <div>
                  <p className="font-semibold">
                    {completed.isVerifiedMentor
                      ? "Verified mentor"
                      : "Session confirmed"}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-cocoa">
                    {completed.isVerifiedMentor
                      ? "Your company email has been confirmed."
                      : "You can close this window whenever you’re ready."}
                  </p>
                </div>
                {completed.isVerifiedMentor && (
                  <Badge className="ml-auto shrink-0" variant="verified">
                    Verified
                  </Badge>
                )}
              </div>
              <Button className="w-full py-3" onClick={onClose}>
                Continue
              </Button>
            </div>
          ) : (
            <>
              <div
                aria-label="Choose an authentication option"
                className="mt-6 grid grid-cols-2 rounded-xl bg-sand-surface p-1"
              >
                <button
                  type="button"
                  aria-pressed={mode === "sign-in"}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    mode === "sign-in"
                      ? "bg-warm-cream text-espresso shadow-sm"
                      : "text-muted-cocoa hover:text-espresso"
                  }`}
                  onClick={() => changeMode("sign-in")}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  aria-pressed={mode === "mentor"}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    mode === "mentor"
                      ? "bg-warm-cream text-espresso shadow-sm"
                      : "text-muted-cocoa hover:text-espresso"
                  }`}
                  onClick={() => changeMode("mentor")}
                >
                  Verify as Mentor
                </button>
              </div>

              {mode === "mentor" && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-terracotta/15 bg-terracotta/5 p-4">
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-terracotta"
                  />
                  <div className="space-y-2">
                    <p className="text-sm leading-relaxed text-muted-cocoa">
                      Confirm your company email to unlock your verified mentor
                      badge.
                    </p>
                    <Badge variant="neutral">Work email verification required</Badge>
                  </div>
                </div>
              )}

              <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                {mode === "mentor" && (
                  <div>
                    <label className={labelClassName} htmlFor="auth-full-name">
                      Full Name
                    </label>
                    <input
                      autoComplete="name"
                      className={inputClassName}
                      id="auth-full-name"
                      maxLength={100}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Your full name"
                      required
                      value={fullName}
                    />
                  </div>
                )}

                <div>
                  <label className={labelClassName} htmlFor="auth-email">
                    {mode === "mentor" ? "Work Email" : "Email"}
                  </label>
                  <div className="relative">
                    <Mail
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-cocoa"
                    />
                    <input
                      autoComplete="email"
                      className={`${inputClassName} pl-10`}
                      id="auth-email"
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={
                        mode === "mentor"
                          ? "you@company.com"
                          : "you@example.com"
                      }
                      required
                      type="email"
                      value={email}
                    />
                  </div>
                  {mode === "mentor" && (
                    <p className="mt-1.5 text-xs text-muted-cocoa">
                      Use your company email; the magic link confirms it.
                    </p>
                  )}
                </div>

                {mode === "mentor" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        className={`${labelClassName} flex items-center gap-1.5`}
                        htmlFor="auth-role"
                      >
                        <Briefcase
                          aria-hidden="true"
                          className="size-4 text-terracotta"
                        />
                        Role
                      </label>
                      <input
                        autoComplete="organization-title"
                        className={inputClassName}
                        id="auth-role"
                        maxLength={100}
                        onChange={(event) => setRole(event.target.value)}
                        placeholder="e.g., Product Designer"
                        required
                        value={role}
                      />
                    </div>
                    <div>
                      <label
                        className={`${labelClassName} flex items-center gap-1.5`}
                        htmlFor="auth-company"
                      >
                        <Briefcase
                          aria-hidden="true"
                          className="size-4 text-terracotta"
                        />
                        Company
                      </label>
                      <input
                        autoComplete="organization"
                        className={inputClassName}
                        id="auth-company"
                        maxLength={100}
                        onChange={(event) => setCompany(event.target.value)}
                        placeholder="Your company"
                        required
                        value={company}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-sm font-medium text-terracotta" role="alert">
                    {error}
                  </p>
                )}
                {notice && (
                  <p
                    className="rounded-xl border border-sage-green/15 bg-sage-green/10 px-4 py-3 text-sm leading-relaxed text-sage-green"
                    role="status"
                  >
                    {notice}
                  </p>
                )}

                <Button
                  className="w-full py-3"
                  disabled={isSending}
                  type="submit"
                >
                  <Mail aria-hidden="true" className="size-4" />
                  {isSending
                    ? "Sending magic link…"
                    : isSupabaseConfigured
                      ? "Send Magic Link"
                      : "Continue with Demo Profile"}
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}
