// For Firebase JS SDK v7.20.0 and later, measurementId is optional 
const firebaseConfig = {
    apiKey: "AIzaSyAyX9Oad7N8AxizdtK7MvMFkK0HIiE1oXQ",
    authDomain: "bankingapp-52159.firebaseapp.com",
    projectId: "bankingapp-52159",
    storageBucket: "bankingapp-52159.appspot.com",
    messagingSenderId: "807339322620",
    appId: "1:807339322620:web:a9405840bac480f6fb3b79",
    measurementId: "G-HY69V9T1MM"
  };
  
 // Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = firebase.database();

// Initialize Authentication
const auth = firebase.auth();