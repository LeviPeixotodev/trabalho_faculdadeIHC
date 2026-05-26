const screens = document.querySelectorAll(".auth-screen, .app-screen");
const appScreen = document.querySelector("#app-screen");
const pageTitle = document.querySelector("[data-page-title]");
const navButtons = document.querySelectorAll("[data-nav]");
const modal = document.querySelector("#card-modal");
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

function openCardModal() {
  if (!modal || modal.open) {
    return;
  }

  modal.showModal();
}

function closeCardModal() {
  if (modal?.open) {
    modal.close();
  }
}

document.querySelectorAll("[data-open-modal]").forEach((button) => {
  button.addEventListener("click", openCardModal);
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeCardModal);
});

modal?.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeCardModal();
  }
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

const cardNumber = document.querySelector("#card-number");
const cardCvc = document.querySelector("#card-cvc");
const cardDate = document.querySelector("#card-date");
const cardOwner = document.querySelector("#card-owner");

function updateCardPreview() {
  const digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
  cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");

  const dateDigits = cardDate.value.replace(/\D/g, "").slice(0, 4);
  cardDate.value = dateDigits.length > 2 ? `${dateDigits.slice(0, 2)}/${dateDigits.slice(2)}` : dateDigits;

  document.querySelector("#preview-number").textContent = digits ? `•••• ${digits.slice(-4)}` : "•••• 4532";
  document.querySelector("#preview-cvc").textContent = cardCvc.value || "453";
  document.querySelector("#preview-date").textContent = cardDate.value || "07/26";
  document.querySelector("#preview-owner").textContent = cardOwner.value || "Nubank Ultravioleta";
}

[cardNumber, cardCvc, cardDate, cardOwner].forEach((input) => {
  input.addEventListener("input", updateCardPreview);
});

document.querySelector("#save-card").addEventListener("click", () => {
  closeCardModal();
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
