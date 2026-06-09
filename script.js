const screens = document.querySelectorAll(".auth-screen, .app-screen");
const appScreen = document.querySelector("#app-screen");
const pageTitle = document.querySelector("[data-page-title]");
const navButtons = document.querySelectorAll("[data-nav]");
const resendButton = document.querySelector("#resend-code");
let otpTimer;

function showScreen(id) {
  screens.forEach((screen) => screen.classList.remove("is-active"));
  document.querySelector(`#${id}`)?.classList.add("is-active");

  if (id === "otp-screen") {
    startOtpTimer();
  }
}

function showPage(id) {
  document.querySelectorAll(".page").forEach((page) => page.classList.remove("is-active"));
  document.querySelector(`#${id}`)?.classList.add("is-active");

  navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.nav === id);
  });

  const title = document.querySelector(`#${id}`)?.dataset.title;
  if (title && pageTitle) {
    pageTitle.innerHTML = title;
  }
}

function startOtpTimer() {
  clearInterval(otpTimer);
  let seconds = 42;
  resendButton.textContent = `Reenviar o codigo em ${seconds}s`;

  otpTimer = setInterval(() => {
    seconds -= 1;
    resendButton.textContent = seconds > 0 ? `Reenviar o codigo em ${seconds}s` : "Reenviar codigo";

    if (seconds <= 0) {
      clearInterval(otpTimer);
    }
  }, 1000);
}

document.querySelectorAll("[data-screen-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showScreen(link.dataset.screenLink);
  });
});

document.querySelectorAll("[data-auth-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    showScreen("app-screen");
    appScreen.classList.add("is-active");
  });
});

document.querySelectorAll("[data-toggle-password]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.parentElement.querySelector("input");
    input.type = input.type === "password" ? "text" : "password";
    button.textContent = input.type === "password" ? "olho" : "oculto";
  });
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => showPage(button.dataset.nav));
});

document.querySelectorAll(".otp-grid input").forEach((input, index, inputs) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "");
    if (input.value && inputs[index + 1]) {
      inputs[index + 1].focus();
    }
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !input.value && inputs[index - 1]) {
      inputs[index - 1].focus();
    }
  });
});

const uploadBox = document.querySelector("#upload-box");
const fileInput = document.querySelector("#statement-file");
const pickFile = document.querySelector("#pick-file");

pickFile.addEventListener("click", () => fileInput.click());

["dragenter", "dragover"].forEach((eventName) => {
  uploadBox.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadBox.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  uploadBox.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadBox.classList.remove("is-dragging");
  });
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    uploadBox.querySelector("strong").textContent = `Arquivo selecionado: ${file.name}`;
  }
});
