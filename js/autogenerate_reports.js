const accountsRef = firebase.database().ref('accounts');
const transactionsRef = firebase.database().ref('transactions');
const transfersRef = firebase.database().ref('transfers');
const reportsRef = firebase.database().ref('reports');

// Function to auto-generate reports for all accounts
function autoGenerateReports() {
    accountsRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const account = childSnapshot.val();
            const accountNumber = account.accountNumber;
            console.log(`Generating report for account: ${accountNumber}`);

            // Generate and save the report for each account
            generateAccountReport(accountNumber);
        });
    });
}

// Function to generate and save report for a specific account
function generateAccountReport(accountNumber) {
    let reportData = [];
    let runningBalance = 0;
    
    const promises = [];

    // Fetch transactions for the account
    promises.push(transactionsRef.orderByChild('accountNumber').equalTo(accountNumber).once('value').then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const transaction = childSnapshot.val();
            const credit = transaction.transactionType === 'Deposit' ? parseFloat(transaction.amount) : 0;
            const debit = transaction.transactionType === 'Withdrawal' ? parseFloat(transaction.amount) : 0;
            runningBalance += credit - debit;

            // Push transaction data to reportData array
            reportData.push({
                date: transaction.date,
                utrNumber: transaction.utrNumber,
                type: transaction.transactionType,
                description: '-',
                credit: credit || '-',
                debit: debit || '-',
                balance: runningBalance.toFixed(2),
            });
        });
    }));

    // Fetch transfers for the account
    promises.push(transfersRef.orderByChild('fromAccountNumber').equalTo(accountNumber).once('value').then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const transfer = childSnapshot.val();
            const debit = parseFloat(transfer.amount);
            runningBalance -= debit;

            // Push transfer data to reportData array
            reportData.push({
                date: transfer.date,
                utrNumber: transfer.utrNumber,
                type: transfer.transferType,
                description: `${transfer.toAccountName} (${transfer.toAccountNumber})`,
                credit: '-',
                debit: debit.toFixed(2),
                balance: runningBalance.toFixed(2),
            });
        });
    }));

    // Wait for all data fetching to complete
    Promise.all(promises).then(() => {
        // Sort the reportData by date
        reportData.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Save the report to Firebase under "reports" node for the account
        reportsRef.child(accountNumber).set({
            report: reportData,
        });

        console.log(`Report saved for account: ${accountNumber}`);
    });
}

// Call this function to auto-generate reports for all accounts
autoGenerateReports();
