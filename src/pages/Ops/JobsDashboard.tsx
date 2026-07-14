import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, XCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import {
  listJobs,
  getJobLogs,
  cancelJob,
  retryJob,
  getQueueStats,
  type JobRecord,
  type JobLogLine,
  type JobStatus,
} from '../../services/jobsService';
import './JobsDashboard.css';

const STATUS_STYLES: Record<JobStatus, string> = {
  queued: 'jobs-status-queued',
  running: 'jobs-status-running',
  completed: 'jobs-status-completed',
  failed: 'jobs-status-failed',
  cancelled: 'jobs-status-cancelled',
};

const STATUS_FILTERS: (JobStatus | 'all')[] = ['all', 'queued', 'running', 'completed', 'failed', 'cancelled'];

const JobsDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [logsByJob, setLogsByJob] = useState<Record<string, JobLogLine[]>>({});
  const [logsLoading, setLogsLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobList, queueStats] = await Promise.all([
        listJobs(statusFilter === 'all' ? {} : { status: statusFilter }),
        getQueueStats(),
      ]);
      setJobs(jobList);
      setStats(queueStats);
    } catch {
      setError('Could not reach the jobs service.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleExpand = async (job: JobRecord) => {
    if (expandedId === job.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(job.id);
    if (!logsByJob[job.id]) {
      setLogsLoading(job.id);
      try {
        const logs = await getJobLogs(job.id);
        setLogsByJob((prev) => ({ ...prev, [job.id]: logs }));
      } catch {
        setLogsByJob((prev) => ({ ...prev, [job.id]: [] }));
      } finally {
        setLogsLoading(null);
      }
    }
  };

  const handleCancel = async (job: JobRecord) => {
    setActionError(null);
    try {
      await cancelJob(job.id);
      await load();
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setActionError(message ?? `Could not cancel job ${job.id}.`);
    }
  };

  const handleRetry = async (job: JobRecord) => {
    setActionError(null);
    try {
      await retryJob(job.id);
      await load();
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setActionError(message ?? `Could not retry job ${job.id}.`);
    }
  };

  return (
    <div className="jobs-dashboard-container">
      <Link to="/ops" className="jobs-back-link">
        <ArrowLeft size={14} /> Ops Hub
      </Link>

      <div className="jobs-header-row">
        <h1 className="jobs-title">Jobs</h1>
        <button onClick={() => void load()} className="jobs-refresh-btn">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <p className="jobs-subtitle">Async job queue — helox.train and other background work.</p>

      {/* Queue stats */}
      <div className="jobs-stats-grid">
        {STATUS_FILTERS.filter((s) => s !== 'all').map((status) => (
          <div key={status} className="jobs-stat-card">
            <div className="jobs-stat-label">{status}</div>
            <div className="jobs-stat-value">{stats[status] ?? 0}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="jobs-filters-row">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`jobs-filter-btn ${statusFilter === status ? 'active' : ''}`}
          >
            {status}
          </button>
        ))}
      </div>

      {actionError && <div className="jobs-error-banner">{actionError}</div>}

      {loading ? (
        <p className="jobs-muted-text">Loading jobs…</p>
      ) : error ? (
        <p className="jobs-error-text">{error}</p>
      ) : jobs.length === 0 ? (
        <p className="jobs-muted-text">No jobs match this filter.</p>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => (
            <div key={job.id} className="jobs-list-row">
              <div className="jobs-row-main">
                <button onClick={() => void toggleExpand(job)} className="jobs-row-expand-btn">
                  {expandedId === job.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  <div className="min-w-0">
                    <div className="jobs-row-type">{job.type}</div>
                    <div className="jobs-row-id">{job.id}</div>
                  </div>
                </button>
                <span className={`jobs-status-badge ${STATUS_STYLES[job.status]}`}>{job.status}</span>
                <div className="jobs-row-actions">
                  {job.status !== 'completed' && job.status !== 'cancelled' && (
                    <button onClick={() => void handleCancel(job)} className="jobs-action-btn jobs-cancel-btn">
                      <XCircle size={14} /> Cancel
                    </button>
                  )}
                  {job.status === 'failed' && (
                    <button onClick={() => void handleRetry(job)} className="jobs-action-btn jobs-retry-btn">
                      <RotateCcw size={14} /> Retry
                    </button>
                  )}
                </div>
              </div>
              {expandedId === job.id && (
                <div className="jobs-row-expanded">
                  {job.error && <p className="jobs-row-error">Error: {job.error}</p>}
                  <div className="jobs-logs-heading">Logs</div>
                  {logsLoading === job.id ? (
                    <p className="jobs-muted-text">Loading logs…</p>
                  ) : (logsByJob[job.id]?.length ?? 0) === 0 ? (
                    <p className="jobs-muted-text">No log lines yet.</p>
                  ) : (
                    <div className="jobs-logs-box">
                      {logsByJob[job.id].map((log, i) => (
                        <div key={i} className="jobs-log-line">
                          <span className="jobs-log-timestamp">{log.createdAt}</span> {log.line}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsDashboard;
