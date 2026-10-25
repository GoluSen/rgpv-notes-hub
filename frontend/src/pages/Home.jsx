import { useEffect, useState } from "react";
import api from "../api/client";
import DocumentCard from "../components/DocumentCard";
import { BRANCHES, SEMESTERS, TYPES } from "../constants";

const emptyFilters = { branch: "", semester: "", type: "", q: "" };

export default function Home() {
  const [filters, setFilters] = useState(emptyFilters);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ documents: [], totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Wait 400ms after typing stops before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = search.trim();
      setFilters((f) => (f.q === q ? f : { ...f, q }));
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch documents whenever filters or page change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const params = { page, limit: 12 };
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });

    api
      .get("/documents", { params })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Could not load documents",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  const updateFilter = (name, value) => {
    setFilters((f) => ({ ...f, [name]: value }));
    setPage(1);
  };

  const clearAll = () => {
    setSearch("");
    setFilters(emptyFilters);
    setPage(1);
  };

  const handleDownloaded = (id, downloads) => {
    setData((d) => ({
      ...d,
      documents: d.documents.map((doc) =>
        doc._id === id ? { ...doc, downloads } : doc,
      ),
    }));
  };

  const hasFilters =
    search || filters.branch || filters.semester || filters.type;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Browse notes and papers</h1>
      <p className="text-slate-600 mt-1">
        Find previous year papers and notes by branch, semester and subject.
      </p>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder="Search title or subject"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="col-span-2 border border-slate-300 rounded-md px-3 py-2 bg-white"
        />

        <select
          value={filters.branch}
          onChange={(e) => updateFilter("branch", e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 bg-white"
        >
          <option value="">All branches</option>
          {BRANCHES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          value={filters.semester}
          onChange={(e) => updateFilter("semester", e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 bg-white"
        >
          <option value="">All semesters</option>
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) => updateFilter("type", e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 bg-white"
        >
          <option value="">Papers and notes</option>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="mt-3 text-sm text-indigo-600 hover:underline"
        >
          Clear all filters
        </button>
      )}

      {/* Results */}
      <div className="mt-6">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
        )}

        {loading && !error && <p className="text-slate-500">Loading...</p>}

        {!loading && !error && data.documents.length === 0 && (
          <p className="text-slate-500">
            No documents found. Try different filters.
          </p>
        )}

        {!error && data.documents.length > 0 && (
          <>
            <p className="text-sm text-slate-500 mb-3">
              {data.total} result{data.total === 1 ? "" : "s"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.documents.map((doc) => (
                <DocumentCard
                  key={doc._id}
                  doc={doc}
                  onDownloaded={handleDownloaded}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-md border border-slate-300 bg-white disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-slate-600">
            Page {page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, data.totalPages))}
            disabled={page === data.totalPages}
            className="px-3 py-1.5 rounded-md border border-slate-300 bg-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
