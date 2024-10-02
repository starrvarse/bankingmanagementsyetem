document.getElementById('showSignup').addEventListener('click', function() {
    document.getElementById('signin-form').classList.remove('active-form');
    document.getElementById('signup-form').classList.add('active-form');
});

document.getElementById('showSignin').addEventListener('click', function() {
    document.getElementById('signup-form').classList.remove('active-form');
    document.getElementById('signin-form').classList.add('active-form');
});

document.getElementById('signInForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    // Mock check - In real application you would verify with backend
    if(email === 'test@example.com' && password === 'password') {
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid credentials!');
    }
});

document.getElementById('signUpForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    // Mock registration - In real application you would send data to backend
    console.log('User registered:', {name, email, password});
    alert('Registration successful, please sign in.');
    document.getElementById('showSignin').click();
});
