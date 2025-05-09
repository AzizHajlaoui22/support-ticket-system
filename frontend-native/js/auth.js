
function saveToken(token) {
  localStorage.setItem('token', token);
}

function getToken() {
  return localStorage.getItem('token');
}

function logoutUser() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

async function registerUser(name, email, password, role) {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Inscription réussie !");
      window.location.href = 'login.html'; // ⬅ redirige vers page de login
    } else {
      alert(data.message || "Erreur lors de l'inscription");
    }
  } catch (err) {
    alert("Erreur serveur : " + err.message);
  }
}

async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      saveToken(data.token);
      window.location.href = 'dashboard.html';
    } else {
      alert(data.message || "Email ou mot de passe incorrect");
    }
  } catch (err) {
    alert("Erreur serveur : " + err.message);
  }
}
