"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Coffee, IndianRupee, MapPin, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import type { MicroTable } from "@/types";

type HostTableModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateTable: (newTable: MicroTable) => void;
};

const categories = [
  "Engineering",
  "Product & Design",
  "Career Switch",
  "System Design",
] as const;

const inputClassName =
  "w-full rounded-xl border border-espresso/10 bg-sand-surface px-3.5 py-3 text-sm text-espresso outline-none transition placeholder:text-muted-cocoa/70 focus:border-terracotta focus:ring-2 focus:ring-terracotta/15";
const labelClassName = "mb-1.5 block text-sm font-semibold";

export function HostTableModal({
  isOpen,
  onClose,
  onCreateTable,
}: HostTableModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <HostTableDialog
          key="host-table-dialog"
          onClose={onClose}
          onCreateTable={onCreateTable}
        />
      )}
    </AnimatePresence>
  );
}

function HostTableDialog({
  onClose,
  onCreateTable,
}: Omit<HostTableModalProps, "isOpen">) {
  const [error, setError] = useState("");

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const hostName = String(formData.get("hostName") ?? "").trim();
    const hostRole = String(formData.get("hostRole") ?? "").trim();
    const hostCompany = String(formData.get("hostCompany") ?? "").trim();
    const topicTitle = String(formData.get("topicTitle") ?? "").trim();
    const category = String(formData.get("category") ?? "");
    const venueName = String(formData.get("venueName") ?? "").trim();
    const scheduledAt = String(formData.get("scheduledAt") ?? "");
    const seatPriceINR = Number(formData.get("seatPriceINR"));
    const topicsCovered = String(formData.get("topicsCovered") ?? "")
      .split(",")
      .map((topic) => topic.trim())
      .filter(Boolean);

    if (
      !hostName ||
      !hostRole ||
      !hostCompany ||
      !topicTitle ||
      !categories.some((option) => option === category) ||
      !venueName ||
      !scheduledAt ||
      !Number.isFinite(seatPriceINR) ||
      seatPriceINR < 0 ||
      topicsCovered.length === 0
    ) {
      setError("Please complete every field with valid information.");
      return;
    }

    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      setError("Please choose a valid date and time.");
      return;
    }

    const id = crypto.randomUUID();
    const newTable: MicroTable = {
      id,
      hostId: `host-${id}`,
      hostName,
      hostRole,
      hostCompany,
      topicTitle,
      category,
      maxSeats: 4,
      reservedSeats: 0,
      seatPriceINR,
      scheduledAt: scheduledDate.toISOString(),
      venueName,
      coordinates: { lat: 17.4326, lng: 78.4071 },
      topicsCovered,
    };

    onCreateTable(newTable);
    onClose();
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
        aria-labelledby="host-table-modal-title"
        aria-modal="true"
        className="relative my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-espresso/10 bg-warm-cream text-espresso shadow-2xl"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        role="dialog"
      >
        <button
          type="button"
          aria-label="Close host table form"
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-muted-cocoa transition hover:bg-sand-surface hover:text-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
          onClick={onClose}
        >
          <X aria-hidden="true" className="size-5" />
        </button>

        <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8">
          <div className="pr-10">
            <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-terracotta">
              <Coffee aria-hidden="true" className="size-4" />
              HOST A MICRO-TABLE
            </p>
            <h2
              id="host-table-modal-title"
              className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Bring people together
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-cocoa">
              Set up a small, thoughtful conversation over coffee.
            </p>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <section aria-labelledby="table-details-heading">
              <h3
                id="table-details-heading"
                className="mb-3 text-base font-bold"
              >
                Conversation
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClassName} htmlFor="host-table-title">
                    Topic Title
                  </label>
                  <input
                    className={inputClassName}
                    id="host-table-title"
                    maxLength={120}
                    name="topicTitle"
                    placeholder="e.g., Growing as a product designer"
                    required
                  />
                </div>
                <div>
                  <label
                    className={labelClassName}
                    htmlFor="host-table-category"
                  >
                    Category
                  </label>
                  <select
                    className={inputClassName}
                    defaultValue=""
                    id="host-table-category"
                    name="category"
                    required
                  >
                    <option disabled value="">
                      Choose a category
                    </option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label
                    className={labelClassName}
                    htmlFor="host-table-topics"
                  >
                    Topics Covered
                  </label>
                  <input
                    className={inputClassName}
                    id="host-table-topics"
                    name="topicsCovered"
                    placeholder="e.g., Portfolio reviews, interview prep, career growth"
                    required
                  />
                  <p className="mt-1.5 text-xs text-muted-cocoa">
                    Separate topics with commas.
                  </p>
                </div>
              </div>
            </section>

            <section aria-labelledby="host-details-heading">
              <h3
                id="host-details-heading"
                className="mb-3 text-base font-bold"
              >
                About you
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClassName} htmlFor="host-table-name">
                    Host Name
                  </label>
                  <input
                    autoComplete="name"
                    className={inputClassName}
                    id="host-table-name"
                    maxLength={100}
                    name="hostName"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="host-table-role">
                    Role
                  </label>
                  <input
                    className={inputClassName}
                    id="host-table-role"
                    maxLength={100}
                    name="hostRole"
                    placeholder="e.g., Product Designer"
                    required
                  />
                </div>
                <div>
                  <label
                    className={labelClassName}
                    htmlFor="host-table-company"
                  >
                    Company
                  </label>
                  <input
                    autoComplete="organization"
                    className={inputClassName}
                    id="host-table-company"
                    maxLength={100}
                    name="hostCompany"
                    placeholder="Company name"
                    required
                  />
                </div>
              </div>
            </section>

            <section aria-labelledby="table-logistics-heading">
              <h3
                id="table-logistics-heading"
                className="mb-3 text-base font-bold"
              >
                Where and when
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    className={`${labelClassName} flex items-center gap-1.5`}
                    htmlFor="host-table-venue"
                  >
                    <MapPin
                      aria-hidden="true"
                      className="size-4 text-terracotta"
                    />
                    Cafe Venue Name
                  </label>
                  <input
                    className={inputClassName}
                    id="host-table-venue"
                    maxLength={160}
                    name="venueName"
                    placeholder="e.g., Roastery Coffee House, Jubilee Hills"
                    required
                  />
                </div>
                <div>
                  <label
                    className={`${labelClassName} flex items-center gap-1.5`}
                    htmlFor="host-table-scheduled-at"
                  >
                    <Calendar
                      aria-hidden="true"
                      className="size-4 text-terracotta"
                    />
                    Date &amp; Time
                  </label>
                  <input
                    className={inputClassName}
                    id="host-table-scheduled-at"
                    name="scheduledAt"
                    required
                    type="datetime-local"
                  />
                </div>
                <div>
                  <label
                    className={`${labelClassName} flex items-center gap-1.5`}
                    htmlFor="host-table-seat-price"
                  >
                    <IndianRupee
                      aria-hidden="true"
                      className="size-4 text-terracotta"
                    />
                    Seat Price (INR)
                  </label>
                  <input
                    className={inputClassName}
                    defaultValue={299}
                    id="host-table-seat-price"
                    min="0"
                    name="seatPriceINR"
                    required
                    step="1"
                    type="number"
                  />
                </div>
              </div>
            </section>

            {error && (
              <p className="text-sm font-medium text-terracotta" role="alert">
                {error}
              </p>
            )}

            <Button className="w-full py-3" type="submit">
              Create Micro-Table
            </Button>
          </form>
        </div>
      </motion.section>
    </motion.div>
  );
}
