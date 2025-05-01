import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export const fetchSentimentDistribution = async (): Promise<{ [key: string]: number }> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/sentiment-distribution`);
    return response.data as { [key: string]: number };
  } catch (error) {
    console.error('Error fetching sentiment distribution:', error);
    throw error;
  }
};

export const fetchTweetsOverTime = async (): Promise<{ date: string; count: number }[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/tweets-over-time`);
    return response.data as { date: string; count: number }[];
  } catch (error) {
    console.error('Error fetching tweets over time:', error);
    throw error;
  }
};

export const fetchSubtopics = async (): Promise<{ subtopic: string; count: number }[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/subtopics`);
    return response.data as { subtopic: string; count: number }[];
  } catch (error) {
    console.error('Error fetching subtopics:', error);
    throw error;
  }
};