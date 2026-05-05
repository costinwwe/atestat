const apiBase = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "";

async function request(path, options = {}) {
  const url = `${apiBase}/${path}`.replace(/\/+/g, "/");
  const init = {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  };

  if (init.body && typeof init.body === "object") {
    init.body = JSON.stringify(init.body);
  }

  const response = await fetch(url, init);
  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || response.statusText || "Request failed",
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function requestWithResponse(path, options = {}) {
  const url = `${apiBase}/${path}`.replace(/\/+/g, "/");
  const init = {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  };

  if (init.body && typeof init.body === "object") {
    init.body = JSON.stringify(init.body);
  }

  const response = await fetch(url, init);
  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || response.statusText || "Request failed",
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return { data, headers: response.headers, status: response.status };
}

export const register = (payload) =>
  request("auth/register", { method: "POST", body: payload });
export const login = (payload) =>
  request("auth/login", { method: "POST", body: payload });
export const getPolls = () => request("polls");
export const getPoll = (id) => request(`polls/${id}`);
export const createPoll = (payload) =>
  requestWithResponse("polls", { method: "POST", body: payload });
export const createOption = (payload) =>
  request("options", { method: "POST", body: payload });
export const vote = (payload) =>
  request("votes", { method: "POST", body: payload });
export const getResults = (pollId) => request(`polls/${pollId}/results`);
