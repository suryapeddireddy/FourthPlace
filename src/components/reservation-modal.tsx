"use client";

import { AnimatePresence, motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MicroTable } from "@/types";

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
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeGoal, setAttendeeGoal] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

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
    if (!isConfirmed) return;

    const closeTimer = window.setTimeout(onClose, 1600);
    return () => window.clearTimeout(closeTimer);
  }, [isConfirmed, onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = attendeeName.trim();
    const goal = attendeeGoal.trim();
    if (!name || !goal) return;

    onConfirm(table.id, name, goal);
    setIsConfirmed(true);
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
            {isConfirmed ? (
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
                key="reservation-form"
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
                    <Button className="mt-5 w-full py-3" type="submit">
                      Confirm &amp; Claim Seat
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
    </motion.div>
  );
}
