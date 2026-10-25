const express = require("express");
const {
  uploadDocument,
  getDocuments,
  getMyDocuments,
  getPendingDocuments,
  getDocumentById,
  updateDocumentStatus,
  trackDownload,
  deleteDocument,
} = require("../controllers/documentController");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", getDocuments);
router.post("/", protect, upload.single("file"), uploadDocument);

// Fixed paths must stay above "/:id" routes
router.get("/mine", protect, getMyDocuments);
router.get("/admin/pending", protect, adminOnly, getPendingDocuments);

router.get("/:id", getDocumentById);
router.patch("/:id/status", protect, adminOnly, updateDocumentStatus);
router.post("/:id/download", trackDownload);
router.delete("/:id", protect, deleteDocument);

module.exports = router;