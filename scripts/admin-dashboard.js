const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "admin") {
      window.location.href = "../../pages/user authorization/2_sign_in_admin_account.html";
}


function getPets() {
      return JSON.parse(localStorage.getItem("pets")) || [];
}

function savePets(pets) {
      localStorage.setItem("pets", JSON.stringify(pets));
}

function getUsers() {
      return JSON.parse(localStorage.getItem("users")) || [];
}

function setupHeader() {
      const logoutBtn = document.querySelector(".logout-btn") || document.querySelector(".dashboard-navbar-logout");
      if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                  localStorage.removeItem("currentUser");
                  window.location.href = "../../pages/user authorization/2_sign_in_admin_account.html";
            });
      }
}
setupHeader();



const path = window.location.pathname;
const isOverview = path.includes("1_overview.html");
const isUserMng = path.includes("2_user_management.html");
const isPetRecords = path.includes("3_pet_records.html");
const isPendingPage = path.includes("4_pending_approvals.html");

function isRegistrationOverdue(registeredAtStr) {
      if (!registeredAtStr) return false;
      const registeredDate = new Date(registeredAtStr);
      const expirationDate = new Date(registeredDate);
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      return new Date() > expirationDate;
}


if (isOverview) {
    function renderDashboardCharts() {
        const pets = getPets();
        const users = getUsers();

        const dogCount = pets.filter(p => (p.species || "").toLowerCase() === 'dog').length;
        const catCount = pets.filter(p => (p.species || "").toLowerCase() === 'cat').length;
        const otherCount = pets.filter(p => (p.species || "").toLowerCase() === 'other').length;

        if(document.getElementById('dog-count')) document.getElementById('dog-count').textContent = dogCount;
        if(document.getElementById('cat-count')) document.getElementById('cat-count').textContent = catCount;
        if(document.getElementById('others-count')) document.getElementById('others-count').textContent = otherCount;

        const pendingList = document.getElementById("pending-list");
        if (pendingList) {
            const pending = pets.filter(p => p.registrationStatus === "Pending");
            pendingList.innerHTML = pending.length > 0 
                ? pending.slice(0, 4).map(p => `<li>${p.name || "Unknown"} — ${p.registrationID || "No ID"}</li>`).join('') 
                : "<li>No pending approvals.</li>";
        }

        const overdueList = document.getElementById("overdue-list");
        if (overdueList) {
            const overdue = pets.filter(p => p.registrationStatus === "Approved" && isRegistrationOverdue(p.registeredAt));
            overdueList.innerHTML = overdue.length > 0 
                ? overdue.slice(0, 4).map(p => `<li>${p.name || "Unknown"} — ${p.registrationID || "No ID"}</li>`).join('') 
                : "<li>No overdue registrations.</li>";
        }

        const updateBar = (className, species) => {
            const bar = document.querySelector(className);
            if (bar) {
                const petsOfSpecies = pets.filter(p => (p.species || "").toLowerCase() === species.toLowerCase());
                const total = petsOfSpecies.length || 0;
                const count = petsOfSpecies.filter(p => (p.vaccinated || "").toLowerCase() === "yes").length;
                const pct = total > 0 ? (count / total) * 100 : 0;
                bar.style.height = `${pct}%`;
                bar.textContent = count > 0 ? count : "";
            }
        };

        updateBar(".vac-gradient-1", "dog");
        updateBar(".vac-gradient-2", "cat");
        updateBar(".vac-gradient-3", "other");
    }

    document.addEventListener("DOMContentLoaded", () => {
        renderDashboardCharts();
    });

    window.addEventListener('petsUpdated', renderDashboardCharts);
}

