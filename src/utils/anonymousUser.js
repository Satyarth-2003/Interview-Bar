const STORAGE_KEY = "interviewbar_anon_id";

export const getAnonymousUserId = () => {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = `guest_${crypto.randomUUID()}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
};
