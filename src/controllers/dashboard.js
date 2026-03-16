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
const transferSection = document.getElementById('transfer-section');
const transferForm = document.getElementById('transferForm');
const beneficiarySelect = document.getElementById('beneficiary');
const sourceCardSelect = document.getElementById('sourceCard');
const amountInput = document.getElementById('amount');
const cancelTransferBtn = document.getElementById('cancelTransferBtn');
const closeTransferBtn = document.getElementById('closeTransferBtn');
const submitTransferBtn = document.getElementById('submitTransferBtn');
const userId = localStorage.getItem('loggedInUserId');

const resetTransferUI = () => {
    if (!transferForm) return;
    transferForm.reset();

    if (beneficiarySelect) {
        beneficiarySelect.innerHTML = '<option value="" disabled selected>Choisir un bénéficiaire</option>';
    }
    if (sourceCardSelect) {
        sourceCardSelect.innerHTML = '<option value="" disabled selected>Sélectionner une carte</option>';
    }
};

const openTransferSection = () => {
    if (!transferSection) return;
    if (!userId) {
        window.location.href = '/src/View/login.html';
        return;
    }

    transferSection.classList.remove('hidden');
    resetTransferUI();

    getAllUsers((err, allUsers) => {
        if (err || !beneficiarySelect) return;

        const otherUsers = allUsers.filter(u => u.id !== userId);
        if (otherUsers.length === 0) {
            alert('Aucun autre utilisateur trouvé.');
            return;
        }

        beneficiarySelect.innerHTML = '<option value="" disabled selected>Choisir un bénéficiaire</option>';
        otherUsers.forEach((u) => {
            const option = document.createElement('option');
            option.value = u.id;
            option.textContent = u.name;
            beneficiarySelect.appendChild(option);
        });
    });

    getUserData(userId, (err, user) => {
        if (err || !sourceCardSelect) return;
        const cards = user?.wallet?.cards ?? [];

        sourceCardSelect.innerHTML = '<option value="" disabled selected>Sélectionner une carte</option>';
        cards.forEach((card) => {
            const option = document.createElement('option');
            option.value = card.numcards;
            option.textContent = `${card.type.toUpperCase()} •••• ${card.numcards.slice(-4)}`;
            sourceCardSelect.appendChild(option);
        });
    });

    amountInput?.focus();
};

const closeTransferSection = () => {
    if (!transferSection) return;
    transferSection.classList.add('hidden');
    resetTransferUI();
};

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
    openTransferSection();
});

cancelTransferBtn?.addEventListener('click', () => {
    closeTransferSection();
});

closeTransferBtn?.addEventListener('click', () => {
    closeTransferSection();
});

transferForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!userId) return;

    if (!transferForm.checkValidity()) {
        transferForm.reportValidity();
        return;
    }

    const toUserId = beneficiarySelect?.value;
    const amount = parseFloat(amountInput?.value ?? '');

    if (!toUserId) return alert('Veuillez choisir un bénéficiaire.');
    if (isNaN(amount) || amount <= 0) return alert('Montant invalide');

    if (submitTransferBtn) {
        submitTransferBtn.disabled = true;
        submitTransferBtn.textContent = 'Transfert...';
    }

    executeTransfer(userId, toUserId, amount, (transErr) => {
        if (submitTransferBtn) {
            submitTransferBtn.disabled = false;
            submitTransferBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Transférer';
        }

        if (transErr) return alert(transErr);
        alert('Transfert réussi !');
        closeTransferSection();
        fetchData();
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

                if (targetId === 'transfers') {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    openTransferSection();
                    return;
                }

                const hasTargetSection = Array.from(sections).some(section => section.id === targetId);
                if (!hasTargetSection) {
                    return;
                }

                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                sections.forEach(section => section.classList.toggle('active', section.id === targetId));
            }
        });
    });
};

setupNavigation();
initDashboard();
