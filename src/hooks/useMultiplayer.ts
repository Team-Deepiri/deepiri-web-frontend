import { useState, useEffect, useCallback } from 'react';
import multiplayerService from '../services/multiplayerService';

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

/**
 * Hook for managing multiplayer state
 */
export function useMultiplayer() {
  const [connected, setConnected] = useState<boolean>(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [duelState, setDuelState] = useState<DuelState | null>(null);
  const [teamState, setTeamState] = useState<TeamState | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');

    if (userId && token) {
      multiplayerService.connect(userId, token);
    }

    // Set up event listeners
    const handleConnected = () => setConnected(true);
    const handleDisconnected = () => {
      setConnected(false);
      setCollaborators([]);
    };
    const handleCollaboratorUpdate = (collabs: Collaborator[]) => setCollaborators(collabs);
    const handleDuelStarted = (duel: DuelState) => setDuelState(duel);
    const handleDuelProgress = (duel: DuelState) => setDuelState(duel);
    const handleDuelFinished = () => setDuelState(null);
    const handleTeamUpdate = (team: TeamState) => setTeamState(team);

    multiplayerService.on('multiplayer:connected', handleConnected);
    multiplayerService.on('disconnect', handleDisconnected);
    multiplayerService.on('collaborator:update', handleCollaboratorUpdate);
    multiplayerService.on('duel:started', handleDuelStarted);
    multiplayerService.on('duel:progress', handleDuelProgress);
    multiplayerService.on('duel:finished', handleDuelFinished);
    multiplayerService.on('team:update', handleTeamUpdate);

    return () => {
      multiplayerService.off('multiplayer:connected', handleConnected);
      multiplayerService.off('disconnect', handleDisconnected);
      multiplayerService.off('collaborator:update', handleCollaboratorUpdate);
      multiplayerService.off('duel:started', handleDuelStarted);
      multiplayerService.off('duel:progress', handleDuelProgress);
      multiplayerService.off('duel:finished', handleDuelFinished);
      multiplayerService.off('team:update', handleTeamUpdate);
      multiplayerService.disconnect();
    };
  }, []);

  const joinRoom = useCallback((roomId: string, userId: string, userInfo?: any) => {
    multiplayerService.joinCollaborationRoom(roomId, userId, userInfo);
  }, []);

  const leaveRoom = useCallback(() => {
    multiplayerService.leaveCollaborationRoom();
  }, []);

  const sendUpdate = useCallback((update: any) => {
    multiplayerService.sendCollaborationUpdate(update);
  }, []);

  const challengeToDuel = useCallback((targetUserId: string, challengeConfig?: ChallengeConfig) => {
    multiplayerService.challengeToDuel(targetUserId, challengeConfig);
  }, []);

  const acceptDuel = useCallback((duelId: string) => {
    multiplayerService.acceptDuel(duelId);
  }, []);

  const rejectDuel = useCallback((duelId: string) => {
    multiplayerService.rejectDuel(duelId);
  }, []);

  const updateDuelProgress = useCallback((progress: number) => {
    multiplayerService.updateDuelProgress(progress);
  }, []);

  const joinTeam = useCallback((teamId: string, userId: string) => {
    multiplayerService.joinTeam(teamId, userId);
  }, []);

  const leaveTeam = useCallback((teamId: string) => {
    multiplayerService.leaveTeam(teamId);
  }, []);

  const startTeamMission = useCallback((teamId: string, missionConfig?: MissionConfig) => {
    multiplayerService.startTeamMission(teamId, missionConfig);
  }, []);

  const updateTeamMissionProgress = useCallback((teamId: string, missionId: string, progress: number) => {
    multiplayerService.updateTeamMissionProgress(teamId, missionId, progress);
  }, []);

  return {
    connected,
    collaborators,
    duelState,
    teamState,
    joinRoom,
    leaveRoom,
    sendUpdate,
    challengeToDuel,
    acceptDuel,
    rejectDuel,
    updateDuelProgress,
    joinTeam,
    leaveTeam,
    startTeamMission,
    updateTeamMissionProgress
  };
}

