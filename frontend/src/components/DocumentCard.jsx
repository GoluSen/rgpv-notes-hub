import api from "../api/client";

const formatSize = (bytes) => {
  if (!bytes) return "";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function DocumentCard({ doc, onDownloaded }) {
  // Link opens the PDF; this only records the download count
  const handleDownload = async () => {
    try {
      const res = await api.post(`/documents/${doc._id}/download`);
      onDownloaded(doc._id, res.data.downloads);
    } catch (err) {
      console.error("Could not record download", err);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col">
      <div className="flex items-center gap-2 text-xs mb-2">
        <span
          className={`px-2 py-0.5 rounded-full font-medium ${
            doc.type === "paper"
              ? "bg-amber-100 text-amber-800"
              : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {doc.type === "paper" ? "Paper" : "Notes"}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {doc.branch}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          Sem {doc.semester}
        </span>
      </div>

      <h3 className="font-semibold text-slate-900">{doc.title}</h3>
      <p className="text-sm text-slate-600 mt-1">
        {doc.subject}
        {doc.year ? ` · ${doc.year}` : ""}
      </p>

      <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
        <span>By {doc.uploadedBy?.name || "Unknown"}</span>
        <span>
          {formatSize(doc.fileSize)} · {doc.downloads} downloads
        </span>
      </div>

      <a
        href={doc.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleDownload}
        className="mt-4 text-center px-3 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
      >
        Open / Download PDF
      </a>
    </div>
  );
}
