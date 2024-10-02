let selectedRow = null;  // Track the selected row for editing

// Reference to Firebase Realtime Database for transfers and accounts
const transfersRef = firebase.database().ref('transfers');
const accountsRef = firebase.database().ref('accounts');  // Reference to accounts in Firebase

// Function to generate a 16-digit UTR number with the prefix '335'
function generateUTR() {
    const prefix = '335';
    const randomNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString(); // Generate 12 random digits
    return prefix + randomNumber;  // Combine the prefix and random number
}

// Function to open the popup form for creating a new transfer
function openCreateForm() {
    selectedRow = null;  // Reset selected row
    document.getElementById('formTitle').textContent = "Create Transfer";
    document.getElementById('transfer-date').value = "";
    document.getElementById('from-account').value = "";
    document.getElementById('to-account').value = "";
    document.getElementById('from-account-name').value = "";
    document.getElementById('from-account-number').value = "";
    document.getElementById('to-account-name').value = "";
    document.getElementById('to-account-number').value = "";
    document.getElementById('transfer-type').value = "RTGS";  // Default to RTGS
    document.getElementById('description').value = "";
    document.getElementById('amount').value = "";
    document.getElementById('popupForm').style.display = 'flex';
}

// Function to search for From Account and auto-populate fields
function searchFromAccount() {
    const searchInput = document.getElementById('from-account').value.toLowerCase();
    const fromAccountField = document.getElementById('from-account');
    const fromAccountNameField = document.getElementById('from-account-name');
    const fromAccountNumberField = document.getElementById('from-account-number');
    
    if (searchInput.length > 0) {
        accountsRef.once('value', (snapshot) => {
            let accountFound = false;
            snapshot.forEach((childSnapshot) => {
                const account = childSnapshot.val();
                const accountName = account.accountName.toLowerCase();
                const accountNumber = account.accountNumber;

                if (accountName.includes(searchInput)) {
                    fromAccountField.value = account.accountName;  // Auto-populate the account name
                    fromAccountNameField.value = account.accountName;
                    fromAccountNumberField.value = accountNumber;
                    accountFound = true;
                }
            });

            if (!accountFound) {
                fromAccountField.value = "";
                fromAccountNameField.value = "";
                fromAccountNumberField.value = "";
            }
        });
    } else {
        fromAccountNameField.value = "";
        fromAccountNumberField.value = "";
    }
}

// Function to search for To Account and auto-populate fields
function searchToAccount() {
    const searchInput = document.getElementById('to-account').value.toLowerCase();
    const toAccountField = document.getElementById('to-account');
    const toAccountNameField = document.getElementById('to-account-name');
    const toAccountNumberField = document.getElementById('to-account-number');
    
    if (searchInput.length > 0) {
        accountsRef.once('value', (snapshot) => {
            let accountFound = false;
            snapshot.forEach((childSnapshot) => {
                const account = childSnapshot.val();
                const accountName = account.accountName.toLowerCase();
                const accountNumber = account.accountNumber;

                if (accountName.includes(searchInput)) {
                    toAccountField.value = account.accountName;
                    toAccountNameField.value = account.accountName;
                    toAccountNumberField.value = accountNumber;
                    accountFound = true;
                }
            });

            if (!accountFound) {
                toAccountField.value = "";
                toAccountNameField.value = "";
                toAccountNumberField.value = "";
            }
        });
    } else {
        toAccountNameField.value = "";
        toAccountNumberField.value = "";
    }
}

// Function to open the popup form for editing a transfer
function editTransfer(button) {
    selectedRow = button.closest('tr');  // Get the row to edit
    const transferId = selectedRow.getAttribute('data-id');  // Get the Firebase transfer ID

    // Retrieve transfer data from Firebase and populate the form
    transfersRef.child(transferId).once('value').then(snapshot => {
        const transfer = snapshot.val();
        document.getElementById('formTitle').textContent = "Edit Transfer";
        document.getElementById('transfer-date').value = transfer.date;
        document.getElementById('from-account-name').value = transfer.fromAccountName;
        document.getElementById('from-account-number').value = transfer.fromAccountNumber;
        document.getElementById('to-account-name').value = transfer.toAccountName;
        document.getElementById('to-account-number').value = transfer.toAccountNumber;
        document.getElementById('transfer-type').value = transfer.transferType;
        document.getElementById('description').value = transfer.description;
        document.getElementById('amount').value = transfer.amount;
        document.getElementById('popupForm').style.display = 'flex';
    });
}

