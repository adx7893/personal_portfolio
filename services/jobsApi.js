import { getAuthToken } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const parseResponse = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error || fallbackMessage);
  }
  return payload;
};

export const fetchJobs = async (filters) => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required.');

  const query = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value === '' || value === undefined || value === null) return;
    query.set(key, String(value));
  });

  const response = await fetch(`${API_BASE_URL}/api/jobs?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await parseResponse(response, 'Failed to fetch jobs.');
  return payload;
};

export const fetchJobById = async (jobId) => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required.');

  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await parseResponse(response, 'Failed to fetch job details.');
  return payload.data;
};

export const saveJob = async ({ jobId, token = getAuthToken() }) => {
  if (!token) throw new Error('Authentication required.');

  const response = await fetch(`${API_BASE_URL}/api/jobs/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ jobId }),
  });
  const payload = await parseResponse(response, 'Failed to save job.');
  return payload.data;
};

export const applyToJob = async ({ jobId, token = getAuthToken() }) => {
  if (!token) throw new Error('Authentication required.');

  const response = await fetch(`${API_BASE_URL}/api/jobs/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ jobId }),
  });
  const payload = await parseResponse(response, 'Failed to apply to job.');
  return payload.data;
};

export const matchJobWithResume = async ({ jobId, resumeText, token = getAuthToken() }) => {
  if (!token) throw new Error('Authentication required.');

  const response = await fetch(`${API_BASE_URL}/api/ai/match-job`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ jobId, resumeText }),
  });
  const payload = await parseResponse(response, 'Failed to match job.');
  return payload.data;
};
