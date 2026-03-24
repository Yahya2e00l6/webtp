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

function checkUser(numcompte) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const beneficiary = finduserbyaccount(numcompte);
      if (beneficiary) {
        resolve(beneficiary);
      } else {
        reject(new Error("beneficiary not found"));
      }
    }, 500);
  });
}

function checkSolde(expediteur, amount) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (expediteur.wallet.balance >= amount) {
        resolve("Sufficient balance");
      } else {
        reject(new Error("Insufficient balance"));
      }
    }, 1000);
  });
}

function updateSolde(expediteur, destinataire, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      expediteur.wallet.balance -= amount;
      destinataire.wallet.balance += amount;
      resolve("update balance done");
    }, 200);
  });
}

function addtransactions(expediteur, destinataire, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
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
      resolve("transaction added successfully");
    }, 500);
  });
}

function isCardExpired(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  return expiry < today;
}

function checkTopupData(amount, selectedCardNumber) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!amount || amount < 10) {
        reject(new Error("Le montant minimum est 10 MAD"));
        return;
      }
      if (!amount || amount > 5000) {
        reject(new Error("Le montant maximal est 5000 MAD"));
        return;
      }


      if (!selectedCardNumber) {
        reject(new Error("Veuillez sélectionner une carte"));
        return;
      }

      const selectedCard = user.wallet.cards.find((card) => card.numcards === selectedCardNumber);
      if (!selectedCard) {
        reject(new Error("Carte introuvable"));
        return;
      }

      if (isCardExpired(selectedCard.expiry)) {
        reject(new Error("Carte expirée"));
        return;
      }

      resolve("Topup data is valid");
    }, 300);
  });
}

function updateTopupSolde(expediteur, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      expediteur.wallet.balance += amount;
      resolve("Topup balance updated");
    }, 300);
  });
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

function addTopupTransaction(expediteur, amount, selectedCardNumber) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const selectedCard = expediteur.wallet.cards.find((card) => card.numcards === selectedCardNumber);
      const topupTransaction = {
        id: Date.now(),
        type: "recharge",
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        from: selectedCard ? `${selectedCard.type} ****${selectedCard.numcards}` : "Recharge carte",
      };

      expediteur.wallet.transactions.unshift(topupTransaction);
      resolve("Topup transaction added");
    }, 300);
  });
}

function topup(expediteur, amount, selectedCardNumber) {
  return checkTopupData(amount, selectedCardNumber)
    .then(() => updateTopupSolde(expediteur, amount))
    .then(() => addTopupTransaction(expediteur, amount, selectedCardNumber))
    .then((message) => {
      sessionStorage.setItem("currentUser", JSON.stringify(expediteur));
      renderDashboard();
      closeTopup();
      return message;
    })
    .catch((error) => Promise.reject(error));
}

// **************************************transfer***************************************************//

function transfer(expediteur, numcompte, amount) {
  let _destinataire;
  return checkUser(numcompte)
    .then((destinataire) => {
      _destinataire = destinataire;
      console.log("Étape 1: Destinataire trouve -", destinataire.name);
      return checkSolde(expediteur, amount);
    })
    .then((soldemessage) => {
      console.log(soldemessage);
      return updateSolde(expediteur, _destinataire, amount);
    })
    .then((updatemessage) => {
      console.log(updatemessage);
      return addtransactions(expediteur, _destinataire, amount);
    })
    .then((addtransactionMessage) => {
      console.log(addtransactionMessage);

      sessionStorage.setItem("currentUser", JSON.stringify(expediteur));
      
      renderDashboard();
      closeTransfer();
      return addtransactionMessage;
    })
    .catch((error) => {
      console.log(error.message);
      return Promise.reject(error);
    });
}


function handleTransfer(e) {
 e.preventDefault();
  const beneficiaryId = document.getElementById("beneficiary").value;
  const beneficiaryAccount=findbeneficiarieByid(user.id,beneficiaryId).account;
  const sourceCard = document.getElementById("sourceCard").value;

  const amount = Number(document.getElementById("amount").value);

transfer(user, beneficiaryAccount, amount);

} 

function handleTopup(e) {
  e.preventDefault();

  const amount = Number(document.getElementById("topupAmount").value);
  const selectedCardNumber = document.getElementById("topupMethod").value;

  const originalText = submitTopupBtn.innerHTML;
  submitTopupBtn.disabled = true;

  topup(user, amount, selectedCardNumber)
    .then(() => {
      document.getElementById("topupForm").reset();
    })
    .catch((error) => {
      alert(error.message);
    })
    .finally(() => {
      submitTopupBtn.innerHTML = originalText;
      submitTopupBtn.disabled = false;
    });
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