import React, { useMemo, useState } from "react";
import { Search, Upload, Plus, Eye, FileText } from "lucide-react";
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
};

const DocumentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState(0);
  const navigate = useNavigate();

  const documents: DocumentItem[] = [
    { id: 1, title: "Master Service Agreement", company: "OpenWave Technologies", category: "Legal", startDate: "2026-01-10", endDate: "2027-01-10", status: "Active" },
    { id: 2, title: "Employment Document", company: "Deepiri Inc.", category: "HR", startDate: "2026-02-14", endDate: "2028-02-14", status: "Active" },
    { id: 3, title: "Vendor Supply Agreement", company: "NorthStar Supplies", category: "Procurement", startDate: "2026-03-01", endDate: "2026-12-31", status: "Pending" },
    { id: 4, title: "Partnership Agreement", company: "Vertex Labs", category: "Business", startDate: "2024-05-12", endDate: "2025-05-12", status: "Expired" },
  ];

  const sections = [
    { label: "All Documents", filter: null },
    { label: "Active Documents", filter: "Active" as DocumentStatus },
    { label: "Pending Review", filter: "Pending" as DocumentStatus },
    { label: "Expired Documents", filter: "Expired" as DocumentStatus },
    { label: "Uploads", filter: null },
  ];

  const styles = {
    wrapper: {
      backgroundColor: "transparent",
      minHeight: "100vh",
      padding: "40px 20px",
      fontFamily: "Inter, sans-serif",
    },
    container: {
      maxWidth: "1100px",
      margin: "0 auto",
    },
    header: {
      marginBottom: "40px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: "16px",
      flexWrap: "wrap" as const,
    },
    sidebar: {
      backgroundColor: "#f3f3f3",
      borderRadius: "16px",
      padding: "12px",
      border: "1px solid rgba(0,0,0,0.06)",
      height: "fit-content" as const,
    },
    mainCard: {
      backgroundColor: "#f3f3f3",
      borderRadius: "24px",
      border: "1px solid rgba(0,0,0,0.06)",
      overflow: "hidden" as const,
    },
    navButton: (isActive: boolean) => ({
      width: "100%",
      padding: "12px 16px",
      borderRadius: "10px",
      border: "none",
      textAlign: "left" as const,
      cursor: "pointer",
      fontSize: "14px",
      transition: "0.2s",
      backgroundColor: isActive ? "rgba(124, 58, 237, 0.12)" : "transparent",
      color: isActive ? "#7c3aed" : "#9ca3af",
      fontWeight: isActive ? 600 : 400,
    }),
    purpleBtn: {
      backgroundColor: "#7c3aed",
      color: "white",
      padding: "10px 24px",
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
      padding: "10px 20px",
      borderRadius: "12px",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
    },
    statCard: {
      backgroundColor: "#ffffff",
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: "16px",
      padding: "18px",
    },
    searchInput: {
      width: "100%",
      backgroundColor: "#ffffff",
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: "12px",
      padding: "12px 16px 12px 42px",
      color: "#111827",
      outline: "none",
      fontSize: "14px",
      boxSizing: "border-box" as const,
    },
    tableWrap: {
      backgroundColor: "#ffffff",
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: "16px",
      overflowX: "auto" as const,
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
      minWidth: "850px",
    },
    th: {
      textAlign: "left" as const,
      fontSize: "12px",
      color: "#6b7280",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
      padding: "16px 18px",
      borderBottom: "1px solid rgba(0,0,0,0.08)",
      backgroundColor: "#f9fafb",
    },
    td: {
      padding: "16px 18px",
      borderBottom: "1px solid rgba(0,0,0,0.06)",
      color: "#111827",
      fontSize: "14px",
    },
  };

  const getStatusStyle = (status: DocumentStatus): React.CSSProperties => {
    if (status === "Active") return { display: "inline-block", padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, backgroundColor: "#dcfce7", color: "#15803d" };
    if (status === "Pending") return { display: "inline-block", padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, backgroundColor: "#fef3c7", color: "#b45309" };
    return { display: "inline-block", padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, backgroundColor: "#fee2e2", color: "#b91c1c" };
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
  }, [searchTerm, activeSection]);

  const totalDocuments = documents.length;
  const activeDocuments = documents.filter((d) => d.status === "Active").length;
  const pendingDocuments = documents.filter((d) => d.status === "Pending").length;
  const expiredDocuments = documents.filter((d) => d.status === "Expired").length;

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: "#111827" }}>
              Documents
            </h1>
            <p style={{ color: "#9ca3af", marginTop: "8px", margin: "8px 0 0" }}>
              Manage your documents and related files
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button style={styles.ghostBtn}>
              <Upload size={16} /> Upload Document
            </button>
            <button style={styles.purpleBtn}>
              <Plus size={16} /> New Document
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "32px" }}>
          <aside style={styles.sidebar}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {sections.map((section, index) => (
                <button
                  key={section.label}
                  style={styles.navButton(index === activeSection)}
                  onClick={() => setActiveSection(index)}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>

          <main style={styles.mainCard}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0, color: "#111827" }}>
                Document Overview
              </h2>
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
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
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
                        <tr
                          key={doc.id}
                          onClick={() => navigate(`/language-intelligence/documents/${doc.id}`)}
                          style={{ cursor: "pointer" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f3ff")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                        >
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
                          <td style={styles.td}>
                            <span style={getStatusStyle(doc.status)}>{doc.status}</span>
                          </td>
                          <td style={styles.td}>
                            <button
                              style={styles.ghostBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/language-intelligence/documents/${doc.id}`);
                              }}
                            >
                              <Eye size={14} /> View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ ...styles.td, textAlign: "center", color: "#6b7280", padding: "28px" }}>
                          No documents found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;