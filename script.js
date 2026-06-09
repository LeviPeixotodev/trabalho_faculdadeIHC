const screens = document.querySelectorAll(".auth-screen, .app-screen");
const appScreen = document.querySelector("#app-screen");
const pageTitle = document.querySelector("[data-page-title]");
const navButtons = document.querySelectorAll("[data-nav]");
const resendButton = document.querySelector("#resend-code");
let otpTimer;

function updateHomeStats(total) {
  const fmt = (v) => 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Atualiza mini-stats proporcionalmente
  const receitas = total * 0.59;  // ~59% receitas
  const despesas = total * 0.29;  // ~29% despesas
  const goodEl = document.querySelector('#home-page .good');
  const badEl  = document.querySelector('#home-page .bad');
  if (goodEl) goodEl.textContent = 'Receitas: ' + fmt(receitas);
  if (badEl)  badEl.textContent  = 'Despesas: ' + fmt(despesas);

  // Atualiza o donut — calcula proporção de despesas por categoria
  // Alimentação 48%, Transporte 18%, Entretenimento 12%, Outros 22%
  const pAlim = 43, pTransp = 17, pEntreten = 12; // soma = 72, resto = outros
  const donut = document.querySelector('.donut');
  if (donut) {
    donut.style.background = `conic-gradient(
      var(--cyan)   0 ${pAlim}%,
      #9c48ff       ${pAlim}% ${pAlim + pTransp}%,
      #ec3fb0       ${pAlim + pTransp}% ${pAlim + pTransp + pEntreten}%,
      var(--yellow) ${pAlim + pTransp + pEntreten}% 100%
    )`;
  }
}

function updateHomeStats(total) {
  const fmt = (v) => 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Atualiza mini-stats proporcionalmente
  const receitas = total * 0.59;  // ~59% receitas
  const despesas = total * 0.29;  // ~29% despesas
  const goodEl = document.querySelector('#home-page .good');
  const badEl  = document.querySelector('#home-page .bad');
  if (goodEl) goodEl.textContent = 'Receitas: ' + fmt(receitas);
  if (badEl)  badEl.textContent  = 'Despesas: ' + fmt(despesas);

  // Atualiza o donut — calcula proporção de despesas por categoria
  // Alimentação 48%, Transporte 18%, Entretenimento 12%, Outros 22%
  const pAlim = 43, pTransp = 17, pEntreten = 12; // soma = 72, resto = outros
  const donut = document.querySelector('.donut');
  if (donut) {
    donut.style.background = `conic-gradient(
      var(--cyan)   0 ${pAlim}%,
      #9c48ff       ${pAlim}% ${pAlim + pTransp}%,
      #ec3fb0       ${pAlim + pTransp}% ${pAlim + pTransp + pEntreten}%,
      var(--yellow) ${pAlim + pTransp + pEntreten}% 100%
    )`;
  }
}

function generateInvestments(totalBalance) {
  const warning = document.querySelector('#investments-warning');
  const addBankBtn = document.querySelector('#inv-add-bank-btn');
  const list = document.querySelector('#investments-list');
  const totalEl = document.querySelector('#total-invested');

  if (!list) return;

  const templates = [
    { name: 'Tesouro Selic',        type: 'renda-fixa',      label: 'Renda Fixa',      pct: 0.30, rentMonth: 0.92 },
    { name: 'CDB Banco Inter',      type: 'renda-fixa',      label: 'Renda Fixa',      pct: 0.22, rentMonth: 1.05 },
    { name: 'LCI Bradesco',         type: 'renda-fixa',      label: 'Renda Fixa',      pct: 0.18, rentMonth: 0.87 },
    { name: 'IVVB11 (S&P 500)',     type: 'renda-variavel',  label: 'Renda Variável',  pct: 0.15, rentMonth: 2.31 },
    { name: 'BOVA11 (Ibovespa)',    type: 'renda-variavel',  label: 'Renda Variável',  pct: 0.10, rentMonth: 1.74 },
    { name: 'Bitcoin (BTC)',        type: 'cripto',          label: 'Cripto',          pct: 0.05, rentMonth: 4.20 },
  ];

  const investedAmount = totalBalance * 0.65;

  let accumulatedPct = 0;
  const investments = templates.map((t, i) => {
    const isLast = i === templates.length - 1;
    const sharePct = isLast ? (1 - accumulatedPct) : t.pct;
    accumulatedPct += t.pct;
    const value = investedAmount * sharePct;
    const barWidth = Math.round(sharePct * 100 * 1.4);
    return { ...t, value, barWidth: Math.min(barWidth, 100) };
  });

  const totalInvested = investments.reduce((s, i) => s + i.value, 0);

  const fmt = (v) => 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (warning) warning.style.display = 'none';
  if (addBankBtn) addBankBtn.style.display = 'none';
  if (totalEl) totalEl.textContent = fmt(totalInvested);

  list.innerHTML = investments.map(inv => `
    <article class="invest-card">
      <div class="invest-header">
        <span class="invest-name">${inv.name}</span>
        <span class="invest-type ${inv.type}">${inv.label}</span>
      </div>
      <span class="invest-value">${fmt(inv.value)}</span>
      <span class="invest-return">+${inv.rentMonth.toFixed(2).replace('.',',')}% este mês</span>
      <div class="invest-bar-bg">
        <div class="invest-bar-fill" style="width:${inv.barWidth}%"></div>
      </div>
    </article>
  `).join('');
}

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

