import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const fetchPubs = (params = {}) =>
  api.get("/pubs", { params }).then((r) => r.data);

export const fetchPub = (id) => api.get(`/pubs/${id}`).then((r) => r.data);

export const fetchFeatured = (limit = 6) =>
  api.get("/pubs/featured", { params: { limit } }).then((r) => r.data);

export const fetchRandom = (params = {}) =>
  api.get("/pubs/random", { params }).then((r) => r.data);

export const fetchNearest = (lat, lng, limit = 10) =>
  api.get("/pubs/nearest", { params: { lat, lng, limit } }).then((r) => r.data);

export const fetchDistricts = () =>
  api.get("/districts").then((r) => r.data);

export const fetchBeers = () => api.get("/beers").then((r) => r.data);

export const fetchStats = () => api.get("/stats").then((r) => r.data);

export const fetchReviews = (pubId) =>
  api.get(`/reviews/${pubId}`).then((r) => r.data);

export const postReview = (payload) =>
  api.post("/reviews", payload).then((r) => r.data);