if (isUserMng) {
      let currentSort = "name"; 
      const searchInput = document.getElementById("searchinput");
      const userTableBody = document.getElementById("userTableBody");
      const dropdownMenu = document.getElementById("dropdownMenu");
      const sortBtn = document.getElementById("sortbtn");

      if (sortBtn && dropdownMenu) {
            sortBtn.addEventListener("click", () => dropdownMenu.classList.toggle("show"));
            window.addEventListener("click", (e) => {
                  if (!sortBtn.contains(e.target)) dropdownMenu.classList.remove("show");
            });
      }

      function renderUserTable() {
            if (!userTableBody) return;
            userTableBody.innerHTML = "";

            const users = getUsers().filter(u => u.role === "user");
            const pets = getPets();
            const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

            let filteredUsers = users.filter(u => {
                  const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
                  return fullName.includes(query) || 
                         (u.userID || "").toLowerCase().includes(query) || 
                         (u.email || "").toLowerCase().includes(query);
            });

            if (currentSort === "name") {
                  filteredUsers.sort((a, b) => (a.lastName || "").localeCompare(b.lastName || ""));
            } else if (currentSort === "userid") {
                  filteredUsers.sort((a, b) => (a.userID || "").localeCompare(b.userID || ""));
            }

            if (filteredUsers.length === 0) {
                  userTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #fff; padding: 20px;">No users found.</td></tr>`;
                  return;
            }

            filteredUsers.forEach(user => {
                  const userPets = pets.filter(p => p.ownerID === user.userID);
                  const tr = document.createElement("tr");

                  const middleInitial = user.middleInitial ? ` ${user.middleInitial}.` : "";
                  const formattedName = `${(user.lastName || "").toUpperCase()}, ${(user.firstName || "").toUpperCase()}${middleInitial.toUpperCase()}`;

                  tr.innerHTML = `
                        <td>${formattedName}</td>
                        <td>${user.userID || "—"}</td>
                        <td>${user.email || "—"}</td>
                        <td>${user.contactNumber || "—"}</td>
                        <td style="text-align: center;">${userPets.length}</td>
                        <td><button class="view-user-btn" data-id="${user.userID}" style="cursor:pointer; background: transparent; color:#a3e635; border:none; text-decoration: underline; font-weight: bold; font-family: inherit;">VIEW</button></td>
                  `;
                  userTableBody.appendChild(tr);
            });

            userTableBody.querySelectorAll(".view-user-btn").forEach(btn => {
                  btn.addEventListener("click", function() {
                        populateUserSidebar(this.dataset.id);
                  });
            });
      }

      function populateUserSidebar(userID) {
            const user = getUsers().find(u => u.userID === userID);
            if (!user) return;

            const pets = getPets().filter(p => p.ownerID === userID);
            
            const sideHeader = document.querySelector(".user-details h3");
            if (sideHeader) {
                  const middleInitial = user.middleInitial ? ` ${user.middleInitial}.` : "";
                  sideHeader.textContent = `${(user.lastName || "").toUpperCase()}, ${(user.firstName || "").toUpperCase()}${middleInitial.toUpperCase()}`;
            }

            if (document.getElementById("userid")) document.getElementById("userid").textContent = user.userID || "—";
            if (document.getElementById("useremail")) document.getElementById("useremail").textContent = user.email || "—";
            if (document.getElementById("usercontact")) document.getElementById("usercontact").textContent = user.contactNumber || "—";

            const userPetsUl = document.getElementById("userpets");
            if (userPetsUl) {
                  userPetsUl.innerHTML = "";
                  
                  if (document.getElementById("petregid")) document.getElementById("petregid").textContent = "—";
                  if (document.getElementById("petstatus")) document.getElementById("petstatus").textContent = "—";

                  if (pets.length === 0) {
                        const li = document.createElement("li");
                        li.textContent = "No registered pets found.";
                        li.style.color = "#bbb";
                        userPetsUl.appendChild(li);
                  } else {
                        pets.forEach((pet, index) => {
                              const li = document.createElement("li");
                              li.textContent = pet.name;
                              li.style.cursor = "pointer";
                              li.style.textDecoration = "underline";
                              li.style.color = "#a3e635";
                              li.style.marginBottom = "4px";
                              
                              li.addEventListener("click", () => {
                                    if (document.getElementById("petregid")) document.getElementById("petregid").textContent = pet.registrationID || "—";
                                    if (document.getElementById("petstatus")) document.getElementById("petstatus").textContent = pet.registrationStatus || "—";
                              });
                              
                              userPetsUl.appendChild(li);

                              if (index === 0) {
                                    if (document.getElementById("petregid")) document.getElementById("petregid").textContent = pet.registrationID || "—";
                                    if (document.getElementById("petstatus")) document.getElementById("petstatus").textContent = pet.registrationStatus || "—";
                              }
                        });
                  }
            }
      }

      if (dropdownMenu) {
            dropdownMenu.querySelectorAll(".dropdown-item").forEach(item => {
                  item.addEventListener("click", function() {
                        currentSort = this.dataset.value;
                        if (sortBtn) sortBtn.innerHTML = `Sort By: ${this.textContent} <span class="arrow">▼</span>`;
                        dropdownMenu.classList.remove("show");
                        renderUserTable();
                  });
            });
      }

      if (searchInput) {
            searchInput.addEventListener("input", renderUserTable);
      }

      renderUserTable();
}


