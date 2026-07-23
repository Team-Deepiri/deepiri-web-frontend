# Deepiri Codebase Intelligence Report

Generated: 7/28/2026, 5:08:51 PM

## Overview

| Metric | Value |
|--------|-------|
| Total Files | 123 |
| Total Relationships | 196 |
| Categories | 11 |
| External Dependencies | 21 |

## File Distribution

| Category | Count |
|----------|-------|
| page | 47 |
| component | 24 |
| module | 14 |
| api module | 14 |
| utility | 7 |
| context | 4 |
| type definition | 4 |
| gamification component | 3 |
| hook | 3 |
| chat component | 2 |
| chat widget | 1 |

## Relationship Types

| Type | Count |
|------|-------|
| imports | 179 |
| imports-external | 17 |

## Top Hub Files (Most Connected)

| Rank | File | Category | Lines | Connections |
|------|------|----------|-------|-------------|
| 1 | App | module | 447 | 55 |
| 2 | AuthContext | context | 205 | 35 |
| 3 | common | type-definition | 32 | 10 |
| 4 | gamificationApi | api-module | 451 | 9 |
| 5 | AdventureContext | context | 309 | 9 |
| 6 | Dashboard | page | 435 | 8 |
| 7 | axiosInstance | api-module | 42 | 7 |
| 8 | adventureApi | api-module | 195 | 6 |
| 9 | eventApi | api-module | 147 | 6 |
| 10 | externalApi | api-module | 113 | 6 |
| 11 | AdventureGenerator | page | 518 | 6 |
| 12 | Events | page | 477 | 6 |
| 13 | CreateEvent | page | 356 | 5 |
| 14 | ImmersiveWorkspace | page | 98 | 5 |
| 15 | documentService | module | 230 | 5 |

## External Dependencies

| Package | Used By |
|---------|---------|
| react | 88 files |
| framer-motion | 43 files |
| react-hot-toast | 31 files |
| react-router-dom | 27 files |
| axios | 16 files |
| lucide-react | 5 files |
| @heroicons/react | 4 files |
| react-query | 3 files |
| vitest | 2 files |
| firebase/firestore | 2 files |
| socket.io-client | 2 files |
| firebase/app | 2 files |
| firebase/auth | 2 files |
| @testing-library/react | 2 files |
| react-icons/fi | 1 files |
| @react-three/fiber | 1 files |
| @react-three/drei | 1 files |
| firebase/analytics | 1 files |
| firebase/storage | 1 files |
| react-dom/client | 1 files |

## Key Connections

### module

- **App.test** — 22 lines → imports: documentService
- **App** — 447 lines → imports: AuthContext, WebPushContext, SocketContext, AdventureContext, ProtectedRoute
- **declarations.d** — 43 lines
- **firebase** — 44 lines → imports: firebase
- **firebaseClient** — 21 lines
- **main** — 14 lines → imports: App
- **reportWebVitals** — 17 lines
- **documentService** — 230 lines → imports: documentService, documentService, documentService, documentApi, document
- **multiplayerService** — 313 lines → imports: multiplayerService, multiplayerService
- **virtualEnvironmentService** — 276 lines → imports: virtualEnvironmentService
- ...and 4 more

### api module

- **adventureApi** — 195 lines → imports: common, adventureApi, adventureApi, adventureApi, adventureApi
- **agentApi** — 69 lines
- **authApi** — 127 lines → imports: authApi
- **axiosInstance** — 42 lines → imports: axiosInstance, axiosInstance, axiosInstance, axiosInstance, axiosInstance
- **documentApi** — 121 lines → imports: axiosInstance, document, documentApi
- **eventApi** — 147 lines → imports: axiosInstance, common, eventApi, eventApi, eventApi
- **externalApi** — 113 lines → imports: axiosInstance, common, externalApi, externalApi, externalApi
- **firebaseApi** — 36 lines → imports: firebase
- **gamificationApi** — 451 lines → imports: axiosInstance, gamificationApi, gamificationApi, gamificationApi, gamificationApi
- **groupChatApi** — 17 lines → imports: chat, groupChatApi
- ...and 4 more

### component

- **AccessibleModal** — 116 lines → imports: AccessibleModal
- **AddItemModal** — 649 lines → imports: userItemsApi
- **Alert** — 183 lines
- **Button** — 69 lines → imports: Button
- **Card** — 67 lines → imports: Card
- **ErrorBoundary** — 104 lines → imports: ErrorBoundary, logger
- **Footer** — 150 lines → imports: Footer, AuthContext
- **GoogleSignInButton** — 99 lines
- **HMRStatus** — 39 lines → imports: HMRStatus
- **IconManager** — 75 lines
- ...and 14 more

### chat widget

- **ChatWidget** — 11 lines → imports: ChatWidget

### chat component

- **GroupChatItem** — 30 lines → imports: chat, GroupChatItem
- **MessageInput** — 54 lines → imports: Button, MessageInput, MessageInput

### gamification component

- **BoostCard** — 122 lines → imports: gamificationApi, BoostCard
- **MomentumBar** — 44 lines → imports: MomentumBar
- **StreakCard** — 89 lines → imports: gamificationApi, StreakCard

### context

- **AdventureContext** — 309 lines → imports: AdventureContext, AuthContext, adventureApi, common, AdventureContext
- **AuthContext** — 205 lines → imports: AuthContext, AuthContext, AuthContext, AuthContext, AuthContext
- **SocketContext** — 193 lines → imports: SocketContext, AuthContext, SocketContext
- **WebPushContext** — 182 lines → imports: WebPushContext, AuthContext, notificationApi, webPush

### hook

- **useGraphData** — 55 lines
- **useMultiplayer** — 149 lines → imports: useMultiplayer, multiplayerService
- **useVirtualEnvironment** — 73 lines → imports: useVirtualEnvironment, virtualEnvironmentService, useVirtualEnvironment

### page

- **About** — 171 lines → imports: About
- **AdventureDetail** — 519 lines → imports: AdventureDetail, AuthContext, adventureApi, eventApi
- **AdventureGenerator** — 518 lines → imports: AdventureGenerator, AuthContext, AdventureContext, adventureApi, externalApi
- **AdventureHistory** — 398 lines → imports: AdventureHistory, AuthContext, adventureApi
- **AgentChat** — 152 lines → imports: AgentChat, externalApi, MessageInput
- **AnalyticsDashboard** — 247 lines → imports: AnalyticsDashboard, AuthContext
- **Boosts** — 144 lines → imports: Boosts, AuthContext, gamificationApi, BoostCard
- **Challenges** — 333 lines → imports: Challenges, AuthContext
- **CodebaseGraph** — 797 lines → imports: CodebaseGraph
- **ComponentShowcase** — 47 lines → imports: ComponentShowcase, Card, SectionDivider
- ...and 37 more

### type definition

- **chat** — 6 lines → imports: chat, chat, chat
- **common** — 32 lines → imports: common, common, common, common, common
- **document** — 28 lines → imports: document, document, document, document
- **react-hot-toast.d** — 22 lines

### utility

- **apiHelpers** — 53 lines
- **googleOAuth** — 161 lines
- **graphConstants** — 27 lines → imports: graphConstants
- **logger** — 395 lines → imports: logger, logger, logger
- **secureLogger** — 58 lines → imports: logger
- **testHelpers** — 268 lines → imports: AuthContext, SocketContext, AdventureContext
- **webPush** — 141 lines → imports: webPush

