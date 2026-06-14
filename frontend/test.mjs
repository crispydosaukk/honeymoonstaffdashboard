import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  authDomain: "honeymoonstaff-prod.firebaseapp.com",
  projectId: "honeymoonstaff-prod",
  storageBucket: "honeymoonstaff-prod.firebasestorage.app",
  messagingSenderId: "583520600420",
  appId: "1:583520600420:web:fb55f82473a92ffac2fa71",
  measurementId: "G-0YDJHR0RR5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const staffSnap = await getDocs(collection(db, "staff"));
  console.log("Staff Data:");
  staffSnap.forEach(doc => {
    console.log(doc.data().full_name, " -> restaurant_id:", doc.data().restaurant_id);
  });
  
  const restSnap = await getDocs(collection(db, "restaurants"));
  console.log("\nRestaurants Data:");
  restSnap.forEach(doc => {
    console.log(doc.id, " -> ", doc.data().restaurant_name);
  });
}
check();
