// Reference to Firebase Realtime Database for bank info
const bankInfoRef = firebase.database().ref('bank_info');

// On form submission, save the data
document.getElementById('bankInfoForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission

    const bankName = document.getElementById('bank-name').value;
    const bankAddress = document.getElementById('bank-address').value;
    const bankGST = document.getElementById('bank-gst').value;
    const bankID = document.getElementById('bank-id').value;
    const bankLogoFile = document.getElementById('bank-logo-base64').files[0]; // Get the uploaded base64.txt file

    // Form data to be saved
    const bankData = {
        bankName: bankName,
        bankAddress: bankAddress,
        bankGST: bankGST,
        bankID: bankID
    };

    if (bankLogoFile) {
        // Read the Base64 file content
        const reader = new FileReader();
        reader.onload = function (event) {
            const base64String = event.target.result.trim();  // Read the Base64 string from the file
            bankData.bankLogoBase64 = base64String;  // Add the Base64 string to the data
            saveBankInfo(bankData);  // Save the bank info after Base64 is read
        };
        reader.readAsText(bankLogoFile);  // Read the file as text (Base64)
    } else {
        saveBankInfo(bankData); // Save without the logo if not provided
    }
});

// Save bank info to Firebase Realtime Database
function saveBankInfo(bankData) {
    bankInfoRef.set(bankData).then(() => {
        alert("Bank info saved successfully!");
        setFieldsReadOnly(true); // Make fields read-only after saving
        loadBankInfo(); // Reload saved data into the fields
    }).catch(error => {
        console.error("Error saving bank info:", error);
    });
}

// Function to load and display bank info
function loadBankInfo() {
    bankInfoRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
            const bankData = snapshot.val();
            document.getElementById('bank-name').value = bankData.bankName;
            document.getElementById('bank-address').value = bankData.bankAddress;
            document.getElementById('bank-gst').value = bankData.bankGST;
            document.getElementById('bank-id').value = bankData.bankID;

            // Show the current logo if exists
            if (bankData.bankLogoBase64) {
                const previewImage = document.getElementById('logo-preview');
                previewImage.src = 'data:image/png;base64,' + bankData.bankLogoBase64;
                previewImage.style.display = 'block';
            }
        } else {
            console.log("No bank info found.");
        }
    }).catch(error => {
        console.error("Error loading bank info:", error);
    });
}

// Preview the selected Base64.txt file
document.getElementById('bank-logo-base64').addEventListener('change', function () {
    const previewImage = document.getElementById('logo-preview');
    const file = this.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const base64String = e.target.result.trim();
            previewImage.src = 'data:image/png;base64,' + base64String;
            previewImage.style.display = 'block';
        };
        reader.readAsText(file);  // Read the file as Base64 text
    } else {
        previewImage.style.display = 'none';
    }
});

// Make fields editable only when the Edit button is clicked
document.getElementById('edit-btn').addEventListener('click', function () {
    setFieldsReadOnly(false); // Make fields editable
});

// Function to set fields as read-only or editable
function setFieldsReadOnly(readOnly) {
    document.getElementById('bank-name').readOnly = readOnly;
    document.getElementById('bank-address').readOnly = readOnly;
    document.getElementById('bank-gst').readOnly = readOnly;
    document.getElementById('bank-id').readOnly = readOnly;
    document.getElementById('bank-logo-base64').disabled = readOnly;
}

// Load bank info when the page loads
window.onload = function () {
    setFieldsReadOnly(true); // Set fields as read-only on page load
    loadBankInfo(); // Load saved data into the fields
};
