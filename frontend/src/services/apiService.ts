import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const surveyService = {
  getSurveyData: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/surveys`);
      return response.data;
    } catch (error) {
      console.error('Error fetching survey data:', error);
      throw error;
    }
  },

  createSurvey: async (surveyData: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/surveys`, surveyData);
      return response.data;
    } catch (error) {
      console.error('Error creating survey:', error);
      throw error;
    }
  }
};
