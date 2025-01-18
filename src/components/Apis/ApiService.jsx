import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const instance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const login = async (loginData) => {
  try {
    const response = await instance.post('/api/v1/login', loginData);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const signUp = async (signupData) => {
  try {
    const response = await instance.post('/api/v1/sign-up', signupData);
    return response.data; 
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};


export const saveDocuInfo = async (documentData) => {
  try {
    const response = await instance.post('/api/v1/doc/create-doc', documentData);
    return response.data; 
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

export const getDocuments = async (author) => {
  try {
    const response = await instance.get('/api/v1/doc/listDocs-byUser', {
      params: { author },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};


export const apiService = {
  login,
  signUp,
  saveDocuInfo,
  getDocuments
};


