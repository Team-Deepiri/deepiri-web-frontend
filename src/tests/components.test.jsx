import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; 
import { QueryClient, QueryClientProvider } from 'react-query';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import toast from 'react-hot-toast';
import { AdventureProvider } from '../contexts/AdventureContext';

const renderWithProviders = (ui) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <AdventureProvider> {/* Add this wrapper */}
            {ui}
          </AdventureProvider>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

// 1. Mock External Dependencies
vi.mock('react-hot-toast', () => ({
  success: vi.fn(),
  error: vi.fn(),
  loading: vi.fn(),
  dismiss: vi.fn(),
  default: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

// 2. Mock APIs
import { authApi } from '../api/authApi';
import { adventureApi } from '../api/adventureApi';

vi.mock('../api/authApi', () => ({
  authApi: { 
    login: vi.fn(), 
    register: vi.fn(), 
    verifyToken: vi.fn(), 
    logout: vi.fn(), 
    refreshToken: vi.fn() 
  }
}));

vi.mock('../api/adventureApi', () => ({
  adventureApi: { generateAdventure: vi.fn(), getAdventures: vi.fn() }
}));

// 3. Mock AuthContext hook (Dynamic Mocking)
vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })),
  };
});

// 4. Import everything else
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import Home from '../pages/Home';
import Navbar from '../components/Navbar';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import AdventureGenerator from '../pages/AdventureGenerator';

// 5. Test Utilities
const createTestQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});


describe('Home Component', () => {
  test('renders home page with correct content', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('Welcome to tripblip MAG 2.0')).toBeInTheDocument();
  });

  test('shows sign up and sign in buttons when not authenticated', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});

describe('Navbar Component', () => {
  test('renders navbar with logo and navigation', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('tripblip MAG 2.0')).toBeInTheDocument();
  });

  test('handles logout when logout button is clicked', () => {
    const mockLogout = vi.fn();
    // Removed "as any" type assertions
    vi.mocked(useAuth).mockReturnValue({
      user: { _id: '1', name: 'Test User', email: 'test@example.com' },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: mockLogout,
      token: '123',
      updateUser: vi.fn()
    });

    renderWithProviders(<Navbar />);
    const logoutButton = screen.getByText('Sign Out');
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalled();
  });
});

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('handles successful login', async () => {
    const mockUser = { _id: '1', name: 'Test User', email: 'test@example.com' };
    vi.mocked(authApi.login).mockResolvedValue({
      success: true,
      user: mockUser,
      token: 'mock-token'
    });

    const TestComponent = () => {
      const { login } = useAuth();
      return <button onClick={() => login('test@example.com', 'password')}>Login</button>;
    };

    renderWithProviders(<TestComponent />);
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith('test@example.com', 'password');
    });
  });
});

describe('Login Component', () => {
  test('submits form with valid data', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      success: true,
      user: { _id: '1', name: 'Test User', email: 'test@example.com' },
      token: 'mock-token'
    });

    renderWithProviders(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});

describe('Register Component', () => {
  test('submits form with valid data', async () => {
    vi.mocked(authApi.register).mockResolvedValue({
      success: true,
      user: { _id: '1', name: 'Test User', email: 'test@example.com' },
      token: 'mock-token'
    });

    renderWithProviders(<Register />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalled();
    });
  });
});

describe('Dashboard Component', () => {
  test('renders dashboard with user information', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { _id: '1', name: 'Test User', email: 'test@example.com' },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      token: '123',
      updateUser: vi.fn()
    });

    renderWithProviders(<Dashboard />);
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});

describe('AdventureGenerator Component', () => {
  test('submits form with valid data', async () => {
    vi.mocked(adventureApi.generateAdventure).mockResolvedValue({
      success: true,
      data: { _id: 'adventure-123', name: 'Test Adventure' }
    });

    vi.mocked(useAuth).mockReturnValue({
      user: { _id: '1', name: 'Test User', email: 'test@example.com' },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      token: '123',
      updateUser: vi.fn()
    });

    renderWithProviders(<AdventureGenerator />);
    fireEvent.change(screen.getByLabelText(/interests/i), { target: { value: 'food,music' } });
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '60' } });
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(adventureApi.generateAdventure).toHaveBeenCalled();
    });
  });
});

describe('Error Handling', () => {
  test('displays error messages for API failures', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Network error'));

    renderWithProviders(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});

export { renderWithProviders, createTestQueryClient };