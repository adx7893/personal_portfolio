import { getAuthToken } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const COVER_LETTER_TONES = ['Professional', 'Confident', 'Friendly', 'Concise', 'Executive'];

export const generateCoverLetterApi = async ({
  application,
  tone,
  resumeText,
  resumeFile,
}) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required.');
  }

  const formData = new FormData();
  formData.append('applicationId', application.id);
  formData.append('tone', tone);
  formData.append('application', JSON.stringify(application));

  if (resumeText) {
    formData.append('resumeText', resumeText);
  }

  if (resumeFile) {
    formData.append('resume', resumeFile);
  }

  const response = await fetch(`${API_BASE_URL}/api/ai/generate-cover-letter`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error || 'Failed to generate cover letter.');
  }

  return payload.data;
};
