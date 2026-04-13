import React, { useMemo, useState } from "react";
import { Search, Upload, Plus, Eye } from "lucide-react";

type ContractStatus = "Active" | "Pending" | "Expired";

type ContractItem = {
  id: number;
  title: string;
  company: string;
  category: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
};

const Contract: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const contracts: ContractItem[] = [
    {
      id: 1,
      title: "Master Service Agreement",
      company: "OpenWave Technologies",
      category: "Legal",
      startDate: "2026-01-10",
      endDate: "2027-01-10",
      status: "Active",
    },
    {
      id: 2,
      title: "Employment Contract",
      company: "Deepiri Inc.",
      category: "HR",
      startDate: "2026-02-14",
      endDate: "2028-02-14",
      status: "Active",
    },
    {
      id: 3,
      title: "Vendor Supply Agreement",
      company: "NorthStar Supplies",
      category: "Procurement",
      startDate: "2026-03-01",
      endDate: "2026-12-31",
      status: "Pending",
    },
    {
      id: 4,
      title: "Partnership Agreement",
      company: "Vertex Labs",
      category: "Business",
      startDate: "2024-05-12",
      endDate: "2025-05-12",
      status: "Expired",
    },
  ];

  const filteredContracts = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return contracts.filter((contract) => {
      return (
        contract.title.toLowerCase().includes(query) ||
        contract.company.toLowerCase().includes(query) ||
        contract.category.toLowerCase().includes(query) ||
        contract.status.toLowerCase().includes(query)
      );
    });
  }, [searchTerm]);

  const styles = {
    wrapper: {
      backgroundColor: "transparent",
      minHeight: "100vh",
      padding: "40px 20px",
      color: "white",
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
      border: "1px solid rgba(255,255,255,0.05)",
      height: "fit-content" as const,
    },
    mainCard: {
      backgroundColor: "#f3f3f3",
      borderRadius: "24px",
      border: "1px solid rgba(255,255,255,0.05)",
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
      color: isActive ? "#a78bfa" : "#9ca3af",
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
      transition: "0.2s",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
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
    },
    statCard: {
      backgroundColor: "#ffffff",
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: "16px",
      padding: "18px",
    },
    searchInput: {
      width: "100%",
      backgroundColor: "rgba(255,255,255)",
      border: "1px solid rgba(0, 0, 0, 0.08)",
      borderRadius: "12px",
      padding: "12px 16px 12px 42px",
      color: "#111827",
      outline: "none",
      fontSize: "14px",
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

  const getStatusStyle = (status: ContractStatus): React.CSSProperties => {
    if (status === "Active") {
      return {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        backgroundColor: "#dcfce7",
        color: "#15803d",
      };
    }

    if (status === "Pending") {
      return {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        backgroundColor: "#fef3c7",
        color: "#b45309",
      };
    }

    return {
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 600,
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
    };
  };

  const totalContracts = contracts.length;
  const activeContracts = contracts.filter((c) => c.status === "Active").length;
  const pendingContracts = contracts.filter((c) => c.status === "Pending").length;
  const expiredContracts = contracts.filter((c) => c.status === "Expired").length;

  const sections = [
    "All Contracts",
    "Active Contracts",
    "Pending Review",
    "Expired Contracts",
    "Uploads",
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                margin: 0,
                color: "black",
              }}
            >
              Contract
            </h1>
            <p style={{ color: "#9ca3af", marginTop: "8px" }}>
              Manage your contracts and related documents
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button style={styles.ghostBtn}>
              <Upload size={16} />
              Upload Contract
            </button>
            <button style={styles.purpleBtn}>
              <Plus size={16} />
              New Contract
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: "32px",
          }}
        >
          <aside style={styles.sidebar}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {sections.map((section, index) => (
                <button
                  key={section}
                  style={styles.navButton(index === 0)}
                >
                  {section}
                </button>
              ))}
            </nav>
          </aside>

          <main style={styles.mainCard}>
            <div
              style={{
                padding: "24px 32px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  margin: 0,
                  color: "#111827",
                }}
              >
                Contract Overview
              </h2>
            </div>

            <div style={{ padding: "32px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div style={styles.statCard}>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
                    Total Contracts
                  </p>
                  <h3
                    style={{
                      margin: "10px 0 0",
                      fontSize: "28px",
                      color: "#111827",
                    }}
                  >
                    {totalContracts}
                  </h3>
                </div>

                <div style={styles.statCard}>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
                    Active
                  </p>
                  <h3
                    style={{
                      margin: "10px 0 0",
                      fontSize: "28px",
                      color: "#111827",
                    }}
                  >
                    {activeContracts}
                  </h3>
                </div>

                <div style={styles.statCard}>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
                    Pending
                  </p>
                  <h3
                    style={{
                      margin: "10px 0 0",
                      fontSize: "28px",
                      color: "#111827",
                    }}
                  >
                    {pendingContracts}
                  </h3>
                </div>

                <div style={styles.statCard}>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>
                    Expired
                  </p>
                  <h3
                    style={{
                      margin: "10px 0 0",
                      fontSize: "28px",
                      color: "#111827",
                    }}
                  >
                    {expiredContracts}
                  </h3>
                </div>
              </div>

              <div style={{ position: "relative", marginBottom: "24px", maxWidth: "420px" }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Contract Name</th>
                      <th style={styles.th}>Company</th>
                      <th style={styles.th}>Category</th>
                      <th style={styles.th}>Start Date</th>
                      <th style={styles.th}>End Date</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContracts.length > 0 ? (
                      filteredContracts.map((contract) => (
                        <tr key={contract.id}>
                          <td style={styles.td}>{contract.title}</td>
                          <td style={styles.td}>{contract.company}</td>
                          <td style={styles.td}>{contract.category}</td>
                          <td style={styles.td}>{contract.startDate}</td>
                          <td style={styles.td}>{contract.endDate}</td>
                          <td style={styles.td}>
                            <span style={getStatusStyle(contract.status)}>
                              {contract.status}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button style={styles.ghostBtn}>
                              <Eye size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            ...styles.td,
                            textAlign: "center",
                            color: "#6b7280",
                            padding: "28px",
                          }}
                        >
                          No contracts found.
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

export default Contract;