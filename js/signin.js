document.getElementById('signInForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    // Sign In with Firebase
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            // Redirect to dashboard on successful sign-in
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
});
