const apiBase = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "";

async function request(path, options = {}, params = {}) {
  let url = `${apiBase}/${path}`.replace(/([^:]\/)\/+/g, "$1");

  if (Object.keys(params).length > 0) {
    const query = new URLSearchParams(params).toString();
    url = `${url}?${query}`;
  }

  const response = await fetch(url, {
    ...options,
  });

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

export const register = (payload) =>
  request("auth/register", { method: "POST" }, payload);

export const login = (payload) =>
  request("auth/login", { method: "POST" }, payload);

export const getPolls = () => request("polls", { method: "GET" });

export const getPoll = (id) => request(`polls/${id}`, { method: "GET" });

export const createPoll = async (payload) => {
  const pollRes = await request("polls", { method: "POST" }, payload);
  return pollRes;
};

export const vote = (payload) =>
  request(
    "votes",
    { method: "POST" },
    {
      option_id: String(payload.option_id),
      user_id: String(payload.user_id),
    },
  );

export const getResults = (pollId) =>
  request(`polls/${pollId}/results`, { method: "GET" });

export const createOption = (payload) =>
  request("options", { method: "POST" }, payload);
