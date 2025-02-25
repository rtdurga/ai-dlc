# GeoCell Processing Service

This service handles the processing of coverage data points in the GeoCell Intelligence Platform. It's designed to efficiently process large batches of data with built-in retry mechanisms and error handling.

## Features

- Batch processing of coverage data points
- Automatic retry handling with exponential backoff
- Dead letter queue for failed messages
- Health monitoring endpoint
- Comprehensive logging
- Efficient DynamoDB writes
- Auto-scaling based on queue depth

## Prerequisites

- Node.js 18 or later
- AWS credentials configured
- Docker (for container deployment)

## Installation

```bash
npm install
```

## Configuration

The service uses the following environment variables:

```env
INGESTION_QUEUE_URL=<SQS queue URL for ingestion>
RETRY_QUEUE_URL=<SQS queue URL for retries>
DLQ_URL=<SQS queue URL for dead letters>
BATCH_SIZE=10
PROCESSING_TIMEOUT=300
AWS_REGION=us-east-1
```

## Running the Service

### Local Development

```bash
# Build TypeScript
npm run build

# Start the service
npm start
```

### Docker Container

```bash
# Build container
docker build -t geocell-processing-service .

# Run container
docker run -d \
  -e INGESTION_QUEUE_URL=<queue-url> \
  -e RETRY_QUEUE_URL=<retry-queue-url> \
  -e DLQ_URL=<dlq-url> \
  geocell-processing-service
```

## Testing

### Unit Tests

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run all tests (unit + integration)
npm run test:all
```

## Test Data Generation

The service includes utilities for generating test data:

```typescript
import { DataGenerator } from './test/data-generator';

// Generate a single batch
const batch = DataGenerator.generateBatch(10);

// Generate multiple batches
const batches = DataGenerator.generateBatches(5, 10);

// Generate test scenarios
const scenarios = DataGenerator.generateTestScenarios();

// Generate invalid data for testing error handling
const invalidData = DataGenerator.generateInvalidData();
```

## Monitoring

The service exposes a health check endpoint at:
```
http://localhost:8080/health
```

CloudWatch metrics are available for:
- Queue depth
- Processing latency
- Error rates
- Batch sizes
- DLQ message count

## Error Handling

The service implements several error handling mechanisms:

1. Validation Errors
   - Invalid data format
   - Missing required fields
   - Out of range values

2. Processing Errors
   - DynamoDB write failures
   - Network issues
   - Timeouts

3. Retry Logic
   - Exponential backoff
   - Maximum 3 retry attempts
   - Dead letter queue for failed messages

## Performance Considerations

- Batch writes to DynamoDB (max 25 items per batch)
- Long polling for SQS messages
- Configurable batch sizes
- Automatic scaling based on queue depth
- Message visibility timeout management

## Contributing

1. Write tests for new features
2. Ensure all tests pass
3. Follow existing code style
4. Update documentation as needed
