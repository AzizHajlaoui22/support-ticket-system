const API_URL = 'http://localhost:5000';

function getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    };
  }
  
  function redirectIfNotLoggedIn() {
    if (!getToken()) {
      window.location.href = 'login.html';
    }
  }
  
  function getUserRoleFromToken() {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  }
  