const modal = document.querySelector("#card-modal");

function openCardModal() {
  if (!modal || modal.open) return;
  modal.showModal();
  document.body.style.overflow = "hidden";
}

function closeCardModal() {
  if (modal?.open) {
    modal.close();
    document.body.style.overflow = "";
  }
}

document.querySelectorAll("[data-open-modal]").forEach((button) => {
  button.addEventListener("click", openCardModal);
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeCardModal);
});

modal?.addEventListener("click", (event) => {
  if (event.target === modal) closeCardModal();
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
  const owner = cardOwner.value.trim() || "Nubank Ultravioleta";
  const digits = cardNumber.value.replace(/\D/g, "").slice(-4) || "0000";
  const color = ["magenta", "orange", "blue"][document.querySelectorAll(".credit-card:not(.preview-card)").length % 3];

  const newCard = document.createElement("article");
  newCard.className = `credit-card ${color}`;
  newCard.innerHTML = `
    <div>
      <span>${owner}</span>
      <b>•••• ${digits}</b>
    </div>
    <p>Disponível <strong>R$ 0,00</strong></p>
    <div class="progress"><span style="width: 0%"></span></div>
    <small>R$ 0,00 usado &nbsp; Limite: R$ 0,00</small>
  `;

  const cardsPage = document.querySelector("#cards-page");
  const addButton = cardsPage.querySelector("[data-open-modal]");
  cardsPage.insertBefore(newCard, addButton);

  cardNumber.value = "";
  cardCvc.value = "";
  cardDate.value = "";
  cardOwner.value = "";
  updateCardPreview();

  closeCardModal();
});

const toggleTx = document.querySelector('#toggle-transactions');
if (toggleTx) {
  let expanded = false;
  toggleTx.addEventListener('click', () => {
    expanded = !expanded;
    document.querySelectorAll('.extra-tx').forEach(el => {
      el.style.display = expanded ? 'flex' : 'none';
    });
    toggleTx.textContent = expanded ? 'Ver menos' : 'Ver todas';
  });
}

const accountModal = document.querySelector('#account-modal');
const bankNameInput = document.querySelector('#bank-name');
const accountTypeInput = document.querySelector('#account-type');
const accountBalanceInput = document.querySelector('#account-balance');
const previewAccountCard = document.querySelector('#preview-account-card');
let selectedAccountColor = 'orange';

function openAccountModal() {
  if (!accountModal || accountModal.open) return;
  accountModal.showModal();
}

function closeAccountModal() {
  if (accountModal?.open) accountModal.close();
}

document.querySelectorAll('[data-open-account-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (appScreen.classList.contains('is-active')) openAccountModal();
  });
});

document.querySelectorAll('[data-close-account-modal]').forEach(btn => {
  btn.addEventListener('click', closeAccountModal);
});

accountModal?.addEventListener('click', (e) => {
  if (e.target === accountModal) closeAccountModal();
});