if (isPetRecords) {
      let currentSort = "name";
      const searchInput = document.getElementById("searchinput");
      const petTableBody = document.getElementById("petTableBody");
      const dropdownMenu = document.getElementById("dropdownMenu");
      const sortBtn = document.getElementById("sortbtn");

      if (sortBtn && dropdownMenu) {
            sortBtn.addEventListener("click", () => dropdownMenu.classList.toggle("show"));
            window.addEventListener("click", (e) => {
                  if (!sortBtn.contains(e.target)) dropdownMenu.classList.remove("show");
            });
      }

      function renderPetTable() {
            if (!petTableBody) return;
            petTableBody.innerHTML = "";

            const pets = getPets();
            const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

            let filteredPets = pets.filter(p => {
                  return (p.name || "").toLowerCase().includes(query) || 
                         (p.registrationID || "").toLowerCase().includes(query) || 
                         (p.ownerID || "").toLowerCase().includes(query) || 
                         (p.species || "").toLowerCase().includes(query);
            });

            if (currentSort === "name") {
                  filteredPets.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            } else if (currentSort === "regid") {
                  filteredPets.sort((a, b) => (a.registrationID || "").localeCompare(b.registrationID || ""));
            }

            if (filteredPets.length === 0) {
                  petTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #fff; padding: 20px;">No pets found.</td></tr>`;
                  return;
            }

            filteredPets.forEach(pet => {
                  const tr = document.createElement("tr");
                  
                  tr.innerHTML = `
                        <td>${pet.ownerID || "—"}</td>
                        <td>${pet.registrationID || "—"}</td>
                        <td><strong>${pet.name || "Un-named"}</strong></td>
                        <td>${pet.species || "—"}</td>
                        <td><span class="status-badge ${(pet.registrationStatus || "pending").toLowerCase()}">${pet.registrationStatus || "Pending"}</span></td>
                        <td><button class="view-pet-btn" data-id="${pet.petID}" style="cursor:pointer; background: transparent; color:#a3e635; border:none; text-decoration: underline; font-weight: bold; font-family: inherit;">VIEW</button></td>
                  `;
                  petTableBody.appendChild(tr);
            });

            petTableBody.querySelectorAll(".view-pet-btn").forEach(btn => {
                  btn.addEventListener("click", function() {
                        populatePetSidebar(this.dataset.id);
                  });
            });
      }

      function populatePetSidebar(petID) {
            const pet = getPets().find(p => p.petID === petID);
            if (!pet) return;

            const sideHeader = document.querySelector(".pet-details h3");
            if (sideHeader) {
                  const genderLabel = (pet.sex || "—").toUpperCase();
                  sideHeader.textContent = `${pet.name ? pet.name.toUpperCase() : "UN-NAMED"} | ${genderLabel}`;
            }

            if (document.getElementById("petage")) document.getElementById("petage").textContent = pet.age || "—";
            if (document.getElementById("petspecies")) document.getElementById("petspecies").textContent = pet.species || "—";
            if (document.getElementById("petbreed")) document.getElementById("petbreed").textContent = pet.breed || "—";
            if (document.getElementById("petbirthday")) document.getElementById("petbirthday").textContent = pet.birthday || "—";
            if (document.getElementById("petregid")) document.getElementById("petregid").textContent = pet.registrationID || "—";
            if (document.getElementById("petstatus")) document.getElementById("petstatus").textContent = pet.registrationStatus || "—";
            if (document.getElementById("petnotes")) document.getElementById("petnotes").textContent = pet.notes || "—";
            
            if (document.getElementById("petmedical")) {
                  document.getElementById("petmedical").textContent = pet.vaccinated ? `Vaccinated: ${pet.vaccinated.toUpperCase()}` : "—";
            }
            if (document.getElementById("petmore")) {
                  document.getElementById("petmore").textContent = pet.neuteredOrSpayed ? `Spayed/Neutered: ${pet.neuteredOrSpayed.toUpperCase()}` : "—";
            }
      }

      if (dropdownMenu) {
            dropdownMenu.querySelectorAll(".dropdown-item").forEach(item => {
                  item.addEventListener("click", function() {
                        currentSort = this.dataset.value;
                        if (sortBtn) sortBtn.innerHTML = `Sort By: ${this.textContent} <span class="arrow">▼</span>`;
                        dropdownMenu.classList.remove("show");
                        renderPetTable();
                  });
            });
      }

      if (searchInput) {
            searchInput.addEventListener("input", renderPetTable);
      }

      renderPetTable();
}

