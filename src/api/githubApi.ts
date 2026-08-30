import axiosInstance from './axiosInstance';

// Mirrors deepiri-external-bridge-service `src/github/service.ts`.
export interface GhReview {
  login: string;
  state: string; // APPROVED | CHANGES_REQUESTED | COMMENTED | DISMISSED | PENDING
  submittedAt: string | null;
}

export interface GhPull {
  number: number;
  title: string;
  url: string;
  repo: string;
  repoUrl: string;
  author: { login: string; avatarUrl: string | null };
  draft: boolean;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  assignees: string[];
  requestedReviewers: string[];
  reviews: GhReview[];
}

export interface GhMemberActivity {
  login: string;
  openPrs: Array<{ repo: string; number: number; title: string; url: string; draft: boolean }>;
  openPrCount: number;
  reviewRequested: Array<{ repo: string; number: number; title: string; url: string; author: string }>;
  reviewRequestedCount: number;
  reviews30d: number | null;
}

export interface GhOverview {
  generatedAt: string;
  org: string;
  repos: Array<{ name: string; fullName: string; url: string; private: boolean; openIssues: number }>;
  pulls: GhPull[];
  members: Record<string, GhMemberActivity>;
  totals: { openPrs: number; awaitingReview: number; repos: number };
}

export interface GhOverviewResult {
  overview: GhOverview | null;
  /** true when the service responded 503 { notConfigured: true } */
  notConfigured: boolean;
  /** network / unexpected error message, if any */
  error: string | null;
}

export const githubApi = {
  /**
   * Team GitHub activity for the People page. `logins` are the GitHub usernames
   * of known Deepiri members — they get a 30-day "reviews given" count.
   */
  getOverview: async (logins: string[] = []): Promise<GhOverviewResult> => {
    try {
      const res = await axiosInstance.get('/integrations/github/overview', {
        params: logins.length ? { logins: logins.join(',') } : undefined,
      });
      return { overview: res.data as GhOverview, notConfigured: false, error: null };
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 503 && err?.response?.data?.notConfigured) {
        return { overview: null, notConfigured: true, error: null };
      }
      return {
        overview: null,
        notConfigured: false,
        error: err?.response?.data?.error || err?.message || 'Failed to load GitHub activity',
      };
    }
  },

  getStatus: async (): Promise<{ configured: boolean; org: string } | null> => {
    try {
      const res = await axiosInstance.get('/integrations/github/status');
      return res.data;
    } catch {
      return null;
    }
  },
};
