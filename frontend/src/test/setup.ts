import { vi } from 'vitest';

// Vitest Browser Mode doesn't play nice with packages like axios-mock-adapter, so we're mocking axios manually, the hard way
const mockAxios = vi.hoisted(() => {
  const callAxiosSpy = vi.fn();
  function mockAxios() {
    return callAxiosSpy();
  }
  mockAxios.create = () => mockAxios;
  mockAxios.defaults = { headers: { common: { Authorization: null } } };
  mockAxios.interceptors = { request: { use: vi.fn() } };
  mockAxios.callAxiosSpy = callAxiosSpy;
  return mockAxios;
});

vi.mock('axios', () => ({
  default: mockAxios,
}));
