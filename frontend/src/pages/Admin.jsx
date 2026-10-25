import { useEffect, useState } from "react";
import api from "../api/client";

export default function Admin() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    api
      .get("/documents/admin/pending")
      .then((res) => setDocuments(res.data.documents))
      .catch((err) =>
        setError(
          err.response?.data?.message || err.message || "Could not load list",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id, status) => {
    setBusyId(id);
    setError("");
    try {
      await api.patch(`/documents/${id}/status`, { status });
      setDocuments((docs) => docs.filter((d) => d._id !== id));
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Could not update",
      );
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Pending approvals</h1>
      <p className="text-sm text-slate-600 mt-1">
        Open the PDF and check it before approving. Reject spam, wrong subjects
        and copyrighted books.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </p>
      )}

      {loading && <p className="mt-6 text-slate-500">Loading...</p>}

      {!loading && documents.length === 0 && !error && (
        <p className="mt-6 text-slate-500">Nothing is waiting for approval.</p>
      )}

      <div className="mt-6 space-y-3">
        {documents.map((doc) => (
          <div
            key={doc._id}
            className="bg-white border border-slate-200 rounded-lg p-4"
          >
            <div className="text-xs text-slate-500 mb-1">
              {doc.type === "paper" ? "Paper" : "Notes"} · {doc.branch} · Sem{" "}
              {doc.semester}
            </div>
            <h3 className="font-semibold">{doc.title}</h3>
            <p className="text-sm text-slate-600">
              {doc.subject}
              {doc.year ? ` · ${doc.year}` : ""}
            </p>
            {doc.description && (
              <p className="text-sm text-slate-600 mt-1">{doc.description}</p>
            )}
            <p className="text-xs text-slate-500 mt-2">
              Uploaded by {doc.uploadedBy?.name} ({doc.uploadedBy?.email})
            </p>

            <div className="mt-3 flex items-center gap-3 text-sm">
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                View PDF
              </a>
              <button
                onClick={() => handleStatus(doc._id, "approved")}
                disabled={busyId === doc._id}
                className="px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatus(doc._id, "rejected")}
                disabled={busyId === doc._id}
                className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
