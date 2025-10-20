//helper functions for saving and retrieving auth token
export function saveToken(token: string) {
  localStorage.setItem('auth_token', token);
}
export function getToken() {
  return localStorage.getItem('auth_token') || '';
}