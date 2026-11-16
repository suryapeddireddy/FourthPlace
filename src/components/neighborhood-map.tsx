"use client";

import { useState } from "react";
import { Coffee, MapPin, Navigation, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MicroTable } from "@/types";

type NeighborhoodMapProps = {
  tables: MicroTable[];
  onSelectTable: (table: MicroTable) => void;
};

const mapBounds = {
  minLatitude: 17.39,
  maxLatitude: 17.48,
  minLongitude: 78.34,
  maxLongitude: 78.45,
};

const neighborhoods = [
  { name: "Jubilee Hills", left: "70%", top: "39%" },
  { name: "Madhapur", left: "19%", top: "18%" },
  { name: "Gachibowli", left: "18%", top: "52%" },
  { name: "Banjara Hills", left: "82%", top: "84%" },
];

function getPinPosition(table: MicroTable) {
  const longitudeRange = mapBounds.maxLongitude - mapBounds.minLongitude;
  const latitudeRange = mapBounds.maxLatitude - mapBounds.minLatitude;
  const longitude = Math.min(
    Math.max(table.coordinates.lng, mapBounds.minLongitude),
    mapBounds.maxLongitude,
  );
  const latitude = Math.min(
    Math.max(table.coordinates.lat, mapBounds.minLatitude),
    mapBounds.maxLatitude,
  );

  return {
    left: `${24 + ((longitude - mapBounds.minLongitude) / longitudeRange) * 52}%`,
    top: `${16 + ((mapBounds.maxLatitude - latitude) / latitudeRange) * 68}%`,
  };
}

function getSeatsLeft(table: MicroTable) {
  const capacity = Math.max(0, table.maxSeats);
  const reserved = Math.min(Math.max(0, table.reservedSeats), capacity);
  return capacity - reserved;
}

