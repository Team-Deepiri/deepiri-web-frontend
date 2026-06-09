import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Share2,
  Edit,
  Trash2,
  FileText,
  Plus,
  X,
  CheckCircle,
} from "lucide-react";

type DocumentStatus = "Active" | "Pending" | "Expired";

type DocumentItem = {
  id: number;
  title: string;
  company: string;
  category: string;
  startDate: string;
  endDate: string;
  status: DocumentStatus;
  uploadedBy: string;
  fileSize: string;
  fileName: string;
  tags: string[];
};

type ActivityItem = {
  id: number;
  initials: string;
  color: string;
  text: string;
  date: string;
};

type EditForm = {
  title: string;
  company: string;
  category: string;
  startDate: string;
  endDate: string;
  status: DocumentStatus;
};

type StringEditField = Exclude<keyof EditForm, "status">;

const mockDocuments: DocumentItem[] = [
  {
    id: 1,
    title: "Master Service Agreement",
    company: "OpenWave Technologies",
    category: "Legal",
    startDate: "2026-01-10",
    endDate: "2027-01-10",
    status: "Active",
    uploadedBy: "Yves K.",
    fileSize: "2.4 MB",
    fileName: "MSA_OpenWave_2026.pdf",
    tags: ["MSA", "Legal", "2026"],
  },
  {
    id: 2,
    title: "Employment Document",
    company: "Deepiri Inc.",
    category: "HR",
    startDate: "2026-02-14",
    endDate: "2028-02-14",
    status: "Active",
    uploadedBy: "Yves K.",
    fileSize: "1.1 MB",
    fileName: "Employment_Deepiri_2026.pdf",
    tags: ["HR", "Employment"],
  },
  {
    id: 3,
    title: "Vendor Supply Agreement",
    company: "NorthStar Supplies",
    category: "Procurement",
    startDate: "2026-03-01",
    endDate: "2026-12-31",
    status: "Pending",
    uploadedBy: "Yves K.",
    fileSize: "890 KB",
    fileName: "Vendor_NorthStar_2026.pdf",
    tags: ["Vendor", "Procurement"],
  },
  {
    id: 4,
    title: "Partnership Agreement",
    company: "Vertex Labs",
    category: "Business",
    startDate: "2024-05-12",
    endDate: "2025-05-12",
    status: "Expired",
    uploadedBy: "Yves K.",
    fileSize: "3.2 MB",
    fileName: "Partnership_Vertex_2024.pdf",
    tags: ["Partnership", "Business"],
  },
];

const mockActivity: ActivityItem[] = [
  {
    id: 1,
    initials: "YK",
    color: "#EEEDFE",
    text: "Yves uploaded this document",
    date: "Jan 10, 2026 · 9:04 AM",
  },
  {
    id: 2,
    initials: "JR",
    color: "#E1F5EE",
    text: "James reviewed and approved",
    date: "Jan 12, 2026 · 2:30 PM",
  },
  {
    id: 3,
    initials: "AO",
    color: "#FBEAF0",
    text: "Ada shared with OpenWave team",
    date: "Jan 15, 2026 · 11:00 AM",
  },
];

const STRING_FIELDS: { label: string; key: StringEditField; placeholder?: string; type?: string }[] = [
  { label: "Title", key: "title", placeholder: "Document title" },
  { label: "Company", key: "company", placeholder: "Company name" },
  { label: "Category", key: "category", placeholder: "Category" },
  { label: "Start Date", key: "startDate", type: "date" },
  { label: "End Date", key: "endDate", type: "date" },
];

