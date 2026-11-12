"use client";

import { MapPin, X } from "lucide-react";
import { useCallback, useState } from "react";
import { MicroTableCard } from "@/components/tables/MicroTableCard";
import { ReservationModal } from "@/components/reservation-modal";
import { MOCK_TABLES } from "@/data/mockTables";
import type { MicroTable } from "@/types";

export default function Home() {
  const [selectedTable, setSelectedTable] = useState<MicroTable | null>(null);
  const [reservationMessage, setReservationMessage] = useState<string | null>(
    null,
  );

  const closeReservation = useCallback(() => setSelectedTable(null), []);

  const handleReservationConfirm = useCallback((tableId: string) => {
    const table = MOCK_TABLES.find((item) => item.id === tableId);
    if (!table) {
      throw new Error(
        `Cannot confirm reservation for unknown table: ${tableId}`,
      );
    }

    setReservationMessage(
      `Your seat for ${table.topicTitle} with ${table.hostName} is confirmed.`,
    );
  }, []);

  return (
    <main className="min-h-screen bg-warm-cream px-4 py-8 text-espresso sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-6 border-b border-espresso/10 pb-8 sm:flex-row sm:items-end sm:justify-between sm:pb-10">
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-terracotta uppercase">
              Good conversations, close by
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              FourthPlace
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-cocoa sm:text-lg">
              Cozy, four-person career micro-mentorship around a cafe table in
              your neighborhood.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-espresso/10 bg-sand-surface px-4 py-2 text-sm font-semibold text-espresso">
            <MapPin aria-hidden="true" className="size-4 text-terracotta" />
            Hyderabad
          </div>
        </header>

        <section aria-labelledby="tables-heading" className="pt-8 sm:pt-10">
          <div className="mb-5 flex flex-col gap-1 sm:mb-6">
            <h2
              id="tables-heading"
              className="text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Find your next table
            </h2>
            <p className="text-sm text-muted-cocoa sm:text-base">
              Small groups, useful advice, and coffee-shop conversations.
            </p>
          </div>

          {reservationMessage && (
            <div
              className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-sage-green/20 bg-sage-green/10 px-4 py-3 text-sm text-espresso"
              role="status"
              aria-live="polite"
            >
              <p>{reservationMessage}</p>
              <button
                type="button"
                aria-label="Dismiss reservation confirmation"
                className="shrink-0 rounded-full p-1 text-muted-cocoa transition hover:bg-sage-green/10 hover:text-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-green"
                onClick={() => setReservationMessage(null)}
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {MOCK_TABLES.map((table) => (
              <MicroTableCard
                key={table.id}
                table={table}
                onSelect={setSelectedTable}
              />
            ))}
          </div>
        </section>
      </div>
      <ReservationModal
        table={selectedTable}
        onClose={closeReservation}
        onConfirm={handleReservationConfirm}
      />
    </main>
  );
}
