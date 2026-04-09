import { clearTestDB, setupTestDB, teardownTestDB } from './db.js';

before(async function () {
  this.timeout(30000);
  await setupTestDB();
});

beforeEach(async function () {
  await clearTestDB();
});

after(async function () {
  this.timeout(30000);
  await teardownTestDB();
});