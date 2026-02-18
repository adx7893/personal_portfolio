import { getAuthToken } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const analyzeResume = async ({ resumeFile, jobDescription }) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required.');
  }

  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('jobDescription', jobDescription);

  const response = await fetch(`${API_BASE_URL}/api/analyze-resume`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    const message = payload?.error || 'Failed to analyze resume.';
    throw new Error(message);
  }

  return payload.data;
};
