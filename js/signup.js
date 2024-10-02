document.getElementById('signUpForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    // Sign Up with Firebase
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;

            // Store additional user data in Firebase Realtime Database
            database.ref('users/' + user.uid).set({
                name: name,
                email: email
            });

            alert('Registration successful, please sign in.');
            window.location.href = 'signin.html';
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
});
