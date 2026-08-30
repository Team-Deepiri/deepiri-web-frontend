import { documentApi } from "../api/documentApi";
import type { DocumentRecord, DocumentStatus, NewDocumentInput } from "../types/document";

const STORAGE_KEY = "deepiri-language-intelligence-documents";

const SEED_DOCUMENTS: DocumentRecord[] = [
  {
    id: "seed-1",
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
    id: "seed-2",
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
    id: "seed-3",
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
    id: "seed-4",
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

const readStoredDocuments = (): DocumentRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...SEED_DOCUMENTS];
    const parsed = JSON.parse(raw) as DocumentRecord[];
    return parsed.length > 0 ? parsed : [...SEED_DOCUMENTS];
  } catch {
    return [...SEED_DOCUMENTS];
  }
};

const writeStoredDocuments = (documents: DocumentRecord[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getSafeDownloadUrl = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  try {
    const parsed = new URL(value, window.location.origin);
    const protocol = parsed.protocol.toLowerCase();
    if (
      protocol === "http:" ||
      protocol === "https:" ||
      protocol === "blob:" ||
      protocol === "data:"
    ) {
      return parsed.href;
    }
  } catch {
    // Invalid URL: reject.
  }
  return undefined;
};

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const mergeDocuments = (
  localDocs: DocumentRecord[],
  remoteDocs: DocumentRecord[]
): DocumentRecord[] => {
  const byId = new Map<string, DocumentRecord>();
  for (const doc of localDocs) byId.set(doc.id, doc);
  for (const doc of remoteDocs) byId.set(doc.id, { ...byId.get(doc.id), ...doc });
  return Array.from(byId.values()).sort((a, b) => a.title.localeCompare(b.title));
};

export const documentService = {
  loadDocuments: async (): Promise<DocumentRecord[]> => {
    const localDocs = readStoredDocuments();
    try {
      const remoteDocs = await documentApi.list();
      if (remoteDocs.length > 0) {
        const merged = mergeDocuments(localDocs, remoteDocs);
        writeStoredDocuments(merged);
        return merged;
      }
    } catch {
      // Fall back to local cache when API is unavailable or user is unauthenticated.
    }
    return localDocs;
  },

  getDocumentById: async (id: string): Promise<DocumentRecord | undefined> => {
    const localDoc = readStoredDocuments().find((doc) => doc.id === id);
    if (id.startsWith("seed-") || id.startsWith("local-")) {
      return localDoc;
    }
    try {
      const remoteDoc = await documentApi.getById(id);
      if (remoteDoc) {
        const documents = readStoredDocuments();
        const next = mergeDocuments(documents, [remoteDoc]);
        writeStoredDocuments(next);
        return remoteDoc;
      }
    } catch {
      // Use cached copy when detail fetch fails.
    }
    return localDoc;
  },

  uploadDocument: async (file: File): Promise<DocumentRecord> => {
    try {
      const uploaded = await documentApi.upload(file);
      const documents = readStoredDocuments();
      const next = [uploaded, ...documents.filter((d) => d.id !== uploaded.id)];
      writeStoredDocuments(next);
      return uploaded;
    } catch {
      const fileDataUrl = await fileToDataUrl(file);
      const localDoc: DocumentRecord = {
        id: `local-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        company: "—",
        category: "Uploads",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "—",
        status: "Pending",
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileType: file.type,
        fileDataUrl,
        tags: [],
      };
      const documents = readStoredDocuments();
      writeStoredDocuments([localDoc, ...documents]);
      return localDoc;
    }
  },

  createDocument: async (input: NewDocumentInput): Promise<DocumentRecord> => {
    try {
      const created = await documentApi.create(input);
      const documents = readStoredDocuments();
      writeStoredDocuments([created, ...documents.filter((d) => d.id !== created.id)]);
      return created;
    } catch {
      const localDoc: DocumentRecord = {
        id: `local-${Date.now()}`,
        ...input,
        fileName: `${input.title.replace(/\s+/g, "_")}.txt`,
        tags: [],
      };
      const documents = readStoredDocuments();
      writeStoredDocuments([localDoc, ...documents]);
      return localDoc;
    }
  },

  updateDocument: (id: string, patch: Partial<DocumentRecord>): DocumentRecord | undefined => {
    const documents = readStoredDocuments();
    const index = documents.findIndex((doc) => doc.id === id);
    if (index === -1) return undefined;
    const updated = { ...documents[index], ...patch };
    documents[index] = updated;
    writeStoredDocuments(documents);
    return updated;
  },

  deleteDocument: (id: string): void => {
    const documents = readStoredDocuments().filter((doc) => doc.id !== id);
    writeStoredDocuments(documents);
  },

  downloadDocument: (doc: DocumentRecord): void => {
    const url = getSafeDownloadUrl(doc.documentUrl || doc.fileDataUrl);
    if (!url) return;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = doc.fileName || doc.title;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  },
};
