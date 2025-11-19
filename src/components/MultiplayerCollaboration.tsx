import React, { useState, useEffect } from 'react';
import { useMultiplayer } from '../hooks/useMultiplayer';
import './MultiplayerCollaboration.css';

interface Collaborator {
  userId: string;
  name?: string;
  color?: string;
  status?: string;
  [key: string]: any;
}

interface CollaboratorAvatarProps {
  collaborator: Collaborator;
  isCurrentUser?: boolean;
}

interface DuelProgressProps {
  duelState: {
    challengeName?: string;
    endTime?: number;
    participants?: Array<{
      userId?: string;
      name?: string;
      progress?: number;
    }>;
  } | null;
  currentUserId: string;
}

interface TeamMissionProps {
  teamState: {
    activeMission?: {
      name?: string;
      overallProgress?: number;
      contributions?: Array<{
        userId?: string;
        points?: number;
      }>;
    };
    members?: Array<{
      userId?: string;
      name?: string;
    }>;
  } | null;
  currentUserId: string;
}

interface MultiplayerCollaborationProps {
  roomId: string;
  currentUserId: string;
  currentUserName: string;
  mode?: 'collaboration' | 'duel' | 'team';
}

interface Invitation {
  id: string;
  fromUserName?: string;
  challengeConfig?: {
    challengeType?: string;
    duration?: number;
  };
  [key: string]: any;
}

/**
 * Collaborator Avatar Component
 */
function CollaboratorAvatar({ collaborator, isCurrentUser = false }: CollaboratorAvatarProps) {
  return (
    <div className={`collaborator-avatar ${isCurrentUser ? 'current-user' : ''}`}>
      <div 
        className="avatar-circle"
        style={{ backgroundColor: collaborator.color || '#6366f1' }}
      >
        {collaborator.name?.charAt(0).toUpperCase() || 'U'}
      </div>
      <div className="avatar-name">{collaborator.name || 'Unknown'}</div>
      {collaborator.status && (
        <div className={`avatar-status ${collaborator.status}`}>
          {collaborator.status}
        </div>
      )}
    </div>
  );
}

/**
 * Duel Progress Component
 */
function DuelProgress({ duelState, currentUserId }: DuelProgressProps) {
  if (!duelState) return null;

  const currentUserProgress = duelState.participants?.find(p => p.userId === currentUserId);
  const opponentProgress = duelState.participants?.find(p => p.userId !== currentUserId);

  return (
    <div className="duel-progress">
      <h3>Duel: {duelState.challengeName || 'Challenge'}</h3>
      <div className="duel-participants">
        <div className="participant">
          <div className="participant-name">You</div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${currentUserProgress?.progress || 0}%` }}
            />
          </div>
          <div className="progress-text">{currentUserProgress?.progress || 0}%</div>
        </div>
        <div className="vs-divider">VS</div>
        <div className="participant">
          <div className="participant-name">{opponentProgress?.name || 'Opponent'}</div>
          <div className="progress-bar">
            <div 
              className="progress-fill opponent"
              style={{ width: `${opponentProgress?.progress || 0}%` }}
            />
          </div>
          <div className="progress-text">{opponentProgress?.progress || 0}%</div>
        </div>
      </div>
      {duelState.endTime && (
        <div className="duel-timer">
          Time remaining: {Math.max(0, Math.floor((duelState.endTime - Date.now()) / 1000))}s
        </div>
      )}
    </div>
  );
}

/**
 * Team Mission Component
 */
function TeamMission({ teamState, currentUserId }: TeamMissionProps) {
  if (!teamState || !teamState.activeMission) return null;

  const mission = teamState.activeMission;
  const userContribution = mission.contributions?.find(c => c.userId === currentUserId);

  return (
    <div className="team-mission">
      <h3>Team Mission: {mission.name || 'Mission'}</h3>
      <div className="mission-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${mission.overallProgress || 0}%` }}
          />
        </div>
        <div className="progress-text">{mission.overallProgress || 0}% Complete</div>
      </div>
      <div className="team-members">
        {teamState.members?.map(member => (
          <div key={member.userId} className="team-member">
            <div className="member-name">{member.name || 'Member'}</div>
            <div className="member-contribution">
              {mission.contributions?.find(c => c.userId === member.userId)?.points || 0} pts
            </div>
          </div>
        ))}
      </div>
      {userContribution && (
        <div className="your-contribution">
          Your contribution: {userContribution.points || 0} points
        </div>
      )}
    </div>
  );
}

/**
 * Main Multiplayer Collaboration Component
 */
