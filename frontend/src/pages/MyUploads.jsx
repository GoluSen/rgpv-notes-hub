import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export default function MyUploads() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/documents/mine")
      .then((res) => setDocuments(res.data.documents))
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            err.message ||
            "Could not load uploads",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document permanently?")) return;

    try {
      await api.delete(`/documents/${id}`);
      setDocuments((docs) => docs.filter((d) => d._id !== id));
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Could not delete",
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My uploads</h1>
        <Link
          to="/upload"
          className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
        >
          Upload new
        </Link>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </p>
      )}

      {loading && <p className="mt-6 text-slate-500">Loading...</p>}

      {!loading && documents.length === 0 && !error && (
        <p className="mt-6 text-slate-500">
          You have not uploaded anything yet.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {documents.map((doc) => (
          <div
            key={doc._id}
            className="bg-white border border-slate-200 rounded-lg p-4 flex items-start justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    STATUS_STYLES[doc.status]
                  }`}
                >
                  {doc.status}
                </span>
                <span className="text-xs text-slate-500">
                  {doc.type === "paper" ? "Paper" : "Notes"} · {doc.branch} ·
                  Sem {doc.semester}
                </span>
              </div>
              <h3 className="font-semibold">{doc.title}</h3>
              <p className="text-sm text-slate-600">
                {doc.subject}
                {doc.year ? ` · ${doc.year}` : ""}
              </p>
              {doc.status === "approved" && (
                <p className="text-xs text-slate-500 mt-1">
                  {doc.downloads} downloads
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm shrink-0">
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                View
              </a>
              <button
                onClick={() => handleDelete(doc._id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
