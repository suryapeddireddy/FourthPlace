"use client";

import { MapPin, Plus, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { MyBookingsDrawer } from "@/components/my-bookings-drawer";
import { FilterBar } from "@/components/tables/FilterBar";
import { HostTableModal } from "@/components/tables/HostTableModal";
import { MicroTableCard } from "@/components/tables/MicroTableCard";
import { ReservationModal } from "@/components/tables/ReservationModal";
import { TableDetailModal } from "@/components/tables/TableDetailModal";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useTableStore } from "@/store/useTableStore";
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
  const { tables, addTable, reserveSeat, fetchTables, myBookings } =
    useTableStore();
  const [mounted, setMounted] = useState(false);
  const [selectedTable, setSelectedTable] = useState<MicroTable | null>(null);
  const [inspectingTable, setInspectingTable] = useState<MicroTable | null>(
    null,
  );
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isBookingsDrawerOpen, setIsBookingsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
      void fetchTables();
    });

    const channel =
      isSupabaseConfigured && supabase
        ? supabase
            .channel("micro_tables_live")
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "micro_tables" },
              () => {
                void fetchTables();
              },
            )
            .subscribe()
        : null;

    return () => {
      window.cancelAnimationFrame(frame);
      if (channel && supabase) {
        void supabase.removeChannel(channel);
      }
    };
  }, [fetchTables]);

  const displayedBookingCount = mounted ? myBookings.length : 0;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      normalizedSearchQuery.length === 0 ||
      [table.topicTitle, table.venueName, table.hostName].some((value) =>
        value.toLowerCase().includes(normalizedSearchQuery),
      );

    return matchesCategory(table, selectedCategory) && matchesSearch;
  });

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
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-espresso/10 bg-sand-surface px-3 py-2 text-sm font-medium text-muted-cocoa">
              {isSupabaseConfigured ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-2 animate-pulse rounded-full bg-sage-green"
                  />
                  Live Sync
                </>
              ) : (
                "Local Demo"
              )}
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-espresso/10 bg-sand-surface px-4 py-2 text-sm font-semibold text-espresso">
              <MapPin aria-hidden="true" className="size-4 text-terracotta" />
              Hyderabad
            </div>
            <Button
              aria-label={`My bookings: ${displayedBookingCount} ${
                displayedBookingCount === 1 ? "seat" : "seats"
              }`}
              className="w-fit rounded-full border border-sage-green/20 bg-sage-green/10 px-3 py-2 text-sm text-sage-green hover:bg-sage-green/15 focus-visible:outline-sage-green"
              onClick={() => setIsBookingsDrawerOpen(true)}
            >
              <Ticket aria-hidden="true" className="size-4" />
              My Bookings
              <span className="rounded-full bg-sage-green/15 px-2 py-0.5">
                {displayedBookingCount}
              </span>
            </Button>
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

          <FilterBar
            onSearchChange={setSearchQuery}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
          />

          {mounted &&
            (filteredTables.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {filteredTables.map((table) => (
                  <MicroTableCard
                    key={table.id}
                    table={table}
                    onSelect={setSelectedTable}
                    onViewDetails={setInspectingTable}
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
            ))}
        </section>
      </div>
      <ReservationModal
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
        onConfirm={reserveSeat}
      />
      <TableDetailModal
        table={inspectingTable}
        bookings={myBookings}
        onClose={() => setInspectingTable(null)}
        onClaimSeat={(table) => {
          setInspectingTable(null);
          setSelectedTable(table);
        }}
      />
      <HostTableModal
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
        onCreateTable={addTable}
      />
      <MyBookingsDrawer
        isOpen={isBookingsDrawerOpen}
        onClose={() => setIsBookingsDrawerOpen(false)}
        bookings={myBookings}
        tables={tables}
      />
    </main>
  );
}
