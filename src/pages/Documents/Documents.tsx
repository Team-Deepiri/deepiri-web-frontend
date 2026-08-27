import React, { useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { RefreshCw, Upload, Download, RotateCcw, FileText } from 'lucide-react';
import {
  listDocuments,
  uploadDocument,
  reprocessDocument,
  downloadDocument,
  type IntelligenceDocument,
  type DocumentStatus,
} from '../../services/documentService';
import { OPS_DASHBOARD_STALE_TIME } from '../../constants/query';
import { getActionErrorMessage } from '../../utils/api';
import './Documents.css';

const STATUS_STYLES: Record<DocumentStatus, string> = {
  PENDING: 'documents-status-pending',
  PROCESSING: 'documents-status-processing',
  COMPLETED: 'documents-status-completed',
  ERROR: 'documents-status-error',
  ARCHIVED: 'documents-status-archived',
};

const STATUS_FILTERS: (DocumentStatus | 'all')[] = [
  'all',
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'ERROR',
  'ARCHIVED',
];

function formatFileSize(bytes?: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const Documents: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [documentKind, setDocumentKind] = useState('document');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: documents = [],
    isLoading,
    isError,
  } = useQuery<IntelligenceDocument[]>(
    ['documents', statusFilter],
    () => listDocuments(statusFilter === 'all' ? {} : { status: statusFilter }),
    { staleTime: OPS_DASHBOARD_STALE_TIME }
  );

  const refresh = () => {
    void queryClient.invalidateQueries(['documents']);
  };

  const handleFilePicked = (file: File | null) => {
    setPendingFile(file);
    if (file && !showUploadForm) setShowUploadForm(true);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setActionError(null);
    setUploading(true);
    try {
      const documentKey = `DOC-${Date.now()}-${pendingFile.name.replace(/\.[^/.]+$/, '')}`;
      await uploadDocument({
        file: pendingFile,
        documentKey,
        documentKind: documentKind.trim() || 'document',
        notes: notes.trim() || undefined,
      });
      setPendingFile(null);
      setNotes('');
      setShowUploadForm(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      refresh();
    } catch (err) {
      setActionError(getActionErrorMessage(err, 'Upload failed.'));
    } finally {
      setUploading(false);
    }
  };

  const handleReprocess = async (doc: IntelligenceDocument) => {
    setActionError(null);
    try {
      await reprocessDocument(doc.id);
      refresh();
    } catch (err) {
      setActionError(getActionErrorMessage(err, `Could not reprocess ${doc.documentKey}.`));
    }
  };

  return (
    <div className="documents-container">
      <div className="documents-header-row">
        <h1 className="documents-title">Documents</h1>
        <div className="documents-header-actions">
          <button onClick={refresh} className="documents-refresh-btn">
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => setShowUploadForm((v) => !v)}
            className="documents-upload-btn"
          >
            <Upload size={14} /> Upload
          </button>
        </div>
      </div>
      <p className="documents-subtitle">
        Upload documents for Cyrex-backed intelligence extraction — abstraction, key terms, obligations.
      </p>

      {showUploadForm && (
        <div className="documents-upload-form">
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => handleFilePicked(e.target.files?.[0] ?? null)}
            className="documents-file-input"
          />
          <input
            type="text"
            value={documentKind}
            onChange={(e) => setDocumentKind(e.target.value)}
            placeholder="Kind (e.g. lease, contract, policy)"
            className="documents-text-input"
          />
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="documents-text-input"
          />
          <button
            onClick={() => void handleUpload()}
            disabled={!pendingFile || uploading}
            className="documents-submit-btn"
          >
            {uploading ? 'Uploading…' : 'Submit'}
          </button>
        </div>
      )}

      <div className="documents-filters-row">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`documents-filter-btn ${statusFilter === status ? 'active' : ''}`}
          >
            {status.toLowerCase()}
          </button>
        ))}
      </div>

      {actionError && <div className="documents-error-banner">{actionError}</div>}

      {isLoading ? (
        <p className="documents-muted-text">Loading documents…</p>
      ) : isError ? (
        <p className="documents-error-text">Could not reach the document service.</p>
      ) : documents.length === 0 ? (
        <p className="documents-muted-text">No documents match this filter.</p>
      ) : (
        <div className="documents-list">
          {documents.map((doc) => (
            <div key={doc.id} className="documents-list-row">
              <div className="documents-row-main">
                <FileText size={16} className="documents-row-icon" />
                <div className="min-w-0">
                  <div className="documents-row-key">{doc.documentKey}</div>
                  <div className="documents-row-meta">
                    {doc.documentKind} · {doc.documentType} · {formatFileSize(doc.fileSize)}
                  </div>
                </div>
                <span className={`documents-status-badge ${STATUS_STYLES[doc.status]}`}>
                  {doc.status.toLowerCase()}
                </span>
                <div className="documents-row-actions">
                  <button
                    onClick={() => downloadDocument(doc.id, doc.documentKey)}
                    className="documents-action-btn"
                  >
                    <Download size={14} /> Download
                  </button>
                  {doc.status === 'ERROR' && (
                    <button
                      onClick={() => void handleReprocess(doc)}
                      className="documents-action-btn documents-reprocess-btn"
                    >
                      <RotateCcw size={14} /> Reprocess
                    </button>
                  )}
                </div>
              </div>
              {doc.status === 'ERROR' && doc.processingError && (
                <p className="documents-row-error">Error: {doc.processingError}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;
