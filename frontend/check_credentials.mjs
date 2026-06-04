import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBI6yf2ci31kM7j92OgZgSGQUhEvVdLNWg",
  authDomain: "honeymoonstaff-prod.firebaseapp.com",
  projectId: "honeymoonstaff-prod",
  storageBucket: "honeymoonstaff-prod.firebasestorage.app",
  messagingSenderId: "583520600420",
  appId: "1:583520600420:web:fb55f82473a92ffac2fa71",
  measurementId: "G-0YDJHR0RR5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const email = "balacuppy@yahoo.in";
const password = "BALAMURGAN@Hounslow";

console.log("Attempting sign-in for:", email);

signInWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
    const user = userCredential.user;
    console.log("Firebase Auth SUCCESS! UID:", user.uid);
    
    // Fetch from staff collection
    try {
      const staffDoc = await getDoc(doc(db, "staff", user.uid));
      if (staffDoc.exists()) {
        console.log("Firestore Staff document found:", JSON.stringify(staffDoc.data(), null, 2));
      } else {
        console.log("Firestore Staff document NOT found in 'staff' collection.");
      }
    } catch (e) {
      console.error("Error fetching staff doc:", e.message);
    }
    
    // Fetch from users collection
    try {
      const usersDoc = await getDoc(doc(db, "users", user.uid));
      if (usersDoc.exists()) {
        console.log("Firestore Users document found:", JSON.stringify(usersDoc.data(), null, 2));
      } else {
        console.log("Firestore Users document NOT found in 'users' collection.");
      }
    } catch (e) {
      console.error("Error fetching users doc:", e.message);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("Firebase Auth FAILED!");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    process.exit(0);
  });
