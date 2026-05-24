
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "user") {
      window.location.href = "../../pages/user authorization/1_sign_in_user_account.html";
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

function saveUsers(users) {
      localStorage.setItem("users", JSON.stringify(users));
}

function generateID(prefix, array) {
      const count = array.length + 1;
      return `${prefix}-${String(count).padStart(3, "0")}`;
}

function formatDisplayName(user) {
      const middleInitial = user.middleInitial ? ` ${user.middleInitial}.` : "";
      return `${user.lastName.toUpperCase()}, ${user.firstName.toUpperCase()}${middleInitial}`;
}

function buildPetCard(pet, clickable) {
      const petCardImage = "../../assets/svg/about us paw print 1.svg";

      const card = document.createElement("div");
      card.className = "pet-card";
      card.dataset.petID = pet.petID;

      const img = document.createElement("img");
      img.src = petCardImage;

      const photo = document.createElement("div");
      photo.className = "pet-card-photo";

      const label = document.createElement("div");
      label.className = "pet-card-label";
      label.innerHTML = `<p class="pet-card-name">${pet.name}</p>` + `<p class="pet-card-age">${pet.age || "—"}</p>`;

      photo.appendChild(img);      
      card.appendChild(photo);
      card.appendChild(label);

      if (!clickable) {
            card.style.cursor = "default";
      }

      return card;
}

function fillNavbar() {
      const navbarName  = document.querySelector(".dashboard-navbar-user-name");
      const navbarEmail = document.querySelector(".dashboard-navbar-user-email");

      if (navbarName) navbarName.textContent = formatDisplayName(currentUser);
      if (navbarEmail) navbarEmail.textContent = currentUser.email;

      const logoutButton = document.querySelector(".dashboard-navbar-logout");
      if (logoutButton) {
            logoutButton.addEventListener("click", function () {
                  localStorage.removeItem("currentUser");
                  window.location.href = "../../pages/user authorization/1_sign_in_user_account.html";
            });
      }
}

fillNavbar();

const path = window.location.pathname;
const overviewPage = path.includes("1_overview.html");
const myPetsPage = path.includes("2_my_pets.html");
const editProfilePage = path.includes("3_edit_profile.html");

if (overviewPage) {
      const myPets = getPets()
            .filter((p) => p.ownerID === currentUser.userID)
            .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

      const petsGrid = document.querySelector(".overview-my-pets-grid");
      if (petsGrid) {
            const preview = myPets.slice(0, 4);
            if (preview.length === 0) {
                  const empty = document.createElement("p");
                  empty.style.cssText = "color: #FFFFFF; font-size: 20px; text-align: center; margin-top: 120px;";
                  empty.textContent = "You have no registered pets.";
                  petsGrid.appendChild(empty);
            } else {
                  const cardRow = document.createElement("div");
                  cardRow.style.cssText = "display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;";
                  preview.forEach((pet) => {
                        cardRow.appendChild(buildPetCard(pet, false));
                  });
                  petsGrid.appendChild(cardRow);
            }
      }

      const remindersList = document.querySelector(".upcoming-reminders-grid .dashboard-list");
      if (remindersList) {
            remindersList.innerHTML = "";
            const recentRemindersList = myPets.slice(0, 3);

            if (recentRemindersList.length === 0) {
                  remindersList.innerHTML = '<li style="text-align: center; margin-top: 34px;">• • • No upcoming reminders.</li>';
            } else {
                  recentRemindersList.forEach((pet) => {
                        const dueDate = new Date(pet.registeredAt);
                        dueDate.setFullYear(dueDate.getFullYear() + 1);
                        const dueDateString = dueDate.toLocaleDateString("en-US", {
                              month: "long", day: "numeric", year: "numeric",
                        });
                        const li = document.createElement("li");
                        li.textContent = `• • • Registration renewal for ${pet.name} due ${dueDateString}`;
                        remindersList.appendChild(li);
                  });
            }
      }

      const activitiesList = document.querySelector(".recent-activities-grid .dashboard-list");
      if (activitiesList) {
            activitiesList.innerHTML = "";
            const recentActivitiesList = myPets.slice(0, 3);

            if (recentActivitiesList.length === 0) {
                  activitiesList.innerHTML = '<li style="text-align: center; margin-top: 34px;">• • • No recent activities.</li>';
            } else {
                  recentActivitiesList.forEach((pet) => {
                        const date = new Date(pet.registeredAt).toLocaleDateString("en-US", {
                              month: "long", day: "numeric", year: "numeric",
                        });
                        const li = document.createElement("li");
                        li.textContent = `• • • Registered ${pet.name} on ${date}`;
                        activitiesList.appendChild(li);
                  });
            }
      }

      const registerForm = document.querySelector(".register-pet-form");
      const registerButton = document.querySelector(".register-now-button");

      if (registerForm) {
            registerForm.addEventListener("submit", function (e) {
                  e.preventDefault();
                  submitPetRegistration();
            });
      }

      function submitPetRegistration() {
            const row1Inputs = registerForm.querySelectorAll(".register-pet-form-row:first-child input");
            const row1Selects = registerForm.querySelectorAll(".register-pet-form-row:first-child select");
            const row2Inputs = registerForm.querySelectorAll(".register-pet-form-row:last-child input");
            const row2Selects = registerForm.querySelectorAll(".register-pet-form-row:last-child select");
 
            const name = row1Inputs[0]?.value.trim() || "";
            const sex = row1Selects[0]?.value || "";
            const species = row1Inputs[1]?.value.trim() || "";
            const breed = row1Inputs[2]?.value.trim() || "";
            const notes = row1Inputs[3]?.value.trim() || "";
 
            const birthday = row2Inputs[0]?.value.trim() || "";
            const age = row2Inputs[1]?.value.trim() || "";
            const vaccinated = row2Selects[0]?.value || "";
            const neuteredOrSpayed = row2Selects[1]?.value || "";
 
            if (!name || !sex || !species || !breed) {
                  alert("Please fill in all required fields.");
                  return;
            }
 
            const pets = getPets();
            const petID = generateID("P", pets);
            const registrationID = generateID("R", pets);
 
            const newPet = {
                  petID,
                  ownerID: currentUser.userID,
                  registrationID,
                  registrationStatus: "Pending",
                  name,
                  sex,
                  species,
                  breed,
                  birthday,
                  age,
                  vaccinated,
                  neuteredOrSpayed,
                  notes,
                  registeredAt: new Date().toISOString(),
            };

            pets.push(newPet);
            savePets(pets);

            alert("Pet registered successfully! Registration is pending admin approval.");
            window.location.reload();
      }
}

if (myPetsPage) {
      let selectedPetID = null;

      function setPanelVisible(visible) {
            const elements = document.querySelectorAll(
                  ".pet-details-panel hr, .remove-pet, .pet-details-info"
            );
            elements.forEach((el) => {
                  el.style.visibility = visible ? "visible" : "hidden";
            });
      }

      const removePetLink = document.querySelector(".remove-pet");
      if (removePetLink) {
            removePetLink.style.pointerEvents = "none";
            removePetLink.style.opacity = "0.4";
      }

      function setRemovePetEnabled(enabled) {
            if (!removePetLink) return;
            removePetLink.style.pointerEvents = enabled ? "auto" : "none";
            removePetLink.style.opacity = enabled ? "1" : "0.4";
      }

      function renderPetGrid() {
            const myPets = getPets().filter((p) => p.ownerID === currentUser.userID);
            const grid = document.querySelector(".my-pets-grid-cards");

            grid.querySelectorAll(".pet-card").forEach((c) => c.remove());

            if (myPets.length === 0) {
                  const empty = document.createElement("p");
                  empty.style.cssText = "grid-column: 1 / -1; color: #FFFFFF; font-size: 20px; text-align: center; margin-top: 200px;";
                  empty.textContent = "You have no registered pets.";
                  grid.appendChild(empty);
                  resetDetailsPanel();
                  return;
            }

            myPets.forEach((pet) => {
                  const card = buildPetCard(pet, true);

                  card.addEventListener("click", () => {
                        grid.querySelectorAll(".pet-card").forEach((c) => c.classList.remove("active"));
                        card.classList.add("active");
                        selectedPetID = pet.petID;
                        fillDetailsPanel(pet);
                        setRemovePetEnabled(true);
                  });

                  grid.appendChild(card);
            });
      }

      function getElementByID(id) {
            return document.getElementById(id);
      }

      function resetDetailsPanel() {
            setPanelVisible(false);

            document.querySelector(".pet-details-header p").textContent = "";
            ["detail-age", "detail-birthday", "detail-species", "detail-breed", "detail-reg-id",
             "detail-reg-status", "detail-vaccinated", "detail-neutered", "detail-pet-notes"]
                  .forEach((id) => {
                        const element = getElementByID(id);
                        if (element) element.textContent = "";
                  });
      }

      function fillDetailsPanel(pet) {
            setPanelVisible(true);

            const sexLabel = pet.sex === "male" ? "M" : pet.sex === "female" ? "F" : "";
            document.querySelector(".pet-details-header p").textContent = `${pet.name.toUpperCase()} | ${sexLabel}`;

            getElementByID("detail-age").textContent = pet.age || "";
            getElementByID("detail-birthday").textContent = pet.birthday || "";
            getElementByID("detail-species").textContent = pet.species || "";
            getElementByID("detail-breed").textContent = pet.breed || "";
            getElementByID("detail-reg-id").textContent = pet.registrationID || "";
            getElementByID("detail-reg-status").textContent = pet.registrationStatus || "";
            getElementByID("detail-vaccinated").textContent = pet.vaccinated ? pet.vaccinated.toUpperCase() : "";
            getElementByID("detail-neutered").textContent = pet.neuteredOrSpayed ? pet.neuteredOrSpayed.toUpperCase() : "";
            getElementByID("detail-pet-notes").textContent = pet.notes || "";
      }

      if (removePetLink) {
            removePetLink.addEventListener("click", function (e) {
                  e.preventDefault();
                  if (!selectedPetID) return;

                  const pets = getPets();
                  const pet = pets.find((p) => p.petID === selectedPetID);
                  if (!pet) return;

                  if (!confirm(`Are you sure you want to remove ${pet.name}?`)) return;

                  savePets(pets.filter((p) => p.petID !== selectedPetID));
                  selectedPetID = null;

                  setRemovePetEnabled(false);
                  resetDetailsPanel();
                  renderPetGrid();
            });
      }

      setPanelVisible(false);
      renderPetGrid();
}

if (editProfilePage) {
      const form = document.querySelector(".edit-profile-form");

      const textInputs = form.querySelectorAll("input");

      function prefillForm(user) {
            textInputs[0].value = user.lastName || "";
            textInputs[1].value = user.firstName || "";
            textInputs[2].value = user.middleInitial || "";
            textInputs[3].value = user.birthday?.month || "";
            textInputs[4].value = user.birthday?.day || "";
            textInputs[5].value = user.birthday?.year || "";
            textInputs[6].value = user.email || "";
            textInputs[7].value = user.contactNumber || "";
            textInputs[8].value = user.address?.houseNumber || "";
            textInputs[9].value = user.address?.streetNameOrBuilding || "";
            textInputs[10].value = user.address?.barangay || "";
      }
      prefillForm(currentUser);

      function updatePanel(user) {
            const middleInitial = user.middleInitial ? ` ${user.middleInitial}.` : "";
            const nameString = `${(user.lastName || "").toUpperCase()}, ${(user.firstName || "").toUpperCase()}${middleInitial.toUpperCase()}`;
            document.querySelector(".panel-name").textContent = nameString;
            document.querySelector(".panel-user-id span").textContent = user.userID;

            const {month, day, year} = user.birthday || {};
            const birthdayString = (month && day && year)
                  ? `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}/${year}`
                  : "";
            document.querySelector(".panel-birthday span").textContent = birthdayString;

            const ProfileSummary = document.querySelectorAll(".profile-summary p");
            const {houseNumber, streetNameOrBuilding, barangay} = user.address || {};
            const addressString = [houseNumber, streetNameOrBuilding, barangay].filter(Boolean).join(", ") || "";
            ProfileSummary[3].querySelector("span").textContent = user.email || "";
            ProfileSummary[4].querySelector("span").textContent = user.contactNumber || "";
            ProfileSummary[5].querySelector("span").textContent = addressString;
      }
      updatePanel(currentUser);

      form.addEventListener("input", function () {
            updatePanel(buildDraftUser());
      });

      function buildDraftUser() {
            return {
                  ...currentUser,
                  lastName: textInputs[0].value.trim(),
                  firstName: textInputs[1].value.trim(),
                  middleInitial: textInputs[2].value.trim(),
                  birthday: {
                        month: parseInt(textInputs[3].value) || null,
                        day: parseInt(textInputs[4].value) || null,
                        year: parseInt(textInputs[5].value) || null,
                  },
                  email: textInputs[6].value.trim(),
                  contactNumber: textInputs[7].value.trim(),
                  address: {
                        houseNumber: textInputs[8].value.trim(),
                        streetNameOrBuilding: textInputs[9].value.trim(),
                        barangay: textInputs[10].value.trim(),
                  },
            };
      }

      form.addEventListener("submit", function (e) {
            e.preventDefault();

            const updated = buildDraftUser();

            if (!updated.firstName || !updated.lastName || !updated.email) {
                  alert("First name, last name, and e-mail are required.");
                  return;
            }

            const users = getUsers();
            const duplicate = users.find((u) => u.email.toLowerCase() === updated.email.toLowerCase() && u.userID !== currentUser.userID);
            if (duplicate) {
                  alert("E-mail address already in use.");
                  return;
            }

            const index = users.findIndex((u) => u.userID === currentUser.userID);
            if (index !== -1) {
                  users[index] = {...users[index], ...updated};
                  saveUsers(users);
            }

            localStorage.setItem("currentUser", JSON.stringify(updated));
            Object.assign(currentUser, updated);

            document.querySelector(".dashboard-navbar-user-name").textContent = formatDisplayName(updated);
            document.querySelector(".dashboard-navbar-user-email").textContent = updated.email;

            updatePanel(updated);
            alert("Profile updated successfully.");
      });
}