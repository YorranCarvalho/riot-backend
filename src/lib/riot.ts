import axios from "axios";

export const riotApi = axios.create({
  timeout: 10000,
  headers: {
    "X-Riot-Token": process.env.RIOT_API_KEY || "",
  },
});

riotApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("RIOT API ERROR:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return Promise.reject(error);
  }
);