function formatCurrency(raw) {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return 'R$ 0,00';
  const num = (parseInt(digits) / 100).toFixed(2);
  return 'R$ ' + num.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function updateAccountPreview() {
  document.querySelector('#preview-bank-name').textContent = bankNameInput.value || 'Nome do banco';
  document.querySelector('#preview-account-type').textContent = accountTypeInput.value || 'Tipo de conta';
  document.querySelector('#preview-account-balance').textContent = accountBalanceInput.value || 'R$ 0,00';

  previewAccountCard.className = `bank-card ${selectedAccountColor} preview-account-card`;
}

accountBalanceInput?.addEventListener('input', () => {
  accountBalanceInput.value = formatCurrency(accountBalanceInput.value);
  updateAccountPreview();
});

bankNameInput?.addEventListener('input', updateAccountPreview);
accountTypeInput?.addEventListener('change', updateAccountPreview);

document.querySelectorAll('.color-pick').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-pick').forEach(b => b.classList.remove('is-selected'));
    btn.classList.add('is-selected');
    selectedAccountColor = btn.dataset.color;
    updateAccountPreview();
  });
});

document.querySelector('#save-account')?.addEventListener('click', () => {
  const name = bankNameInput.value.trim();
  const type = accountTypeInput.value;
  const balance = accountBalanceInput.value || 'R$ 0,00';

  if (!name) {
    bankNameInput.focus();
    bankNameInput.style.borderColor = 'var(--danger)';
    return;
  }

  const newCard = document.createElement('article');
  newCard.className = `bank-card ${selectedAccountColor}`;
  newCard.innerHTML = `<span>${name}</span><small>${type}</small><strong>${balance}</strong>`;

  const addBtn = document.querySelector('#accounts-page .secondary-button');
  addBtn.parentNode.insertBefore(newCard, addBtn);

  const totalEl = document.querySelector('#accounts-page .total-card strong');
  if (totalEl) {
    const current = parseFloat(totalEl.textContent.replace(/[R$.\s]/g,'').replace(',','.')) || 0;
    const added = parseFloat(balance.replace(/[R$.\s]/g,'').replace(',','.')) || 0;
    const newTotal = (current + added).toFixed(2);
    totalEl.textContent = 'R$ ' + newTotal.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    const homeBalance = document.querySelector('#home-page .balance-card strong');
    if (homeBalance) homeBalance.textContent = totalEl.textContent;

    const newTotalNum = current + added;
    updateHomeStats(newTotalNum);
  }

  bankNameInput.value = '';
  accountBalanceInput.value = '';
  bankNameInput.style.borderColor = '';
  selectedAccountColor = 'orange';
  document.querySelectorAll('.color-pick').forEach((b, i) => b.classList.toggle('is-selected', i === 0));
  updateAccountPreview();

  generateInvestments(parseFloat(balance.replace(/[R$.\s]/g,'').replace(',','.')) || 0);
  closeAccountModal();
});

