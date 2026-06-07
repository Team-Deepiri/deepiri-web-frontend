import React, { useMemo, useState, useRef } from "react";
import { Search, Upload, Plus, Eye, FileText, X, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

type DocumentStatus = "Active" | "Pending" | "Expired";

type DocumentItem = {
  id: number;
  title: string;
  company: string;
  category: string;
  startDate: string;
  endDate: string;
  status: DocumentStatus;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
};

const DocumentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [newDocForm, setNewDocForm] = useState({
    title: "",
    company: "",
    category: "",
    startDate: "",
    endDate: "",
    status: "Active" as DocumentStatus,
  });

  const [documents, setDocuments] = useState<DocumentItem[]>([
    { id: 1, title: "Master Service Agreement", company: "OpenWave Technologies", category: "Legal", startDate: "2026-01-10", endDate: "2027-01-10", status: "Active" },
    { id: 2, title: "Employment Document", company: "Deepiri Inc.", category: "HR", startDate: "2026-02-14", endDate: "2028-02-14", status: "Active" },
    { id: 3, title: "Vendor Supply Agreement", company: "NorthStar Supplies", category: "Procurement", startDate: "2026-03-01", endDate: "2026-12-31", status: "Pending" },
    { id: 4, title: "Partnership Agreement", company: "Vertex Labs", category: "Business", startDate: "2024-05-12", endDate: "2025-05-12", status: "Expired" },
  ]);

  const sections = [
    { label: "All Documents", filter: null },
    { label: "Active Documents", filter: "Active" as DocumentStatus },
    { label: "Pending Review", filter: "Pending" as DocumentStatus },
    { label: "Expired Documents", filter: "Expired" as DocumentStatus },
    { label: "Uploads", filter: null },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handleUploadSubmit = () => {
    if (!uploadedFile) return;
    const newDoc: DocumentItem = {
      id: documents.length + 1,
      title: uploadedFile.name.replace(/\.[^/.]+$/, ""),
      company: "—",
      category: "Uploads",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "—",
      status: "Pending",
      fileName: uploadedFile.name,
      fileSize: formatFileSize(uploadedFile.size),
      fileType: uploadedFile.type,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setUploadedFile(null);
      setShowUploadModal(false);
    }, 1500);
  };

  const handleNewDocSubmit = () => {
    if (!newDocForm.title || !newDocForm.company) return;
    const newDoc: DocumentItem = {
      id: documents.length + 1,
      ...newDocForm,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setShowNewModal(false);
    setNewDocForm({ title: "", company: "", category: "", startDate: "", endDate: "", status: "Active" });
  };

  const filteredDocuments = useMemo(() => {
    const query = searchTerm.toLowerCase();
    const sectionFilter = sections[activeSection].filter;
    return documents.filter((doc) => {
      const matchesSection = !sectionFilter || doc.status === sectionFilter;
      const matchesSearch =
        doc.title.toLowerCase().includes(query) ||
        doc.company.toLowerCase().includes(query) ||
        doc.category.toLowerCase().includes(query) ||
        doc.status.toLowerCase().includes(query);
      return matchesSection && matchesSearch;
    });
  }, [searchTerm, activeSection, documents]);

  const totalDocuments = documents.length;
  const activeDocuments = documents.filter((d) => d.status === "Active").length;
  const pendingDocuments = documents.filter((d) => d.status === "Pending").length;
  const expiredDocuments = documents.filter((d) => d.status === "Expired").length;

  const styles = {
    wrapper: { backgroundColor: "transparent", minHeight: "100vh", padding: "40px 20px", fontFamily: "Inter, sans-serif" },
    container: { maxWidth: "1100px", margin: "0 auto" },
    header: { marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" as const },
    sidebar: { backgroundColor: "#f3f3f3", borderRadius: "16px", padding: "12px", border: "1px solid rgba(0,0,0,0.06)", height: "fit-content" as const },
    mainCard: { backgroundColor: "#f3f3f3", borderRadius: "24px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" as const },
    navButton: (isActive: boolean) => ({ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "none", textAlign: "left" as const, cursor: "pointer", fontSize: "14px", transition: "0.2s", backgroundColor: isActive ? "rgba(124, 58, 237, 0.12)" : "transparent", color: isActive ? "#7c3aed" : "#9ca3af", fontWeight: isActive ? 600 : 400 }),
    purpleBtn: { backgroundColor: "#7c3aed", color: "white", padding: "10px 24px", borderRadius: "12px", border: "none", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px" },
    ghostBtn: { background: "#ffffff", color: "#111827", border: "1px solid rgba(0,0,0,0.08)", padding: "10px 20px", borderRadius: "12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px" },
    statCard: { backgroundColor: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "16px", padding: "18px" },
    searchInput: { width: "100%", backgroundColor: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", padding: "12px 16px 12px 42px", color: "#111827", outline: "none", fontSize: "14px", boxSizing: "border-box" as const },
    tableWrap: { backgroundColor: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "16px", overflowX: "auto" as const },
    table: { width: "100%", borderCollapse: "collapse" as const, minWidth: "850px" },
    th: { textAlign: "left" as const, fontSize: "12px", color: "#6b7280", textTransform: "uppercase" as const, letterSpacing: "0.5px", padding: "16px 18px", borderBottom: "1px solid rgba(0,0,0,0.08)", backgroundColor: "#f9fafb" },
    td: { padding: "16px 18px", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "#111827", fontSize: "14px" },
    // Modal styles
    overlay: { position: "fixed" as const, inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
    modal: { backgroundColor: "#ffffff", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "480px", position: "relative" as const },
    input: { width: "100%", padding: "10px 14px", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" as const, color: "#111827" },
    label: { fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" },
  };

  const getStatusStyle = (status: DocumentStatus): React.CSSProperties => {
    if (status === "Active") return { display: "inline-block", padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, backgroundColor: "#dcfce7", color: "#15803d" };
    if (status === "Pending") return { display: "inline-block", padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, backgroundColor: "#fef3c7", color: "#b45309" };
    return { display: "inline-block", padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, backgroundColor: "#fee2e2", color: "#b91c1c" };
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: "#111827" }}>Documents</h1>
            <p style={{ color: "#9ca3af", margin: "8px 0 0" }}>Manage your documents and related files</p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button style={styles.ghostBtn} onClick={() => setShowUploadModal(true)}>
              <Upload size={16} /> Upload Document
            </button>
            <button style={styles.purpleBtn} onClick={() => setShowNewModal(true)}>
              <Plus size={16} /> New Document
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "32px" }}>
          <aside style={styles.sidebar}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {sections.map((section, index) => (
                <button key={section.label} style={styles.navButton(index === activeSection)} onClick={() => setActiveSection(index)}>
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>

          <main style={styles.mainCard}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0, color: "#111827" }}>Document Overview</h2>
            </div>
            <div style={{ padding: "32px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "16px", marginBottom: "24px" }}>
                {[
                  { label: "Total Documents", value: totalDocuments },
                  { label: "Active", value: activeDocuments },
                  { label: "Pending", value: pendingDocuments },
                  { label: "Expired", value: expiredDocuments },
                ].map(({ label, value }) => (
                  <div key={label} style={styles.statCard}>
                    <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>{label}</p>
                    <h3 style={{ margin: "10px 0 0", fontSize: "28px", color: "#111827" }}>{value}</h3>
                  </div>
                ))}
              </div>

              <div style={{ position: "relative", marginBottom: "24px", maxWidth: "420px" }}>
                <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                <input type="text" placeholder="Search documents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
              </div>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["Document Name", "Company", "Category", "Start Date", "End Date", "Status", "Action"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((doc) => (
                        <tr key={doc.id} onClick={() => navigate(`/language-intelligence/documents/${doc.id}`)} style={{ cursor: "pointer" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f3ff")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>
                          <td style={styles.td}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <FileText size={15} color="#a78bfa" />
                              {doc.title}
                            </div>
                          </td>
                          <td style={styles.td}>{doc.company}</td>
                          <td style={styles.td}>{doc.category}</td>
                          <td style={styles.td}>{doc.startDate}</td>
                          <td style={styles.td}>{doc.endDate}</td>
                          <td style={styles.td}><span style={getStatusStyle(doc.status)}>{doc.status}</span></td>
                          <td style={styles.td}>
                            <button style={styles.ghostBtn} onClick={(e) => { e.stopPropagation(); navigate(`/language-intelligence/documents/${doc.id}`); }}>
                              <Eye size={14} /> View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ ...styles.td, textAlign: "center", color: "#6b7280", padding: "28px" }}>No documents found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={styles.overlay} onClick={() => { setShowUploadModal(false); setUploadedFile(null); }}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setShowUploadModal(false); setUploadedFile(null); }} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
              <X size={20} />
            </button>
            <h2 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: 700, color: "#111827" }}>Upload Document</h2>
            <p style={{ margin: "0 0 24px", color: "#6b7280", fontSize: "14px" }}>Accepts all file formats — PDF, DOCX, XLSX, PNG, and more.</p>

            {uploadSuccess ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <CheckCircle size={48} color="#15803d" style={{ marginBottom: "12px" }} />
                <p style={{ color: "#15803d", fontWeight: 600, fontSize: "16px" }}>Uploaded successfully!</p>
              </div>
            ) : (
              <>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragOver ? "#7c3aed" : "rgba(0,0,0,0.15)"}`,
                    borderRadius: "14px",
                    padding: "40px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: dragOver ? "rgba(124,58,237,0.04)" : "#f9fafb",
                    transition: "0.2s",
                    marginBottom: "16px",
                  }}
                >
                  <Upload size={32} color="#a78bfa" style={{ marginBottom: "12px" }} />
                  <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#111827" }}>
                    {uploadedFile ? uploadedFile.name : "Drag & drop your file here"}
                  </p>
                  <p style={{ margin: 0, color: "#9ca3af", fontSize: "13px" }}>
                    {uploadedFile ? formatFileSize(uploadedFile.size) : "or click to browse — all formats accepted"}
                  </p>
                  <input ref={fileInputRef} type="file" accept="*/*" style={{ display: "none" }} onChange={handleFileSelect} />
                </div>

                {uploadedFile && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", background: "#f5f3ff", borderRadius: "10px", marginBottom: "16px" }}>
                    <FileText size={16} color="#7c3aed" />
                    <span style={{ fontSize: "13px", color: "#111827", flex: 1 }}>{uploadedFile.name}</span>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>{formatFileSize(uploadedFile.size)}</span>
                    <button onClick={() => setUploadedFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                      <X size={14} />
                    </button>
                  </div>
                )}

                <button style={{ ...styles.purpleBtn, width: "100%", justifyContent: "center", opacity: uploadedFile ? 1 : 0.5 }}
                  onClick={handleUploadSubmit} disabled={!uploadedFile}>
                  <Upload size={16} /> Upload Document
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* New Document Modal */}
      {showNewModal && (
        <div style={styles.overlay} onClick={() => setShowNewModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowNewModal(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
              <X size={20} />
            </button>
            <h2 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: 700, color: "#111827" }}>New Document</h2>
            <p style={{ margin: "0 0 24px", color: "#6b7280", fontSize: "14px" }}>Fill in the details to create a new document entry.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={styles.label}>Document Title *</label>
                <input style={styles.input} placeholder="e.g. Service Level Agreement" value={newDocForm.title} onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })} />
              </div>
              <div>
                <label style={styles.label}>Company *</label>
                <input style={styles.input} placeholder="e.g. Acme Corp" value={newDocForm.company} onChange={(e) => setNewDocForm({ ...newDocForm, company: e.target.value })} />
              </div>
              <div>
                <label style={styles.label}>Category</label>
                <select style={styles.input} value={newDocForm.category} onChange={(e) => setNewDocForm({ ...newDocForm, category: e.target.value })}>
                  <option value="">Select category</option>
                  <option>Legal</option>
                  <option>HR</option>
                  <option>Procurement</option>
                  <option>Business</option>
                  <option>Finance</option>
                  <option>Other</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={styles.label}>Start Date</label>
                  <input type="date" style={styles.input} value={newDocForm.startDate} onChange={(e) => setNewDocForm({ ...newDocForm, startDate: e.target.value })} />
                </div>
                <div>
                  <label style={styles.label}>End Date</label>
                  <input type="date" style={styles.input} value={newDocForm.endDate} onChange={(e) => setNewDocForm({ ...newDocForm, endDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={styles.label}>Status</label>
                <select style={styles.input} value={newDocForm.status} onChange={(e) => setNewDocForm({ ...newDocForm, status: e.target.value as DocumentStatus })}>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <button style={{ ...styles.purpleBtn, width: "100%", justifyContent: "center", marginTop: "8px", opacity: newDocForm.title && newDocForm.company ? 1 : 0.5 }}
                onClick={handleNewDocSubmit} disabled={!newDocForm.title || !newDocForm.company}>
                <Plus size={16} /> Create Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;