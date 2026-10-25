import { useState } from "react";
import api from "../api/client";
import { BRANCHES, SEMESTERS, TYPES } from "../constants";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB, same as backend

const emptyForm = {
  title: "",
  description: "",
  branch: "",
  semester: "",
  subject: "",
  year: "",
  type: "",
};

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 12 }, (_, i) => currentYear - i);

export default function Upload() {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0); // used to reset the file input
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFile = (e) => {
    const selected = e.target.files[0];
    setError("");

    if (!selected) {
      setFile(null);
      return;
    }
    if (selected.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      setFile(null);
      e.target.value = "";
      return;
    }
    if (selected.size > MAX_SIZE) {
      setError("File is too large (max 10 MB)");
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please choose a PDF file");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    formData.append("file", file);

    setSubmitting(true);
    try {
      const res = await api.post("/documents", formData);
      setSuccess(res.data.message);
      setForm(emptyForm);
      setFile(null);
      setFileKey((k) => k + 1);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full border border-slate-300 rounded-md px-3 py-2 bg-white";

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Upload a paper or notes</h1>
      <p className="text-slate-600 mt-1 text-sm">
        Your upload will be visible to everyone after an admin approves it.
        Please upload only material you are allowed to share.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 p-3 rounded">
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <input
          name="title"
          placeholder="Title (e.g. Data Structures 2023 End Sem Paper)"
          value={form.title}
          onChange={handleChange}
          required
          maxLength={120}
          className={inputClass}
        />

        <textarea
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
          maxLength={500}
          rows={3}
          className={inputClass}
        />

        <div className="grid grid-cols-2 gap-3">
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="">Type</option>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <select
            name="branch"
            value={form.branch}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="">Branch</option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            name="semester"
            value={form.semester}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="">Semester</option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          <select
            name="year"
            value={form.year}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Year (optional)</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <input
          name="subject"
          placeholder="Subject (e.g. Data Structures)"
          value={form.subject}
          onChange={handleChange}
          required
          className={inputClass}
        />

        <div>
          <label className="block text-sm text-slate-600 mb-1">
            PDF file (max 10 MB)
          </label>
          <input
            key={fileKey}
            type="file"
            accept="application/pdf"
            onChange={handleFile}
            className="block w-full text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}
