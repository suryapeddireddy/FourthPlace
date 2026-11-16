"use client";

import { AnimatePresence, motion } from "framer-motion";
import { format, isValid, parseISO } from "date-fns";
import { Calendar, CheckCircle2, MapPin, Ticket, X } from "lucide-react";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MicroTable, SeatBooking } from "@/types";

type MyBookingsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  bookings: SeatBooking[];
  tables: MicroTable[];
};

export function MyBookingsDrawer({
  isOpen,
  onClose,
  bookings,
  tables,
}: MyBookingsDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end bg-espresso/45 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.aside
            aria-labelledby="my-bookings-title"
            aria-modal="true"
            className="flex h-full w-full max-w-xl flex-col bg-warm-cream text-espresso shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            role="dialog"
          >
            <header className="flex items-center justify-between border-b border-espresso/10 px-5 py-5 sm:px-7">
              <h2
                id="my-bookings-title"
                className="text-xl font-bold tracking-tight sm:text-2xl"
              >
                My Reserved Seats
              </h2>
              <Button
                aria-label="Close reserved seats"
                className="rounded-full bg-transparent px-3 py-3 text-muted-cocoa hover:bg-sand-surface hover:text-espresso"
                onClick={onClose}
              >
                <X aria-hidden="true" className="size-5" />
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
              {bookings.length === 0 ? (
                <div
                  className="flex min-h-[60vh] flex-col items-center justify-center text-center"
                  role="status"
                >
                  <div className="flex size-16 items-center justify-center rounded-full bg-sand-surface text-terracotta">
                    <Ticket aria-hidden="true" className="size-8" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-tight">
                    Your next good conversation is nearby
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-cocoa">
                    Claim your first neighborhood mentorship seat and meet
                    someone new over coffee.
                  </p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {bookings.map((booking) => {
                    const table = tables.find(
                      (item) => item.id === booking.tableId,
                    );

                    return (
                      <li key={booking.id}>
                        <article
                          aria-labelledby={`booking-${booking.id}`}
                          className="rounded-3xl border border-espresso/10 bg-sand-surface p-5 sm:p-6"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-terracotta uppercase">
                                <Ticket
                                  aria-hidden="true"
                                  className="size-4 shrink-0"
                                />
                                Neighborhood seat
                              </p>
                              <h3
                                id={`booking-${booking.id}`}
                                className="mt-2 text-lg font-bold leading-snug"
                              >
                                {table?.topicTitle ?? "Table details unavailable"}
                              </h3>
                              <p className="mt-1 text-sm text-muted-cocoa">
                                Hosted by{" "}
                                <span className="font-semibold text-espresso">
                                  {table?.hostName ?? "Host details unavailable"}
                                </span>
                              </p>
                            </div>
                            <Badge
                              className="shrink-0 bg-sage-green/10 text-sage-green"
                              variant="neutral"
                            >
                              <CheckCircle2
                                aria-hidden="true"
                                className="size-3.5 shrink-0"
                              />
                              Confirmed
                            </Badge>
                          </div>

                          <div className="mt-5 grid gap-3 border-t border-dashed border-espresso/15 pt-4 text-sm text-muted-cocoa">
                            <div className="flex items-start gap-2.5">
                              <MapPin
                                aria-hidden="true"
                                className="mt-0.5 size-4 shrink-0 text-terracotta"
                              />
                              <span>
                                {table?.venueName ?? "Cafe details unavailable"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <Calendar
                                aria-hidden="true"
                                className="size-4 shrink-0 text-terracotta"
                              />
                              {table && isValid(parseISO(table.scheduledAt)) ? (
                                <time dateTime={table.scheduledAt}>
                                  {format(
                                    parseISO(table.scheduledAt),
                                    "EEEE, MMM d · h:mm a",
                                  )}
                                </time>
                              ) : (
                                <span>Schedule unavailable</span>
                              )}
                            </div>
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
