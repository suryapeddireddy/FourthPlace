"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MOCK_TABLES } from "@/data/mockTables";
import type { MicroTable, SeatBooking } from "@/types";

interface TableState {
  tables: MicroTable[];
  myBookings: SeatBooking[];
  addTable: (newTable: MicroTable) => void;
  reserveSeat: (
    tableId: string,
    attendeeName: string,
    attendeeGoal: string,
  ) => void;
  resetDemoData: () => void;
}

export const useTableStore = create<TableState>()(
  persist(
    (set) => ({
      tables: MOCK_TABLES,
      myBookings: [],
      addTable: (newTable) =>
        set((state) => ({ tables: [newTable, ...state.tables] })),
      reserveSeat: (tableId, attendeeName, attendeeGoal) =>
        set((state) => {
          const table = state.tables.find((item) => item.id === tableId);
          if (!table) return state;

          const booking: SeatBooking = {
            id: crypto.randomUUID(),
            tableId,
            userId: attendeeName,
            attendeeName,
            attendeeGoal,
            status: "confirmed",
            bookedAt: new Date().toISOString(),
          };

          return {
            tables: state.tables.map((item) =>
              item.id === tableId
                ? {
                    ...item,
                    reservedSeats: Math.min(
                      item.reservedSeats + 1,
                      item.maxSeats,
                    ),
                  }
                : item,
            ),
            myBookings: [...state.myBookings, booking],
          };
        }),
      resetDemoData: () => set({ tables: MOCK_TABLES, myBookings: [] }),
    }),
    {
      name: "useTableStore",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
