"use client";

import { AnimatePresence, motion } from "framer-motion";
import { format, isValid, parseISO } from "date-fns";
import {
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MicroTable, SeatBooking } from "@/types";

type TableDetailModalProps = {
  table: MicroTable | null;
  bookings: SeatBooking[];
  onClose: () => void;
  onClaimSeat: (table: MicroTable) => void;
};

const VISIBLE_SEAT_COUNT = 4;

export function TableDetailModal({
  table,
  bookings,
  onClose,
  onClaimSeat,
}: TableDetailModalProps) {
  useEffect(() => {
    if (!table) return;

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
  }, [onClose, table]);

  return (
    <AnimatePresence>
      {table && (
        <motion.div
          key={table.id}
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
            aria-labelledby="table-detail-title"
            aria-modal="true"
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-espresso/10 bg-warm-cream text-espresso shadow-2xl"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            role="dialog"
          >
            <div className="relative min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
              <button
                type="button"
                aria-label="Close table details"
                className="absolute right-5 top-5 z-10 rounded-full p-2 text-muted-cocoa transition hover:bg-sand-surface hover:text-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta sm:right-7 sm:top-7"
                onClick={onClose}
              >
                <X aria-hidden="true" className="size-5" />
              </button>

              <header className="pr-10">
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-terracotta uppercase">
                  <Sparkles aria-hidden="true" className="size-4" />
                  A seat at the table
                </p>
                <Badge variant="neutral">{table.category}</Badge>
                <h2
                  id="table-detail-title"
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
                  <span className="inline-flex items-center gap-1 font-medium text-sage-green">
                    <ShieldCheck aria-hidden="true" className="size-4" />
                    Verified Mentor
                  </span>
                </div>
              </header>

              <section
                aria-labelledby="table-schedule-title"
                className="mt-6 rounded-2xl bg-sand-surface/75 p-4 sm:p-5"
              >
                <h3
                  id="table-schedule-title"
                  className="text-sm font-bold text-espresso"
                >
                  Cafe &amp; Schedule
                </h3>
                <div className="mt-4 grid gap-4 text-sm text-muted-cocoa sm:grid-cols-2">
                  <div className="flex items-start gap-2.5">
                    <MapPin
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-terracotta"
                    />
                    <div>
                      <p className="font-medium text-espresso">
                        {table.venueName}
                      </p>
                      <a
                        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-terracotta underline-offset-4 hover:underline focus-visible:underline"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${table.venueName} Hyderabad`)}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open in Google Maps
                        <ExternalLink aria-hidden="true" className="size-3.5" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Calendar
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-terracotta"
                    />
                    <div>
                      {(() => {
                        const scheduledAt = parseISO(table.scheduledAt);
                        return isValid(scheduledAt) ? (
                          <>
                            <time
                              className="block font-medium text-espresso"
                              dateTime={table.scheduledAt}
                            >
                              {format(scheduledAt, "EEEE, MMMM d")}
                            </time>
                            <span className="mt-1 inline-flex items-center gap-1 text-xs">
                              <Clock aria-hidden="true" className="size-3.5" />
                              {format(scheduledAt, "h:mm a")}
                            </span>
                          </>
                        ) : (
                          <span className="font-medium text-espresso">
                            Schedule unavailable
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-espresso/10 pt-3 text-sm">
                  <Users
                    aria-hidden="true"
                    className="size-4 shrink-0 text-terracotta"
                  />
                  <span className="font-semibold text-espresso">
                    {Math.max(
                      0,
                      table.maxSeats -
                        Math.min(Math.max(0, table.reservedSeats), table.maxSeats),
                    )}{" "}
                    of {table.maxSeats} seats remaining
                  </span>
                </div>
              </section>

              <section
                aria-labelledby="table-topics-title"
                className="mt-6"
              >
                <h3
                  id="table-topics-title"
                  className="text-base font-bold tracking-tight"
                >
                  What We Will Cover
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {table.topicsCovered.map((topic) => (
                    <li
                      className="rounded-full border border-espresso/10 bg-sand-surface px-3 py-1.5 text-xs font-medium text-muted-cocoa"
                      key={topic}
                    >
                      {topic}
                    </li>
                  ))}
                </ul>
              </section>

              <section
                aria-labelledby="table-roster-title"
                className="mt-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3
                    id="table-roster-title"
                    className="text-base font-bold tracking-tight"
                  >
                    Who Is Sitting at This Table
                  </h3>
                  <span className="shrink-0 text-xs font-medium text-muted-cocoa">
                    {VISIBLE_SEAT_COUNT} seats
                  </span>
                </div>
                {(() => {
                  const confirmedBookings = bookings.filter(
                    (booking) =>
                      booking.tableId === table.id &&
                      booking.status.toLowerCase() === "confirmed",
                  );
                  const reservedSeatCount = Math.min(
                    Math.max(0, table.reservedSeats),
                    VISIBLE_SEAT_COUNT,
                  );
                  const seats = Array.from(
                    { length: VISIBLE_SEAT_COUNT },
                    (_, index) => {
                      if (index >= reservedSeatCount) return null;
                      return (
                        confirmedBookings[index] ?? {
                          id: `reserved-seat-${table.id}-${index}`,
                          attendeeName: "Fellow attendee",
                          attendeeGoal: "Looking forward to sharing ideas.",
                        }
                      );
                    },
                  );

                  return (
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                      {seats.map((booking, index) => (
                        <li
                          className="min-h-24 rounded-2xl border border-espresso/10 bg-sand-surface/70 p-4"
                          key={booking?.id ?? `open-seat-${table.id}-${index}`}
                        >
                          {booking ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span
                                  aria-hidden="true"
                                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sage-green/15 text-xs font-bold text-sage-green"
                                >
                                  {booking.attendeeName
                                    .trim()
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                                <span className="text-sm font-semibold text-espresso">
                                  {booking.attendeeName}
                                </span>
                              </div>
                              <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-muted-cocoa">
                                <MessageSquare
                                  aria-hidden="true"
                                  className="mt-0.5 size-3.5 shrink-0"
                                />
                                <span>{booking.attendeeGoal}</span>
                              </p>
                            </>
                          ) : (
                            <div className="flex h-full min-h-16 items-center gap-2 text-sm font-medium text-muted-cocoa">
                              <Users
                                aria-hidden="true"
                                className="size-4 shrink-0 text-terracotta"
                              />
                              Open Seat — Available
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </section>
            </div>

            <footer className="flex shrink-0 flex-col gap-3 border-t border-espresso/10 bg-warm-cream px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <p className="text-xs font-medium text-muted-cocoa">Seat price</p>
                <p className="text-xl font-bold tracking-tight">
                  ₹{table.seatPriceINR.toLocaleString("en-IN")}
                </p>
              </div>
              <Button
                className="w-full py-3 sm:w-auto sm:min-w-48"
                disabled={table.reservedSeats >= table.maxSeats}
                onClick={() => onClaimSeat(table)}
              >
                Claim Your Seat
              </Button>
            </footer>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
