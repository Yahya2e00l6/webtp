import {getbeneficiaries ,finduserbyaccount,findbeneficiarieByid} from "../Model/database.js";
const user = JSON.parse(sessionStorage.getItem("currentUser"));
// DOM elements
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
const submitTransferBtn=document.getElementById("submitTransferBtn");

// Guard
if (!user) {
  alert("User not authenticated");
  window.location.href = "index.html";
}

// Events
  transferBtn.addEventListener("click", handleTransfersection);
  closeTransferBtn.addEventListener("click", closeTransfer);
  cancelTransferBtn.addEventListener("click", closeTransfer);
  submitTransferBtn.addEventListener("click",handleTransfer)

// Topup DOM elements
const topupBtn = document.getElementById("quickTopup");
const topupSection = document.getElementById("topupPopup");
const closeTopupBtn = document.getElementById("closeTopupBtn");
const cancelTopupBtn = document.getElementById("cancelTopupBtn");
const submitTopupBtn = document.getElementById("submitTopupBtn");
const selectTopup = document.getElementById("topupMethod");

// Topup Events
topupBtn.addEventListener("click", handleTopupsection);
closeTopupBtn.addEventListener("click", closeTopup);
cancelTopupBtn.addEventListener("click", closeTopup);
submitTopupBtn.addEventListener("click", handleTopup);

// Topup popup functions
function closeTopup() {
  topupSection.classList.remove("active");
  document.body.classList.remove("popup-open");
}

function handleTopupsection() {
  topupSection.classList.add("active");
  document.body.classList.add("popup-open");
}
Topupmethods();


// Retrieve dashboard data
const getDashboardData = () => {
  const monthlyIncome = user.wallet.transactions
    .filter(t => t.type === "credit")
    .reduce((total, t) => total + t.amount, 0);

  const monthlyExpenses = user.wallet.transactions
    .filter(t => t.type === "debit")
    .reduce((total, t) => total + t.amount, 0);

  return {
    userName: user.name,
    currentDate: new Date().toLocaleDateString("fr-FR"),
    availableBalance: `${user.wallet.balance} ${user.wallet.currency}`,
    activeCards: user.wallet.cards.length,
    monthlyIncome: `${monthlyIncome} MAD`,
    monthlyExpenses: `${monthlyExpenses} MAD`,
  };
};

function renderDashboard(){
const dashboardData = getDashboardData();
if (dashboardData) {
  greetingName.textContent = dashboardData.userName;
  currentDate.textContent = dashboardData.currentDate;
  solde.textContent = dashboardData.availableBalance;
  incomeElement.textContent = dashboardData.monthlyIncome;
  expensesElement.textContent = dashboardData.monthlyExpenses;
  activecards.textContent = dashboardData.activeCards;
}
// Display transactions
transactionsList.innerHTML = "";
user.wallet.transactions.forEach(transaction => {
  const transactionItem = document.createElement("div");
  transactionItem.className = "transaction-item";
  transactionItem.innerHTML = `
    <div>${transaction.date}</div>
    <div>${transaction.amount} MAD</div>
    <div>${transaction.type}</div>
  `;
  transactionsList.appendChild(transactionItem);
});

}
renderDashboard();

// Transfer popup
function closeTransfer() {
  transferSection.classList.remove("active");
  document.body.classList.remove("popup-open");
}

function handleTransfersection() {
  transferSection.classList.add("active");
  document.body.classList.add("popup-open");
}

// Beneficiaries
const beneficiaries = getbeneficiaries(user.id);

function renderBeneficiaries() {
  beneficiaries.forEach((beneficiary) => {
    const option = document.createElement("option");
    option.value = beneficiary.id;
    option.textContent = beneficiary.name;
    beneficiarySelect.appendChild(option);
  });
}
renderBeneficiaries();
function renderCards() {
  user.wallet.cards.forEach((card) => {
    const option = document.createElement("option");
    option.value = card.numcards;
    option.textContent = card.type+"****"+card.numcards;
    sourceCard.appendChild(option);
  });
}

renderCards();

//###################################  Transfer  #####################################################//

// check function 

