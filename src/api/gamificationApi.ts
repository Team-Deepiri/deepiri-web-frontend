import axiosInstance from './axiosInstance';

const API_BASE = '/gamification';

export interface MomentumProfile {
  totalMomentum: number;
  currentLevel: number;
  momentumToNextLevel: number;
  skillMastery: {
    commits: number;
    docs: number;
    tasks: number;
    reviews: number;
    comments: number;
    attendance: number;
    featuresShipped: number;
    designEdits: number;
  };
  levelHistory: Array<{
    level: number;
    reachedAt: string;
    totalMomentum: number;
  }>;
  achievements: Array<{
    achievementId: string;
    name: string;
    description: string;
    unlockedAt: string;
    showcaseable: boolean;
  }>;
  publicProfile: {
    displayMomentum: boolean;
    showcaseAchievements: string[];
    resumeReferences: string[];
  };
}

export interface StreakData {
  daily: {
    current: number;
    longest: number;
    lastDate: string | null;
    canCashIn: boolean;
  };
  weekly: {
    current: number;
    longest: number;
    lastWeek: string | null;
    canCashIn: boolean;
  };
  project: {
    current: number;
    longest: number;
    projectId: string | null;
    lastProjectDate: string | null;
    canCashIn: boolean;
  };
  pr: {
    current: number;
    longest: number;
    lastPRDate: string | null;
    canCashIn: boolean;
  };
  healthy: {
    current: number;
    longest: number;
    lastHealthyDate: string | null;
    canCashIn: boolean;
    consecutiveDaysWithoutBurnout: number;
  };
  cashedInStreaks: Array<{
    streakType: string;
    cashedAt: string;
    streakValue: number;
    boostCreditsEarned: number;
  }>;
}

export interface BoostProfile {
  activeBoosts: Array<{
    boostType: string;
    activatedAt: string;
    expiresAt: string;
    duration: number;
    metadata?: Record<string, any>;
  }>;
  boostCredits: number;
  settings: {
    maxConcurrentBoosts: number;
    maxAutopilotTimePerDay: number;
    autopilotTimeUsedToday: number;
    lastAutopilotReset: string;
  };
}

