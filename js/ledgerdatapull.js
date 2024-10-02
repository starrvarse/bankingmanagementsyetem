// Ensure accountsRef is only declared in this file (ledgerdatapull.js)
const accountsRef = firebase.database().ref('accounts');
const transfersRef = firebase.database().ref('transfers');
const transactionsRef = firebase.database().ref('transactions');
const utrNumbersSet = new Set();  // Track unique UTR numbers

// Function to load accounts into the dropdown
function loadAccounts() {
    const accountDropdown = document.getElementById('account-dropdown');
    accountDropdown.innerHTML = ''; // Clear existing options

    accountsRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const account = childSnapshot.val();
            const option = document.createElement('option');
            option.value = account.accountNumber;  // Use the accountNumber as the value
            option.textContent = `${account.accountName} (${account.accountNumber})`;
            accountDropdown.appendChild(option);
        });

        // Automatically load the first account's transactions upon page load
        const firstAccountNumber = accountDropdown.options[0].value;
        populateAccountDetails(firstAccountNumber);
    });
}

// Function to populate account details and trigger loading of data
function populateAccountDetails(selectedAccountNumber) {
    console.log(`Selected Account: ${selectedAccountNumber}`);
    const accountNameField = document.getElementById('account-name');
    const accountNumberField = document.getElementById('account-number');
    const odLimitField = document.getElementById('od-limit');  // OD Limit field

    if (!selectedAccountNumber) {
        console.error('Selected account number is undefined or null.');
        return;
    }

    // Query the selected account's details
    accountsRef.orderByChild('accountNumber').equalTo(selectedAccountNumber).once('value').then(snapshot => {
        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                const account = childSnapshot.val();
                accountNameField.value = account.accountName;
                accountNumberField.value = account.accountNumber;
                odLimitField.value = account.odLimit || 'N/A';  // Populate OD Limit or default to N/A
            });
        } else {
            console.log("No account data found.");
        }
    });

    // Clear the table and UTR set, and load transactions/transfers
    clearTable();
    utrNumbersSet.clear();
    loadTransactions(selectedAccountNumber);  // Load both transactions and transfers for the account
    loadTransfers(selectedAccountNumber);
}

// Function to clear the table before loading new data
function clearTable() {
    const tableBody = document.querySelector("#reportTable tbody");
    tableBody.innerHTML = '';  // Clear existing table rows
}

// Function to load transactions for the selected account
function loadTransactions(accountNumber) {
    console.log(`Loading transactions for account: ${accountNumber}`);
    const tableBody = document.querySelector("#reportTable tbody");

    transactionsRef.orderByChild('accountNumber').equalTo(accountNumber).once('value', (snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const transaction = childSnapshot.val();
                console.log("Transaction Data:", transaction);

                // Check for duplicate UTR numbers
                if (utrNumbersSet.has(transaction.utrNumber)) {
                    console.log(`Duplicate UTR found in transactions: ${transaction.utrNumber}. Skipping...`);
                    return;
                }

                utrNumbersSet.add(transaction.utrNumber);  // Add UTR number to the set

                // Create row and populate with transaction data
                const row = document.createElement('tr');
                row.setAttribute('id', 'transaction-' + childSnapshot.key);

                let credit = '', debit = '';
                if (transaction.transactionType === 'Deposit') {
                    credit = transaction.amount;
                } else if (transaction.transactionType === 'Withdrawal') {
                    debit = transaction.amount;
                }

                // Add row to table
                row.innerHTML = `
                    <td>${transaction.date}</td>
                    <td>${transaction.utrNumber}</td>
                    <td>${transaction.transactionType}</td>
                    <td>-</td>
                    <td>${credit || '-'}</td>
                    <td>${debit || '-'}</td>
                    <td>-</td> <!-- Balance column removed from this script -->
                `;
                tableBody.appendChild(row);
            });
        } else {
            console.log("No transactions data found.");
        }
    }).catch(error => {
        console.error("Error fetching transactions:", error);
    });
}

// Function to load transfers for the selected account
function loadTransfers(accountNumber) {
    console.log(`Loading transfers for account: ${accountNumber}`);
    const tableBody = document.querySelector("#reportTable tbody");

    transfersRef.orderByChild('fromAccountNumber').equalTo(accountNumber).once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const transfer = childSnapshot.val();

            // Check for duplicate UTR numbers
            if (utrNumbersSet.has(transfer.utrNumber)) {
                console.log(`Duplicate UTR found in transfers: ${transfer.utrNumber}. Skipping...`);
                return;
            }

            utrNumbersSet.add(transfer.utrNumber);  // Add UTR number to the set

            const row = document.createElement('tr');
            row.setAttribute('id', 'transfer-' + childSnapshot.key);

            // Populate table row
            row.innerHTML = `
                <td>${transfer.date}</td>
                <td>${transfer.utrNumber}</td>
                <td>${transfer.transferType}</td>
                <td>${transfer.toAccountName} (${transfer.toAccountNumber})</td>
                <td>-</td>
                <td>${transfer.amount}</td>
                <td>-</td> <!-- Balance column removed from this script -->
            `;
            tableBody.appendChild(row);
        });
    }).catch(error => {
        console.error("Error fetching transfers:", error);
    });
}

// Event listener to update the data when an account is selected from the dropdown
document.getElementById('account-dropdown').addEventListener('change', function () {
    const selectedAccountNumber = this.value;
    populateAccountDetails(selectedAccountNumber);
});

// Load accounts on window load
window.onload = function () {
    loadAccounts();
};
