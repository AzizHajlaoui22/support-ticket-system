async function loadAgents() {
    try {
        const res = await fetch(`${API_URL}/api/users?role=agent`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error("Erreur chargement agents");

        const agents = await res.json();
        const select = document.getElementById("agentId");

        agents.forEach(agent => {
            const option = document.createElement("option");
            option.value = agent._id;
            option.textContent = `${agent.name} (${agent.email})`;
            select.appendChild(option);
         });
    } catch (error) {
    console.error("Erreur chargement des agents :", error);
    }
}
