import { useState } from "react";
import { Link } from "react-router-dom";

export default function LegalPage() {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="min-h-screen bg-sky-100 px-4 py-8 text-slate-900 sm:py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-[2rem] bg-white px-6 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.22)] sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Legal</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Privacy Policy and Terms & Conditions</h1>
          </div>
          <Link to="/" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
            Back Home
          </Link>
        </div>

        <section className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <h2 className="text-lg font-bold text-slate-900">Privacy Policy</h2>
          <p className="text-sm leading-6 text-slate-700">
            We collect only the information needed to provide pet profiles, appointments, marketplace orders, and contact support.
            Data is used for service delivery, account management, and communication with the registered user.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <h2 className="text-lg font-bold text-slate-900">Terms & Conditions</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
            <li>Use the platform for lawful pet wellness and marketplace activities only.</li>
            <li>Keep your account details accurate and secure.</li>
            <li>Orders, bookings, and profile actions are subject to system availability and verification.</li>
            <li>Administrators may review submitted content for support, safety, and compliance.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-sky-100 bg-sky-50 p-5 text-sm leading-6 text-slate-700">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
            />
            <span className="text-sm leading-6 text-slate-700">
              I accept the Privacy Policy and Terms & Conditions.
            </span>
          </label>

          <div className="mt-4 flex items-center justify-end gap-3">
            <Link
              to="/"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel
            </Link>
            <Link
              to={accepted ? "/register" : "#"}
              onClick={(event) => {
                if (!accepted) event.preventDefault();
              }}
              aria-disabled={!accepted}
              className={[
                "rounded-full px-4 py-2 text-sm font-semibold text-white",
                accepted ? "bg-sky-700 hover:bg-sky-800" : "cursor-not-allowed bg-slate-400",
              ].join(" ")}
            >
              Accept
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
