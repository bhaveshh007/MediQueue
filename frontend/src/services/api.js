const API_BASE_URL = "http://mediqueue-alb-1885354462.ap-south-1.elb.amazonaws.com/api";

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from server");
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const api = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "GET",
    }),

  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "DELETE",
    }),
};