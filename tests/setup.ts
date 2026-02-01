/**
 * Test Setup
 * Mocks Chrome APIs and sets up testing environment
 */

import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock chrome API with proper typing
const mockStorage = {
  local: {
    get: vi.fn().mockImplementation(() => Promise.resolve({})),
    set: vi.fn().mockImplementation(() => Promise.resolve()),
    remove: vi.fn().mockImplementation(() => Promise.resolve()),
    clear: vi.fn().mockImplementation(() => Promise.resolve()),
  },
  onChanged: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
};

const mockRuntime = {
  sendMessage: vi.fn(),
  onMessage: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
  onInstalled: {
    addListener: vi.fn(),
  },
};

const mockTabs = {
  query: vi.fn().mockResolvedValue([]),
  sendMessage: vi.fn(),
};

const mockCommands = {
  onCommand: {
    addListener: vi.fn(),
  },
};

const mockChrome = {
  storage: mockStorage,
  runtime: mockRuntime,
  tabs: mockTabs,
  commands: mockCommands,
};

vi.stubGlobal('chrome', mockChrome);

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