export interface Objective {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  momentumReward: number;
  deadline?: string;
  subtasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    momentumReward: number;
  }>;
  aiSuggestions: Array<{
    suggestion: string;
    type: string;
    confidence: number;
  }>;
  completionData?: {
    completedAt?: string;
    actualDuration?: number;
    momentumEarned: number;
    autoDetected: boolean;
  };
  odysseyId?: string;
  seasonId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Odyssey {
  _id: string;
  userId: string;
  organizationId?: string;
  title: string;
  description?: string;
  scale: 'hours' | 'day' | 'week' | 'month' | 'custom';
  minimumHoursBeforeSelection?: number;
  status: 'planning' | 'active' | 'completed' | 'paused' | 'cancelled';
  objectives: string[];
  milestones: Array<{
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    completedAt?: string;
    momentumReward: number;
  }>;
  progress: {
    objectivesCompleted: number;
    totalObjectives: number;
    milestonesCompleted: number;
    totalMilestones: number;
    progressPercentage: number;
  };
  aiGeneratedBrief: {
    animation?: string;
    summary: string;
    generatedAt: string;
  };
  progressMap: {
    currentStage: string;
    stages: Array<{
      stageId: string;
      name: string;
      completed: boolean;
      completedAt?: string;
    }>;
  };
  startDate: string;
  endDate?: string;
  seasonId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Season {
  _id: string;
  userId: string;
  organizationId?: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  sprintCycle?: string;
  status: 'upcoming' | 'active' | 'completed';
  odysseys: string[];
  seasonBoosts: {
    enabled: boolean;
    boostType?: string;
    multiplier?: number;
    description?: string;
  };
  highlights: {
    totalMomentumEarned: number;
    objectivesCompleted: number;
    odysseysCompleted: number;
    topContributors: Array<{
      userId: string;
      momentum: number;
      name?: string;
    }>;
    highlightsReel?: string;
    generatedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Reward {
  _id: string;
  userId: string;
  rewardType: 'boost_credits' | 'momentum_bonus' | 'skip_day' | 'break_time' | 'custom';
  amount: number;
  source: 'streak' | 'momentum' | 'season' | 'achievement' | 'manual';
  sourceId?: string;
  description: string;
  status: 'pending' | 'claimed' | 'expired';
  claimedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export const gamificationApi = {
  // Momentum
  async getMomentum(userId: string): Promise<{ success: boolean; data: MomentumProfile }> {
    const response = await axiosInstance.get(`${API_BASE}/momentum/${userId}`);
    return response.data;
  },

  async awardMomentum(userId: string, amount: number, source: string, metadata?: Record<string, any>): Promise<{ success: boolean; data: MomentumProfile }> {
    const response = await axiosInstance.post(`${API_BASE}/momentum/award`, {
      userId,
      amount,
      source,
      metadata
    });
    return response.data;
  },

  async getRanking(limit?: number, sortBy?: string): Promise<{ success: boolean; data: any[] }> {
    const response = await axiosInstance.get(`${API_BASE}/momentum/ranking`, {
      params: { limit, sortBy }
    });
    return response.data;
  },

  async getUserRank(userId: string): Promise<{ success: boolean; data: { rank: number; totalMomentum: number; currentLevel: number } }> {
    const response = await axiosInstance.get(`${API_BASE}/momentum/${userId}/rank`);
    return response.data;
  },

  // Streaks
  async getStreaks(userId: string): Promise<{ success: boolean; data: StreakData }> {
    const response = await axiosInstance.get(`${API_BASE}/streaks/${userId}`);
    return response.data;
  },

  async updateStreak(userId: string, streakType: string, projectId?: string, isHealthy?: boolean): Promise<{ success: boolean; data: any }> {
    const response = await axiosInstance.post(`${API_BASE}/streaks/update`, {
      userId,
      streakType,
      projectId,
      isHealthy
    });
    return response.data;
  },

  async cashInStreak(userId: string, streakType: string): Promise<{ success: boolean; data: { boostCreditsEarned: number; streakType: string; streakValue: number } }> {
    const response = await axiosInstance.post(`${API_BASE}/streaks/cash-in`, {
      userId,
      streakType
    });
    return response.data;
  },

  // Boosts
  async getBoosts(userId: string): Promise<{ success: boolean; data: BoostProfile }> {
    const response = await axiosInstance.get(`${API_BASE}/boosts/${userId}`);
    return response.data;
  },

  async activateBoost(userId: string, boostType: string, source?: string, duration?: number): Promise<{ success: boolean; data: BoostProfile }> {
    const response = await axiosInstance.post(`${API_BASE}/boosts/activate`, {
      userId,
      boostType,
      source: source || 'purchased',
      duration
    });
    return response.data;
  },

  async addBoostCredits(userId: string, amount: number): Promise<{ success: boolean; data: { boostCredits: number } }> {
    const response = await axiosInstance.post(`${API_BASE}/boosts/add-credits`, {
      userId,
      amount
    });
    return response.data;
  },

  async getBoostCosts(): Promise<{ success: boolean; data: { costs: Record<string, number>; durations: Record<string, number> } }> {
    const response = await axiosInstance.get(`${API_BASE}/boosts/costs`);
    return response.data;
  },

  // Objectives
  async createObjective(data: Partial<Objective>): Promise<{ success: boolean; data: Objective }> {
    const response = await axiosInstance.post(`${API_BASE}/objectives`, data);
    return response.data;
  },

  async getObjectives(userId: string, status?: string, odysseyId?: string, seasonId?: string): Promise<{ success: boolean; data: Objective[] }> {
    const response = await axiosInstance.get(`${API_BASE}/objectives/${userId}`, {
      params: { status, odysseyId, seasonId }
    });
    return response.data;
  },

  async getObjective(id: string): Promise<{ success: boolean; data: Objective }> {
    const response = await axiosInstance.get(`${API_BASE}/objectives/detail/${id}`);
    return response.data;
  },

  async completeObjective(id: string, autoDetected?: boolean, actualDuration?: number): Promise<{ success: boolean; data: Objective }> {
    const response = await axiosInstance.post(`${API_BASE}/objectives/${id}/complete`, {
      autoDetected,
      actualDuration
    });
    return response.data;
  },

  async updateObjective(id: string, updates: Partial<Objective>): Promise<{ success: boolean; data: Objective }> {
    const response = await axiosInstance.put(`${API_BASE}/objectives/${id}`, updates);
    return response.data;
  },

  async deleteObjective(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete(`${API_BASE}/objectives/${id}`);
    return response.data;
  },

  // Odysseys
  async createOdyssey(data: Partial<Odyssey>): Promise<{ success: boolean; data: Odyssey }> {
    const response = await axiosInstance.post(`${API_BASE}/odysseys`, data);
    return response.data;
  },

  async getOdysseys(userId: string, status?: string, organizationId?: string, seasonId?: string): Promise<{ success: boolean; data: Odyssey[] }> {
    const response = await axiosInstance.get(`${API_BASE}/odysseys/${userId}`, {
      params: { status, organizationId, seasonId }
    });
    return response.data;
  },

  async getOdyssey(id: string): Promise<{ success: boolean; data: Odyssey }> {
    const response = await axiosInstance.get(`${API_BASE}/odysseys/detail/${id}`);
    return response.data;
  },

  async addObjectiveToOdyssey(odysseyId: string, objectiveId: string): Promise<{ success: boolean; data: Odyssey }> {
    const response = await axiosInstance.post(`${API_BASE}/odysseys/${odysseyId}/objectives`, {
      objectiveId
    });
    return response.data;
  },

  async addMilestone(odysseyId: string, title: string, description?: string, momentumReward?: number): Promise<{ success: boolean; data: Odyssey }> {
    const response = await axiosInstance.post(`${API_BASE}/odysseys/${odysseyId}/milestones`, {
      title,
      description,
      momentumReward
    });
    return response.data;
  },

  async completeMilestone(odysseyId: string, milestoneId: string): Promise<{ success: boolean; data: Odyssey }> {
    const response = await axiosInstance.post(`${API_BASE}/odysseys/${odysseyId}/milestones/${milestoneId}/complete`);
    return response.data;
  },

  async updateOdyssey(id: string, updates: Partial<Odyssey>): Promise<{ success: boolean; data: Odyssey }> {
    const response = await axiosInstance.put(`${API_BASE}/odysseys/${id}`, updates);
    return response.data;
  },

  // Seasons
  async createSeason(data: Partial<Season>): Promise<{ success: boolean; data: Season }> {
    const response = await axiosInstance.post(`${API_BASE}/seasons`, data);
    return response.data;
  },

  async getSeasons(userId?: string, organizationId?: string, status?: string): Promise<{ success: boolean; data: Season[] }> {
    const response = await axiosInstance.get(`${API_BASE}/seasons`, {
      params: { userId, organizationId, status }
    });
    return response.data;
  },

  async getSeason(id: string): Promise<{ success: boolean; data: Season }> {
    const response = await axiosInstance.get(`${API_BASE}/seasons/${id}`);
    return response.data;
  },

  async addOdysseyToSeason(seasonId: string, odysseyId: string): Promise<{ success: boolean; data: Season }> {
    const response = await axiosInstance.post(`${API_BASE}/seasons/${seasonId}/odysseys`, {
      odysseyId
    });
    return response.data;
  },

  async enableSeasonBoost(seasonId: string, boostType: string, multiplier?: number, description?: string): Promise<{ success: boolean; data: Season }> {
    const response = await axiosInstance.post(`${API_BASE}/seasons/${seasonId}/boost`, {
      boostType,
      multiplier,
      description
    });
    return response.data;
  },

  async generateHighlights(seasonId: string): Promise<{ success: boolean; data: Season }> {
    const response = await axiosInstance.post(`${API_BASE}/seasons/${seasonId}/highlights`);
    return response.data;
  },

  // Rewards
  async createReward(data: Partial<Reward>): Promise<{ success: boolean; data: Reward }> {
    const response = await axiosInstance.post(`${API_BASE}/rewards`, data);
    return response.data;
  },

  async getRewards(userId: string, status?: string): Promise<{ success: boolean; data: Reward[] }> {
    const response = await axiosInstance.get(`${API_BASE}/rewards/${userId}`, {
      params: { status }
    });
    return response.data;
  },

  async claimReward(id: string): Promise<{ success: boolean; data: Reward }> {
    const response = await axiosInstance.post(`${API_BASE}/rewards/${id}/claim`);
    return response.data;
  },

  async getPendingRewardsCount(userId: string): Promise<{ success: boolean; data: { count: number } }> {
    const response = await axiosInstance.get(`${API_BASE}/rewards/${userId}/pending-count`);
    return response.data;
  }
};

