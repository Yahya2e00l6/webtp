const STORAGE_KEY = "ewallet_model_database";

const initialDatabase = {
  users: [
    {
      id: "1",
      name: "Ali",
      email: "Ali@example.com",
      password: "1232",
      account: "124847",
      wallet: {
        balance: 10000,
        currency: "MAD",
        cards: [
          { numcards: "124847", type: "visa", balance: 14712, expiry: "2027-08-14", vcc: "147" },
          { numcards: "124478", type: "mastercard", balance: 1470, expiry: "2028-08-14", vcc: "257" }
        ],
        transactions: [
          { id: "1", type: "credit", amount: 140, date: "2025-08-14", from: "Ahmed", to: "124847" },
          { id: "2", type: "debit", amount: 200, date: "2025-08-13", from: "124847", to: "Amazon" },
          { id: "3", type: "credit", amount: 250, date: "2025-08-12", from: "Ahmed", to: "124478" }
        ],
        beneficiaries: [
          { id: "1", name: "Ahmed", account: "12347" },
          { id: "2", name: "Meriem", account: "124478" }
        ]
      }
    },
    {
      id: "2",
      name: "Ahmed",
      email: "Ahmed@example.com",
      password: "12345",
      account: "12347",
      wallet: {
        balance: 2000,
        currency: "MAD",
        cards: [
          { numcards: "224847", type: "visa", balance: 14712, expiry: "2027-08-14", vcc: "147" },
          { numcards: "224478", type: "mastercard", balance: 1470, expiry: "2028-08-14", vcc: "257" }
        ],
        transactions: [
          { id: "1", type: "credit", amount: 140, date: "2025-08-14", from: "Ali", to: "12347" },
          { id: "2", type: "debit", amount: 200, date: "2025-08-13", from: "12347", to: "Amazon" },
          { id: "3", type: "credit", amount: 250, date: "2025-08-12", from: "Ali", to: "224478" }
        ],
        beneficiaries: [
          { id: "1", name: "Ali", account: "124847" },
          { id: "2", name: "Sara", account: "213456" }
        ]
      }
    }
  ]
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const delay = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const loadDatabase = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = clone(initialDatabase);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.users)) {
      return parsed;
    }
  } catch (_err) {
  }

  const fallback = clone(initialDatabase);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
  } catch (_err) {
  }
  return fallback;
};

let database = loadDatabase();

const persistDatabase = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  } catch (_err) {
  }
};

export const finduserbymail = (mail, password) => {
  return delay(300).then(() => {
    const user = database.users.find((u) => u.email === mail && u.password === password);
    if (!user) {
      return Promise.reject(new Error("Bad credentials."));
    }
    return user;
  });
}

export const getUserById = (id) => {
  return delay(150).then(() => {
    const user = database.users.find((u) => u.id === id);
    if (!user) {
      return Promise.reject(new Error("Utilisateur introuvable"));
    }
    return user;
  });
}

export const getbeneficiaries = (id) => {
  return delay(150).then(() => {
    const user = database.users.find((u) => u.id === id);
    if (!user) {
      return Promise.reject(new Error("Utilisateur introuvable"));
    }
    return user.wallet.beneficiaries;
  });
}

export const findbeneficiarieByid = (id, beneficiaryId) => {
  return delay(150).then(() => {
    const user = database.users.find((u) => u.id === id);
    if (!user) {
      return Promise.reject(new Error("Utilisateur introuvable"));
    }

    const beneficiary = user.wallet.beneficiaries.find((u) => u.id === beneficiaryId);
    if (!beneficiary) {
      return Promise.reject(new Error("Bénéficiaire introuvable"));
    }
    return beneficiary;
  });
}

export const finduserbyaccount = (numcompte) => {
  return delay(150).then(() => {
    const user = database.users.find((u) => u.account === numcompte);
    if (!user) {
      return Promise.reject(new Error("Destinataire non trouvé"));
    }
    return user;
  });
}

export const executeTransfer = (senderId, receiverAccount, amount) => {
  return delay(400).then(() => {
    const sender = database.users.find((u) => u.id === senderId);
    const receiver = database.users.find((u) => u.account === receiverAccount);

    if (!sender || !receiver) {
      return Promise.reject(new Error("Destinataire non trouvé"));
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return Promise.reject(new Error("Montant invalide"));
    }

    if (sender.wallet.balance < amount) {
      return Promise.reject(new Error("Insufficient balance"));
    }

    sender.wallet.balance -= amount;
    receiver.wallet.balance += amount;

    const date = new Date().toLocaleDateString("fr-FR");
    const debit = {
      id: Date.now().toString(),
      type: "debit",
      amount,
      date,
      from: sender.account,
      to: receiver.account
    };

    const credit = {
      id: (Date.now() + 1).toString(),
      type: "credit",
      amount,
      date,
      from: sender.account,
      to: receiver.account
    };

    sender.wallet.transactions.unshift(debit);
    receiver.wallet.transactions.unshift(credit);

    persistDatabase();

    return {
      sender,
      receiver,
      transaction: debit
    };
  });
}




