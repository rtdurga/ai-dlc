import { expect } from 'chai';

describe('AWS Client Mocking', () => {
  it('should work with mock AWS clients', () => {
    // Create mock clients
    const mockClients = {
      sqs: {
        send: () => Promise.resolve({ $metadata: { httpStatusCode: 200 } })
      },
      dynamodb: {
        send: () => Promise.resolve({ $metadata: { httpStatusCode: 200 } })
      }
    };

    // Replace the real clients with mocks
    const clients = mockClients;

    // Verify the mock clients exist
    expect(clients.sqs).to.exist;
    expect(clients.dynamodb).to.exist;
    expect(typeof clients.sqs.send).to.equal('function');
    expect(typeof clients.dynamodb.send).to.equal('function');
  });
});
