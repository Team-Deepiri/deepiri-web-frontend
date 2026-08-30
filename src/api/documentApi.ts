import axiosInstance from "./axiosInstance";
import type { DocumentRecord, DocumentStatus, NewDocumentInput } from "../types/document";

/** Payload shape from language-intelligence `/api/contracts` (legacy route name). */
type LanguageIntelligenceDocumentDto = {
  id: string;
  contractNumber?: string;
  contractName: string;
  partyA?: string;
  partyB?: string;
  contractType?: string | null;
  effectiveDate?: string;
  expirationDate?: string | null;
  documentUrl?: string;
  documentType?: string;
  fileSize?: number | null;
  status?: string;
  tags?: string[];
};

const mapRemoteStatus = (status?: string): DocumentStatus => {
  const normalized = (status ?? "").toUpperCase();
  if (normalized === "COMPLETED" || normalized === "ACTIVE") return "Active";
  if (normalized === "ARCHIVED" || normalized === "ERROR") return "Expired";
  return "Pending";
};

const formatFileSize = (bytes?: number | null): string | undefined => {
  if (!bytes) return undefined;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const mapDtoToDocument = (dto: LanguageIntelligenceDocumentDto): DocumentRecord => ({
  id: dto.id,
  title: dto.contractName,
  company: dto.partyB || dto.partyA || "—",
  category: dto.contractType || "General",
  startDate: dto.effectiveDate
    ? new Date(dto.effectiveDate).toISOString().split("T")[0]
    : "—",
  endDate: dto.expirationDate
    ? new Date(dto.expirationDate).toISOString().split("T")[0]
    : "—",
  status: mapRemoteStatus(dto.status),
  fileName: dto.contractNumber
    ? `${dto.contractNumber}.${(dto.documentType || "pdf").toLowerCase()}`
    : dto.contractName,
  fileSize: formatFileSize(dto.fileSize),
  fileType: dto.documentType,
  documentUrl: dto.documentUrl,
  tags: dto.tags ?? [],
});

/** Language Intelligence document API (proxied at `/api/contracts` until backend route rename). */
export const documentApi = {
  list: async (): Promise<DocumentRecord[]> => {
    const response = await axiosInstance.get<{
      success: boolean;
      data: LanguageIntelligenceDocumentDto[];
    }>("/contracts");
    return (response.data.data ?? []).map(mapDtoToDocument);
  },

  getById: async (id: string): Promise<DocumentRecord | null> => {
    const response = await axiosInstance.get<{
      success: boolean;
      data: LanguageIntelligenceDocumentDto;
    }>(`/contracts/${id}`);
    return response.data.data ? mapDtoToDocument(response.data.data) : null;
  },

  upload: async (file: File, title?: string): Promise<DocumentRecord> => {
    const formData = new FormData();
    const stamp = Date.now();
    formData.append("file", file);
    formData.append("contractNumber", `DOC-${stamp}`);
    formData.append("contractName", title || file.name.replace(/\.[^/.]+$/, ""));
    formData.append("partyA", "Deepiri");
    formData.append("partyB", "—");
    formData.append("effectiveDate", new Date().toISOString());
    formData.append("contractType", "Uploads");

    const response = await axiosInstance.post<{
      success: boolean;
      data: LanguageIntelligenceDocumentDto;
    }>("/contracts/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return mapDtoToDocument(response.data.data);
  },

  create: async (input: NewDocumentInput): Promise<DocumentRecord> => {
    const stamp = Date.now();
    const placeholder = new File(
      [new Blob([`Document: ${input.title}`], { type: "text/plain" })],
      `${input.title.replace(/\s+/g, "_")}.txt`,
      { type: "text/plain" }
    );
    const formData = new FormData();
    formData.append("file", placeholder);
    formData.append("contractNumber", `DOC-${stamp}`);
    formData.append("contractName", input.title);
    formData.append("partyA", "Deepiri");
    formData.append("partyB", input.company);
    formData.append("effectiveDate", input.startDate || new Date().toISOString());
    if (input.endDate) formData.append("expirationDate", input.endDate);
    formData.append("contractType", input.category || "General");

    const response = await axiosInstance.post<{
      success: boolean;
      data: LanguageIntelligenceDocumentDto;
    }>("/contracts/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const doc = mapDtoToDocument(response.data.data);
    return { ...doc, status: input.status };
  },
};
