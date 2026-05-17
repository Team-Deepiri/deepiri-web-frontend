# Quick Start: Deepiri Gamification System

## 🎮 What's Been Built

A complete gamification system with:
- **Momentum (XP) System** - Level up through work activities
- **Streaks** - Track consistency (daily, weekly, project, PR, healthy)
- **Boosts** - Temporary power-ups (Focus, Velocity, Clarity, Debug, Cleanup)
- **Objectives** - Tasks with momentum rewards
- **Odysseys** - Project workflows with milestones
- **Seasons** - Sprint cycles with highlights
- **Rewards** - Earned from streaks and milestones

## 🚀 Access the Pages

All pages are now available at:
- `/objectives` - Create and manage objectives
- `/progress` - View momentum, levels, and skill mastery
- `/boosts` - Activate and manage boosts
- `/streaks` - View and cash in streaks
- `/gamification` - Main gamification dashboard

## 📡 API Endpoints

All endpoints are available at `/api/gamification/*`:

### Momentum
- `GET /api/gamification/momentum/:userId` - Get momentum profile
- `POST /api/gamification/momentum/award` - Award momentum
- `GET /api/gamification/momentum/ranking` - Get leaderboard

### Streaks
- `GET /api/gamification/streaks/:userId` - Get streaks
- `POST /api/gamification/streaks/update` - Update streak
- `POST /api/gamification/streaks/cash-in` - Cash in streak

### Boosts
- `GET /api/gamification/boosts/:userId` - Get boost profile
- `POST /api/gamification/boosts/activate` - Activate boost
- `POST /api/gamification/boosts/add-credits` - Add credits

### Objectives
- `POST /api/gamification/objectives` - Create objective
- `GET /api/gamification/objectives/:userId` - Get objectives
- `POST /api/gamification/objectives/:id/complete` - Complete objective

## 💻 Using the API Client

```typescript
import { gamificationApi } from './api/gamificationApi';

// Get momentum
const momentum = await gamificationApi.getMomentum(userId);

// Create objective
await gamificationApi.createObjective({
  userId,
  title: 'Build login system',
  momentumReward: 50
});

// Activate boost
await gamificationApi.activateBoost(userId, 'focus', 'purchased');

// Cash in streak
await gamificationApi.cashInStreak(userId, 'daily');
```

## 🔗 Integration Points

### Task Completion
When a task is completed, call:
```typescript
await gamificationApi.awardMomentum(userId, 10, 'tasks');
await gamificationApi.updateStreak(userId, 'daily');
```

### Commit/PR
When code is committed:
```typescript
await gamificationApi.awardMomentum(userId, 5, 'commits');
await gamificationApi.updateStreak(userId, 'pr');
```

## 🎯 Next Steps

1. **Integrate with Task Service** - Auto-award momentum on task completion
2. **Add Real-time Updates** - Socket.IO events for momentum/streak changes
3. **Create Odysseys & Seasons Pages** - Full project workflow UI
4. **Update Dashboard** - Add gamification widgets
5. **Add Webhooks** - GitHub/commit integration

## 📝 Notes

- All data is stored in MongoDB
- Services are in TypeScript with proper error handling
- Frontend uses React + TypeScript + Framer Motion
- API client handles authentication automatically

