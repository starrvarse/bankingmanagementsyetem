
##Banking Management System
##Description
A comprehensive Banking Management System (BMS) built with Firebase, HTML, CSS, and JavaScript. The system offers account management, 
cash transactions, fund transfers, user management, branch details, and reporting functionality. 
It integrates with Firebase Authentication for user sign-up/sign-in and Realtime Database for storing account and transaction data.


## Features
Features
Account Management: Create, edit, and manage bank accounts with ease.
Cash Transactions: Record deposits and withdrawals for each account.
Fund Transfers: Transfer funds between accounts with detailed transaction history.
User Management: View, add, and delete users registered in the system.
Branch Management: Manage and display bank branch details.
Reports: Generate reports for accounts, transactions, and more.
Authentication: User sign-up and sign-in system using Firebase Authentication.
Responsive Design: Mobile-friendly and responsive UI.
Technology Stack
Frontend:

HTML5 / CSS3 / JavaScript
Firebase Realtime Database
FontAwesome for icons
Backend:

Firebase Authentication
Firebase Realtime Database
Firebase:

Firebase Realtime Database for data storage
Firebase Authentication for managing user sign-up and login
Screenshots
Dashboard

Account Management

Cash Transactions
## Installation

1. Clone the Repository
bash
Copy code
git clone https://github.com/starrvarse/Banking-management-system.git
cd Banking-Management-System
2. Setup Firebase
Go to the Firebase Console.
Create a new project.
Enable Authentication and choose the email/password sign-in method.
Setup Realtime Database and create necessary rules for reading/writing data.
In Project Settings, generate Firebase config credentials for web apps and update firebase-config.js in your project with those credentials.
Example of firebase-config.js:

javascript
Copy code
var firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
3. Run the Application
Open the index.html file in your browser to run the application.

Alternatively, use a local development server (e.g., Live Server in VSCode).

4. Firebase Realtime Database Rules (Optional)
If you'd like to restrict access to authenticated users only, set the rules like this:

json
Copy code
{
  "rules": {
    "users": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "accounts": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "transactions": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
Usage
Creating Accounts
Navigate to the Accounts page to create new accounts, view the account list, and manage account details.
Each account is associated with a branch and has an optional OD (Overdraft) limit.
Managing Transactions
Record deposits and withdrawals in the Cash Transactions section.
Manage fund transfers between accounts with UTR numbers for each transaction.
User Management
View the list of users who have registered in the system.
Add, edit, or delete user accounts as needed.
Branch Management
Add and edit branch details such as branch name and code.
Reports
Generate and view detailed reports for transactions, deposits, withdrawals, and other account activities.
Project Structure
bash
Copy code
.
├── css/                        # CSS files for styling the application
├── js/                         # JavaScript files for dynamic functionality
├── attendance.html             # Attendance tracking page
├── company_info.html           # Company information page
├── dashboard.html              # Admin dashboard page
├── employees.html              # Employee management page
├── index.html                  # Main landing page
├── loanbalances.html           # Loan balances tracking page
├── loans.html                  # Loans management page
├── navbar.html                 # Navigation bar for all pages
├── salary_slips.html           # Salary slips management page
└── salarydetail.html           # Detailed salary breakdown page

Firebase Database Structure
json
Copy code
{
  "users": {
    "uid12345": {
      "email": "user@example.com",
      "createdAt": "2024-09-15T12:34:56Z"
    }
  },
  "accounts": {
    "acc12345": {
      "accountNumber": "1234567890",
      "accountName": "John Doe",
      "branchName": "Main Branch",
      "odLimit": 5000,
      "email": "john.doe@example.com"
    }
  },
  "transactions": {
    "txn12345": {
      "accountNumber": "1234567890",
      "amount": 1000,
      "transactionType": "Deposit",
      "date": "2024-09-15",
      "utrNumber": "UTR98765"
    }
  }
}
Firebase Security Rules
For security, ensure to have proper access rules in place based on user authentication.

json
Copy code
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
Contributing
Fork the repository.
Create a new branch.
Make your changes.
Submit a pull request.