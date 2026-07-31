import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { ArrowLeft, ChevronDown, ChevronUp, Play, RefreshCw, XCircle } from 'lucide-react';
import {
  cancelTrussRun,
  launchTrainPublishTemplate,
  listTrussDefinitions,
  listTrussRuns,
  type TrussRun,
  type TrussRunStatus,
} from '../../services/trussService';
import { OPS_DASHBOARD_STALE_TIME } from '../../constants/query';
import { getActionErrorMessage } from '../../utils/api';
import { formatTimestamp } from '../../utils/date';
import './TrussDashboard.css';

const TRUSS_STALE_TIME = OPS_DASHBOARD_STALE_TIME;

const RUN_STATUS_STYLES: Record<TrussRunStatus, string> = {
  queued: 'truss-status-queued',
  running: 'truss-status-running',
  waiting: 'truss-status-waiting',
  completed: 'truss-status-completed',
  failed: 'truss-status-failed',
  cancelled: 'truss-status-cancelled',
};

const DEFAULT_TEMPLATE_INPUT = JSON.stringify(
  {
    datasetId: 'demo-dataset',
    modelName: 'phase1-demo-model',
    publish: true,
  },
  null,
  2
);

function isActiveRun(run: TrussRun): boolean {
  return run.status === 'queued' || run.status === 'running' || run.status === 'waiting';
}

function summarizeStepOutput(output: Record<string, unknown> | null | undefined): string {
  if (!output || Object.keys(output).length === 0) return 'No output yet';
  if ('id' in output && typeof output.id === 'string') return output.id;
  if ('passed' in output && typeof output.passed === 'boolean') return output.passed ? 'passed' : 'failed';
  if ('waitingFor' in output) return 'waiting for event';
  return JSON.stringify(output);
}

const TrussDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [templateInput, setTemplateInput] = useState(DEFAULT_TEMPLATE_INPUT);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  const {
    data: definitions = [],
    isLoading: definitionsLoading,
    isError: definitionsErrored,
  } = useQuery(['truss', 'definitions'], listTrussDefinitions, { staleTime: TRUSS_STALE_TIME });

  const {
    data: runs = [],
    isLoading: runsLoading,
    isError: runsErrored,
    isFetching,
  } = useQuery(['truss', 'runs'], listTrussRuns, { staleTime: TRUSS_STALE_TIME });

  const statusCounts = useMemo(() => {
    return runs.reduce<Record<TrussRunStatus, number>>(
      (acc, run) => {
        acc[run.status] += 1;
        return acc;
      },
      { queued: 0, running: 0, waiting: 0, completed: 0, failed: 0, cancelled: 0 }
    );
  }, [runs]);

  const refreshAll = () => {
    void queryClient.invalidateQueries(['truss']);
  };

  const handleLaunchTemplate = async () => {
    setActionError(null);
    setIsLaunching(true);
    try {
      const parsed = JSON.parse(templateInput) as unknown;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setActionError('Template input must be a JSON object.');
        return;
      }

      const response = await launchTrainPublishTemplate(parsed as Record<string, unknown>);
      setExpandedId(response.run.id);
      refreshAll();
    } catch (err) {
      if (err instanceof SyntaxError) {
        setActionError('Template input is not valid JSON.');
        return;
      }
      setActionError(getActionErrorMessage(err, 'Could not launch the ml.train-publish template.'));
    } finally {
      setIsLaunching(false);
    }
  };

  const handleCancel = async (run: TrussRun) => {
    setActionError(null);
    try {
      await cancelTrussRun(run.id);
      refreshAll();
    } catch (err) {
      setActionError(getActionErrorMessage(err, `Could not cancel run ${run.id}.`));
    }
  };

  return (
    <div className="truss-dashboard-container">
      <Link to="/ops" className="truss-back-link">
        <ArrowLeft size={14} /> Ops Hub
      </Link>

      <div className="truss-header-row">
        <div>
          <h1 className="truss-title">Truss</h1>
          <p className="truss-subtitle">Workflow definitions, runs, and step execution state.</p>
        </div>
        <button onClick={refreshAll} className="truss-refresh-btn" disabled={isFetching}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="truss-summary-grid">
        <div className="truss-summary-card">
          <div className="truss-summary-label">Definitions</div>
          <div className="truss-summary-value">{definitions.length}</div>
        </div>
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="truss-summary-card">
            <div className="truss-summary-label">{status}</div>
            <div className="truss-summary-value">{count}</div>
          </div>
        ))}
      </div>

      {actionError && <div className="truss-error-banner">{actionError}</div>}

      <div className="truss-launch-panel">
        <div className="truss-panel-header">
          <div>
            <h2 className="truss-panel-title">ml.train-publish</h2>
            <p className="truss-panel-subtitle">Template run input</p>
          </div>
          <button onClick={() => void handleLaunchTemplate()} className="truss-primary-btn" disabled={isLaunching}>
            <Play size={14} /> Launch
          </button>
        </div>
        <textarea
          className="truss-input-textarea"
          value={templateInput}
          onChange={(event) => setTemplateInput(event.target.value)}
          spellCheck={false}
        />
      </div>

      <div className="truss-layout-grid">
        <section>
          <div className="truss-section-header">
            <h2 className="truss-section-title">Runs</h2>
          </div>

          {runsLoading ? (
            <p className="truss-muted-text">Loading runs...</p>
          ) : runsErrored ? (
            <p className="truss-error-text">Could not reach the Truss service.</p>
          ) : runs.length === 0 ? (
            <p className="truss-muted-text">No Truss runs yet.</p>
          ) : (
            <div className="truss-runs-list">
              {runs.map((run) => (
                <div key={run.id} className="truss-run-row">
                  <div className="truss-run-main">
                    <button
                      onClick={() => setExpandedId((prev) => (prev === run.id ? null : run.id))}
                      className="truss-run-expand-btn"
                      aria-expanded={expandedId === run.id}
                      aria-controls={`truss-run-${run.id}-details`}
                    >
                      {expandedId === run.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      <div className="truss-run-text">
                        <div className="truss-run-name">
                          {run.definition?.name ?? run.definitionId}
                          {run.definition?.version ? <span>v{run.definition.version}</span> : null}
                        </div>
                        <div className="truss-run-id">{run.id}</div>
                      </div>
                    </button>
                    <span className={`truss-status-badge ${RUN_STATUS_STYLES[run.status]}`}>{run.status}</span>
                    {isActiveRun(run) && (
                      <button onClick={() => void handleCancel(run)} className="truss-cancel-btn">
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                  </div>

                  {expandedId === run.id && (
                    <div id={`truss-run-${run.id}-details`} className="truss-run-expanded">
                      <div className="truss-run-meta-grid">
                        <div>
                          <span>Current step</span>
                          <strong>{run.currentStep ?? 'None'}</strong>
                        </div>
                        <div>
                          <span>Started</span>
                          <strong>{formatTimestamp(run.startedAt)}</strong>
                        </div>
                        <div>
                          <span>Updated</span>
                          <strong>{formatTimestamp(run.updatedAt)}</strong>
                        </div>
                      </div>
                      {run.error && <p className="truss-row-error">Error: {run.error}</p>}
                      <div className="truss-step-list">
                        {(run.stepRuns ?? []).map((step) => (
                          <div key={step.id} className="truss-step-row">
                            <div>
                              <div className="truss-step-name">{step.stepId}</div>
                              <div className="truss-step-detail">
                                {step.kind}
                                {step.externalRef ? ` - ${step.externalRef}` : ''}
                              </div>
                            </div>
                            <div className="truss-step-output">
                              <span className={`truss-status-badge ${RUN_STATUS_STYLES[step.status]}`}>
                                {step.status}
                              </span>
                              <code>{summarizeStepOutput(step.output)}</code>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="truss-section-header">
            <h2 className="truss-section-title">Definitions</h2>
          </div>

          {definitionsLoading ? (
            <p className="truss-muted-text">Loading definitions...</p>
          ) : definitionsErrored ? (
            <p className="truss-error-text">Could not load Truss definitions.</p>
          ) : definitions.length === 0 ? (
            <p className="truss-muted-text">No definitions have been materialized.</p>
          ) : (
            <div className="truss-definition-list">
              {definitions.map((definition) => (
                <div key={definition.id} className="truss-definition-card">
                  <div className="truss-definition-header">
                    <div>
                      <div className="truss-definition-name">{definition.name}</div>
                      <div className="truss-definition-id">{definition.id}</div>
                    </div>
                    <span className="truss-version-badge">v{definition.version}</span>
                  </div>
                  {definition.description && <p className="truss-definition-description">{definition.description}</p>}
                  <div className="truss-definition-steps">
                    {definition.steps.map((step) => (
                      <div key={step.id} className="truss-definition-step">
                        <span>{step.id}</span>
                        <code>{step.kind}</code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TrussDashboard;
