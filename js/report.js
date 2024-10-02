document.addEventListener("DOMContentLoaded", function() {
    // Function to sort the table rows by date
    function sortTableByDate() {
        const tableBody = document.querySelector("#reportTable tbody");
        const rows = Array.from(tableBody.querySelectorAll("tr"));

        rows.sort((rowA, rowB) => {
            const dateA = new Date(rowA.querySelector("td:nth-child(1)").textContent);
            const dateB = new Date(rowB.querySelector("td:nth-child(1)").textContent);
            return dateA - dateB;  // Sort in ascending order (earliest first)
        });

        tableBody.innerHTML = '';
        const fragment = document.createDocumentFragment();
        rows.forEach(row => fragment.appendChild(row));
        tableBody.appendChild(fragment);
    }

    // Function to calculate the balance for each row
    function calculateBalance() {
        const tableBody = document.querySelector("#reportTable tbody");
        const odLimitField = document.getElementById('od-limit');
        let odLimit = parseFloat(odLimitField.value) || 0;
        let runningBalance = odLimit;

        const rows = tableBody.querySelectorAll("tr");
        rows.forEach((row) => {
            const creditCell = row.querySelector("td:nth-child(5)");
            const debitCell = row.querySelector("td:nth-child(6)");
            const balanceCell = row.querySelector("td:nth-child(7)");

            let credit = parseFloat(creditCell.textContent) || 0;
            let debit = parseFloat(debitCell.textContent) || 0;

            runningBalance += credit - debit;
            balanceCell.textContent = runningBalance.toFixed(2);
        });
    }

    // Function to update and calculate balances after sorting by date
    function updateTableWithBalances() {
        sortTableByDate();
        calculateBalance();
    }

    // Monitor table updates
    function monitorTableUpdates() {
        const tableBody = document.querySelector("#reportTable tbody");
        const observer = new MutationObserver(() => {
            clearTimeout(window.balanceUpdateTimeout);
            window.balanceUpdateTimeout = setTimeout(() => {
                updateTableWithBalances();
            }, 200);
        });
        observer.observe(tableBody, { childList: true, subtree: true });
    }

    // Export to PDF
    function exportToPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("Bank Transactions Report", 14, 16);

        const tableBody = document.querySelector("#reportTable tbody");
        const headers = [["Date", "Transaction Type", "Description", "Credit", "Debit", "Balance"]];
        const rows = Array.from(tableBody.querySelectorAll("tr")).map(row => {
            const cols = row.querySelectorAll("td");
            return Array.from(cols).map(col => col.textContent);
        });

        doc.autoTable({
            head: headers,
            body: rows,
            startY: 22,
        });
        doc.save("bank_transactions_report.pdf");
    }

    // Export to Excel
    function exportToExcel() {
        const wb = XLSX.utils.book_new();
        const ws_data = [];
        const headers = ["Date", "Transaction Type", "Description", "Credit", "Debit", "Balance"];
        ws_data.push(headers);

        const tableBody = document.querySelector("#reportTable tbody");
        Array.from(tableBody.querySelectorAll("tr")).forEach(row => {
            const rowData = Array.from(row.querySelectorAll("td")).map(td => td.textContent);
            ws_data.push(rowData);
        });

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, "Transactions");
        XLSX.writeFile(wb, "bank_transactions_report.xlsx");
    }

    // Share report via email
    function shareReport() {
        const accountEmail = document.getElementById("account-dropdown").value;
        const subject = "Your Account Report";
        const message = "Please find the attached report for your account.";
        if (typeof sendEmail !== "undefined") {
            sendEmail(accountEmail, subject, message);
        } else {
            console.error("sendEmail function not found.");
        }
    }

    // Attach event listeners to buttons
    document.querySelector(".export-btn.pdf").addEventListener("click", exportToPDF);
    document.querySelector(".export-btn.excel").addEventListener("click", exportToExcel);
    document.querySelector(".export-btn.share").addEventListener("click", shareReport);

    // Initialize
    updateTableWithBalances();
    monitorTableUpdates();
});