if (isPendingPage) {
      function renderPendingQueues() {
            const pets = getPets();

            const newRegBody = document.getElementById("new-registration-tbody") || document.querySelector("table tbody");
            const renewalBody = document.getElementById("for-renewal-tbody");
            const updateBody = document.getElementById("pet-update-tbody");

            const pendingNew = pets.filter(p => p.registrationStatus === "Pending");
            const pendingRenewals = pets.filter(p => p.registrationStatus === "Approved" && isRegistrationOverdue(p.registeredAt));
            const approvedUpdates = pets.filter(p => p.registrationStatus === "Approved" && !isRegistrationOverdue(p.registeredAt));
            
            if (newRegBody) buildTableRows(newRegBody, pendingNew, "new");
            if (renewalBody) buildTableRows(renewalBody, pendingRenewals, "renewal");
            if (updateBody) buildTableRows(updateBody, approvedUpdates, "update");
      }

      function buildTableRows(tbodyElement, petArray, currentTabType) {
            tbodyElement.innerHTML = "";
            const columnCount = tbodyElement.closest('table')?.querySelectorAll('thead th').length || 9;

            if (petArray.length === 0) {
                  tbodyElement.innerHTML = `<tr><td colspan="${columnCount}" style="text-align: center; color: #fff; padding: 20px;">No records found in this category.</td></tr>`;
                  return;
            }

            petArray.forEach(pet => {
                  const tr = document.createElement("tr");
                  const dateFormatted = pet.registeredAt ? new Date(pet.registeredAt).toLocaleDateString() : "MM-DD-YYYY";
                  const genderChar = (pet.sex || "F").toUpperCase().charAt(0);

                  tr.innerHTML = `
                        <td>${dateFormatted}</td>
                        <td>${pet.ownerID || "—"}</td>
                        <td><strong>${pet.name || "—"}</strong></td>
                        <td>${genderChar}</td>
                        <td>${pet.species || "—"}</td>
                        <td>${pet.breed || "—"}</td>
                        <td>${pet.birthday || "N/A"}</td>
                        <td>${pet.age || "—"}</td>
                        <td>
                              <button class="reject-action-btn" data-id="${pet.petID}" style="background: #ef4444; color: #fff; border:none; padding: 6px 12px; border-radius:4px; cursor:pointer; font-weight:bold; margin-right:6px; font-family: inherit;">REJECT</button>
                              ${currentTabType !== "update" ? `<button class="approve-action-btn" data-id="${pet.petID}" style="background: #22c55e; color: #fff; border:none; padding: 6px 12px; border-radius:4px; cursor:pointer; font-weight:bold; font-family: inherit;">APPROVE</button>` : ''}
                        </td>
                  `;
                  tbodyElement.appendChild(tr);
            });

            tbodyElement.querySelectorAll(".approve-action-btn").forEach(btn => {
                  btn.addEventListener("click", function() {
                        processApplication(this.dataset.id, "Approved", currentTabType === "renewal");
                  });
            });

            tbodyElement.querySelectorAll(".reject-action-btn").forEach(btn => {
                  btn.addEventListener("click", function() {
                        processApplication(this.dataset.id, "Rejected", currentTabType === "renewal");
                  });
            });
      }

      function processApplication(petID, decision, isRenewalContext) {
            let pets = getPets();
            const index = pets.findIndex(p => p.petID === petID);

            if (index !== -1) {
                  if (confirm(`Are you sure you want to mark this pet item as ${decision.toUpperCase()}?`)) {
                        pets[index].registrationStatus = decision;
                        if (decision === "Approved" && isRenewalContext) {
                              pets[index].registeredAt = new Date().toISOString();
                        }
                        savePets(pets);
                        renderPendingQueues();
                  }
            }
      }

      renderPendingQueues();
}
