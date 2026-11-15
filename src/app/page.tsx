"use client";

import { MapPin, Plus, X } from "lucide-react";
import { useState } from "react";
import { FilterBar } from "@/components/tables/FilterBar";
import { HostTableModal } from "@/components/tables/HostTableModal";
import { MicroTableCard } from "@/components/tables/MicroTableCard";
import { ReservationModal } from "@/components/tables/ReservationModal";
import { Button } from "@/components/ui/button";
import { MOCK_TABLES } from "@/data/mockTables";
import type { MicroTable } from "@/types";

function matchesCategory(table: MicroTable, category: string) {
  switch (category) {
    case "Engineering":
      return table.category.includes("Engineering");
    case "Product & Design":
      return table.category.startsWith("Product");
    case "Career Switch":
      return table.category.startsWith("Career");
    case "System Design":
      return table.category === "System Design";
    default:
      return true;
  }
}

export default function Home() {
  const [tables, setTables] = useState<MicroTable[]>(MOCK_TABLES);
  const [selectedTable, setSelectedTable] = useState<MicroTable | null>(null);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [reservationMessage, setReservationMessage] = useState<string | null>(
    null,
  );
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      normalizedSearchQuery.length === 0 ||
      [table.topicTitle, table.venueName, table.hostName].some((value) =>
        value.toLowerCase().includes(normalizedSearchQuery),
      );

    return matchesCategory(table, selectedCategory) && matchesSearch;
  });

  function handleConfirmReservation(
    tableId: string,
    attendeeName: string,
    attendeeGoal: string,
  ) {
    const table = tables.find((item) => item.id === tableId);
    if (!table) {
      throw new Error(
        `Cannot confirm reservation for unknown table: ${tableId}`,
      );
    }

    setTables((currentTables) =>
      currentTables.map((item) =>
        item.id === tableId
          ? {
              ...item,
              reservedSeats: Math.min(item.reservedSeats + 1, item.maxSeats),
            }
          : item,
      ),
    );
    setReservationMessage(
      `Thanks, ${attendeeName}. Your seat for ${table.topicTitle} with ${table.hostName} is confirmed. Your discussion goal: ${attendeeGoal}`,
    );
    setSelectedTable(null);
  }

  function handleCreateTable(newTable: MicroTable) {
    setTables((currentTables) => [newTable, ...currentTables]);
  }

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
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-espresso/10 bg-sand-surface px-4 py-2 text-sm font-semibold text-espresso">
              <MapPin aria-hidden="true" className="size-4 text-terracotta" />
              Hyderabad
            </div>
            <Button onClick={() => setIsHostModalOpen(true)}>
              <Plus aria-hidden="true" className="size-4" />
              Host a Table
            </Button>
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

          <FilterBar
            onSearchChange={setSearchQuery}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
          />

          {filteredTables.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {filteredTables.map((table) => (
                <MicroTableCard
                  key={table.id}
                  table={table}
                  onSelect={setSelectedTable}
                />
              ))}
            </div>
          ) : (
            <div
              className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-sand-surface px-4 py-8 text-center"
              role="status"
            >
              <p className="text-sm text-muted-cocoa">
                No tables found for those filters. Try a fresh search and find
                your next great conversation.
              </p>
              <button
                className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-warm-cream transition hover:bg-terracotta/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                type="button"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </div>
      <ReservationModal
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
        onConfirm={handleConfirmReservation}
      />
      <HostTableModal
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
        onCreateTable={handleCreateTable}
      />
    </main>
  );
}
