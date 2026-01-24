/**
 * Test setup file
 * Runs before all tests
 */

import { beforeEach } from 'vitest';
import { clearCache } from '../src/data/loader.js';

// Clear cache before each test to ensure isolation
beforeEach(() => {
	clearCache();
});

// Optional: Preload data once for all tests to speed up test execution
// Uncomment if you want to share loaded data across tests
// beforeAll(async () => {
//   await preloadAll();
// });
