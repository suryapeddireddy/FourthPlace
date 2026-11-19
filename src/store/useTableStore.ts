"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MOCK_TABLES } from "@/data/mockTables";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { MicroTable, SeatBooking } from "@/types";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  company?: string;
  isVerifiedMentor: boolean;
}

interface TableState {
  tables: MicroTable[];
  myBookings: SeatBooking[];
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  logout: () => void;
  fetchTables: () => Promise<void>;
  addTable: (newTable: MicroTable) => Promise<void>;
  reserveSeat: (
    tableId: string,
    attendeeName: string,
    attendeeGoal: string,
  ) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  deleteHostedTable: (tableId: string) => Promise<void>;
  resetDemoData: () => void;
}

type MicroTableRow = {
  id: string;
  host_id: string | null;
  host_name: string;
  host_role: string;
  host_company: string;
  topic_title: string;
  category: string;
  max_seats: number | null;
  reserved_seats: number | null;
  seat_price_inr: number;
  scheduled_at: string;
  venue_name: string;
  lat: number;
  lng: number;
  topics_covered: string[] | null;
};

function mapMicroTable(row: MicroTableRow): MicroTable {
  return {
    id: row.id,
    hostId: row.host_id ?? "",
    hostName: row.host_name,
    hostRole: row.host_role,
    hostCompany: row.host_company,
    topicTitle: row.topic_title,
    category: row.category,
    maxSeats: row.max_seats ?? 4,
    reservedSeats: row.reserved_seats ?? 0,
    seatPriceINR: row.seat_price_inr,
    scheduledAt: row.scheduled_at,
    venueName: row.venue_name,
    coordinates: { lat: row.lat, lng: row.lng },
    topicsCovered: row.topics_covered ?? [],
  };
}

export const useTableStore = create<TableState>()(
  persist(
    (set, get) => ({
      tables: MOCK_TABLES,
      myBookings: [],
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
      fetchTables: async () => {
        if (!isSupabaseConfigured || !supabase) return;

        try {
          const { data, error } = await supabase
            .from("micro_tables")
            .select("*")
            .order("scheduled_at", { ascending: true });

          if (error) {
            console.error("Failed to fetch micro tables from Supabase:", error);
            return;
          }

          if (data.length > 0) {
            set({ tables: data.map((row) => mapMicroTable(row)) });
          }
        } catch (error) {
          console.error("Failed to fetch micro tables from Supabase:", error);
        }
      },
      addTable: async (newTable) => {
        set((state) => ({ tables: [newTable, ...state.tables] }));

        if (!isSupabaseConfigured || !supabase) return;

        try {
          const { data, error } = await supabase
            .from("micro_tables")
            .insert({
              host_id: newTable.hostId,
              host_name: newTable.hostName,
              host_role: newTable.hostRole,
              host_company: newTable.hostCompany,
              topic_title: newTable.topicTitle,
              category: newTable.category,
              max_seats: newTable.maxSeats,
              reserved_seats: newTable.reservedSeats,
              seat_price_inr: newTable.seatPriceINR,
              scheduled_at: newTable.scheduledAt,
              venue_name: newTable.venueName,
              lat: newTable.coordinates.lat,
              lng: newTable.coordinates.lng,
              topics_covered: newTable.topicsCovered,
            })
            .select("id")
            .single();

          if (error) {
            console.error("Failed to save micro table to Supabase:", error);
            return;
          }

          set((state) => ({
            tables: state.tables.map((table) =>
              table.id === newTable.id ? { ...table, id: data.id } : table,
            ),
          }));
        } catch (error) {
          console.error("Failed to save micro table to Supabase:", error);
        }
      },
      reserveSeat: async (tableId, attendeeName, attendeeGoal) => {
        if (isSupabaseConfigured && supabase) {
          if (!get().tables.some((table) => table.id === tableId)) return;

          try {
            const { data, error } = await supabase.rpc(
              "book_micro_table_seat",
              {
                p_table_id: tableId,
                p_attendee_name: attendeeName,
                p_attendee_goal: attendeeGoal,
              },
            );

            if (error) {
              console.error("Failed to reserve micro table seat:", error);
              return;
            }

            const booking = data as {
              id: string;
              user_id: string | null;
              attendee_name: string;
              attendee_goal: string | null;
              status: string;
              booked_at: string;
            } | null;

            if (!booking) {
              console.error(
                "Supabase returned no booking after reserving a seat.",
              );
              return;
            }

            set((state) => ({
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
              myBookings: [
                ...state.myBookings,
                {
                  id: booking.id,
                  tableId,
                  userId: booking.user_id ?? attendeeName,
                  attendeeName: booking.attendee_name,
                  attendeeGoal: booking.attendee_goal ?? attendeeGoal,
                  status: booking.status,
                  bookedAt: booking.booked_at,
                },
              ],
            }));
          } catch (error) {
            console.error("Failed to reserve micro table seat:", error);
          }
          return;
        }

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
        });
      },
      cancelBooking: async (bookingId) => {
        const booking = get().myBookings.find((item) => item.id === bookingId);
        if (!booking) return;

        if (isSupabaseConfigured && supabase) {
          try {
            const { error } = await supabase
              .from("seat_bookings")
              .delete()
              .eq("id", bookingId);

            if (error) {
              console.error("Failed to cancel seat booking in Supabase:", error);
              return;
            }
          } catch (error) {
            console.error("Failed to cancel seat booking in Supabase:", error);
            return;
          }

          try {
            const { data, error } = await supabase
              .from("micro_tables")
              .select("reserved_seats")
              .eq("id", booking.tableId)
              .maybeSingle();

            if (error) {
              console.error(
                "Failed to fetch reserved seats from Supabase:",
                error,
              );
            } else if (data) {
              const { error: updateError } = await supabase
                .from("micro_tables")
                .update({
                  reserved_seats: Math.max(0, (data.reserved_seats ?? 0) - 1),
                })
                .eq("id", booking.tableId);

              if (updateError) {
                console.error(
                  "Failed to decrement reserved seats in Supabase:",
                  updateError,
                );
              }
            }
          } catch (error) {
            console.error(
              "Failed to decrement reserved seats in Supabase:",
              error,
            );
          }
        }

        set((state) => ({
          myBookings: state.myBookings.filter((item) => item.id !== bookingId),
          tables: state.tables.map((table) =>
            table.id === booking.tableId
              ? { ...table, reservedSeats: Math.max(0, table.reservedSeats - 1) }
              : table,
          ),
        }));
      },
      deleteHostedTable: async (tableId) => {
        if (isSupabaseConfigured && supabase) {
          try {
            const { error } = await supabase
              .from("micro_tables")
              .delete()
              .eq("id", tableId);

            if (error) {
              console.error("Failed to delete micro table from Supabase:", error);
              return;
            }
          } catch (error) {
            console.error("Failed to delete micro table from Supabase:", error);
            return;
          }
        }

        set((state) => ({
          tables: state.tables.filter((table) => table.id !== tableId),
          myBookings: state.myBookings.filter(
            (booking) => booking.tableId !== tableId,
          ),
        }));
      },
      resetDemoData: () => set({ tables: MOCK_TABLES, myBookings: [] }),
    }),
    {
      name: "useTableStore",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tables: state.tables,
        myBookings: state.myBookings,
        currentUser: state.currentUser,
      }),
    },
  ),
);
