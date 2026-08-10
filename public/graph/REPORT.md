# Deepiri Codebase Intelligence Report

Generated: 8/10/2026, 7:06:06 PM

## Overview

| Metric | Value |
|--------|-------|
| Total Files | 60 |
| Total Relationships | 25 |
| Categories | 5 |
| External Dependencies | 20 |

## File Distribution

| Category | Count |
|----------|-------|
| module | 25 |
| page | 19 |
| hook | 7 |
| utility | 5 |
| component | 4 |

## Relationship Types

| Type | Count |
|------|-------|
| imports | 25 |

## Top Hub Files (Most Connected)

| Rank | File | Category | Lines | Connections |
|------|------|----------|-------|-------------|
| 1 | platformClient | module | 65 | 6 |
| 2 | query | module | 3 | 4 |
| 3 | TrussDashboard | page | 294 | 4 |
| 4 | App | component | 17 | 3 |
| 5 | Router | module | 85 | 3 |
| 6 | JobsDashboard | page | 185 | 3 |
| 7 | RegistryDashboard | page | 177 | 3 |
| 8 | TelemetryDashboard | page | 207 | 3 |
| 9 | jobsService | module | 58 | 2 |
| 10 | registryService | module | 45 | 2 |
| 11 | telemetryService | module | 41 | 2 |
| 12 | trussService | module | 105 | 2 |
| 13 | api | utility | 12 | 2 |
| 14 | ui | utility | 14 | 2 |
| 15 | App.test | module | 19 | 1 |

## External Dependencies

| Package | Used By |
|---------|---------|
| react | 21 files |
| framer-motion | 17 files |
| react-router-dom | 16 files |
| @deepiri/shared | 10 files |
| lucide-react | 7 files |
| react-query | 5 files |
| zustand | 5 files |
| socket.io-client | 3 files |
| @react-three/fiber | 2 files |
| @react-three/drei | 2 files |
| three | 2 files |
| axios | 2 files |
| zustand/middleware | 2 files |
| vitest | 1 files |
| @testing-library/react | 1 files |
| d3-selection | 1 files |
| d3-force | 1 files |
| d3-drag | 1 files |
| d3-zoom | 1 files |
| react-dom/client | 1 files |

## Key Connections

### module

- **App.test** — 19 lines → imports: App
- **AuthGuard** — 37 lines → imports: AuthGuard
- **Router** — 85 lines → imports: Router, AuthGuard, Shell
- **Shell** — 45 lines → imports: Shell
- **onboardingSteps** — 83 lines
- **query** — 3 lines → imports: query, query, query, query
- **main** — 320 lines
- **SceneControls** — 204 lines
- **ServicePanel** — 70 lines
- **Planet** — 68 lines → imports: Planet
- ...and 15 more

### component

- **App** — 17 lines → imports: App, Router, App
- **CyrexSidebar** — 121 lines
- **Sidebar** — 100 lines
- **Topbar** — 185 lines

### hook

- **useEventStream** — 57 lines
- **useGraphData** — 55 lines
- **useHealthPoll** — 74 lines
- **useImmersiveStatus** — 15 lines
- **usePresence** — 96 lines
- **useHubConnection** — 90 lines
- **usePortalAuth** — 16 lines

### page

- **AIWorkspace** — 12 lines
- **CodebaseGraph** — 803 lines
- **Contact** — 151 lines
- **DependencyMap** — 12 lines
- **EventRiver** — 12 lines
- **Home** — 83 lines
- **ImmersivePage** — 27 lines
- **Launchpad** — 12 lines
- **Login** — 91 lines
- **Onboarding** — 12 lines
- ...and 9 more

### utility

- **api** — 12 lines → imports: api, api
- **apiHelpers** — 69 lines
- **date** — 11 lines → imports: date
- **graphConstants** — 27 lines
- **ui** — 14 lines → imports: ui, ui

