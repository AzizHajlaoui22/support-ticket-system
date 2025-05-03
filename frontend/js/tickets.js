
async function loadDashboard() {
    const role = getUserRoleFromToken();
    let tickets = [];
  
    try {
      let url;
  
      if (role === 'admin') {
        url = `${API_URL}/api/tickets/all`;
      } else if (role === 'agent') {
        url = `${API_URL}/api/tickets/assigned`;
      } else {
        url = `${API_URL}/api/tickets/my`;
      }
  
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
  
      tickets = await res.json();
      displayTickets(tickets);
      
    } catch (error) {
      console.error("Erreur chargement des tickets:", error);
      alert("Impossible de charger les tickets");
    }
  }

function displayTickets(tickets) {
  const tbody = document.getElementById('ticketsBody');
  tbody.innerHTML = "";

  const role = getUserRoleFromToken(); // 🔍 Récupérer le rôle de l'utilisateur connecté

  tickets.forEach(ticket => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${ticket._id}</td>
      <td>${ticket.title}</td>
      <td>${ticket.status}</td>
      <td>${ticket.assignedTo?.name || '–'}</td>
      <td>
        <a href="ticket_details.html?id=${ticket._id}" class="btn btn-sm btn-primary">Voir</a>
        ${role === "admin" ? `<button onclick="deleteTicket('${ticket._id}')" class="btn btn-sm btn-danger ms-2">Supprimer</button>` : ""}
      </td>
    `;
    tbody.appendChild(tr);
  });
  
}
async function createTicket(title, description) {
    try {
      const response = await fetch(`${API_URL}/api/tickets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, description })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("🎉 Ticket créé avec succès !");
        window.location.href = "dashboard.html";
      } else {
        alert(data.message || "Erreur lors de la création du ticket");
      }
    } catch (error) {
      console.error("Erreur création ticket:", error);
      alert("Erreur réseau ou serveur");
    }
  }
  async function getTicketById(id) {
    try {
      const res = await fetch(`${API_URL}/api/tickets/${id}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Erreur ticket");
      return await res.json();
    } catch (err) {
      console.error(err);
      alert("Impossible de charger le ticket.");
      return null;
    }
  }
  
  async function updateTicket(id, data) {
    try {
      const res = await fetch(`${API_URL}/api/tickets/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
  
      if (res.ok) {
        alert("Ticket mis à jour !");
        window.location.href = "dashboard.html"; // ✅ Redirige vers le tableau de bord
      } else {
        const err = await res.json();
        alert("Erreur: " + (err.message || "échec mise à jour"));
      }
    } catch (err) {
      console.error(err);
      alert("Erreur serveur.");
    }
  }
  async function deleteTicket(id) {
    if (!confirm("⚠️ Es-tu sûr de vouloir supprimer ce ticket ?")) return;
  
    try {
      const res = await fetch(`${API_URL}/api/tickets/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
  
      if (res.ok) {
        alert("✅ Ticket supprimé !");
        location.reload();
      } else {
        const err = await res.json();
        alert("❌ Erreur suppression: " + (err.message || "échec"));
      }
    } catch (err) {
      console.error("Erreur deleteTicket:", err);
      alert("Erreur serveur.");
    }
  }
  async function assignTicket(id, agentId) {
    try {
      const res = await fetch(`${API_URL}/api/tickets/${id}/assign`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ agentId })
      });
  
      if (res.ok) {
        alert("Ticket assigné !");
        location.reload();
      } else {
        const err = await res.json();
        alert("Erreur assignation: " + (err.message || "échec"));
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    }
  }
  
  async function closeTicket(id) {
    try {
      const res = await fetch(`${API_URL}/api/tickets/${id}/close`, {
        method: "PUT",
        headers: getAuthHeaders()
      });
  
      if (res.ok) {
        alert("Ticket clôturé !");
        location.reload();
      } else {
        const err = await res.json();
        alert("Erreur clôture: " + (err.message || "échec"));
      }
    } catch (err) {
      console.error(err);
      alert("Erreur serveur.");
    }
  }
  async function loadTicketDetails() {
    const ticket = await getTicketById(ticketId);
    
    if (!ticket) return;
    console.log("DEBUG: ticket.assigné à = ", ticket.assignedTo);

    document.getElementById("title").value = ticket.title;
    document.getElementById("description").value = ticket.description;

    document.getElementById("ticketInfo").innerHTML = `
      <p><strong>ID:</strong> ${ticket._id}</p>
      <p><strong>Statut:</strong> ${ticket.status}</p>
      <p><strong>Créé par:</strong> ${ticket.createdBy?.name || "N/A"}</p>
      <p><strong>Assigné à:</strong> ${ticket.assignedTo?.name || "Non assigné"}</p>
    `;

    const role = getUserRoleFromToken();
    if (role === "admin") {
      document.getElementById("adminActions").classList.remove("d-none");
      await loadAgents(); // 👈 Ceci appelle la fonction JS qui va chercher tous les agents
    }
    if (role === "admin") document.getElementById("adminActions").classList.remove("d-none");
    if ((role === "admin" || role === "agent") && ticket.status !== "closed") document.getElementById("closeActions").classList.remove("d-none");
  }