"use client";

import { AnimatePresence, motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MapPin,
  QrCode,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTableStore } from "@/store/useTableStore";
import type { MicroTable } from "@/types";

type ReservationStep = "details" | "payment" | "confirmed";

type ReservationModalProps = {
  table: MicroTable | null;
  onClose: () => void;
  onConfirm: (
    tableId: string,
    attendeeName: string,
    attendeeGoal: string,
  ) => void;
};

export function ReservationModal({
  table,
  onClose,
  onConfirm,
}: ReservationModalProps) {
  return (
    <AnimatePresence>
      {table && (
        <ReservationDialog
          key={table.id}
          table={table}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      )}
    </AnimatePresence>
  );
}

function ReservationDialog({
  table,
  onClose,
  onConfirm,
}: Omit<ReservationModalProps, "table"> & { table: MicroTable }) {
  const currentUser = useTableStore((state) => state.currentUser);
  const [attendeeName, setAttendeeName] = useState(
    () => currentUser?.name ?? "",
  );
  const [attendeeGoal, setAttendeeGoal] = useState("");
  const [step, setStep] = useState<ReservationStep>("details");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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
    if (step !== "confirmed") return;

    const closeTimer = window.setTimeout(onClose, 1600);
    return () => window.clearTimeout(closeTimer);
  }, [step, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = attendeeName.trim();
    const goal = attendeeGoal.trim();
    if (!name || !goal) return;

    setCheckoutError(null);
    setIsCreatingOrder(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: table.id,
          amountInr: table.seatPriceINR,
          attendeeName: name,
        }),
      });

      if (!response.ok) {
        throw new Error("We couldn't start checkout. Please try again.");
      }

      setAttendeeName(name);
      setAttendeeGoal(goal);
      setStep("payment");
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "We couldn't start checkout. Please try again.",
      );
    } finally {
      setIsCreatingOrder(false);
    }
  }

  async function handlePayment() {
    setIsProcessingPayment(true);
    await new Promise<void>((resolve) => window.setTimeout(resolve, 800));
    onConfirm(table.id, attendeeName.trim(), attendeeGoal.trim());
    setStep("confirmed");
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
        aria-labelledby="reservation-modal-title"
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
          aria-label="Close reservation"
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-muted-cocoa transition hover:bg-sand-surface hover:text-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
          onClick={onClose}
        >
          <X aria-hidden="true" className="size-5" />
        </button>

        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait" initial={false}>
            {step === "confirmed" ? (
              <motion.div
                key="confirmation"
                className="flex min-h-80 flex-col items-center justify-center py-10 text-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                role="status"
                aria-live="polite"
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="size-16 text-sage-green"
                  strokeWidth={1.7}
                />
                <h2
                  id="reservation-modal-title"
                  className="mt-5 text-2xl font-bold tracking-tight"
                >
                  Your seat is claimed
                </h2>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-cocoa">
                  You’re all set for {table.topicTitle}. Looking forward to
                  a thoughtful conversation.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <div className="pr-10">
                  <Badge variant="neutral">{table.category}</Badge>
                  <h2
                    id="reservation-modal-title"
                    className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl"
                  >
                    {table.topicTitle}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-cocoa">
                    <span className="font-semibold text-espresso">
                      {table.hostName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {table.hostRole} at {table.hostCompany}
                    </span>
                    <Badge variant="verified">Verified host</Badge>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 rounded-2xl bg-sand-surface/75 p-4 text-sm text-muted-cocoa">
                  <div className="flex items-start gap-2.5">
                    <MapPin
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-terracotta"
                    />
                    <span>{table.venueName}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar
                      aria-hidden="true"
                      className="size-4 shrink-0 text-terracotta"
                    />
                    <time dateTime={table.scheduledAt}>
                      {format(
                        parseISO(table.scheduledAt),
                        "EEEE, MMM d · h:mm a",
                      )}
                    </time>
                  </div>
                </div>

                {step === "details" ? (
                  <form className="mt-6" onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                      <div>
                        <label
                          className="mb-1.5 block text-sm font-semibold"
                          htmlFor="attendee-name"
                        >
                          Your Name
                        </label>
                        <input
                          autoComplete="name"
                          className="w-full rounded-xl border border-espresso/15 bg-white/70 px-3.5 py-3 text-sm text-espresso outline-none transition placeholder:text-muted-cocoa/70 focus:border-terracotta focus:ring-2 focus:ring-terracotta/15"
                          id="attendee-name"
                          maxLength={100}
                          name="attendeeName"
                          onChange={(event) =>
                            setAttendeeName(event.target.value)
                          }
                          placeholder="How should the host know you?"
                          required
                          value={attendeeName}
                        />
                      </div>
                      <div>
                        <label
                          className="mb-1.5 block text-sm font-semibold"
                          htmlFor="attendee-goal"
                        >
                          What do you want to discuss? (1-line goal)
                        </label>
                        <input
                          className="w-full rounded-xl border border-espresso/15 bg-white/70 px-3.5 py-3 text-sm text-espresso outline-none transition placeholder:text-muted-cocoa/70 focus:border-terracotta focus:ring-2 focus:ring-terracotta/15"
                          id="attendee-goal"
                          maxLength={140}
                          name="attendeeGoal"
                          onChange={(event) =>
                            setAttendeeGoal(event.target.value)
                          }
                          placeholder="e.g. Finding my next step in product design"
                          required
                          type="text"
                          value={attendeeGoal}
                        />
                      </div>
                    </div>

                    {checkoutError && (
                      <p className="mt-3 text-sm text-terracotta" role="alert">
                        {checkoutError}
                      </p>
                    )}

                    <div className="mt-6 border-t border-espresso/10 pt-4">
                      <div className="flex items-center justify-between text-sm text-muted-cocoa">
                        <span>Seat price</span>
                        <span>
                          ₹{table.seatPriceINR.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-base font-bold">
                        <span>Total</span>
                        <span>
                          ₹{table.seatPriceINR.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <Button
                        className="mt-5 w-full py-3"
                        disabled={isCreatingOrder}
                        type="submit"
                      >
                        {isCreatingOrder
                          ? "Preparing checkout..."
                          : "Continue to payment"}
                      </Button>
                      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-cocoa">
                        <ShieldCheck
                          aria-hidden="true"
                          className="size-3.5 text-sage-green"
                        />
                        Your details are shared only with the host.
                      </p>
                    </div>
                  </form>
                ) : (
                  <section
                    aria-labelledby="payment-step-title"
                    className="mt-6 rounded-2xl bg-sand-surface p-5 text-espresso sm:p-6"
                  >
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-cocoa">
                        Amount to pay
                      </p>
                      <h3
                        className="mt-1 text-3xl font-bold tracking-tight"
                        id="payment-step-title"
                      >
                        ₹{table.seatPriceINR.toLocaleString("en-IN")}
                      </h3>
                    </div>

                    <div
                      aria-label="Stylized UPI QR code placeholder"
                      className="mx-auto mt-5 flex size-48 items-center justify-center rounded-2xl border border-espresso/10 bg-white p-3 shadow-sm"
                      role="img"
                    >
                      <div className="flex size-full items-center justify-center rounded-xl border-4 border-espresso/80 bg-sand-surface">
                        <QrCode
                          aria-hidden="true"
                          className="size-32 text-espresso"
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-cocoa">
                      <Smartphone aria-hidden="true" className="size-4" />
                      Scan with your preferred UPI app
                    </div>
                    <div
                      aria-label="Popular UPI apps"
                      className="mt-3 flex justify-center gap-2"
                    >
                      {["GPay", "PhonePe", "Paytm"].map((app) => (
                        <span
                          className="rounded-full border border-espresso/10 bg-white px-3 py-1 text-xs font-semibold text-espresso"
                          key={app}
                        >
                          {app}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button
                        className="bg-white text-espresso hover:bg-white/80"
                        disabled={isProcessingPayment}
                        onClick={() => setStep("details")}
                      >
                        <ArrowLeft aria-hidden="true" className="size-4" />
                        Back
                      </Button>
                      <Button
                        className="flex-1 py-3"
                        disabled={isProcessingPayment}
                        onClick={handlePayment}
                      >
                        {isProcessingPayment
                          ? "Processing payment..."
                          : "Complete Payment & Claim Seat"}
                      </Button>
                    </div>
                    {isProcessingPayment && (
                      <p className="sr-only" role="status">
                        Processing payment
                      </p>
                    )}
                  </section>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
    </motion.div>
  );
}
