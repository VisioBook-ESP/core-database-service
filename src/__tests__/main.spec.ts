import { bootstrap } from '../main';

describe('Main', () => {
  it('should export bootstrap function', () => {
    expect(bootstrap).toBeDefined();
    expect(typeof bootstrap).toBe('function');
  });
});
