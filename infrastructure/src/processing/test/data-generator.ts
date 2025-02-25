import { v4 as uuidv4 } from 'uuid';

export class DataGenerator {
  static generateBatch(pointCount: number) {
    const points = [];
    for (let i = 0; i < pointCount; i++) {
      points.push({
        cell_id: `cell_${uuidv4()}`,
        latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
        signal_strength: -50 - Math.random() * 50,
        accuracy: 10 + Math.random() * 20,
        timestamp: new Date().toISOString()
      });
    }

    return {
      batchId: `batch_${uuidv4()}`,
      points,
      metadata: {
        source: 'test',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }
    };
  }

  static generateInvalidData() {
    return [
      'not json',
      '{"invalid": true',
      {},
      { points: 'not an array' },
      { points: [], metadata: 123 },
      {
        points: [{
          // Missing required fields
          latitude: 37.7749,
          longitude: -122.4194
        }],
        metadata: {}
      }
    ];
  }

  static generateTestScenarios() {
    return {
      validBatch: {
        name: 'Valid batch with mixed signal strengths',
        data: this.generateBatch(5)
      },
      largeBatch: {
        name: 'Large batch exceeding DynamoDB limits',
        data: this.generateBatch(30)
      },
      invalidBatch: {
        name: 'Invalid data formats',
        data: this.generateInvalidData()
      },
      boundaryBatch: {
        name: 'Boundary conditions batch',
        data: {
          batchId: `batch_${uuidv4()}`,
          points: [
            {
              cell_id: `cell_${uuidv4()}`,
              latitude: 90, // Max latitude
              longitude: 180, // Max longitude
              signal_strength: 0, // Max signal strength
              accuracy: 1, // Min accuracy
              timestamp: new Date().toISOString()
            },
            {
              cell_id: `cell_${uuidv4()}`,
              latitude: -90, // Min latitude
              longitude: -180, // Min longitude
              signal_strength: -120, // Min signal strength
              accuracy: 100, // Max accuracy
              timestamp: new Date().toISOString()
            }
          ],
          metadata: {
            source: 'boundary-test',
            version: '1.0.0',
            timestamp: new Date().toISOString()
          }
        }
      }
    };
  }
}
