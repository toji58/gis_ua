// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcD0Jex1VBVf5Ro6NJ1WqzQpFqg6bg5Q8",
  authDomain: "generative-info-system.firebaseapp.com",
  projectId: "generative-info-system",
  storageBucket: "generative-info-system.appspot.com",  // Corrected storageBucket URL
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
  if (!email || !password) {
    alert("Please provide both email and password.");
    return;
  }
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Logged in successfully
      const user = userCredential.user;
      console.log("Logged in as:", user);
      // Redirect to dashboard after successful login
      window.location.href = "/dashboard";  // Change this to your desired path
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Login failed with error:", errorCode, errorMessage);
      alert("Error: " + errorMessage); // Show error to the user
    });
};

// Listen to authentication state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in:", user);
    // You can redirect to the dashboard or home page here
  } else {
    console.log("User is signed out");
  }
});
