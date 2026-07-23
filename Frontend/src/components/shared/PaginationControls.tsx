type PaginationControlsProps = {
  page: number;
  totalPages: number;
  totalElements: number;
  onPrevious: () => void;
  onNext: () => void;
  loading?: boolean;
  label?: string;
};

export default function PaginationControls({
  page,
  totalPages,
  totalElements,
  onPrevious,
  onNext,
  loading = false,
  label = "items",
}: PaginationControlsProps) {
  const hasPrevious = page > 0;
  const hasNext = page + 1 < totalPages;

  if (totalPages <= 1 && totalElements <= 0) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3 text-sm text-slate-700">
      <p>
        Page <span className="font-semibold text-slate-900">{page + 1}</span> of{" "}
        <span className="font-semibold text-slate-900">{Math.max(totalPages, 1)}</span> for {totalElements} {label}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasPrevious || loading}
          className="rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext || loading}
          className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-teal-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}
