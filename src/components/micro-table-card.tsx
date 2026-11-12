"use client";

import { format, parseISO } from "date-fns";
import { ArrowUpRight, Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MicroTable } from "@/types";

type MicroTableCardProps = {
  table: MicroTable;
  onSelect: (table: MicroTable) => void;
};

export function MicroTableCard({ table, onSelect }: MicroTableCardProps) {
  const seatCount = Math.max(0, table.maxSeats);
  const reservedSeats = Math.min(Math.max(0, table.reservedSeats), seatCount);
  const seatsLeft = seatCount - reservedSeats;

  return (
    <article className="group rounded-2xl border border-espresso/10 bg-sand-surface p-5 text-espresso shadow-sm transition duration-200 hover:-translate-y-1 hover:bg-warm-cream hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <Badge variant="neutral">{table.category}</Badge>
        <p className="shrink-0 text-lg font-bold text-espresso">
          ₹{table.seatPriceINR.toLocaleString("en-IN")}
        </p>
      </div>

      <h2 className="mt-4 text-xl font-bold leading-snug tracking-tight text-espresso">
        {table.topicTitle}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-cocoa">
        <span className="font-semibold text-espresso">{table.hostName}</span>
        <span aria-hidden="true">·</span>
        <span>
          {table.hostRole} at {table.hostCompany}
        </span>
        <Badge variant="verified">Verified</Badge>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-muted-cocoa">
        <div className="flex items-start gap-2.5">
          <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-terracotta" />
          <span>{table.venueName}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Calendar aria-hidden="true" className="size-4 shrink-0 text-terracotta" />
          <time dateTime={table.scheduledAt}>
            {format(parseISO(table.scheduledAt), "EEE, MMM d · h:mm a")}
          </time>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-warm-cream/70 px-3.5 py-3">
        <div
          aria-label={`${reservedSeats} of ${seatCount} seats reserved`}
          className="flex items-center gap-2"
        >
          <Users aria-hidden="true" className="size-4 shrink-0 text-muted-cocoa" />
          <div className="flex items-center gap-1" aria-hidden="true">
            {Array.from({ length: seatCount }, (_, index) => (
              <span
                key={index}
                className={`size-2.5 rounded-full ${
                  index < reservedSeats ? "bg-terracotta" : "bg-sand-surface ring-1 ring-muted-cocoa/30"
                }`}
              />
            ))}
          </div>
        </div>
        <span className="text-right text-xs font-medium text-muted-cocoa">
          {seatsLeft} of {seatCount} seats left
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {table.topicsCovered.map((topic) => (
          <span
            key={topic}
            className="rounded-full border border-espresso/10 bg-warm-cream/70 px-2.5 py-1 text-xs font-medium text-muted-cocoa"
          >
            {topic}
          </span>
        ))}
      </div>

      <Button
        className="mt-5 w-full"
        disabled={seatsLeft === 0}
        onClick={() => onSelect(table)}
      >
        {seatsLeft === 0 ? "Fully booked" : "Claim Seat"}
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </Button>
    </article>
  );
}
