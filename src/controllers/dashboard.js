import { getUserData, getAllUsers, executeTransfer } from '../modules/database.js';

const greetingName = document.getElementById('greetingName');
const currentDate = document.getElementById('currentDate');
const availableBalance = document.getElementById('availableBalance');
const monthlyIncome = document.getElementById('monthlyIncome');
const monthlyExpenses = document.getElementById('monthlyExpenses');
const activeCardsCount = document.getElementById('activeCards');
const recentTransactionsList = document.getElementById('recentTransactionsList');
const cardsGrid = document.getElementById('cardsGrid');
const quickTransfer = document.getElementById('quickTransfer');
const userId = localStorage.getItem('loggedInUserId');

const initDashboard = () => {
    if (!userId) {
        window.location.href = '/src/View/login.html';
        return;
    }
    setTimeout(() => {
        fetchData();
    }, 500);
};

const fetchData = () => {
    getUserData(userId, (err, user) => {
        if (err) {
            localStorage.removeItem('loggedInUserId');
            window.location.href = '/src/View/login.html';
            return;
        }
        updateUI(user);
    });
};

const updateUI = (user) => {
    greetingName.textContent = user.name;
    currentDate.textContent = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const currency = user.wallet.currency;
    availableBalance.textContent = `${user.wallet.balance.toLocaleString()} ${currency}`;
    
    const income = user.wallet.transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = user.wallet.transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

    monthlyIncome.textContent = `+${income.toLocaleString()} ${currency}`;
    monthlyExpenses.textContent = `-${expenses.toLocaleString()} ${currency}`;
    activeCardsCount.textContent = user.wallet.cards.length;

    renderTransactions(user.wallet.transactions, currency);
    renderCards(user.wallet.cards, user.name);
};

const renderTransactions = (transactions, currency) => {
    recentTransactionsList.innerHTML = '';
    transactions.forEach(t => {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        div.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon ${t.type === 'credit' ? 'blue' : 'red'}">
                    <i class="fas ${t.type === 'credit' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                </div>
                <div>
                    <p class="transaction-name">${t.type === 'credit' ? 'Reçu de : ' + t.from : 'Envoyé à : ' + t.to}</p>
                    <p class="transaction-date">${t.date}</p>
                </div>
            </div>
            <div class="transaction-amount ${t.type === 'credit' ? 'positive' : 'negative'}">
                ${t.type === 'credit' ? '+' : '-'}${t.amount} ${currency}
            </div>
        `;
        recentTransactionsList.appendChild(div);
    });
};

const renderCards = (cards, ownerName) => {
    cardsGrid.innerHTML = '';
    cards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card-item';
        cardDiv.innerHTML = `
            <div class="card-preview ${card.type}">
                <div class="card-chip"></div>
                <div class="card-number">**** **** **** ${card.numcards.slice(-4)}</div>
                <div class="card-holder">${ownerName}</div>
                <div class="card-expiry">${card.expiry}</div>
                <div class="card-type">${card.type.toUpperCase()}</div>
                <div class="card-balance-overlay">${card.balance} MAD</div>
            </div>
        `;
        cardsGrid.appendChild(cardDiv);
    });
};

quickTransfer?.addEventListener('click', () => {
    getAllUsers((err, allUsers) => {
        const otherUsers = allUsers.filter(u => u.id !== userId);
        if (otherUsers.length === 0) return alert("Aucun autre utilisateur trouvé.");

        const userNames = otherUsers.map((u, i) => `${i + 1}. ${u.name}`).join('\n');
        const choice = prompt(`A qui voulez-vous envoyer de l'argent ?\n${userNames}`);
        const selectedIndex = parseInt(choice) - 1;

        if (otherUsers[selectedIndex]) {
            const amount = parseFloat(prompt("Quel montant ?"));
            if (isNaN(amount) || amount <= 0) return alert("Montant invalide");

            executeTransfer(userId, otherUsers[selectedIndex].id, amount, (transErr) => {
                if (transErr) return alert(transErr);
                alert("Transfert réussi !");
                fetchData();
            });
        }
    });
});

const setupNavigation = () => {
    const navLinks = document.querySelectorAll('.sidebar-nav li');
    const sections = document.querySelectorAll('.dashboard-section');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const anchor = link.querySelector('a');
            if (anchor) {
                const targetId = anchor.getAttribute('href').replace('#', '');
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                sections.forEach(section => section.classList.toggle('active', section.id === targetId));
            }
        });
    });
};

setupNavigation();
initDashboard();