document.querySelector('.soft-button').addEventListener('click', () => {
  const accounts = [...document.querySelectorAll('#accounts-page .bank-card:not(.preview-account-card)')];
  const transactions = [...document.querySelectorAll('.transaction')];
  const investments = [...document.querySelectorAll('.invest-card')];

  const totalBalanceEl = document.querySelector('#accounts-page .total-card strong');
  const totalBalance = totalBalanceEl?.textContent || 'R$ 0,00';

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  const monthStr = now.toLocaleDateString('pt-BR', { month:'long', year:'numeric' });

  const accountsHTML = accounts.map(card => {
    const name = card.querySelector('span')?.textContent || '';
    const type = card.querySelector('small')?.textContent || '';
    const value = card.querySelector('strong')?.textContent || '';
    const color = card.classList.contains('orange') ? '#ffa51d' :
                  card.classList.contains('magenta') ? '#c600d8' :
                  card.classList.contains('blue') ? '#2678ff' : '#07be3d';
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;
                  padding:14px 18px;border-radius:14px;margin-bottom:10px;
                  background:linear-gradient(135deg,${color}22,${color}11);
                  border:1px solid ${color}44;">
        <div>
          <div style="font-weight:800;font-size:15px;">${name}</div>
          <div style="font-size:12px;opacity:.7;">${type}</div>
        </div>
        <div style="font-weight:800;font-size:18px;color:${color};">${value}</div>
      </div>`;
  }).join('');

  const txHTML = transactions.map(tx => {
    const label = tx.querySelector('span')?.childNodes[0]?.textContent?.trim() || '';
    const cat   = tx.querySelector('small')?.textContent || '';
    const val   = tx.querySelector('strong')?.textContent || '';
    const isIncome = tx.classList.contains('income');
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;
                  padding:11px 16px;border-radius:12px;margin-bottom:8px;
                  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);">
        <div>
          <div style="font-weight:700;font-size:14px;">${label}</div>
          <div style="font-size:11px;opacity:.6;">${cat}</div>
        </div>
        <div style="font-weight:800;font-size:15px;color:${isIncome ? '#56ff8a' : '#ff7481'};">${val}</div>
      </div>`;
  }).join('');

  const invHTML = investments.length ? investments.map(card => {
    const name   = card.querySelector('.invest-name')?.textContent || '';
    const type   = card.querySelector('.invest-type')?.textContent || '';
    const value  = card.querySelector('.invest-value')?.textContent || '';
    const ret    = card.querySelector('.invest-return')?.textContent || '';
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;
                  padding:11px 16px;border-radius:12px;margin-bottom:8px;
                  background:rgba(7,190,61,.07);border:1px solid rgba(7,190,61,.2);">
        <div>
          <div style="font-weight:700;font-size:14px;">${name}</div>
          <div style="font-size:11px;opacity:.6;">${type}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:800;font-size:15px;">${value}</div>
          <div style="font-size:11px;color:#5aff8e;">${ret}</div>
        </div>
      </div>`;
  }).join('') : `<p style="opacity:.5;font-size:13px;">Nenhum investimento registrado.</p>`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório CashControl - ${monthStr}</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Outfit',sans-serif;background:#061026;color:#f7f9ff;padding:40px 24px;min-height:100vh;}
    .page{max-width:720px;margin:0 auto;}
    .header{display:flex;align-items:center;justify-content:space-between;
            padding:28px 32px;border-radius:22px;margin-bottom:28px;
            background:linear-gradient(135deg,#3488ff,#165bec);
            box-shadow:0 16px 40px rgba(38,120,255,.3);}
    .header h1{font-size:26px;font-weight:800;}
    .header p{font-size:13px;opacity:.85;margin-top:4px;}
    .badge{padding:6px 14px;border-radius:999px;font-size:12px;font-weight:800;
           background:rgba(255,255,255,.2);}
    .total-box{display:flex;align-items:center;justify-content:space-between;
               padding:24px 28px;border-radius:18px;margin-bottom:28px;
               background:rgba(13,27,63,.82);border:1px solid rgba(255,255,255,.12);}
    .total-box span{font-size:14px;opacity:.7;font-weight:800;}
    .total-box strong{font-family:'Space Grotesk',sans-serif;font-size:36px;font-weight:700;}
    section{margin-bottom:28px;}
    h2{font-size:16px;font-weight:800;margin-bottom:14px;opacity:.7;
       text-transform:uppercase;letter-spacing:.06em;}
    .print-btn{display:block;width:100%;padding:15px;border-radius:14px;border:0;
               background:linear-gradient(180deg,#3488ff,#145dff);color:white;
               font-family:'Outfit',sans-serif;font-size:15px;font-weight:800;
               cursor:pointer;margin-top:10px;box-shadow:0 6px 0 rgba(12,64,158,.5);}
    .footer{margin-top:32px;text-align:center;font-size:12px;opacity:.4;}
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <h1>Relatório Financeiro</h1>
        <p>Gerado em ${dateStr}</p>
      </div>
      <span class="badge">CashControl C$+</span>
    </div>

    <div class="total-box">
      <span>Saldo total consolidado</span>
      <strong>${totalBalance}</strong>
    </div>

    <section>
      <h2>Contas bancárias</h2>
      ${accountsHTML || '<p style="opacity:.5;font-size:13px;">Nenhuma conta registrada.</p>'}
    </section>

    <section>
      <h2>Transações recentes</h2>
      ${txHTML || '<p style="opacity:.5;font-size:13px;">Nenhuma transação.</p>'}
    </section>

    <section>
      <h2>Investimentos</h2>
      ${invHTML}
    </section>

    <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar como PDF</button>
    <p class="footer">CashControl C$+ • Relatório gerado automaticamente • ${dateStr}</p>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  window.open(url, '_blank');
});