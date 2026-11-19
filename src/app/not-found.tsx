import Link from "next/link";
import { ArrowLeft, Coffee } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-warm-cream px-4 py-12 text-espresso">
      <section className="w-full max-w-lg rounded-3xl border border-espresso/10 bg-sand-surface p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
          <Coffee aria-hidden="true" className="size-8" />
        </div>
        <p className="mt-6 text-sm font-semibold tracking-[0.16em] text-terracotta uppercase">
          404 · Table not found
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          Looks like this table has already wrapped up.
        </h1>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-terracotta px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-terracotta/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to Hyderabad Tables
        </Link>
      </section>
    </main>
  );
}
