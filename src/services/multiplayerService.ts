/**
 * Multiplayer Collaboration Service
 * Handles real-time collaboration, duels, and team features
 */

import { Socket, io } from 'socket.io-client';

interface Collaborator {
  userId: string;
  [key: string]: any;
}

interface DuelState {
  id: string;
  participants: Array<{ userId: string; progress: number }>;
  challengeName?: string;
  startTime?: number;
  endTime?: number;
  [key: string]: any;
}

interface TeamState {
  teamId: string;
  members?: Collaborator[];
  mission?: any;
  [key: string]: any;
}

interface ChallengeConfig {
  challengeType?: string;
  duration?: number;
  [key: string]: any;
}

interface MissionConfig {
  name?: string;
  duration?: number;
  [key: string]: any;
}

type EventCallback = (data?: any) => void;

class MultiplayerService {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private currentRoom: string | null = null;
  private collaborators: Map<string, Collaborator> = new Map();
  private duelState: DuelState | null = null;
  private teamState: TeamState | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();

  /**
   * Initialize connection
   */
  connect(userId: string, token: string): void {
    if (this.socket && this.connected) {
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5100';
    this.socket = io(serverUrl, {
      auth: { token, userId },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.connected = true;
      this.emit('multiplayer:connected', { userId });
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      this.collaborators.clear();
    });

    this.socket.on('collaborator:joined', (data: Collaborator) => {
      this.collaborators.set(data.userId, data);
      this.emit('collaborator:update', Array.from(this.collaborators.values()));
    });

    this.socket.on('collaborator:left', (data: { userId: string }) => {
      this.collaborators.delete(data.userId);
      this.emit('collaborator:update', Array.from(this.collaborators.values()));
    });

    this.socket.on('collaboration:state', (data: any) => {
      this.emit('state:update', data);
    });

    this.socket.on('duel:invite', (data: any) => {
      this.emit('duel:invitation', data);
    });

    this.socket.on('duel:start', (data: DuelState) => {
      this.duelState = data;
      this.emit('duel:started', data);
    });

    this.socket.on('duel:update', (data: Partial<DuelState>) => {
      this.duelState = { ...this.duelState, ...data } as DuelState;
      this.emit('duel:progress', this.duelState);
    });

    this.socket.on('duel:end', (data: any) => {
      this.emit('duel:finished', data);
      this.duelState = null;
    });

    this.socket.on('team:joined', (data: TeamState) => {
      this.teamState = data;
      this.emit('team:update', data);
    });

    this.socket.on('team:mission:update', (data: any) => {
      this.emit('team:mission:progress', data);
    });
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.collaborators.clear();
    }
  }

  /**
   * Join collaboration room
   */
  joinCollaborationRoom(roomId: string, userId: string, userInfo?: any): void {
    if (!this.connected) {
      console.error('Not connected to server');
      return;
    }

    this.currentRoom = roomId;
    this.socket?.emit('collaboration:join', {
      roomId,
      userId,
      userInfo
    });
  }

  /**
   * Leave collaboration room
   */
  leaveCollaborationRoom(): void {
    if (this.currentRoom && this.socket) {
      this.socket.emit('collaboration:leave', { roomId: this.currentRoom });
      this.currentRoom = null;
    }
  }

  /**
   * Send collaboration update
   */
  sendCollaborationUpdate(update: any): void {
    if (this.currentRoom && this.socket) {
      this.socket.emit('collaboration:update', {
        roomId: this.currentRoom,
        update
      });
    }
  }

  /**
   * Challenge user to duel
   */
  challengeToDuel(targetUserId: string, challengeConfig?: ChallengeConfig): void {
    if (!this.connected) return;

    this.socket?.emit('duel:challenge', {
      targetUserId,
      challengeConfig,
      timestamp: Date.now()
    });
  }

  /**
   * Accept duel invitation
   */
  acceptDuel(duelId: string): void {
    if (!this.connected) return;

    this.socket?.emit('duel:accept', { duelId });
  }

  /**
   * Reject duel invitation
   */
  rejectDuel(duelId: string): void {
    if (!this.connected) return;

    this.socket?.emit('duel:reject', { duelId });
  }

  /**
   * Update duel progress
   */
  updateDuelProgress(progress: number): void {
    if (!this.connected || !this.duelState) return;

    this.socket?.emit('duel:progress', {
      duelId: this.duelState.id,
      progress
    });
  }

  /**
   * Join team/guild
   */
  joinTeam(teamId: string, userId: string): void {
    if (!this.connected) return;

    this.socket?.emit('team:join', { teamId, userId });
  }

  /**
   * Leave team
   */
  leaveTeam(teamId: string): void {
    if (!this.connected) return;

    this.socket?.emit('team:leave', { teamId });
  }

  /**
   * Start team mission
   */
  startTeamMission(teamId: string, missionConfig?: MissionConfig): void {
    if (!this.connected) return;

    this.socket?.emit('team:mission:start', {
      teamId,
      missionConfig
    });
  }

  /**
   * Update team mission progress
   */
  updateTeamMissionProgress(teamId: string, missionId: string, progress: number): void {
    if (!this.connected) return;

    this.socket?.emit('team:mission:progress', {
      teamId,
      missionId,
      progress
    });
  }

  /**
   * Get current collaborators
   */
  getCollaborators(): Collaborator[] {
    return Array.from(this.collaborators.values());
  }

  /**
   * Get current duel state
   */
  getDuelState(): DuelState | null {
    return this.duelState;
  }

  /**
   * Get current team state
   */
  getTeamState(): TeamState | null {
    return this.teamState;
  }

  /**
   * Event emitter/listener pattern
   */
  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback): void {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, data?: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
}

// Export singleton instance
export default new MultiplayerService();

