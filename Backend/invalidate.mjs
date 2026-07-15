import { invalidateCache } from './src/middleware/cache.js';

(async () => {
  console.log("Invalidating cache...");
  await invalidateCache('restaurants:*');
  console.log("Cache invalidated!");
  process.exit(0);
})();
