# Deepiri Web Frontend - Complete Developer Onboarding Guide

> **Welcome!** This guide is designed to get you up to speed quickly, even if you're new to React, TypeScript, or modern frontend development. We'll cover everything from setup to debugging to testing.

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites & Setup](#prerequisites--setup)
3. [Project Architecture](#project-architecture)
4. [Development Workflow](#development-workflow)
5. [Key Technologies Explained](#key-technologies-explained)
6. [Browser Developer Tools Mastery](#browser-developer-tools-mastery)
7. [Testing Guide](#testing-guide)
8. [Component Development](#component-development)
9. [API Integration](#api-integration)
10. [Common Patterns & Best Practices](#common-patterns--best-practices)
11. [Troubleshooting](#troubleshooting)
12. [Resources for Learning](#resources-for-learning)

---

## 🎯 Project Overview

**Deepiri** is a gamified productivity platform that transforms work into an engaging experience. The frontend is built with modern React, TypeScript, and Vite, providing a fast, interactive user experience.

### What This Project Does

- **Gamification System**: Tracks momentum (XP), streaks, boosts, objectives, odysseys, and seasons
- **Real-time Collaboration**: Socket.IO for live updates and notifications
- **Task Management**: AI-powered task generation and tracking
- **Analytics Dashboard**: Visual insights into productivity metrics
- **Social Features**: Friends, leaderboards, and team collaboration

### Tech Stack Summary

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool (faster than Create React App)
- **React Router** - Navigation
- **React Query** - Server state management
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Framer Motion** - Animations
- **Vitest** - Testing framework

---

## 🚀 Prerequisites & Setup

### Required Knowledge (Don't Worry, We'll Teach You!)

**Minimum:**
- Basic HTML, CSS, JavaScript
- Understanding of functions, objects, arrays

**Helpful but Not Required:**
- React basics (we'll cover it)
- TypeScript basics (we'll cover it)
- Node.js/npm basics

### Installation Steps

#### 1. Install Node.js

Download and install [Node.js 18+](https://nodejs.org/) (LTS version recommended).

Verify installation:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

#### 2. Clone and Install Dependencies

```bash
# Navigate to the frontend directory
cd deepiri/deepiri-web-frontend

# Install dependencies
npm install

# If you encounter peer dependency issues:
npm install --legacy-peer-deps
```

#### 3. Environment Setup

Copy the example environment file:
```bash
cp env.example.frontend .env
```

Edit `.env` with your configuration:
```env
VITE_API_URL=http://localhost:5000/api
VITE_CYREX_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-domain-here
# ... other Firebase config
```

#### 4. Start Development Server

```bash
# Standard development mode
npm run dev

# Fast mode (skips some checks)
npm run dev:fast

# Debug mode (verbose logging)
npm run dev:debug
```

The app will be available at **http://localhost:5173**

---

## 🏗️ Project Architecture

### Folder Structure

```
deepiri-web-frontend/
├── src/
│   ├── api/              # API client functions
│   │   ├── axiosInstance.ts    # Axios configuration
│   │   ├── authApi.ts          # Authentication endpoints
│   │   ├── gamificationApi.ts  # Gamification endpoints
│   │   └── ...
│   │
│   ├── components/       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Navbar.tsx
│   │   ├── gamification/  # Gamification-specific components
│   │   └── ...
│   │
│   ├── contexts/         # React Context providers
│   │   ├── AuthContext.tsx      # Authentication state
│   │   ├── SocketContext.tsx     # WebSocket connections
│   │   └── ...
│   │
│   ├── hooks/            # Custom React hooks
│   │   ├── useMultiplayer.ts
│   │   └── ...
│   │
│   ├── pages/            # Page components (routes)
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   └── ...
│   │
│   ├── services/         # Business logic services
│   │   ├── multiplayerService.ts
│   │   └── ...
│   │
│   ├── styles/           # Global CSS files
│   │   ├── index.css
│   │   ├── App.css
│   │   └── ...
│   │
│   ├── tests/            # Test files
│   │   └── components.test.jsx
│   │
│   ├── types/            # TypeScript type definitions
│   │   └── common.ts
│   │
│   ├── utils/            # Utility functions
│   │   ├── logger.ts
│   │   └── testHelpers.tsx
│   │
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Application entry point
│
├── public/               # Static assets
├── dist/                 # Production build output
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

### Key Concepts

#### 1. **Pages vs Components**
- **Pages** (`src/pages/`): Full page views, usually correspond to routes
- **Components** (`src/components/`): Reusable UI pieces used across pages

#### 2. **Contexts (State Management)**
React Context provides global state without prop drilling:
- `AuthContext`: User authentication state
- `SocketContext`: Real-time WebSocket connections
- `AdventureContext`: Adventure/gamification state

#### 3. **API Layer**
All backend communication goes through:
- `axiosInstance.ts`: Configured Axios client with interceptors
- Individual API files: Organized by feature (auth, gamification, etc.)

---

## 💻 Development Workflow

### Daily Development Process

1. **Start the dev server**
   ```bash
   npm run dev
   ```

2. **Make changes** - Vite's HMR (Hot Module Replacement) will automatically refresh

3. **Check the browser console** - Errors and warnings appear here

4. **Use React DevTools** - Install the [React DevTools browser extension](https://react.dev/learn/react-developer-tools)

5. **Run tests** (we'll cover this later)
   ```bash
   npm test
   ```

### Code Organization Principles

1. **One component per file** - Each component gets its own `.tsx` file
2. **Co-locate related code** - Keep styles, tests, and components together when possible
3. **Use TypeScript** - Type everything for better IDE support and fewer bugs
4. **Follow naming conventions**:
   - Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
   - Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
   - Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)

### Git Workflow

```bash
# Create a new branch for your feature
git checkout -b feature/your-feature-name

# Make your changes, then:
git add .
git commit -m "feat: add user profile page"

# Push and create a pull request
git push origin feature/your-feature-name
```

---

## 🔧 Key Technologies Explained

### React Basics (Quick Primer)

#### What is React?
React is a library for building user interfaces using **components** - reusable pieces of UI.

#### Component Example

```tsx
// Simple component
function Welcome({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

// Usage
<Welcome name="Alice" />
```

#### Hooks (React's Way to Add Functionality)

**useState** - Manage component state:
```tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

**useEffect** - Run code after render (API calls, subscriptions):
```tsx
import { useEffect, useState } from 'react';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Fetch user data when component mounts or userId changes
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]); // Dependency array - re-run when userId changes
  
  if (!user) return <div>Loading...</div>;
  return <div>{user.name}</div>;
}
```

### TypeScript Basics

TypeScript adds **types** to JavaScript to catch errors early.

```tsx
// JavaScript (no types)
function greet(name) {
  return `Hello, ${name}`;
}

// TypeScript (with types)
function greet(name: string): string {
  return `Hello, ${name}`;
}

// Interface (defining object shapes)
interface User {
  id: string;
  name: string;
  email: string;
  age?: number; // Optional property
}

function displayUser(user: User) {
  console.log(user.name);
}
```

### React Query (Server State Management)

React Query handles fetching, caching, and synchronizing server state.

```tsx
import { useQuery } from 'react-query';
import { gamificationApi } from '../api/gamificationApi';

function MomentumDisplay() {
  // React Query automatically handles loading, error, and data states
  const { data, isLoading, error } = useQuery(
    'momentum', // Cache key
    () => gamificationApi.getMomentum() // Fetch function
  );
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading momentum</div>;
  
  return <div>Momentum: {data.momentum}</div>;
}
```

### React Router (Navigation)

```tsx
import { Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
```

---

## 🛠️ Browser Developer Tools Mastery

The browser DevTools are your best friend for debugging. Here's how to use them effectively.

### Opening DevTools

- **Chrome/Edge**: `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Safari**: Enable in Preferences → Advanced → "Show Develop menu"

### Essential Tabs

#### 1. **Console Tab** - Your Debugging Hub

**Viewing Logs:**
```javascript
// In your code:
console.log('User clicked button', { userId: 123 });
console.warn('This is a warning');
console.error('This is an error');
console.table([{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]);
```

**Interactive Console:**
- Type JavaScript directly to test code
- Access global variables: `window`, `document`, `localStorage`
- Inspect React components: Install React DevTools, then `$r` in console

**Filtering:**
- Click the filter icon to show only errors, warnings, or logs
- Use the search box to find specific messages

#### 2. **Elements Tab** - Inspect the DOM

**Inspecting Elements:**
1. Click the element selector (top-left icon) or press `Ctrl+Shift+C`
2. Hover over elements on the page
3. Click to select and inspect

**What You Can Do:**
- **Edit HTML/CSS live**: Right-click → "Edit as HTML" or modify styles in the right panel
- **See computed styles**: View final CSS after all rules applied
- **Check accessibility**: Look for ARIA labels, semantic HTML
- **Find React component**: With React DevTools, see which component rendered this element

**Finding Elements:**
```javascript
// In console:
document.querySelector('.my-class')  // First match
document.querySelectorAll('.my-class')  // All matches
$('.my-class')  // jQuery-style (if available)
```

#### 3. **Network Tab** - Monitor API Calls

**What to Look For:**
- **Request/Response**: See what data is sent and received
- **Status codes**: 200 = success, 404 = not found, 500 = server error
- **Timing**: How long requests take
- **Headers**: Authentication tokens, content types

**Filtering:**
- XHR/Fetch: API calls
- JS: JavaScript files
- CSS: Stylesheets
- Img: Images

**Debugging Failed Requests:**
1. Click the failed request (red status)
2. Check "Headers" tab for request details
3. Check "Response" tab for error message
4. Check "Preview" tab for formatted JSON

**Example Debugging:**
```javascript
// In console, intercept fetch calls:
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch called:', args);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('Response:', response);
      return response;
    });
};
```

#### 4. **Sources Tab** - Debug JavaScript

**Setting Breakpoints:**
1. Open Sources tab
2. Navigate to your file (e.g., `src/components/Button.tsx`)
3. Click line number to set breakpoint
4. Refresh page - execution pauses at breakpoint

**Debugging Controls:**
- **Resume** (F8): Continue execution
- **Step Over** (F10): Execute current line, don't enter functions
- **Step Into** (F11): Enter function calls
- **Step Out** (Shift+F11): Exit current function

**Watch Expressions:**
- Add variables to watch their values change
- Right-click variable → "Add to watch"

**Call Stack:**
- See the chain of function calls that led to current point

#### 5. **Application Tab** - Storage & Data

**Local Storage:**
- View stored data (tokens, user info)
- Right-click to edit/delete
- In console: `localStorage.getItem('token')`

**Session Storage:**
- Similar to localStorage but cleared on tab close

**Cookies:**
- View authentication cookies

**Service Workers:**
- Check if service worker is registered
- Unregister for testing

#### 6. **React DevTools** (Extension)

**Install:**
- [Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

**Features:**
- **Components Tab**: Tree view of React component hierarchy
- **Profiler Tab**: Performance analysis
- **Inspect Component**: Click element on page, see component in tree
- **Props/State**: View component props and state
- **Hooks**: Inspect hook values

**Usage:**
1. Open DevTools → "Components" tab
2. Click element on page or select component in tree
3. View props, state, hooks on right panel
4. Edit props/state to test different scenarios

#### 7. **Performance Tab** - Find Bottlenecks

**Recording:**
1. Click "Record" (circle icon)
2. Perform actions on page
3. Stop recording
4. Analyze timeline

**What to Look For:**
- Long tasks (red bars) - JavaScript blocking UI
- Layout shifts - Elements moving unexpectedly
- Memory leaks - Memory usage growing over time

### Common Debugging Scenarios

#### Scenario 1: Component Not Rendering

```tsx
// Add console.log to see if component is called
function MyComponent() {
  console.log('MyComponent rendered');
  return <div>Hello</div>;
}

// Check React DevTools - is component in tree?
// Check Elements tab - is HTML present?
// Check Console - any errors?
```

#### Scenario 2: API Call Failing

```tsx
// Add logging to API call
const response = await fetch('/api/users');
console.log('Response status:', response.status);
console.log('Response headers:', response.headers);
const data = await response.json();
console.log('Response data:', data);
```

**In Network Tab:**
- Find the request
- Check status code
- Check request payload
- Check response body

#### Scenario 3: State Not Updating

```tsx
// Add useEffect to watch state changes
useEffect(() => {
  console.log('State changed:', myState);
}, [myState]);

// Check React DevTools - is state actually changing?
// Check if you're mutating state directly (bad!)
// setState([...oldArray, newItem]); // ✅ Correct
// oldArray.push(newItem); // ❌ Wrong
```

#### Scenario 4: Styling Issues

```tsx
// In Elements tab:
// 1. Inspect element
// 2. Check "Computed" styles
// 3. See which CSS rules are applied
// 4. Toggle styles in right panel to test

// In console:
const element = document.querySelector('.my-class');
console.log(getComputedStyle(element)); // All computed styles
```

### Pro Tips

1. **Use `debugger;` statement**:
   ```tsx
   function handleClick() {
     debugger; // Execution pauses here if DevTools is open
     // Your code
   }
   ```

2. **Console.table() for arrays/objects**:
   ```javascript
   console.table([{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]);
   ```

3. **Time operations**:
   ```javascript
   console.time('myOperation');
   // ... your code ...
   console.timeEnd('myOperation'); // Logs elapsed time
   ```

4. **Group related logs**:
   ```javascript
   console.group('User Actions');
   console.log('Clicked button');
   console.log('Submitted form');
   console.groupEnd();
   ```

---

## 🧪 Testing Guide

We use **Vitest** (similar to Jest) for testing. It's fast, works with Vite, and has a Jest-compatible API.

### Why Test?

- **Catch bugs early** - Before users see them
- **Document behavior** - Tests show how code should work
- **Refactor safely** - Tests ensure changes don't break existing features
- **Confidence** - Deploy knowing your code works

### Test Types

1. **Unit Tests**: Test individual functions/components in isolation
2. **Integration Tests**: Test how multiple pieces work together
3. **E2E Tests**: Test full user flows (we use Playwright/Cypress for this)

### Running Tests

```bash
# Run all tests in watch mode (reruns on file changes)
npm test

# Run tests once
npm test -- --run

# Run specific test file
npm test -- src/components/Button.test.tsx

# Run tests with coverage report
npm run coverage

# Run tests in UI mode (interactive)
npm test -- --ui
```

### Writing Your First Test

#### Basic Component Test

```tsx
// src/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn(); // Mock function
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Testing with React Query

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { describe, it, expect } from 'vitest';
import MomentumDisplay from './MomentumDisplay';
import { gamificationApi } from '../api/gamificationApi';
import { vi } from 'vitest';

// Mock the API
vi.mock('../api/gamificationApi', () => ({
  gamificationApi: {
    getMomentum: vi.fn(),
  },
}));

describe('MomentumDisplay', () => {
  it('displays momentum after loading', async () => {
    // Mock API response
    (gamificationApi.getMomentum as any).mockResolvedValue({
      momentum: 1500,
      level: 5,
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MomentumDisplay />
      </QueryClientProvider>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText(/1500/)).toBeInTheDocument();
    });
  });
});
```

#### Testing Forms

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<LoginForm onSubmit={onSubmit} />);

    // Fill form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows validation errors', async () => {
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });
});
```

### Testing Utilities

We have helper functions in `src/utils/testHelpers.tsx`:

```tsx
import { renderWithProviders, mockUser } from '../utils/testHelpers';
import { screen } from '@testing-library/react';

// Use the helper instead of manual setup
test('component with providers', () => {
  renderWithProviders(<MyComponent />);
  // Automatically wrapped with Router, QueryClient, Contexts
});
```

### Common Testing Patterns

#### 1. Mocking API Calls

```tsx
import { vi } from 'vitest';
import { authApi } from '../api/authApi';

// Mock the entire module
vi.mock('../api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

// In your test:
(authApi.login as any).mockResolvedValue({
  success: true,
  data: { user: mockUser, token: 'token' },
});
```

#### 2. Testing Async Code

```tsx
import { waitFor } from '@testing-library/react';

test('async operation', async () => {
  render(<AsyncComponent />);
  
  // Wait for element to appear
  await waitFor(() => {
    expect(screen.getByText('Loaded!')).toBeInTheDocument();
  });
});
```

#### 3. Testing Context Providers

```tsx
import { AuthProvider } from '../contexts/AuthContext';

test('with auth context', () => {
  render(
    <AuthProvider>
      <MyComponent />
    </AuthProvider>
  );
});
```

#### 4. Snapshot Testing (Use Sparingly)

```tsx
import { render } from '@testing-library/react';
import { expect, test } from 'vitest';

test('component snapshot', () => {
  const { container } = render(<MyComponent />);
  expect(container).toMatchSnapshot();
});
```

### Integration Testing

Test how multiple components work together:

```tsx
describe('Login Flow Integration', () => {
  it('completes full login process', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<App />);
    
    // Navigate to login
    await user.click(screen.getByText('Sign In'));
    
    // Fill and submit form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Verify redirect to dashboard
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });
});
```

### Coverage Goals

- **Aim for 70%+ coverage** on critical paths
- **Focus on**: User flows, error handling, edge cases
- **Don't obsess over**: 100% coverage (not worth the time)

View coverage:
```bash
npm run coverage
# Opens coverage report in browser
```

### Debugging Tests

1. **Use `screen.debug()`**:
   ```tsx
   render(<MyComponent />);
   screen.debug(); // Prints entire DOM to console
   screen.debug(screen.getByRole('button')); // Print specific element
   ```

2. **Use `--reporter=verbose`**:
   ```bash
   npm test -- --reporter=verbose
   ```

3. **Add `console.log`** in tests (they show in test output)

4. **Use `--ui` mode**:
   ```bash
   npm test -- --ui
   # Interactive test runner with debugging tools
   ```

---

## 🧩 Component Development

### Creating a New Component

#### Step 1: Create the File

```tsx
// src/components/UserCard.tsx
import React from 'react';

interface UserCardProps {
  name: string;
  email: string;
  avatar?: string;
  onEdit?: () => void;
}

export default function UserCard({ name, email, avatar, onEdit }: UserCardProps) {
  return (
    <div className="user-card">
      {avatar && <img src={avatar} alt={name} />}
      <h3>{name}</h3>
      <p>{email}</p>
      {onEdit && <button onClick={onEdit}>Edit</button>}
    </div>
  );
}
```

#### Step 2: Add Styles

```css
/* src/styles/UserCard.css */
.user-card {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.user-card img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
}
```

#### Step 3: Write Tests

```tsx
// src/components/UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserCard from './UserCard';

describe('UserCard', () => {
  it('renders user information', () => {
    render(<UserCard name="Alice" email="alice@example.com" />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });
});
```

### Component Best Practices

1. **Keep components small** - One responsibility per component
2. **Use TypeScript** - Define props interface
3. **Extract logic to hooks** - Keep components focused on rendering
4. **Handle loading/error states**:
   ```tsx
   if (isLoading) return <Spinner />;
   if (error) return <ErrorMessage error={error} />;
   return <Content />;
   ```

### Using Existing Components

Browse `src/components/` to see what's available:

```tsx
import Button from '../components/Button';
import Input from '../components/Input';
import { MomentumBar } from '../components/gamification/MomentumBar';

function MyPage() {
  return (
    <div>
      <Input label="Name" />
      <Button onClick={handleClick}>Submit</Button>
      <MomentumBar momentum={1500} />
    </div>
  );
}
```

---

## 🌐 API Integration

### Making API Calls

#### Using React Query (Recommended)

```tsx
import { useQuery, useMutation } from 'react-query';
import { gamificationApi } from '../api/gamificationApi';

function MomentumDisplay() {
  // Fetch data
  const { data, isLoading, error } = useQuery(
    'momentum',
    () => gamificationApi.getMomentum()
  );

  // Update data
  const mutation = useMutation(
    (newMomentum: number) => gamificationApi.updateMomentum(newMomentum),
    {
      onSuccess: () => {
        // Refetch momentum after update
        queryClient.invalidateQueries('momentum');
      },
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>Momentum: {data.momentum}</p>
      <button onClick={() => mutation.mutate(2000)}>
        Update Momentum
      </button>
    </div>
  );
}
```

#### Direct API Calls (When Needed)

```tsx
import axiosInstance from '../api/axiosInstance';

async function fetchUserData(userId: string) {
  try {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}
```

### API File Structure

Each feature has its own API file:

```tsx
// src/api/gamificationApi.ts
import axiosInstance from './axiosInstance';

export const gamificationApi = {
  getMomentum: async () => {
    const response = await axiosInstance.get('/gamification/momentum');
    return response.data;
  },
  
  updateMomentum: async (amount: number) => {
    const response = await axiosInstance.post('/gamification/momentum', { amount });
    return response.data;
  },
};
```

### Error Handling

```tsx
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';

function MyComponent() {
  const { data, error } = useQuery(
    'myData',
    fetchData,
    {
      onError: (error) => {
        toast.error('Failed to load data');
        console.error(error);
      },
    }
  );

  // Component code...
}
```

---

## 📋 Common Patterns & Best Practices

### 1. Custom Hooks

Extract reusable logic:

```tsx
// src/hooks/useMomentum.ts
import { useQuery } from 'react-query';
import { gamificationApi } from '../api/gamificationApi';

export function useMomentum() {
  return useQuery('momentum', () => gamificationApi.getMomentum());
}

// Usage:
function MyComponent() {
  const { data: momentum } = useMomentum();
  // ...
}
```

### 2. Form Handling

```tsx
import { useForm } from 'react-hook-form';

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await authApi.login(data.email, data.password);
    } catch (error) {
      toast.error('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email', { required: 'Email is required' })}
        type="email"
      />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input
        {...register('password', { required: 'Password is required' })}
        type="password"
      />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### 3. Protected Routes

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
}

// Usage in App.tsx:
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### 4. Loading States

```tsx
function DataDisplay() {
  const { data, isLoading, isError } = useQuery('data', fetchData);

  if (isLoading) {
    return <div className="spinner">Loading...</div>;
  }

  if (isError) {
    return <div className="error">Failed to load data</div>;
  }

  return <div>{data.content}</div>;
}
```

### 5. Optimistic Updates

```tsx
const mutation = useMutation(updateData, {
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries('data');
    
    // Snapshot previous value
    const previous = queryClient.getQueryData('data');
    
    // Optimistically update
    queryClient.setQueryData('data', newData);
    
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData('data', context.previous);
  },
});
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Issue: "Module not found"

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Port 5173 already in use

**Solution:**
```bash
# Kill process on port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9

# Or use a different port:
npm run dev -- --port 3000
```

#### Issue: TypeScript errors

**Solution:**
```bash
# Check TypeScript config
npm run type-check

# Common fixes:
# 1. Restart TypeScript server in VS Code (Cmd+Shift+P → "TypeScript: Restart TS Server")
# 2. Check tsconfig.json paths
# 3. Ensure types are installed: npm install --save-dev @types/react
```

#### Issue: HMR not working

**Solution:**
1. Check browser console for errors
2. Try hard refresh: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)
3. Clear browser cache
4. Restart dev server

#### Issue: API calls failing

**Solution:**
1. Check Network tab in DevTools
2. Verify API URL in `.env` file
3. Check if backend is running
4. Verify CORS settings on backend
5. Check authentication token in Application → Local Storage

#### Issue: Tests failing

**Solution:**
```bash
# Clear test cache
npm test -- --clearCache

# Run with verbose output
npm test -- --reporter=verbose

# Check if mocks are set up correctly
# Verify testHelpers are imported
```

---

## 📚 Resources for Learning

### Official Documentation

- **React**: https://react.dev/learn
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Vite**: https://vitejs.dev/guide/
- **React Query**: https://tanstack.com/query/latest
- **React Router**: https://reactrouter.com/
- **Vitest**: https://vitest.dev/

### Recommended Learning Path

1. **Week 1**: React basics, JSX, components, props
2. **Week 2**: Hooks (useState, useEffect), event handling
3. **Week 3**: React Router, forms, API calls
4. **Week 4**: TypeScript, testing, advanced patterns

### Practice Resources

- **React Tutorial**: https://react.dev/learn/tutorial-tic-tac-toe
- **TypeScript Exercises**: https://typescript-exercises.github.io/
- **Testing Library Docs**: https://testing-library.com/docs/react-testing-library/intro/

### Internal Resources

- Check `FRONTEND_DEBUG_GUIDE.md` for debugging tips
- Check `HMR_GUIDE.md` for Hot Module Replacement details
- Check `PERFORMANCE_OPTIMIZATION.md` for performance tips

---

## 🎓 Quick Reference Cheat Sheet

### Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Check code quality
npm run type-check   # Check TypeScript
```

### Common Imports

```tsx
// React
import { useState, useEffect } from 'react';

// React Router
import { useNavigate, useParams, Link } from 'react-router-dom';

// React Query
import { useQuery, useMutation } from 'react-query';

// Testing
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
```

### Common Patterns

```tsx
// State
const [value, setValue] = useState(initial);

// Effect
useEffect(() => { /* code */ }, [dependencies]);

// Query
const { data, isLoading } = useQuery('key', fetchFn);

// Mutation
const mutation = useMutation(updateFn);
mutation.mutate(data);
```

---

## 🤝 Getting Help

1. **Check this README first** - Most common questions are answered here
2. **Search existing issues** - Someone might have had the same problem
3. **Ask in team chat** - We're here to help!
4. **Check browser console** - Errors often have helpful messages
5. **Use React DevTools** - Inspect component state and props

---

## ✅ Next Steps

1. ✅ Set up your development environment
2. ✅ Run the app locally
3. ✅ Explore the codebase
4. ✅ Read through a component file
5. ✅ Make a small change and see it update
6. ✅ Write your first test
7. ✅ Create a simple component

**Welcome to the team! You've got this! 🚀**

---

*Last updated: 2024*
*Questions? Ask the team or update this README with your findings!*
