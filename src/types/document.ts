export type DocumentStatus = "Active" | "Pending" | "Expired";

export type DocumentRecord = {
  id: string;
  title: string;
  company: string;
  category: string;
  startDate: string;
  endDate: string;
  status: DocumentStatus;
  uploadedBy?: string;
  fileSize?: string;
  fileName?: string;
  fileType?: string;
  documentUrl?: string;
  fileDataUrl?: string;
  tags?: string[];
};

export type NewDocumentInput = {
  title: string;
  company: string;
  category: string;
  startDate: string;
  endDate: string;
  status: DocumentStatus;
};
