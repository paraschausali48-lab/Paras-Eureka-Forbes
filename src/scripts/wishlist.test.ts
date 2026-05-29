import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getWishlist, saveWishlist } from './wishlist';

// Mock Astro router since it's a virtual module
vi.mock('astro:transitions/client', () => ({
  navigate: vi.fn(),
}));

// Mock dependencies that rely on the DOM to prevent test suite errors
vi.mock('./toast', () => ({
  showToast: vi.fn(),
}));

describe('Wishlist Data I/O & Caching', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="wishlist-badge"></div>`;
    vi.spyOn(Storage.prototype, 'getItem');
    vi.spyOn(Storage.prototype, 'setItem');
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return an empty array without crashing when parsing invalid JSON', () => {
    // Simulate corrupted data injected into localStorage
    localStorage.setItem('ef_wishlist', '{ invalid JSON }');

    // Validates the graceful fallback inside getWishlist()
    const list = getWishlist();
    expect(list).toEqual([]);
  });

  it('should successfully read and write valid wishlist items', () => {
    saveWishlist(['EF-TEST-123', 'EF-TEST-456']);
    expect(localStorage.setItem).toHaveBeenCalledWith('ef_wishlist', '["EF-TEST-123","EF-TEST-456"]');

    const list = getWishlist();
    expect(list).toEqual(['EF-TEST-123', 'EF-TEST-456']);
  });
});