export function NeighborhoodMap({
  tables,
  onSelectTable,
}: NeighborhoodMapProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const selectedTable =
    tables.find((table) => table.id === selectedTableId) ?? null;

  return (
    <section
      aria-label="Neighborhood map of available micro-tables in Hyderabad"
      className="overflow-hidden rounded-3xl border border-espresso/10 bg-sand-surface shadow-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-7 sm:py-5">
        <div>
          <div className="flex items-center gap-2 text-terracotta">
            <Coffee aria-hidden="true" className="size-4" />
            <p className="text-xs font-semibold tracking-[0.16em] uppercase">
              Around your neighborhood
            </p>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-espresso sm:text-2xl">
            Hyderabad
          </h2>
        </div>
        <Badge variant="neutral">
          <span className="size-1.5 rounded-full bg-sage-green" />
          {tables.length} {tables.length === 1 ? "table" : "tables"} nearby
        </Badge>
      </header>

      <div className="relative min-h-[500px] overflow-hidden border-y border-espresso/10 bg-warm-cream sm:aspect-[1.7] sm:min-h-0">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(rgba(44,34,30,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(44,34,30,0.045)_1px,transparent_1px)] bg-[size:34px_34px]"
        />
        <div
          aria-hidden="true"
          className="absolute -left-[12%] top-[15%] h-[52%] w-[55%] rounded-[42%] border border-amber-gold/20 bg-amber-gold/5"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-[20%] right-[4%] h-[64%] w-[48%] rounded-[48%] border border-sage-green/15 bg-sage-green/5"
        />

        <svg
          aria-hidden="true"
          className="absolute inset-0 size-full"
          preserveAspectRatio="none"
          viewBox="0 0 1000 600"
        >
          <path
            d="M-40 424 C130 354 165 466 335 374 S594 201 1040 257"
            fill="none"
            stroke="#e6a817"
            strokeOpacity=".24"
            strokeWidth="15"
          />
          <path
            d="M-30 426 C130 356 165 468 335 376 S594 203 1030 259"
            fill="none"
            stroke="#faf7f2"
            strokeWidth="8"
          />
          <path
            d="M190 -30 C274 116 375 177 432 271 S552 448 679 640"
            fill="none"
            stroke="#d96b43"
            strokeOpacity=".13"
            strokeWidth="9"
          />
          <path
            d="M810 -40 C737 113 741 183 837 279 S902 465 795 642"
            fill="none"
            stroke="#6e5d54"
            strokeOpacity=".12"
            strokeWidth="5"
          />
        </svg>

        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-terracotta/10 bg-terracotta/[0.03] sm:size-40"
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-terracotta/15 sm:size-24"
        />

        {neighborhoods.map((neighborhood) => (
          <span
            key={neighborhood.name}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-espresso/5 bg-warm-cream/75 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-muted-cocoa/80 shadow-sm sm:text-xs"
            style={{ left: neighborhood.left, top: neighborhood.top }}
          >
            {neighborhood.name}
          </span>
        ))}

        {tables.map((table, index) => {
          const position = getPinPosition(table);
          const seatsLeft = getSeatsLeft(table);
          const isSelected = selectedTableId === table.id;

          return (
            <Button
              key={table.id}
              aria-label={`${table.venueName}, ${seatsLeft} ${
                seatsLeft === 1 ? "seat" : "seats"
              } left`}
              aria-pressed={isSelected}
              className={`absolute z-10 h-auto w-[min(11rem,46vw)] -translate-x-1/2 -translate-y-1/2 justify-start gap-2 rounded-2xl border px-2.5 py-2 text-left shadow-md transition duration-200 hover:scale-[1.03] hover:shadow-lg sm:w-48 ${
                isSelected
                  ? "border-terracotta bg-warm-cream text-espresso ring-2 ring-terracotta/20"
                  : "border-espresso/10 bg-warm-cream/95 text-espresso hover:bg-warm-cream"
              }`}
              onClick={() => setSelectedTableId(table.id)}
              style={{
                left: position.left,
                top: `calc(${position.top} ${index % 2 === 0 ? "-" : "+"} 18px)`,
              }}
              title={table.venueName}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                  isSelected
                    ? "bg-terracotta text-warm-cream"
                    : "bg-terracotta/10 text-terracotta"
                }`}
              >
                <Coffee aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-bold leading-tight sm:text-xs">
                  {table.venueName}
                </span>
                <span className="mt-1 flex items-center gap-1 text-[10px] font-medium text-muted-cocoa">
                  <Users aria-hidden="true" className="size-3 shrink-0" />
                  {seatsLeft} {seatsLeft === 1 ? "seat" : "seats"} left
                </span>
              </span>
            </Button>
          );
        })}

        <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-espresso/10 bg-warm-cream/90 px-3 py-1.5 text-xs font-medium text-muted-cocoa shadow-sm">
          <MapPin aria-hidden="true" className="size-3.5 text-terracotta" />
          Hyderabad, India
        </span>
        <span
          aria-hidden="true"
          className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full border border-espresso/10 bg-warm-cream/90 text-terracotta shadow-sm"
        >
          <Navigation className="size-4" />
        </span>

        {selectedTable && (
          <article
            aria-label={`Details for ${selectedTable.topicTitle}`}
            className="absolute inset-x-3 bottom-3 z-20 rounded-2xl border border-espresso/10 bg-warm-cream/95 p-4 shadow-xl backdrop-blur-sm sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-80"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Badge variant="neutral">{selectedTable.category}</Badge>
                <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-espresso">
                  {selectedTable.topicTitle}
                </h3>
                <p className="mt-1 text-xs text-muted-cocoa">
                  Hosted by{" "}
                  <span className="font-semibold text-espresso">
                    {selectedTable.hostName}
                  </span>
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold text-espresso">
                ₹{selectedTable.seatPriceINR.toLocaleString("en-IN")}
              </p>
            </div>
            <Button
              className="mt-3 w-full"
              disabled={getSeatsLeft(selectedTable) === 0}
              onClick={() => onSelectTable(selectedTable)}
            >
              {getSeatsLeft(selectedTable) === 0
                ? "Fully booked"
                : "Claim Seat"}
            </Button>
          </article>
        )}
      </div>
    </section>
  );
}
