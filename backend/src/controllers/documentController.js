const Document = require("../models/Document");
const cloudinary = require("../config/cloudinary");

// Upload a buffer to Cloudinary as a raw file (PDF)
const streamUpload = (buffer, publicId) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "rgpv-notes-hub",
        resource_type: "raw",
        public_id: publicId,
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// POST /api/documents  (protected)
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const { title, description, branch, semester, subject, year, type } =
      req.body;

    if (!title || !branch || !semester || !subject || !type) {
      return res.status(400).json({
        message: "Title, branch, semester, subject and type are required",
      });
    }

    const safeName = title.replace(/[^a-zA-Z0-9]+/g, "-").slice(0, 40);
    const publicId = `${Date.now()}-${safeName}.pdf`;

    const result = await streamUpload(req.file.buffer, publicId);

    const document = await Document.create({
      title,
      description,
      branch,
      semester,
      subject,
      year: year || undefined,
      type,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      // Admin uploads are approved directly, student uploads wait for review
      status: req.user.role === "admin" ? "approved" : "pending",
    });

    res.status(201).json({
      message:
        document.status === "approved"
          ? "Document uploaded"
          : "Document uploaded and waiting for admin approval",
      document,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/documents  (public, only approved)
// Query: branch, semester, subject, year, type, q, page, limit
exports.getDocuments = async (req, res, next) => {
  try {
    const { branch, semester, subject, year, type, q } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);

    const filter = { status: "approved" };

    if (branch) filter.branch = branch.toUpperCase();
    if (semester) filter.semester = Number(semester);
    if (year) filter.year = Number(year);
    if (type) filter.type = type;
    if (subject) {
      filter.subject = new RegExp(escapeRegex(subject), "i");
    }
    if (q) {
      const regex = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ title: regex }, { subject: regex }];
    }

    const [documents, total] = await Promise.all([
      Document.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("uploadedBy", "name"),
      Document.countDocuments(filter),
    ]);

    res.json({
      documents,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/documents/mine  (protected, all statuses of my uploads)
exports.getMyDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ uploadedBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ documents });
  } catch (err) {
    next(err);
  }
};

// GET /api/documents/admin/pending  (admin only)
exports.getPendingDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ status: "pending" })
      .sort({ createdAt: 1 })
      .populate("uploadedBy", "name email");
    res.json({ documents });
  } catch (err) {
    next(err);
  }
};

// GET /api/documents/:id  (public if approved)
exports.getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id).populate(
      "uploadedBy",
      "name"
    );

    if (!document || document.status !== "approved") {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({ document });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/documents/:id/status  (admin only)
// Body: { "status": "approved" | "rejected" }
exports.updateDocumentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be approved or rejected" });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.status = status;
    await document.save();

    res.json({ message: `Document ${status}`, document });
  } catch (err) {
    next(err);
  }
};

// POST /api/documents/:id/download  (public, approved only)
exports.trackDownload = async (req, res, next) => {
  try {
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, status: "approved" },
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({ fileUrl: document.fileUrl, downloads: document.downloads });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/documents/:id  (admin or the uploader)
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const isOwner = document.uploadedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You can only delete your own documents" });
    }

    await cloudinary.uploader.destroy(document.publicId, {
      resource_type: "raw",
    });
    await document.deleteOne();

    res.json({ message: "Document deleted" });
  } catch (err) {
    next(err);
  }
};