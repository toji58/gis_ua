// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcD0Jex1VBVf5Ro6NJ1WqzQpFqg6bg5Q8",
  authDomain: "generative-info-system.firebaseapp.com",
  projectId: "generative-info-system",
  storageBucket: "generative-info-system.firebasestorage.app",
  messagingSenderId: "156890790642",
  appId: "1:156890790642:web:9486ede5d79a2a9e252e6b",
  measurementId: "G-J5QCS3XZ21"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Function to sign in using email and password
const signIn = (email, password) => {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Logged in successfully
      const user = userCredential.user;
      console.log("Logged in as:", user);
      // Proceed to next step, for example, redirect to dashboard
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Login failed with error:", errorCode, errorMessage);
      alert("Error: " + errorMessage); // Show error to the user
    });
};
