import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-5 rounded-3xl bg-white px-6 py-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-3xl text-rose-600">
          {"\u26A0"}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Unauthorized Access</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            You do not have permission to view this page. Please sign in with the correct account or return to the main dashboard.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/login" className="rounded-full bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white">
            Go to Login
          </Link>
          <Link to="/" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
