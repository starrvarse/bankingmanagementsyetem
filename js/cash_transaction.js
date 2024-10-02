let selectedRow = null;  // Track the selected row for editing

// Reference to Firebase Realtime Database for transactions and accounts
const transactionsRef = firebase.database().ref('transactions');
const accountsRef = firebase.database().ref('accounts');  // Reference to accounts in Firebase

// Function to open the popup form for creating a new transaction
function openCreateForm() {
    selectedRow = null;  // Reset selected row
    document.getElementById('formTitle').textContent = "Create Transaction";
    document.getElementById('select-account').value = ""; // Search field
    document.getElementById('account-number').value = "";
    document.getElementById('account-name').value = "";
    document.getElementById('transaction-date').value = "";
    document.getElementById('transaction-type').value = "debit";  // Default to Debit
    document.getElementById('amount').value = "";
    document.getElementById('utr-number').value = generateUTR();  // Generate UTR number
    document.getElementById('popupForm').style.display = 'flex';
}

// Function to generate a unique 16-digit UTR number with prefix '524'
function generateUTR() {
    const prefix = '524';
    const randomDigits = Math.floor(1000000000000 + Math.random() * 9000000000000);  // 13 random digits
    return prefix + randomDigits;
}

// Function to search accounts by Account Name or Account Number in Firebase
function searchAccount() {
    const searchInput = document.getElementById('select-account').value.toLowerCase();  // Get search input
    const accountNumberField = document.getElementById('account-number');
    const accountNameField = document.getElementById('account-name');

    if (searchInput.length > 0) {
        accountsRef.once('value', (snapshot) => {
            let accountFound = false;
            snapshot.forEach((childSnapshot) => {
                const account = childSnapshot.val();
                const accountNumber = account.accountNumber.toLowerCase();
                const accountName = account.accountName.toLowerCase();
                
                // Check if the search input matches the account number or account name
                if (accountName.includes(searchInput) || accountNumber.includes(searchInput)) {
                    // Auto-populate account number and account name
                    accountNumberField.value = account.accountNumber;
                    accountNameField.value = account.accountName;
                    accountFound = true;
                }
            });

            // If no account is found, clear the fields
            if (!accountFound) {
                accountNumberField.value = "";
                accountNameField.value = "";
            }
        });
    } else {
        // Clear the fields if no input is provided
        accountNumberField.value = "";
        accountNameField.value = "";
    }
}

// Function to open the popup form for editing a transaction
function editTransaction(button) {
    selectedRow = button.closest('tr');  // Get the row to edit
    const transactionId = selectedRow.getAttribute('data-id');  // Get the Firebase transaction ID

    // Retrieve transaction data from Firebase and populate the form
    transactionsRef.child(transactionId).once('value').then(snapshot => {
        const transaction = snapshot.val();
        document.getElementById('formTitle').textContent = "Edit Transaction";
        document.getElementById('account-number').value = transaction.accountNumber;
        document.getElementById('account-name').value = transaction.accountName;
        document.getElementById('transaction-date').value = transaction.date;
        document.getElementById('transaction-type').value = transaction.transactionType;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('utr-number').value = transaction.utrNumber;  // Load UTR number into the form
        document.getElementById('popupForm').style.display = 'flex';
    });
}

// Function to submit the form (create or edit)
function submitForm() {
    const accountNumber = document.getElementById('account-number').value;
    const accountName = document.getElementById('account-name').value;
    const date = document.getElementById('transaction-date').value;
    const transactionType = document.getElementById('transaction-type').value;
    const amount = document.getElementById('amount').value || 0;  // Default to 0 if empty
    const utrNumber = document.getElementById('utr-number').value;  // Get the UTR number

    if (selectedRow) {
        // Update the existing transaction in Firebase
        const transactionId = selectedRow.getAttribute('data-id');
        transactionsRef.child(transactionId).set({
            accountNumber: accountNumber,
            accountName: accountName,
            date: date,
            transactionType: transactionType,
            amount: amount,
            utrNumber: utrNumber  // Update UTR number
        });
    } else {
        // Create a new transaction in Firebase
        const newTransactionRef = transactionsRef.push();
        newTransactionRef.set({
            accountNumber: accountNumber,
            accountName: accountName,
            date: date,
            transactionType: transactionType,
            amount: amount,
            utrNumber: utrNumber  // Store UTR number in Firebase
        });
    }

    closeForm();  // Close the form after submission
    loadTransactions();  // Reload transactions to reflect the changes
}

// Function to load transactions from Firebase
function loadTransactions() {
    const tableBody = document.querySelector("#transactionsTable tbody");
    tableBody.innerHTML = ""; // Clear the table first

    transactionsRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const transaction = childSnapshot.val();
            const row = document.createElement('tr');
            row.setAttribute('data-id', childSnapshot.key);  // Store the Firebase ID
            row.innerHTML = `
                <td>${transaction.accountNumber}</td>
                <td>${transaction.accountName}</td>
                <td>${transaction.date}</td>
                <td>${transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}</td>
                <td>${transaction.amount}</td>
                <td>${transaction.utrNumber}</td>  <!-- UTR Number Column -->
                <td>
                    <button class="action-btn edit" title="Edit Transaction" onclick="editTransaction(this)"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" title="Delete Transaction" onclick="deleteTransaction(this)"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    });
}

// Function to delete a transaction from Firebase
function deleteTransaction(button) {
    const row = button.closest('tr');
    const transactionId = row.getAttribute('data-id');  // Get the Firebase transaction ID
    transactionsRef.child(transactionId).remove();  // Delete the transaction from Firebase
    row.remove();  // Remove the row from the table
}

// Function to close the popup form
function closeForm() {
    document.getElementById('popupForm').style.display = 'none';
}

// Function to filter transactions by account number or name
function searchTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('transactionsTable');
    const rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) {
        const accountNumber = rows[i].getElementsByTagName('td')[0].textContent.toLowerCase();
        const accountName = rows[i].getElementsByTagName('td')[1].textContent.toLowerCase();
        if (accountNumber.includes(filter) || accountName.includes(filter)) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}

// Call this function to load transactions when the page loads
window.onload = loadTransactions;
