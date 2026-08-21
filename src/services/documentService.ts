import { apiClient } from "./platformClient";

export type DocumentStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "ERROR" | "ARCHIVED";

export interface IntelligenceDocument {
  id: string;
  documentKey: string;
  documentKind: string;
  intelligenceProfile: string;
  documentType: string;
  fileSize?: number | null;
  status: DocumentStatus;
  processingStatus?: string | null;
  processingError?: string | null;
  extractionConfidence?: number | null;
  tags: string[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFilters {
  documentKind?: string;
  status?: string;
}

export interface UploadDocumentInput {
  file: File;
  documentKey: string;
  documentKind: string;
  notes?: string;
  tags?: string[];
}

// Internal routing hint for which Cyrex pipeline processes the document —
// not a user-facing concept, so the upload form doesn't expose it.
const DEFAULT_INTELLIGENCE_PROFILE = "primary";

export async function listDocuments(filters: DocumentFilters = {}): Promise<IntelligenceDocument[]> {
  const res = await apiClient.get<{ success: boolean; data: IntelligenceDocument[] }>(
    "/api/documents",
    { params: filters }
  );
  return res.data.data;
}

export async function getDocument(id: string): Promise<IntelligenceDocument> {
  const res = await apiClient.get<{ success: boolean; data: IntelligenceDocument }>(
    `/api/documents/${id}`
  );
  return res.data.data;
}

export async function uploadDocument(input: UploadDocumentInput): Promise<IntelligenceDocument> {
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("documentKey", input.documentKey);
  formData.append("documentKind", input.documentKind);
  formData.append("intelligenceProfile", DEFAULT_INTELLIGENCE_PROFILE);
  if (input.notes) formData.append("notes", input.notes);
  if (input.tags?.length) formData.append("tags", JSON.stringify(input.tags));

  const res = await apiClient.post<{ success: boolean; data: IntelligenceDocument }>(
    "/api/documents/upload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data.data;
}

/**
 * Documents are private in storage — this always fetches a fresh,
 * short-lived link. Never cache/store the result; call it right before
 * you need it (a download click, a preview open).
 */
export async function getDocumentDownloadUrl(id: string): Promise<string> {
  const res = await apiClient.get<{ success: boolean; data: { url: string; expiresIn: number } }>(
    `/api/documents/${id}/download-url`
  );
  return res.data.data.url;
}

export async function reprocessDocument(id: string): Promise<void> {
  await apiClient.post(`/api/documents/${id}/reprocess`);
}

export function downloadDocument(id: string, fileName?: string): void {
  getDocumentDownloadUrl(id)
    .then((url) => {
      const anchor = document.createElement("a");
      anchor.href = url;
      if (fileName) anchor.download = fileName;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    })
    .catch(() => {
      // Swallow — caller-visible error handling belongs in the UI layer;
      // this helper is a fire-and-forget convenience for click handlers.
    });
}
