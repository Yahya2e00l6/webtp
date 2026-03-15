const database = {
    users: [
        {
            id: "1",
            name: "Ali",
            email: "Ali@example.com",
            password: "1232",
            wallet: {
                balance: 12457,
                currency: "MAD",
                cards: [
                    { numcards: "124847", type: "visa", balance: "14712", expiry: "14-08-27", vcc: "147" },
                    { numcards: "124478", type: "mastercard", balance: "1470", expiry: "14-08-28", vcc: "257" },
                ],
                transactions: [
                    { id: "1", type: "credit", amount: 140, date: "14-08-25", from: "Ahmed", to: "124847" },
                    { id: "2", type: "debit", amount: 200, date: "13-08-25", from: "124847", to: "Amazon" },
                    { id: "3", type: "credit", amount: 250, date: "12-08-25", from: "Ahmed", to: "124478" },
                ]
            }
        },
        {
            id: "2",
            name: "Yahya",
            email: "yahya@example.com",
            password: "1231",
            wallet: {
                balance: 5000,
                currency: "MAD",
                cards: [
                    { numcards: "987654", type: "visa", balance: "5000", expiry: "01-01-30", vcc: "999" }
                ],
                transactions: []
            }
        }
    ]
}

const checkDatabaseExists = (callback) => {
    setTimeout(() => {
        if (database && database.users) {
            callback(null, true);
        } else {
            callback("La base de données est inaccessible", false);
        }
    }, 500);
};

const finduserbymail = (mail, password, callback) => {
    setTimeout(() => {
        const user = database.users.find((u) => u.email === mail && u.password === password);
        if (user) {
            callback(null, user);
        } else {
            callback("Email ou mot de passe incorrect", null);
        }
    }, 1000);
}

const getUserData = (userId, callback) => {
    setTimeout(() => {
        const user = database.users.find((u) => u.id === userId);
        if (user) {
            callback(null, user);
        } else {
            callback("Utilisateur non trouvé", null);
        }
    }, 500);
}

const executeTransfer = (fromUserId, toUserId, amount, callback) => {
    setTimeout(() => {
        const sender = database.users.find(u => u.id === fromUserId);
        const receiver = database.users.find(u => u.id === toUserId);

        if (!sender || !receiver) return callback("Utilisateur introuvable");
        if (sender.wallet.balance < amount) return callback("Solde insuffisant");

        const date = new Date().toLocaleDateString('fr-FR');
        sender.wallet.balance -= amount;
        receiver.wallet.balance += amount;
        sender.wallet.transactions.unshift({
            id: Date.now().toString(),
            type: "debit",
            amount: amount,
            date: date,
            from: sender.name,
            to: receiver.name
        });

        receiver.wallet.transactions.unshift({
            id: (Date.now() + 1).toString(),
            type: "credit",
            amount: amount,
            date: date,
            from: sender.name,
            to: receiver.name
        });

        callback(null, true);
    }, 1000);
};

const getAllUsers = (callback) => {
    setTimeout(() => {
        callback(null, database.users.map(u => ({ id: u.id, name: u.name })));
    }, 300);
};

export { finduserbymail, getUserData, checkDatabaseExists, executeTransfer, getAllUsers };
export default database;
