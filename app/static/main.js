document.addEventListener("DOMContentLoaded", () => {
  const serviceSelect = document.getElementById("service-select");
  const fileInput = document.getElementById("file-upload");
  const submitBtn = document.getElementById("submit-btn");
  const resultPre = document.getElementById("result");
  const themeToggleBtn = document.getElementById("theme-toggle");
  const themeIconLight = document.getElementById("theme-icon-light");
  const themeIconDark = document.getElementById("theme-icon-dark");

  // --- Theme Toggle Logic ---
  const THEME_KEY = "theme-preference";

  const applyTheme = (theme) => {
    document.body.setAttribute("data-theme", theme);
    if (theme === "dark") {
      themeIconLight.style.display = "block";
      themeIconDark.style.display = "none";
    } else {
      themeIconLight.style.display = "none";
      themeIconDark.style.display = "block";
    }
    localStorage.setItem(THEME_KEY, theme);
  };

  const toggleTheme = () => {
    const currentTheme = localStorage.getItem(THEME_KEY) || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
  };

  themeToggleBtn.addEventListener("click", toggleTheme);

  // Load saved theme or detect system preference
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }
  // --- End Theme Toggle Logic ---

  // Populate the service multi-select from the static JSON file
  fetch("aws_services.json")
    .then((res) => res.json())
    .then((services) => {
      Object.keys(services).forEach((svc) => {
        const opt = document.createElement("option");
        opt.value = svc;
        opt.textContent = svc;
        serviceSelect.appendChild(opt);
      });
    })
    .catch((err) => console.error("Failed to load AWS services:", err));

  submitBtn.addEventListener("click", async () => {
    const selectedServices = Array.from(serviceSelect.selectedOptions).map(
      (o) => o.value
    );
    const file = fileInput.files[0];

    if (!file || selectedServices.length === 0) {
      alert("Please choose at least one service and a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("services", JSON.stringify(selectedServices));

    try {
      const response = await fetch("/api/sla-check", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      resultPre.textContent = JSON.stringify(data, null, 2);
    } catch (e) {
      alert("Error: " + e.message);
    }
  });
});
