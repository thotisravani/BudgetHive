let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let monthlyIncome = parseFloat(localStorage.getItem('monthlyIncome')) || 0;
let monthlyExpense = parseFloat(localStorage.getItem('monthlyExpense')) || 0;

document.getElementById('addButton').addEventListener('click', addTransaction);
document.getElementById('setBudgetButton').addEventListener('click', setBudget);

displayTransactions();
updateSummary();
updateChart();

function addTransaction() {
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;

    // Validate input fields
    if (!description || isNaN(amount) || !date || !category) {
        alert('Please fill out all fields');
        return;
    }

    // Create a new transaction object
    const transaction = { description, amount, date, category };
    transactions.push(transaction);

    // Update display, summary, chart, and save data
    displayTransactions();
    updateSummary();
    updateChart();
    saveData();

    // Clear input fields
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('date').value = '';
    document.getElementById('category').value = 'income';
}

function displayTransactions() {
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = ''; // Clear existing list

    transactions.forEach((transaction, index) => {
        const li = document.createElement('li');
        li.textContent = `${transaction.date} - ${transaction.description}: ₹${transaction.amount.toFixed(2)} (${transaction.category})`;

        // Create delete button for each transaction
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('deleteButton');
        deleteButton.addEventListener('click', () => deleteTransaction(index));

        li.appendChild(deleteButton);
        transactionList.appendChild(li);
    });
}

function deleteTransaction(index) {
    transactions.splice(index, 1);
    displayTransactions();
    updateSummary();
    updateChart();
    saveData();
}

function setBudget() {
    monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value);
    monthlyExpense = parseFloat(document.getElementById('monthlyExpense').value);
    updateSummary();
    saveData();
}

function updateSummary() {
    const totalIncome = transactions
        .filter(t => t.category === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.category !== 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const savings = totalIncome - totalExpenses;
    const monthlySavings = monthlyIncome - totalExpenses;

    document.getElementById('totalIncome').textContent = `₹${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `₹${totalExpenses.toFixed(2)}`;
    document.getElementById('savings').textContent = `₹${savings.toFixed(2)}`;
    document.getElementById('monthlySavings').textContent = `₹${monthlySavings.toFixed(2)}`;

    let budgetStatus = 'N/A';
    if (monthlyIncome > 0 && monthlyExpense > 0) {
        budgetStatus = monthlySavings >= 0 ? 'Within Budget' : 'Over Budget';
    }

    document.getElementById('budgetStatus').textContent = budgetStatus;
}

function updateChart() {
    const chartCanvas = document.getElementById('chart');

    if (!chartCanvas || !Array.isArray(transactions)) {
        console.error('Chart canvas or transactions data is missing.');
        return;
    }

    const ctx = chartCanvas.getContext('2d');
    const labels = ['Food', 'Rent', 'Entertainment', 'Other'];
    const expenses = labels.map(label => {
        return transactions
            .filter(t => t.category.toLowerCase() === label.toLowerCase())
            .reduce((sum, t) => sum + t.amount, 0);
    });

    const totalChartData = expenses.reduce((acc, curr) => acc + curr, 0);

    if (window.barChart) {
        window.barChart.destroy();
    }

    window.barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Expenses',
                data: expenses,
                backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'],
            }],
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            const percentage = totalChartData ? ((value / totalChartData) * 100).toFixed(2) : '0.00';
                            return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        },
    });
}

function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('monthlyIncome', monthlyIncome);
    localStorage.setItem('monthlyExpense', monthlyExpense);
}
