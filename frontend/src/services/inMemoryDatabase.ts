interface PolygonCoordinate {
  latitude: number;
  longitude: number;
}

interface SurveyEntry {
  id: number;
  towerId: string;
  location: string;
  polygonPoints: PolygonCoordinate[];
  timestamp: string;
}

class InMemoryDatabase {
  private surveys: SurveyEntry[] = [];
  private nextId: number = 1;

  constructor() {
    // Seed initial data
    this.createSurvey({
      towerId: 'TOWER001',
      location: 'Bangalore Central',
      polygonPoints: [
        { latitude: 12.9716, longitude: 77.5946 },
        { latitude: 12.9820, longitude: 77.5980 },
        { latitude: 12.9750, longitude: 77.6030 },
        { latitude: 12.9700, longitude: 77.5900 }
      ]
    });

    this.createSurvey({
      towerId: 'TOWER002', 
      location: 'Chennai Marina',
      polygonPoints: [
        { latitude: 13.0827, longitude: 80.2707 },
        { latitude: 13.0900, longitude: 80.2750 },
        { latitude: 13.0850, longitude: 80.2800 },
        { latitude: 13.0800, longitude: 80.2750 }
      ]
    });
  }

  createSurvey(surveyData: Omit<SurveyEntry, 'id' | 'timestamp'>): SurveyEntry {
    const newSurvey: SurveyEntry = {
      id: this.nextId++,
      ...surveyData,
      timestamp: new Date().toISOString()
    };
    this.surveys.push(newSurvey);
    return newSurvey;
  }

  getSurveys(): SurveyEntry[] {
    return [...this.surveys];
  }

  getSurveyByTowerId(towerId: string): SurveyEntry | undefined {
    return this.surveys.find(survey => survey.towerId === towerId);
  }

  updateSurvey(id: number, updateData: Partial<Omit<SurveyEntry, 'id' | 'timestamp'>>): SurveyEntry | null {
    const index = this.surveys.findIndex(survey => survey.id === id);
    if (index !== -1) {
      this.surveys[index] = {
        ...this.surveys[index],
        ...updateData
      };
      return this.surveys[index];
    }
    return null;
  }

  deleteSurvey(id: number): boolean {
    const initialLength = this.surveys.length;
    this.surveys = this.surveys.filter(survey => survey.id !== id);
    return this.surveys.length < initialLength;
  }
}

export const inMemoryDatabase = new InMemoryDatabase();
export type { SurveyEntry, PolygonCoordinate };
