// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.INGESTION_QUEUE_URL = 'https://sqs.test.url/ingestion';
process.env.RETRY_QUEUE_URL = 'https://sqs.test.url/retry';
process.env.DLQ_URL = 'https://sqs.test.url/dlq';
