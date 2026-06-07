const FAV_KEY = "praha_pivo_favorites_v1";
const CRAWL_KEY = "praha_pivo_crawl_v1";

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};
const write = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export const getFavorites = () => read(FAV_KEY);
export const isFavorite = (id) => read(FAV_KEY).includes(id);
export const toggleFavorite = (id) => {
  const f = read(FAV_KEY);
  const idx = f.indexOf(id);
  if (idx >= 0) f.splice(idx, 1);
  else f.push(id);
  write(FAV_KEY, f);
  return f;
};

export const getCrawl = () => read(CRAWL_KEY);
export const addToCrawl = (id) => {
  const f = read(CRAWL_KEY);
  if (!f.includes(id)) f.push(id);
  write(CRAWL_KEY, f);
  return f;
};
export const removeFromCrawl = (id) => {
  const f = read(CRAWL_KEY).filter((x) => x !== id);
  write(CRAWL_KEY, f);
  return f;
};
export const reorderCrawl = (newOrder) => {
  write(CRAWL_KEY, newOrder);
  return newOrder;
};
export const clearCrawl = () => write(CRAWL_KEY, []);
