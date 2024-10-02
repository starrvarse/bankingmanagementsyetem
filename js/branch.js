let selectedRow = null;  // Track the selected row for editing

// Reference to Firebase Realtime Database for branches
const branchesRef = firebase.database().ref('branches');

// Function to open the popup form for creating a new branch
function openCreateForm() {
    selectedRow = null;  // Reset selected row
    document.getElementById('formTitle').textContent = "Add Branch";
    document.getElementById('branch-name').value = "";
    document.getElementById('branch-code').value = "";
    document.getElementById('ifsc').value = "";
    document.getElementById('address').value = "";
    document.getElementById('phone-number').value = "";
    document.getElementById('email').value = "";
    document.getElementById('popupForm').style.display = 'flex';
}

// Function to submit the form (create or edit)
function submitForm() {
    const branchName = document.getElementById('branch-name').value;
    const branchCode = document.getElementById('branch-code').value;
    const ifsc = document.getElementById('ifsc').value;
    const address = document.getElementById('address').value;
    const phoneNumber = document.getElementById('phone-number').value;
    const email = document.getElementById('email').value;

    // Debugging: Log the form data
    console.log('Form Data:', { branchName, branchCode, ifsc, address, phoneNumber, email });

    if (selectedRow) {
        // Update the existing branch in Firebase
        const branchId = selectedRow.getAttribute('data-id');
        branchesRef.child(branchId).set({
            branchName: branchName,
            branchCode: branchCode,
            ifsc: ifsc,
            address: address,
            phoneNumber: phoneNumber,
            email: email
        }).then(() => {
            console.log('Branch updated successfully');
            closeForm();
            loadBranches();  // Reload the table after updating
        }).catch((error) => {
            console.error('Error updating branch:', error);
        });
    } else {
        // Create a new branch in Firebase
        const newBranchRef = branchesRef.push();
        newBranchRef.set({
            branchName: branchName,
            branchCode: branchCode,
            ifsc: ifsc,
            address: address,
            phoneNumber: phoneNumber,
            email: email
        }).then(() => {
            console.log('Branch created successfully');
            closeForm();
            loadBranches();  // Reload the table after adding
        }).catch((error) => {
            console.error('Error creating branch:', error);
        });
    }
}

// Function to load branches from Firebase and display in the table
function loadBranches() {
    const tableBody = document.querySelector("#branchesTable tbody");
    tableBody.innerHTML = "";  // Clear the table first

    branchesRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const branch = childSnapshot.val();
            const row = document.createElement('tr');
            row.setAttribute('data-id', childSnapshot.key);  // Store the Firebase ID

            row.innerHTML = `
                <td>${branch.branchName}</td>
                <td>${branch.branchCode}</td>
                <td>${branch.ifsc}</td>
                <td>${branch.address}</td>
                <td>${branch.phoneNumber}</td>
                <td>${branch.email}</td>
                <td>
                    <button class="action-btn edit" onclick="editBranch(this)"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteBranch(this)"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;

            tableBody.appendChild(row);
        });
    }).catch(error => {
        console.error('Error loading branches:', error);
    });
}

// Function to edit a branch
function editBranch(button) {
    selectedRow = button.closest('tr');
    const branchId = selectedRow.getAttribute('data-id');  // Get the Firebase ID

    branchesRef.child(branchId).once('value').then((snapshot) => {
        const branch = snapshot.val();
        document.getElementById('formTitle').textContent = "Edit Branch";
        document.getElementById('branch-name').value = branch.branchName;
        document.getElementById('branch-code').value = branch.branchCode;
        document.getElementById('ifsc').value = branch.ifsc;
        document.getElementById('address').value = branch.address;
        document.getElementById('phone-number').value = branch.phoneNumber;
        document.getElementById('email').value = branch.email;
        document.getElementById('popupForm').style.display = 'flex';
    });
}

// Function to delete a branch
function deleteBranch(button) {
    const row = button.closest('tr');
    const branchId = row.getAttribute('data-id');

    branchesRef.child(branchId).remove().then(() => {
        console.log('Branch deleted successfully');
        row.remove();  // Remove the row from the table
    }).catch(error => {
        console.error('Error deleting branch:', error);
    });
}

// Function to close the popup form
function closeForm() {
    document.getElementById('popupForm').style.display = 'none';
}

// Function to search and filter branches in the table
function searchTable() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#branchesTable tbody tr');

    rows.forEach(row => {
        const branchName = row.getElementsByTagName('td')[0].textContent.toLowerCase();
        const branchCode = row.getElementsByTagName('td')[1].textContent.toLowerCase();
        if (branchName.includes(input) || branchCode.includes(input)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

// Call this function to load branches when the page loads
window.onload = loadBranches;
