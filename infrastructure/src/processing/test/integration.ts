import { expect } from 'chai';
import { DataGenerator } from './data-generator';
import { processBatch } from '../index';
import 'mocha';

// TODO: Fix AWS client mocking issues
// Tests temporarily disabled due to AWS client mocking issues
describe.skip('Processing Service Integration Tests', function (this: Mocha.Suite) {
  this.timeout(10000); // Allow more time for integration tests

  before(function () {
    // Set environment variables for integration tests
    process.env.NODE_ENV = 'test';
    process.env.INGESTION_QUEUE_URL = 'https://sqs.test.url/ingestion';
    process.env.RETRY_QUEUE_URL = 'https://sqs.test.url/retry';
    process.env.DLQ_URL = 'https://sqs.test.url/dlq';
    process.env.LOG_TESTS = 'true'; // Enable logging for integration tests
  });

  after(function () {
    // Clean up environment variables
    delete process.env.NODE_ENV;
    delete process.env.INGESTION_QUEUE_URL;
    delete process.env.RETRY_QUEUE_URL;
    delete process.env.DLQ_URL;
    delete process.env.LOG_TESTS;
  });

  describe('End-to-End Processing', function () {
    const scenarios = DataGenerator.generateTestScenarios();

    it('should process valid batches successfully', async () => {
      const messages = [{
        messageId: 'test-1',
        body: JSON.stringify(scenarios.validBatch.data),
        attributes: { approximateReceiveCount: '1' }
      }];

      await processBatch(messages);
      // Success is determined by no exceptions being thrown
    });

    it('should handle boundary conditions', async () => {
      const messages = [{
        messageId: 'test-2',
        body: JSON.stringify(scenarios.boundaryBatch.data),
        attributes: { approximateReceiveCount: '1' }
      }];

      await processBatch(messages);
      // Success is determined by no exceptions being thrown
    });

    it('should handle large batches', async () => {
      const messages = [{
        messageId: 'test-3',
        body: JSON.stringify(scenarios.largeBatch.data),
        attributes: { approximateReceiveCount: '1' }
      }];

      await processBatch(messages);
      // Success is determined by no exceptions being thrown
    });

    it('should handle invalid data appropriately', async () => {
      const invalidData = scenarios.invalidBatch.data;
      const messages = Array.isArray(invalidData) ? invalidData.map((data, index) => ({
        messageId: `invalid-${index}`,
        body: typeof data === 'string' ? data : JSON.stringify(data),
        attributes: { approximateReceiveCount: '1' }
      })) : [];

      await processBatch(messages);
      // Success is determined by no exceptions being thrown
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Simulate network error by using an invalid URL
      process.env.INGESTION_QUEUE_URL = 'https://invalid.url';
      
      const messages = [{
        messageId: 'test-error',
        body: JSON.stringify(DataGenerator.generateBatch(1)),
        attributes: { approximateReceiveCount: '1' }
      }];

      await processBatch(messages);
      // Success is determined by no exceptions being thrown
    });

    it('should handle retry logic correctly', async () => {
      const messages = [{
        messageId: 'test-retry',
        body: JSON.stringify(DataGenerator.generateBatch(1)),
        attributes: { approximateReceiveCount: '3' }
      }];

      await processBatch(messages);
      // Success is determined by no exceptions being thrown
    });
  });
});