/* function checkUser(numcompte, callback) {
  setTimeout(() => {
    const destinataire = finduserbyaccount(numcompte);
    if (destinataire) {
      callback(destinataire);
    } else {
      console.log("Destinataire non trouvé");
    }
  }, 500);
}

function checkSolde(exp, amount, callback) {
  setTimeout(() => {
    const solde = exp.wallet.balance;
    if (solde >= amount) {
      callback("Solde suffisant");
    } else {
      callback("Solde insuffisant");
    }
  }, 400);
}

function updateSolde(exp, destinataire, amount, callback) {
  setTimeout(() => {  
    exp.wallet.balance -= amount;
    destinataire.wallet.balance += amount;
    callback("Solde mis à jour");
  }, 300);
}


function addtransactions(exp, destinataire, amount, callback) {
  setTimeout(() => { 
    // Transaction pour l'expéditeur (débit)
    const transactionDebit = {
      id: Date.now(),
      type: "debit",
      amount: amount,
      from: exp.name,
      to: destinataire.name,
      date: new Date().toLocaleDateString()
    };

    // Transaction pour le destinataire (crédit)
    const transactionCredit = {
      id: Date.now() + 1,
      type: "credit",
      amount: amount,
      from: exp.name,
      to: destinataire.name,
      date: new Date().toLocaleDateString()
    };

    user.wallet.transactions.push(transactionDebit);
    destinataire.wallet.transactions.push(transactionCredit);
    renderDashboard();
    callback("Transaction enregistrée");
  }, 200);
}


export function transferer(exp, numcompte, amount) {
  console.log("\n DÉBUT DU TRANSFERT ");

  // Étape 1: Vérifier le destinataire
  checkUser(numcompte, function afterCheckUser(destinataire) {
    console.log("Étape 1: Destinataire trouvé -", destinataire.name);

    // Étape 2: Vérifier le solde
    checkSolde(exp, amount, function afterCheckSolde(soldemessage) {
      console.log(" Étape 2:", soldemessage);

      if (soldemessage.includes("Solde suffisant")) {
        // Étape 3: Mettre à jour les soldes
        updateSolde(exp, destinataire, amount, function afterUpdateSolde(updatemessage) {
          console.log(" Étape 3:", updatemessage);

          // Étape 4: Enregistrer la transaction
          addtransactions(exp, destinataire, amount, function afterAddTransactions(transactionMessage) {
            console.log(" Étape 4:", transactionMessage);
            console.log(`Transfert de ${amount} réussi!`);
          });
        });
      }
    });
  });
}


function handleTransfer(e) {
 e.preventDefault();
  const beneficiaryId = document.getElementById("beneficiary").value;
  const beneficiaryAccount=findbeneficiarieByid(user.id,beneficiaryId).account;
  const sourceCard = document.getElementById("sourceCard").value;

  const amount = Number(document.getElementById("amount").value);

  
  transferer(user, beneficiaryAccount, amount);

} */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function checkUser(numcompte) {
  await delay(500);
  const beneficiary = finduserbyaccount(numcompte);
  if (!beneficiary) {
    throw new Error("beneficiary not found");
  }
  return beneficiary;
}

async function checkSolde(expediteur, amount) {
  await delay(1000);
  if (expediteur.wallet.balance < amount) {
    throw new Error("Insufficient balance");
  }
  return "Sufficient balance";
}

async function updateSolde(expediteur, destinataire, amount) {
  await delay(200);
  expediteur.wallet.balance -= amount;
  destinataire.wallet.balance += amount;
  return "update balance done";
}

async function addtransactions(expediteur, destinataire, amount) {
  await delay(500);
  const credit = {
    id: Date.now(),
    type: "credit",
    amount: amount,
    date: new Date().toISOString().split('T')[0],
    from: expediteur.name,
  };

  const debit = {
    id: Date.now() + 1,
    type: "debit",
    amount: amount,
    date: new Date().toISOString().split('T')[0],
    to: destinataire.name,
  };

  expediteur.wallet.transactions.unshift(debit);
  destinataire.wallet.transactions.unshift(credit);
  return "transaction added successfully";
}

function isCardExpired(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  return expiry < today;
}

