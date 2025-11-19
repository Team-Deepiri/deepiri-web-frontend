/**
 * Frontend Testing and Debugging Utilities
 */

import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { SocketProvider } from '../contexts/SocketContext';
import { AdventureProvider } from '../contexts/AdventureContext';
import React from 'react';

// Mock data for testing
export const mockUser = {
  _id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  preferences: {
    interests: ['hiking', 'photography'],
    difficulty: 'moderate'
  }
};

export const mockAdventure = {
  _id: 'test-adventure-id',
  title: 'Test Adventure',
  description: 'A test adventure for debugging',
  steps: [
    { title: 'Step 1', description: 'First step', completed: false },
    { title: 'Step 2', description: 'Second step', completed: false }
  ],
  difficulty: 'moderate',
  duration: 120,
  location: { latitude: 40.7128, longitude: -74.0060 }
};

export const mockEvent = {
  _id: 'test-event-id',
  title: 'Test Event',
  description: 'A test event for debugging',
  date: new Date().toISOString(),
  location: 'Test Location',
  attendees: []
};

interface TestWrapperProps {
  children: React.ReactNode;
  initialAuth?: any;
}

// Test wrapper with all providers
export const TestWrapper: React.FC<TestWrapperProps> = ({ children, initialAuth = null }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider initialAuth={initialAuth}>
          <SocketProvider>
            <AdventureProvider>
              {children}
            </AdventureProvider>
          </SocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

// Custom render function with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options: RenderOptions & { initialAuth?: any } = {}
) => {
  const { initialAuth, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper initialAuth={initialAuth}>
        {children}
      </TestWrapper>
    ),
    ...renderOptions
  });
};

// Debug utilities for development
export const debugUtils = {
  // Log component props and state
  logComponent: (component: any, props: Record<string, any> = {}) => {
    console.group(`🧪 Component Debug: ${component.name || 'Unknown'}`);
    console.log('Props:', props);
    console.log('Component:', component);
    console.groupEnd();
  },

  // Log API calls
  logApiCall: (method: string, url: string, data: any = null, response: any = null) => {
    console.group(`🌐 API Call: ${method} ${url}`);
    if (data) console.log('Request Data:', data);
    if (response) console.log('Response:', response);
    console.groupEnd();
  },

  // Log user interactions
  logInteraction: (action: string, element: Element, data: Record<string, any> = {}) => {
    console.log(`👆 User Interaction: ${action}`, {
      element: element.tagName,
      className: element.className,
      id: element.id,
      ...data
    });
  },

  // Check component accessibility
  checkA11y: (element: Element): string[] => {
    const issues: string[] = [];
    
    // Check for alt text on images
    const images = element.querySelectorAll('img');
    images.forEach(img => {
      if (!img.getAttribute('alt')) {
        issues.push(`Image missing alt text: ${img.getAttribute('src')}`);
      }
    });
    
    // Check for form labels
    const inputs = element.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const label = element.querySelector(`label[for="${input.id}"]`);
      if (!label && !input.getAttribute('aria-label')) {
        issues.push(`Input missing label: ${(input as HTMLInputElement).name || input.getAttribute('type')}`);
      }
    });
    
    // Check for button text
    const buttons = element.querySelectorAll('button');
    buttons.forEach(button => {
      if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
        issues.push('Button missing text or aria-label');
      }
    });
    
    if (issues.length > 0) {
      console.warn('♿ Accessibility Issues:', issues);
    } else {
      console.log('✅ No accessibility issues found');
    }
    
    return issues;
  },

  // Performance monitoring
  measureRender: <T,>(componentName: string, renderFn: () => T): T => {
    const start = performance.now();
    const result = renderFn();
    const end = performance.now();
    
    console.log(`⚡ Render Time for ${componentName}: ${(end - start).toFixed(2)}ms`);
    
    return result;
  },

  // Memory usage tracking
  trackMemory: (label: string) => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log(`🧠 Memory Usage (${label}):`, {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
      });
    }
  }
};

// Mock API responses for testing
export const mockApiResponses = {
  auth: {
    login: { success: true, data: { user: mockUser, token: 'mock-token' } },
    register: { success: true, data: { user: mockUser, token: 'mock-token' } },
    verify: { success: true, data: { user: mockUser } }
  },
  
  adventures: {
    generate: { success: true, data: mockAdventure },
    list: { success: true, data: [mockAdventure] },
    get: { success: true, data: mockAdventure }
  },
  
  events: {
    list: { success: true, data: [mockEvent] },
    create: { success: true, data: mockEvent },
    get: { success: true, data: mockEvent }
  }
};

// Test helpers for common scenarios
export const testHelpers = {
  // Simulate user login
  simulateLogin: async () => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
  },

  // Simulate user logout
  simulateLogout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Wait for element to appear
  waitForElement: async (selector: string, timeout: number = 5000): Promise<Element> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkElement = () => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Element not found: ${selector}`));
        } else {
          setTimeout(checkElement, 100);
        }
      };
      checkElement();
    });
  },

  // Fill form fields
  fillForm: async (formData: Record<string, string>) => {
    // This would need to be implemented with testing library
    console.log('fillForm called with:', formData);
  },

  // Simulate API error
  simulateApiError: (status: number = 500, message: string = 'Server Error') => {
    return Promise.reject({
      response: { status, data: { message } }
    });
  }
};

// Development mode helpers
if (import.meta.env.DEV) {
  // Add debug utilities to window for console access
  (window as any).debugUtils = debugUtils;
  (window as any).testHelpers = testHelpers;
  (window as any).mockData = { mockUser, mockAdventure, mockEvent };
  
  console.log('🔧 Test helpers loaded in development mode');
  console.log('Available: window.debugUtils, window.testHelpers, window.mockData');
}

export default {
  debugUtils,
  testHelpers,
  mockApiResponses,
  mockUser,
  mockAdventure,
  mockEvent,
  TestWrapper,
  renderWithProviders
};

