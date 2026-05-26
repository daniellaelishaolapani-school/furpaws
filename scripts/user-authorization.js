
function getUsers() {
      return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
      localStorage.setItem("users", JSON.stringify(users));
}

function generateUserID(prefix, array, idField) {
      const count = array.length + 1;
      return `${prefix}-${String(count).padStart(3, "0")}`;
}

const adminAccounts = [
      {
            userID: "A-001",
            role: "admin",
            email: "admin1@furpaws.com",
            password: "admin1_password",
      },
      {
            userID: "A-002",
            role: "admin",
            email: "admin2@furpaws.com",
            password: "admin2_password",            
      }
];

const path = window.location.pathname;
const signInUser = path.includes("1_sign_in_user_account.html");
const signInAdmin = path.includes("2_sign_in_admin_account.html");
const signUp = path.includes("3_sign_up.html");

if (signInUser) {
      const form = document.querySelector(".sign-in-form");

      form.addEventListener("submit", function (e) {
            e.preventDefault();

            const inputs = form.querySelectorAll("input");
            const email = inputs[0].value.trim();
            const password = inputs[1].value;

            const users = getUsers();
            const match = users.find((u) => u.email === email && u.password === password);

            if (!match) {
                  alert("Invalid email or password.");
                  return;
            }

            localStorage.setItem("currentUser", JSON.stringify(match));
            window.location.href = "../user dashboard/1_overview.html";
      });
}

if (signInAdmin) {
      const form = document.querySelector(".sign-in-form");
      
      form.addEventListener("submit", function (e) {
            e.preventDefault();
            
            const inputs = form.querySelectorAll("input");
            const email = inputs[0].value.trim();
            const password = inputs[1].value;

            const match = adminAccounts.find((a) => a.email === email && a.password === password);
            
            if (!match) {
                  alert("Invalid admin credentials.");
                  return;
            }
            
            localStorage.setItem("currentUser", JSON.stringify(match));
            window.location.href = "../admin dashboard/1_overview.html";
      });
}

if (signUp) {
      const form = document.querySelector(".sign-up-form");
      
      form.addEventListener("submit", function (e) {
            e.preventDefault();

            const fields = form.querySelectorAll("input");
            const firstName = fields[0].value.trim();
            const lastName = fields[1].value.trim();
            const email = fields[2].value.trim();
            const password = fields[3].value;
            const confirmPassword = fields[4].value;

            if (!firstName || !lastName || !email || !password || !confirmPassword) {
                  alert("Please fill in all required fields.");
                  return;
            }

            if (password !== confirmPassword) {
                  alert("Passwords do not match.");
                  return;
            }

            const users = getUsers();

            const emailTaken = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
            if (emailTaken) {
                  alert("An account with that email address already exists.");
                  return;
            }

            const newUser = {
                  userID: generateUserID("U", users, "userID"),
                  role: "user",
                  firstName,
                  lastName,
                  middleInitial: "",
                  email,
                  password,
                  contactNumber: "",
                  birthday: {month: null, day: null, year: null},
                  address: {houseNumber: "", streetNameOrBuilding: "", barangay: ""},
            };

            users.push(newUser);
            saveUsers(users);

            alert("Account created successfully! You may now sign in.");
            window.location.href = "1_sign_in_user_account.html";
      });
}