// Function to submit the form (create or edit)
function submitForm() {
    const date = document.getElementById('transfer-date').value;
    const fromAccountName = document.getElementById('from-account-name').value;
    const fromAccountNumber = document.getElementById('from-account-number').value;
    const toAccountName = document.getElementById('to-account-name').value;
    const toAccountNumber = document.getElementById('to-account-number').value;
    const transferType = document.getElementById('transfer-type').value;
    const description = document.getElementById('description').value || "";
    const amount = document.getElementById('amount').value || 0;  // Default to 0 if empty
    const utrNumber = generateUTR();  // Generate the UTR number

    if (selectedRow) {
        // Update the existing transfer in Firebase
        const transferId = selectedRow.getAttribute('data-id');
        transfersRef.child(transferId).set({
            date: date,
            fromAccountName: fromAccountName,
            fromAccountNumber: fromAccountNumber,
            toAccountName: toAccountName,
            toAccountNumber: toAccountNumber,
            transferType: transferType,
            description: description,
            amount: amount,
            utrNumber: utrNumber  // Include the UTR number
        });
    } else {
        // Create a new transfer in Firebase
        const newTransferRef = transfersRef.push();
        newTransferRef.set({
            date: date,
            fromAccountName: fromAccountName,
            fromAccountNumber: fromAccountNumber,
            toAccountName: toAccountName,
            toAccountNumber: toAccountNumber,
            transferType: transferType,
            description: description,
            amount: amount,
            utrNumber: utrNumber  // Include the UTR number
        });
    }

    closeForm();  // Close the form after submission
    loadTransfers();  // Reload transfers to reflect the changes
}

// Function to load transfers from Firebase
function loadTransfers() {
    const tableBody = document.querySelector("#transfersTable tbody");
    tableBody.innerHTML = ""; // Clear the table first

    transfersRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const transfer = childSnapshot.val();
            const row = document.createElement('tr');
            row.setAttribute('data-id', childSnapshot.key);  // Store the Firebase ID
            row.innerHTML = `
                <td>${transfer.date}</td>
                <td>${transfer.fromAccountName} (${transfer.fromAccountNumber})</td>  <!-- From Account -->
                <td>${transfer.toAccountName} (${transfer.toAccountNumber})</td>  <!-- To Account -->
                <td>${transfer.transferType.charAt(0).toUpperCase() + transfer.transferType.slice(1)}</td>
                <td>${transfer.description}</td>
                <td>${transfer.amount}</td>
                <td>${transfer.utrNumber}</td>  <!-- Display the UTR number -->
                <td>
                    <button class="action-btn edit" title="Edit Transfer" onclick="editTransfer(this)"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" title="Delete Transfer" onclick="deleteTransfer(this)"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    });
}

// Function to delete a transfer from Firebase
function deleteTransfer(button) {
    const row = button.closest('tr');
    const transferId = row.getAttribute('data-id');  // Get the Firebase transfer ID
    transfersRef.child(transferId).remove();  // Delete the transfer from Firebase
    row.remove();  // Remove the row from the table
}

// Function to close the popup form
function closeForm() {
    document.getElementById('popupForm').style.display = 'none';
}

// Function to filter transfers by From Account or To Account
function searchTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('transfersTable');
    const rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) {
        const fromAccount = rows[i].getElementsByTagName('td')[1].textContent.toLowerCase();
        const toAccount = rows[i].getElementsByTagName('td')[2].textContent.toLowerCase();
        if (fromAccount.includes(filter) || toAccount.includes(filter)) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}

// Call this function to load transfers when the page loads
window.onload = loadTransfers;