const MultiplayerCollaboration: React.FC<MultiplayerCollaborationProps> = ({ 
  roomId, 
  currentUserId, 
  currentUserName,
  mode = 'collaboration'
}) => {
  const {
    connected,
    collaborators,
    duelState,
    teamState,
    joinRoom,
    leaveRoom,
    sendUpdate,
    challengeToDuel,
    acceptDuel,
    updateDuelProgress,
    startTeamMission
  } = useMultiplayer();

  const [showCollaborators, setShowCollaborators] = useState<boolean>(true);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    if (roomId && currentUserId) {
      joinRoom(roomId, currentUserId, { name: currentUserName });
    }

    return () => {
      if (roomId) {
        leaveRoom();
      }
    };
  }, [roomId, currentUserId, currentUserName, joinRoom, leaveRoom]);

  useEffect(() => {
    const handleInvitation = (invitation: Invitation) => {
      setInvitations(prev => [...prev, invitation]);
    };

    const handleDuelStart = (duel: any) => {
      setInvitations(prev => prev.filter(inv => inv.id !== duel.id));
    };

    // Subscribe to multiplayer events
    const multiplayer = require('../services/multiplayerService').default;
    multiplayer.on('duel:invitation', handleInvitation);
    multiplayer.on('duel:started', handleDuelStart);

    return () => {
      multiplayer.off('duel:invitation', handleInvitation);
      multiplayer.off('duel:started', handleDuelStart);
    };
  }, []);

  const handleChallenge = (targetUserId: string): void => {
    challengeToDuel(targetUserId, {
      challengeType: 'time_attack',
      duration: 15 * 60 * 1000, // 15 minutes
      difficulty: 'medium'
    });
  };

  const handleAcceptInvitation = (invitationId: string): void => {
    acceptDuel(invitationId);
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
  };

  return (
    <div className="multiplayer-collaboration">
      {!connected && (
        <div className="connection-status">
          <div className="status-indicator disconnected" />
          Connecting to multiplayer server...
        </div>
      )}

      {connected && (
        <>
          {/* Collaboration Mode */}
          {mode === 'collaboration' && (
            <div className="collaboration-panel">
              <div className="panel-header">
                <h3>Collaborators</h3>
                <button 
                  onClick={() => setShowCollaborators(!showCollaborators)}
                  className="toggle-btn"
                >
                  {showCollaborators ? '−' : '+'}
                </button>
              </div>
              {showCollaborators && (
                <div className="collaborators-list">
                  {collaborators.map(collab => (
                    <CollaboratorAvatar
                      key={collab.userId}
                      collaborator={collab}
                      isCurrentUser={collab.userId === currentUserId}
                    />
                  ))}
                  {collaborators.length === 0 && (
                    <div className="no-collaborators">
                      No other collaborators in this room
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Duel Mode */}
          {mode === 'duel' && (
            <div className="duel-panel">
              {duelState ? (
                <DuelProgress duelState={duelState} currentUserId={currentUserId} />
              ) : (
                <div className="duel-setup">
                  <h3>Start a Duel</h3>
                  <p>Challenge another user to a productivity duel!</p>
                  <button 
                    className="challenge-btn"
                    onClick={() => {
                      // This would open a user selector
                      console.log('Open user selector');
                    }}
                  >
                    Challenge User
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Team Mode */}
          {mode === 'team' && (
            <div className="team-panel">
              {teamState ? (
                <TeamMission teamState={teamState} currentUserId={currentUserId} />
              ) : (
                <div className="team-setup">
                  <h3>Join a Team</h3>
                  <p>Collaborate with your team on missions!</p>
                  <button 
                    className="join-team-btn"
                    onClick={() => {
                      // This would open team selector
                      console.log('Open team selector');
                    }}
                  >
                    Join Team
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Duel Invitations */}
          {invitations.length > 0 && (
            <div className="invitations-panel">
              <h4>Duel Invitations</h4>
              {invitations.map(invitation => (
                <div key={invitation.id} className="invitation-card">
                  <div className="invitation-info">
                    <strong>{invitation.fromUserName || 'Someone'}</strong> challenged you!
                    <div className="invitation-details">
                      Challenge: {invitation.challengeConfig?.challengeType || 'Unknown'}
                      Duration: {invitation.challengeConfig?.duration ? Math.floor(invitation.challengeConfig.duration / 60000) : 0} min
                    </div>
                  </div>
                  <div className="invitation-actions">
                    <button 
                      className="accept-btn"
                      onClick={() => handleAcceptInvitation(invitation.id)}
                    >
                      Accept
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => setInvitations(prev => prev.filter(inv => inv.id !== invitation.id))}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MultiplayerCollaboration;

