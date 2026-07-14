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

const STATUS_STYLES: Record<JobStatus, string> = {
  queued: 'bg-gray-100 text-gray-700',
  running: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-yellow-100 text-yellow-700',
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
    <div className="p-6 max-w-5xl mx-auto">
      <Link to="/ops" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={14} /> Ops Hub
      </Link>

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <button
          onClick={() => void load()}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <p className="text-gray-500 mb-6">Async job queue — helox.train and other background work.</p>

      {/* Queue stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {STATUS_FILTERS.filter((s) => s !== 'all').map((status) => (
          <div key={status} className="border rounded-lg p-3 shadow-sm">
            <div className="text-xs text-gray-500 capitalize">{status}</div>
            <div className="text-xl font-semibold">{stats[status] ?? 0}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 rounded-full text-sm capitalize border ${
              statusFilter === status
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{actionError}</div>
      )}

      {loading ? (
        <p>Loading jobs…</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : jobs.length === 0 ? (
        <p className="text-gray-500">No jobs match this filter.</p>
      ) : (
        <div className="border rounded-lg divide-y">
          {jobs.map((job) => (
            <div key={job.id}>
              <div className="p-4 flex items-center justify-between gap-4">
                <button
                  onClick={() => void toggleExpand(job)}
                  className="flex items-center gap-3 flex-1 text-left min-w-0"
                >
                  {expandedId === job.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  <div className="min-w-0">
                    <div className="font-medium truncate">{job.type}</div>
                    <div className="text-xs text-gray-400 truncate">{job.id}</div>
                  </div>
                </button>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_STYLES[job.status]}`}>
                  {job.status}
                </span>
                <div className="flex gap-2 flex-shrink-0">
                  {job.status !== 'completed' && job.status !== 'cancelled' && (
                    <button
                      onClick={() => void handleCancel(job)}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  )}
                  {job.status === 'failed' && (
                    <button
                      onClick={() => void handleRetry(job)}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      <RotateCcw size={14} /> Retry
                    </button>
                  )}
                </div>
              </div>
              {expandedId === job.id && (
                <div className="px-4 pb-4 bg-gray-50">
                  {job.error && (
                    <p className="text-sm text-red-600 mb-2">Error: {job.error}</p>
                  )}
                  <div className="text-xs font-semibold text-gray-500 mb-1">Logs</div>
                  {logsLoading === job.id ? (
                    <p className="text-sm text-gray-400">Loading logs…</p>
                  ) : (logsByJob[job.id]?.length ?? 0) === 0 ? (
                    <p className="text-sm text-gray-400">No log lines yet.</p>
                  ) : (
                    <div className="bg-white border rounded p-2 font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
                      {logsByJob[job.id].map((log, i) => (
                        <div key={i}>
                          <span className="text-gray-400">{log.createdAt}</span> {log.line}
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
