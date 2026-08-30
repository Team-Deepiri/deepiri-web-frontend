import { describe, it, expect, beforeEach } from "vitest";
import { documentService } from "./services/documentService";

describe("documentService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads seeded documents when storage is empty", async () => {
    const documents = await documentService.loadDocuments();
    expect(documents.length).toBeGreaterThan(0);
    expect(documents[0].id).toBeTruthy();
  });

  it("persists uploaded documents for detail lookup", async () => {
    const file = new File(["hello"], "sample.txt", { type: "text/plain" });
    const uploaded = await documentService.uploadDocument(file);
    const found = await documentService.getDocumentById(uploaded.id);
    expect(found?.title).toBe("sample");
  });
});
