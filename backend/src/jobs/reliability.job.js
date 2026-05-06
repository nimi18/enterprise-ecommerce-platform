import logger from '../config/logger.js';
import {
  cleanupOldCartsService,
  expireOldPendingOrdersService,
} from '../services/reliability.service.js';

const runReliabilityJobs = async () => {
  const pendingOrderResult = await expireOldPendingOrdersService({
    olderThanMinutes: 30,
  });

  const cartCleanupResult = await cleanupOldCartsService({
    emptyCartOlderThanDays: 7,
  });

  logger.info(
    {
      pendingOrderResult,
      cartCleanupResult,
    },
    'Reliability jobs completed'
  );

  return {
    pendingOrderResult,
    cartCleanupResult,
  };
};

export { runReliabilityJobs };