const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const docFromRoute = mockDocuments.find((d) => d.id === Number(id));

  const [newTag, setNewTag] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [tags, setTags] = useState<string[]>(docFromRoute?.tags ?? []);
  const [liveDoc, setLiveDoc] = useState<DocumentItem | undefined>(docFromRoute);
  const [editForm, setEditForm] = useState<EditForm>({
    title: docFromRoute?.title ?? "",
    company: docFromRoute?.company ?? "",
    category: docFromRoute?.category ?? "",
    startDate: docFromRoute?.startDate ?? "",
    endDate: docFromRoute?.endDate ?? "",
    status: docFromRoute?.status ?? "Active",
  });

  if (!liveDoc) {
    return (
      <div
        style={{
          padding: "80px 20px",
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <FileText size={48} color="#d1d5db" style={{ marginBottom: "16px" }} />
        <h2 style={{ color: "#111827", marginBottom: "8px" }}>Document not found</h2>
        <p style={{ color: "#6b7280", marginBottom: "24px" }}>
          This document may have been deleted or doesn't exist.
        </p>
        <button
          onClick={() => navigate("/language-intelligence/documents")}
          style={styles.purpleBtn}
        >
          <ArrowLeft size={16} /> Back to Documents
        </button>
      </div>
    );
  }

  const getStatusStyle = (status: DocumentStatus): React.CSSProperties => {
    if (status === "Active")
      return {
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        backgroundColor: "#dcfce7",
        color: "#15803d",
      };
    if (status === "Pending")
      return {
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        backgroundColor: "#fef3c7",
        color: "#b45309",
      };
    return {
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 600,
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
    };
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag("");
      setAddingTag(false);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleSave = () => {
    setLiveDoc({ ...liveDoc, ...editForm });
    setShowEditModal(false);
  };

  const handleStringFieldChange = (key: StringEditField, value: string) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleStatusChange = (value: DocumentStatus) => {
    setEditForm((prev) => ({ ...prev, status: value }));
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>

        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
            fontSize: "13px",
            color: "#9ca3af",
          }}
        >
          <button
            onClick={() => navigate("/language-intelligence/documents")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#7c3aed",
              fontSize: "13px",
              padding: 0,
            }}
          >
            <ArrowLeft size={14} /> Documents
          </button>
          <span>/</span>
          <span style={{ color: "#111827" }}>{liveDoc.title}</span>
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                backgroundColor: "#EEEDFE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText size={26} color="#7c3aed" />
            </div>
            <div>
              <h1
                style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#111827" }}
              >
                {liveDoc.title}
              </h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "6px",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: "13px", color: "#6b7280" }}>{liveDoc.company}</span>
                <span style={{ color: "#d1d5db" }}>·</span>
                <span style={{ fontSize: "13px", color: "#6b7280" }}>{liveDoc.category}</span>
                <span style={{ color: "#d1d5db" }}>·</span>
                <span style={getStatusStyle(liveDoc.status)}>{liveDoc.status}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button style={styles.ghostBtn} onClick={() => setShowShareModal(true)}>
              <Share2 size={15} /> Share
            </button>
            <button style={styles.ghostBtn}>
              <Download size={15} /> Download
            </button>
            <button style={styles.purpleBtn} onClick={() => setShowEditModal(true)}>
              <Edit size={15} /> Edit
            </button>
            <button style={styles.redBtn} onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>

        {/* Main layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Preview */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>Document preview</span>
                <button
                  style={{ ...styles.ghostBtn, padding: "6px 12px", fontSize: "12px" }}
                >
                  Full view
                </button>
              </div>
              <div style={{ padding: "16px" }}>
                <div
                  style={{
                    backgroundColor: "#f9fafb",
                    borderRadius: "12px",
                    border: "1px solid rgba(0,0,0,0.06)",
                    minHeight: "280px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "80px",
                      backgroundColor: "#EEEDFE",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FileText size={32} color="#7c3aed" />
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      color: "#111827",
                      fontSize: "14px",
                    }}
                  >
                    {liveDoc.fileName}
                  </p>
                  <p style={{ margin: 0, color: "#9ca3af", fontSize: "12px" }}>
                    {liveDoc.fileSize}
                  </p>
                  <button
                    style={{
                      ...styles.purpleBtn,
                      marginTop: "8px",
                      fontSize: "13px",
                      padding: "8px 20px",
                    }}
                  >
                    <Download size={14} /> Download file
                  </button>
                </div>
              </div>
            </div>

            {/* Activity */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>Activity log</span>
              </div>
              <div style={{ padding: "8px 20px" }}>
                {mockActivity.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "14px 0",
                      borderBottom:
                        index < mockActivity.length - 1
                          ? "1px solid rgba(0,0,0,0.06)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: item.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#534AB7",
                        flexShrink: 0,
                      }}
                    >
                      {item.initials}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "13px", color: "#111827" }}>
                        {item.text}
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9ca3af" }}>
                        {item.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Details */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>Details</span>
              </div>
              <div style={{ padding: "8px 20px" }}>
                {(
                  [
                    { label: "Company", value: liveDoc.company },
                    { label: "Category", value: liveDoc.category },
                    { label: "Start date", value: liveDoc.startDate },
                    { label: "End date", value: liveDoc.endDate },
                    { label: "Uploaded by", value: liveDoc.uploadedBy },
                    { label: "File size", value: liveDoc.fileSize },
                    { label: "File name", value: liveDoc.fileName },
                  ] as const
                ).map(({ label, value }, index, arr) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "11px 0",
                      borderBottom:
                        index < arr.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontSize: "13px", color: "#6b7280", flexShrink: 0 }}>
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#111827",
                        fontWeight: 500,
                        textAlign: "right",
                        wordBreak: "break-all",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "11px 0",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>Status</span>
                  <span style={getStatusStyle(liveDoc.status)}>{liveDoc.status}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>Tags</span>
              </div>
              <div
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: "#EEEDFE",
                      color: "#534AB7",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 500,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#534AB7",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
                {addingTag ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <input
                      autoFocus
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddTag();
                        if (e.key === "Escape") setAddingTag(false);
                      }}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        border: "1px solid #a78bfa",
                        outline: "none",
                        fontSize: "12px",
                        width: "100px",
                        color: "#111827",
                      }}
                      placeholder="New tag..."
                    />
                    <button
                      onClick={handleAddTag}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#7c3aed",
                      }}
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => setAddingTag(false)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#9ca3af",
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingTag(true)}
                    style={{
                      backgroundColor: "#f9fafb",
                      color: "#6b7280",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      border: "1px solid rgba(0,0,0,0.08)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Plus size={11} /> Add tag
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div style={styles.overlay} onClick={() => setShowDeleteConfirm(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  backgroundColor: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Trash2 size={24} color="#b91c1c" />
              </div>
              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                Delete document?
              </h2>
              <p style={{ margin: "0 0 24px", color: "#6b7280", fontSize: "14px" }}>
                This will permanently delete <strong>{liveDoc.title}</strong>. This action
                cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  style={{ ...styles.ghostBtn, flex: 1, justifyContent: "center" }}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  style={{ ...styles.redBtn, flex: 1, justifyContent: "center" }}
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    navigate("/language-intelligence/documents");
                  }}
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={styles.overlay} onClick={() => setShowEditModal(false)}>
          <div
            style={{ ...styles.modal, maxWidth: "500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEditModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280",
              }}
            >
              <X size={20} />
            </button>
            <h2
              style={{ margin: "0 0 24px", fontSize: "20px", fontWeight: 700, color: "#111827" }}
            >
              Edit Document
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {STRING_FIELDS.map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label style={styles.label}>{label}</label>
                  <input
                    type={type ?? "text"}
                    style={styles.input}
                    placeholder={placeholder}
                    value={editForm[key]}
                    onChange={(e) => handleStringFieldChange(key, e.target.value)}
                  />
                </div>
              ))}
              <div>
                <label style={styles.label}>Status</label>
                <select
                  style={styles.input}
                  value={editForm.status}
                  onChange={(e) => handleStatusChange(e.target.value as DocumentStatus)}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <button
                style={{
                  ...styles.purpleBtn,
                  width: "100%",
                  justifyContent: "center",
                  marginTop: "8px",
                }}
                onClick={handleSave}
              >
                <CheckCircle size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div style={styles.overlay} onClick={() => setShowShareModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowShareModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280",
              }}
            >
              <X size={20} />
            </button>
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "20px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Share Document
            </h2>
            <p style={{ margin: "0 0 20px", color: "#6b7280", fontSize: "14px" }}>
              Copy the link below to share this document.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                readOnly
                value={window.location.href}
                style={{ ...styles.input, flex: 1, backgroundColor: "#f9fafb", color: "#6b7280" }}
              />
              <button style={styles.purpleBtn} onClick={handleShare}>
                {shareCopied ? <CheckCircle size={15} /> : "Copy"}
              </button>
            </div>
            {shareCopied && (
              <p style={{ margin: "10px 0 0", color: "#15803d", fontSize: "13px" }}>
                Link copied to clipboard!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    backgroundColor: "transparent",
    minHeight: "100vh",
    padding: "40px 20px",
    fontFamily: "Inter, sans-serif",
  },
  container: { maxWidth: "1100px", margin: "0 auto" },
  card: {
    backgroundColor: "#f3f3f3",
    borderRadius: "20px",
    border: "1px solid rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "18px 20px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: "15px", fontWeight: 600, color: "#111827" },
  purpleBtn: {
    backgroundColor: "#7c3aed",
    color: "white",
    padding: "10px 20px",
    borderRadius: "12px",
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
  },
  ghostBtn: {
    background: "#ffffff",
    color: "#111827",
    border: "1px solid rgba(0,0,0,0.08)",
    padding: "10px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
  },
  redBtn: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "10px 18px",
    borderRadius: "12px",
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "32px",
    width: "100%",
    maxWidth: "440px",
    position: "relative",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    color: "#111827",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "6px",
    display: "block",
  },
};

export default DocumentDetail;