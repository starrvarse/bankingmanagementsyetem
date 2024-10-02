document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("emailForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        const toEmail = document.getElementById("toEmail").value;
        const subject = document.getElementById("subject").value;
        const message = document.getElementById("message").value;

        const apiKey = "1333A7D9D23A654762A151C5D7A9952B9B3243A70A44B51C722112B54FA028EB966E1DD7E5C5D6014D42860B9697AB92";  // Replace with your Elastic Email API key

        const emailData = {
            apikey: apiKey,
            from: "statement@nbisolutions.xyz",  // Your sender email
            to: toEmail,
            subject: subject,
            bodyText: message,
        };

        try {
            const response = await fetch("https://api.elasticemail.com/v2/email/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams(emailData)
            });

            const result = await response.json();
            console.log(result);

            if (result.success) {
                alert("Email sent successfully!");
            } else {
                alert("Failed to send email. Error: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error sending email: " + error.message);
        }
    });
});
