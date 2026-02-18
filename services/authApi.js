const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const AUTH_TOKEN_KEY = 'auth-token';

const parseJson = async (response, fallback) => {
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    const error = new Error(payload?.error || fallback);
    error.status = response.status;
    throw error;
  }
  return payload.data;
};

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY) || '';

export const setAuthToken = (token) => {
  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } else {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

export const signupApi = async ({ firstName, lastName, email, password }) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });
  return parseJson(response, 'Failed to sign up.');
};

export const loginApi = async ({ email, password }) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseJson(response, 'Failed to log in.');
};

export const logoutApi = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });
  return parseJson(response, 'Failed to log out.');
};

export const fetchProfileApi = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return parseJson(response, 'Failed to load profile.');
};

export const updateProfileApi = async (token, updates) => {
  const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  return parseJson(response, 'Failed to update profile.');
};

export const changePasswordApi = async (token, currentPassword, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return parseJson(response, 'Failed to change password.');
};

export const uploadFileApi = async (token, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return parseJson(response, 'Failed to upload file.');
};
