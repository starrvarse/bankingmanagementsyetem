let selectedRow = null;  // Track the selected row for editing

// Reference to Firebase Realtime Database for accounts and branches
const accountsRef = firebase.database().ref('accounts');
const branchesRef = firebase.database().ref('branches'); // Reference to branches

// Function to load branch names into the dropdown
function loadBranches() {
    const branchDropdown = document.getElementById('branch-name');
    branchDropdown.innerHTML = ''; // Clear existing options

    branchesRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const branch = childSnapshot.val();
            const option = document.createElement('option');
            option.value = branch.branchName; // Use the branch name as the value
            option.setAttribute('data-branch-code', branch.branchCode); // Store branch code as a data attribute
            option.textContent = `${branch.branchName} (${branch.branchCode})`; // Display branch name and code
            branchDropdown.appendChild(option);
        });
    });
}

// Function to open the popup form for creating a new account
function openCreateForm() {
    selectedRow = null;  // Reset selected row
    document.getElementById('formTitle').textContent = "Create Account";
    document.getElementById('account-number').value = "";
    document.getElementById('account-name').value = "";
    document.getElementById('account-type').value = "savings";
    document.getElementById('od-limit').value = "";  // Clear OD Limit field
    document.getElementById('branch-name').value = ""; // Clear branch dropdown
    document.getElementById('email').value = "";  // Clear email field
    loadBranches();  // Load branch options when form opens
    document.getElementById('popupForm').style.display = 'flex';
}

// Function to open the popup form for editing an account
function editAccount(button) {
    selectedRow = button.closest('tr');  // Get the row to edit
    const accountId = selectedRow.getAttribute('data-id');  // Get the Firebase account ID

    // Retrieve account data from Firebase and populate the form
    accountsRef.child(accountId).once('value').then(snapshot => {
        const account = snapshot.val();
        document.getElementById('formTitle').textContent = "Edit Account";
        document.getElementById('account-number').value = account.accountNumber || generateAccountNumber();
        document.getElementById('account-name').value = account.accountName;
        document.getElementById('account-type').value = account.accountType.toLowerCase();
        document.getElementById('od-limit').value = account.odLimit || "";  // Populate OD Limit field
        document.getElementById('email').value = account.email || "";  // Populate email field
        loadBranches();  // Load branch options when editing
        document.getElementById('branch-name').value = account.branchName || ""; // Populate branch name
        document.getElementById('popupForm').style.display = 'flex';
    });
}

// Function to generate a 15-digit account number based on the selected branch
function generateAccountNumber() {
    const branchDropdown = document.getElementById('branch-name');
    const selectedBranchOption = branchDropdown.options[branchDropdown.selectedIndex];
    const branchCode = selectedBranchOption ? selectedBranchOption.getAttribute('data-branch-code') : '00000'; // Default to '00000' if no branch selected
    const randomPart = Math.floor(100000000 + Math.random() * 900000000); // Generate 9 random digits
    return branchCode + randomPart; // Combine branch code and random part to form a 15-digit number
}

// Function to handle branch selection and account number generation
document.getElementById('branch-name').addEventListener('change', function () {
    const branchDropdown = document.getElementById('branch-name');
    const selectedBranchOption = branchDropdown.options[branchDropdown.selectedIndex];
    if (selectedBranchOption) {
        const branchCode = selectedBranchOption.getAttribute('data-branch-code');
        const newAccountNumber = generateAccountNumber(branchCode);
        document.getElementById('account-number').value = newAccountNumber;
    }
});

// Function to submit the form (create or edit)
function submitForm() {
    const accountNumber = document.getElementById('account-number').value;
    const accountName = document.getElementById('account-name').value;
    const accountType = document.getElementById('account-type').value;
    const odLimit = document.getElementById('od-limit').value || "0";  // Default to 0 if empty
    const branchName = document.getElementById('branch-name').value; // Get the selected branch name
    const email = document.getElementById('email').value;  // Get the email address

    const accountData = {
        accountNumber: accountNumber,
        accountName: accountName,
        accountType: accountType,
        odLimit: odLimit,
        branchName: branchName, // Save branch name
        email: email  // Save email
    };

    if (selectedRow) {
        // Update the existing account in Firebase
        const accountId = selectedRow.getAttribute('data-id');
        accountsRef.child(accountId).set(accountData);
    } else {
        // Create a new account in Firebase
        const newAccountRef = accountsRef.push();
        newAccountRef.set(accountData);
    }

    closeForm();  // Close the form after submission
    loadAccounts();  // Reload accounts to reflect the changes
}

// Function to load accounts from Firebase
function loadAccounts() {
    const tableBody = document.querySelector("#accountsTable tbody");
    tableBody.innerHTML = ""; // Clear the table first

    accountsRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const account = childSnapshot.val();
            const row = document.createElement('tr');
            row.setAttribute('data-id', childSnapshot.key);  // Store the Firebase ID
            row.innerHTML = `
                <td>${account.accountNumber || 'N/A'}</td> <!-- Ensure Account Number is displayed -->
                <td>${account.accountName}</td>
                <td>${account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}</td>
                <td>${account.odLimit || '0'}</td> <!-- Display OD Limit or 0 if not available -->
                <td>${account.branchName || 'N/A'}</td> <!-- Display branch name or N/A if not available -->
                <td>${account.email || 'N/A'}</td> <!-- Display email or N/A if not available -->
                <td>
                    <button class="action-btn edit" title="Edit Account" onclick="editAccount(this)"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" title="Delete Account" onclick="deleteAccount(this)"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    });
}

// Function to delete an account from Firebase
function deleteAccount(button) {
    const row = button.closest('tr');
    const accountId = row.getAttribute('data-id');  // Get the Firebase account ID
    accountsRef.child(accountId).remove();  // Delete the account from Firebase
    row.remove();  // Remove the row from the table
}

// Function to close the popup form
function closeForm() {
    document.getElementById('popupForm').style.display = 'none';
}

// Function to filter table by account number or name
function searchTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('accountsTable');
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

// Call this function to load accounts when the page loads
window.onload = function() {
    loadAccounts();
    loadBranches();  // Load branches when page loads to make sure branch dropdown is populated
};