async function checkTopupData(amount, selectedCardNumber) {
  await delay(300);
  if (!amount || amount < 10) {
    throw new Error("Le montant minimum est 10 MAD");
  }
  if (!amount || amount > 5000) {
    throw new Error("Le montant maximal est 5000 MAD");
  }

  if (!selectedCardNumber) {
    throw new Error("Veuillez sélectionner une carte");
  }

  const selectedCard = user.wallet.cards.find((card) => card.numcards === selectedCardNumber);
  if (!selectedCard) {
    throw new Error("Carte introuvable");
  }

  if (isCardExpired(selectedCard.expiry)) {
    throw new Error("Carte expirée");
  }

  return "Topup data is valid";
}

async function updateTopupSolde(expediteur, amount) {
  await delay(300);
  expediteur.wallet.balance += amount;
  return "Topup balance updated";
}
function Topupmethods() {
  selectTopup.innerHTML = '<option value="" disabled selected>Sélectionner une carte</option>';
  user.wallet.cards.forEach((card) => {
    const option = document.createElement("option");
    option.value = card.numcards;
    option.textContent = `${card.type} ****${card.numcards} (exp: ${card.expiry})`;
    selectTopup.appendChild(option);
  });
}

async function addTopupTransaction(expediteur, amount, selectedCardNumber) {
  await delay(300);
  const selectedCard = expediteur.wallet.cards.find((card) => card.numcards === selectedCardNumber);
  const topupTransaction = {
    id: Date.now(),
    type: "recharge",
    amount: amount,
    date: new Date().toISOString().split('T')[0],
    from: selectedCard ? `${selectedCard.type} ****${selectedCard.numcards}` : "Recharge carte",
  };

  expediteur.wallet.transactions.unshift(topupTransaction);
  return "Topup transaction added";
}

async function topup(expediteur, amount, selectedCardNumber) {
  await checkTopupData(amount, selectedCardNumber);
  await updateTopupSolde(expediteur, amount);
  const message = await addTopupTransaction(expediteur, amount, selectedCardNumber);

  sessionStorage.setItem("currentUser", JSON.stringify(expediteur));
  renderDashboard();
  closeTopup();
  return message;
}

// **************************************transfer***************************************************//

async function transfer(expediteur, numcompte, amount) {
  const destinataire = await checkUser(numcompte);
  console.log("Étape 1: Destinataire trouve -", destinataire.name);

  const soldemessage = await checkSolde(expediteur, amount);
  console.log(soldemessage);

  const updatemessage = await updateSolde(expediteur, destinataire, amount);
  console.log(updatemessage);

  const addtransactionMessage = await addtransactions(expediteur, destinataire, amount);
  console.log(addtransactionMessage);

  sessionStorage.setItem("currentUser", JSON.stringify(expediteur));
  renderDashboard();
  closeTransfer();
  return addtransactionMessage;
}


async function handleTransfer(e) {
 e.preventDefault();
  const beneficiaryId = document.getElementById("beneficiary").value;
  const beneficiaryAccount=findbeneficiarieByid(user.id,beneficiaryId).account;
  const sourceCard = document.getElementById("sourceCard").value;

  const amount = Number(document.getElementById("amount").value);

  try {
    await transfer(user, beneficiaryAccount, amount);
  } catch (error) {
    console.log(error.message);
    alert(error.message);
  }

} 

async function handleTopup(e) {
  e.preventDefault();

  const amount = Number(document.getElementById("topupAmount").value);
  const selectedCardNumber = document.getElementById("topupMethod").value;

  const originalText = submitTopupBtn.innerHTML;
  submitTopupBtn.disabled = true;

  try {
    await topup(user, amount, selectedCardNumber);
    document.getElementById("topupForm").reset();
  } catch (error) {
    alert(error.message);
  } finally {
    submitTopupBtn.innerHTML = originalText;
    submitTopupBtn.disabled = false;
  }
}

/*
    function func1(number,callback){
        console.log("start function");
       if(number%2===0){
        console.log("start callback");
        callback(number);
        console.log("end callback");
       }else{
        
       }
       console.log("end function");
    }

    function produit(number){
        console.log("the result is : ", (number*number));
    }

    func1(4,produit);
    */