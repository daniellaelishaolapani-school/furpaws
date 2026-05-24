/* PENDING APPROVAL JS */

<script>
  
  function logout() {
    window.location.href = "../index.html";
  }
  const data = {
    "new-reg": [
      { date: "MM-DD-YYYY", uid: "UID", name: "PET'S NAME", mf: "F", species: "CAT", breed: "PET'S BREED", birthday: "N/A", age: 1 },
      { date: "MM-DD-YYYY", uid: "UID", name: "PET'S NAME", mf: "M", species: "DOG", breed: "PET'S BREED", birthday: "N/A", age: 2 },
    ],
    "for-renewal": [
      { date: "MM-DD-YYYY", uid: "UID", name: "PET'S NAME", mf: "F", species: "CAT", breed: "PET'S BREED", birthday: "N/A", age: 1 },
      { date: "MM-DD-YYYY", uid: "UID", name: "PET'S NAME", mf: "M", species: "DOG", breed: "PET'S BREED", birthday: "N/A", age: 2 },
    ],
    "pet-info": [
      { date: "MM-DD-YYYY", uid: "UID", name: "PET'S NAME", mf: "F", species: "CAT", breed: "PET'S BREED", birthday: "N/A", age: 1 },
      { date: "MM-DD-YYYY", uid: "UID", name: "PET'S NAME", mf: "M", species: "DOG", breed: "PET'S BREED", birthday: "N/A", age: 2 },
    ]
  };

  function renderRows(tabId) {
    const tbody = document.getElementById(tabId + "-body");
    const rows = data[tabId];
    tbody.innerHTML = rows.map((pet, index) => `
      <tr>
        <td>${pet.date}</td>
        <td>${pet.uid}</td>
        <td><span class="view-link">VIEW</span></td>
        <td>${pet.name}</td>
        <td>${pet.mf}</td>
        <td>${pet.species}</td>
        <td>${pet.breed}</td>
        <td>${pet.birthday}</td>
        <td>${pet.age}</td>
        <td><span class="view-link">VIEW</span></td>
        <td><span class="view-link">VIEW</span></td>
        <td><button class="btn-reject" onclick="handleAction('${tabId}', ${index}, 'reject')">REJECT</button></td>
        <td><button class="btn-approve" onclick="handleAction('${tabId}', ${index}, 'approve')">APPROVE</button></td>
      </tr>
    `).join("");
  }

  function handleAction(tabId, index, action) {
    const pet = data[tabId][index];
    if (action === "approve") {
      alert(`Approved: ${pet.name} (${pet.species})`);
    } else {
      alert(`Rejected: ${pet.name} (${pet.species})`);
    }
    data[tabId].splice(index, 1);
    renderRows(tabId);
  }
  
  function switchTab(id, clickedTab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    clickedTab.classList.add('active');
  }

  renderRows("new-reg");
  renderRows("for-renewal");
  renderRows("pet-info");
</script>
