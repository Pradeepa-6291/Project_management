const API_BASE = "/api";
let token = localStorage.getItem("token") || "";
let impactChart = null;

const toast = (msg) => {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
};

const authHeaders = () => ({
  Authorization: `Bearer ${token}`,
});

const request = async (url, options = {}) => {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target));
  await request(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  toast("Registration successful");
  e.target.reset();
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const body = Object.fromEntries(new FormData(e.target));
    const data = await request(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    token = data.token;
    localStorage.setItem("token", token);
    toast("Login successful");
    await loadAll();
  } catch (error) {
    toast(error.message);
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  token = "";
  localStorage.removeItem("token");
  toast("Logged out");
});

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const body = Object.fromEntries(new FormData(e.target));
    await request(`${API_BASE}/users/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    });
    toast("Profile updated");
    await loadDashboardRole();
  } catch (error) {
    toast(error.message);
  }
});

document.getElementById("projectForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const fd = new FormData(e.target);
    await request(`${API_BASE}/projects`, {
      method: "POST",
      headers: authHeaders(),
      body: fd,
    });
    toast("Project created");
    e.target.reset();
    await loadProjects();
    await loadImpact();
  } catch (error) {
    toast(error.message);
  }
});

document.getElementById("volunteerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const form = Object.fromEntries(new FormData(e.target));
    const body = {
      user: form.user,
      skills: form.skills ? form.skills.split(",").map((s) => s.trim()) : [],
      assignedTasks: form.tasks ? form.tasks.split(",").map((s) => s.trim()) : [],
      participationHours: Number(form.hours || 0),
    };
    await request(`${API_BASE}/volunteers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    });
    toast("Volunteer added");
    e.target.reset();
    await loadVolunteers();
    await loadImpact();
  } catch (error) {
    toast(error.message);
  }
});

document.getElementById("eventForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const body = Object.fromEntries(new FormData(e.target));
    await request(`${API_BASE}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    });
    toast("Event created");
    e.target.reset();
    await loadEvents();
  } catch (error) {
    toast(error.message);
  }
});

document.getElementById("donationForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const body = Object.fromEntries(new FormData(e.target));
    body.amount = Number(body.amount || 0);
    await request(`${API_BASE}/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    });
    toast("Donation recorded");
    e.target.reset();
    await loadDonations();
    await loadImpact();
  } catch (error) {
    toast(error.message);
  }
});

document.getElementById("projectSearch").addEventListener("input", loadProjects);
document.getElementById("projectStatusFilter").addEventListener("change", loadProjects);

async function loadDashboardRole() {
  if (!token) return;
  const data = await request(`${API_BASE}/users/dashboard`, { headers: authHeaders() });
  document.getElementById("dashboardRole").textContent = `${data.role}: ${data.message}`;
}

async function loadProjects() {
  if (!token) return;
  const search = encodeURIComponent(document.getElementById("projectSearch").value || "");
  const status = encodeURIComponent(
    document.getElementById("projectStatusFilter").value || ""
  );
  const projects = await request(
    `${API_BASE}/projects?search=${search}&status=${status}`,
    { headers: authHeaders() }
  );
  document.getElementById("projectList").innerHTML = projects
    .map((p) => `<li>${p.title} - ${p.status}</li>`)
    .join("");
}

async function loadVolunteers() {
  if (!token) return;
  const volunteers = await request(`${API_BASE}/volunteers`, { headers: authHeaders() });
  document.getElementById("volunteerList").innerHTML = volunteers
    .map((v) => `<li>${v.user?.name || "Unknown"} - ${v.participationHours} hrs</li>`)
    .join("");
}

async function loadEvents() {
  if (!token) return;
  const events = await request(`${API_BASE}/events`, { headers: authHeaders() });
  document.getElementById("eventList").innerHTML = events
    .map((ev) => `<li>${ev.title} @ ${ev.location} on ${new Date(ev.date).toLocaleDateString()}</li>`)
    .join("");
}

async function loadDonations() {
  if (!token) return;
  const donations = await request(`${API_BASE}/donations`, { headers: authHeaders() });
  document.getElementById("donationList").innerHTML = donations
    .map((d) => `<li>${d.donorName} - $${d.amount}</li>`)
    .join("");
}

async function loadImpact() {
  if (!token) return;
  const data = await request(`${API_BASE}/impact/summary`, { headers: authHeaders() });

  document.getElementById("statProjects").textContent = data.totalProjects;
  document.getElementById("statVolunteers").textContent = data.totalVolunteers;
  document.getElementById("statDonations").textContent = data.totalDonations;

  const ctx = document.getElementById("impactChart");
  const labels = data.projectStatus.map((s) => s._id);
  const values = data.projectStatus.map((s) => s.count);

  if (impactChart) impactChart.destroy();
  impactChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Projects by Status", data: values }],
    },
    options: { responsive: true },
  });
}

async function loadAll() {
  try {
    await loadDashboardRole();
    await Promise.all([loadProjects(), loadVolunteers(), loadEvents(), loadDonations(), loadImpact()]);
  } catch (error) {
    toast(error.message);
  }
}

if (token) loadAll();
