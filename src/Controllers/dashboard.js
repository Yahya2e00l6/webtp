import { getbeneficiaries, findbeneficiarieByid, getUserById, executeTransfer } from "../Model/database.js";

const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

const greetingName = document.getElementById("greetingName");
const currentDate = document.getElementById("currentDate");
const solde = document.getElementById("availableBalance");
const incomeElement = document.getElementById("monthlyIncome");
const expensesElement = document.getElementById("monthlyExpenses");
const activecards = document.getElementById("activeCards");
const transactionsList = document.getElementById("recentTransactionsList");
const transferBtn = document.getElementById("quickTransfer");
const transferSection = document.getElementById("transferPopup");
const closeTransferBtn = document.getElementById("closeTransferBtn");
const cancelTransferBtn = document.getElementById("cancelTransferBtn");
const beneficiarySelect = document.getElementById("beneficiary");
const sourceCard = document.getElementById("sourceCard");
const submitTransferBtn = document.getElementById("submitTransferBtn");

if (!currentUser || !currentUser.id) {
  alert("User not authenticated");
  window.location.href = "index.html";
}

const renderDashboard = (user) => {
  const monthlyIncome = user.wallet.transactions
    .filter((transaction) => transaction.type === "credit")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const monthlyExpenses = user.wallet.transactions
    .filter((transaction) => transaction.type === "debit")
    .reduce((total, transaction) => total + transaction.amount, 0);

  greetingName.textContent = user.name;
  currentDate.textContent = new Date().toLocaleDateString("fr-FR");
  solde.textContent = `${user.wallet.balance} ${user.wallet.currency}`;
  incomeElement.textContent = `${monthlyIncome} MAD`;
  expensesElement.textContent = `${monthlyExpenses} MAD`;
  activecards.textContent = user.wallet.cards.length;

  transactionsList.innerHTML = "";
  user.wallet.transactions.forEach((transaction) => {
    const transactionItem = document.createElement("div");
    transactionItem.className = "transaction-item";
    transactionItem.innerHTML = `
      <div>${transaction.date}</div>
      <div>${transaction.amount} MAD</div>
      <div>${transaction.type}</div>
    `;
    transactionsList.appendChild(transactionItem);
  });
};

const renderBeneficiaries = (beneficiaries) => {
  beneficiarySelect.innerHTML = "";
  beneficiaries.forEach((beneficiary) => {
    const option = document.createElement("option");
    option.value = beneficiary.id;
    option.textContent = beneficiary.name;
    beneficiarySelect.appendChild(option);
  });
};

const renderCards = (user) => {
  sourceCard.innerHTML = "";
  user.wallet.cards.forEach((card) => {
    const option = document.createElement("option");
    option.value = card.numcards;
    option.textContent = `${card.type}****${card.numcards}`;
    sourceCard.appendChild(option);
  });
};

const loadDashboard = () => {
  return getUserById(currentUser.id)
    .then((freshUser) => {
      sessionStorage.setItem("currentUser", JSON.stringify(freshUser));
      renderDashboard(freshUser);
      renderCards(freshUser);
      return getbeneficiaries(freshUser.id);
    })
    .then((beneficiaries) => {
      renderBeneficiaries(beneficiaries);
    })
    .catch((error) => {
      alert(error?.message || "Erreur de chargement");
      window.location.href = "index.html";
    });
};

const closeTransfer = () => {
  transferSection.classList.remove("active");
  document.body.classList.remove("popup-open");
};

const handleTransfersection = () => {
  transferSection.classList.add("active");
  document.body.classList.add("popup-open");
};

const handleTransfer = (event) => {
  event.preventDefault();

  const beneficiaryId = beneficiarySelect.value;
  const amount = Number(document.getElementById("amount").value);

  if (!beneficiaryId) {
    alert("Choisir un bénéficiaire.");
    return;
  }

  submitTransferBtn.disabled = true;
  submitTransferBtn.textContent = "Transfert...";

  findbeneficiarieByid(currentUser.id, beneficiaryId)
    .then((beneficiary) => {
      return executeTransfer(currentUser.id, beneficiary.account, amount);
    })
    .then(() => {
      alert("Transfert réussi");
      closeTransfer();
      return loadDashboard();
    })
    .catch((error) => {
      alert(error?.message || "Transfert échoué");
    })
    .finally(() => {
      submitTransferBtn.disabled = false;
      submitTransferBtn.textContent = "Transfer";
    });
};

transferBtn.addEventListener("click", handleTransfersection);
closeTransferBtn.addEventListener("click", closeTransfer);
cancelTransferBtn.addEventListener("click", closeTransfer);
submitTransferBtn.addEventListener("click", handleTransfer);

loadDashboard();
