const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

async function checkUser() {
  // 1. Find the Firestore doc for this email
  const snapshot = await db.collection("staff").where("email", "==", "balacuppy@yahoo.in").get();
  
  if (snapshot.empty) {
    console.log("❌ No staff document found for balacuppy@yahoo.in");
  } else {
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log("📄 Firestore Document ID (UID):", doc.id);
      console.log("📄 Full Name:", data.full_name);
      console.log("📄 Email:", data.email);
      console.log("📄 Password stored:", JSON.stringify(data.password));
      console.log("📄 is_active:", data.is_active);
      console.log("📄 restaurant_id:", data.restaurant_id);
    });
  }

  // 2. Check Firebase Auth for this email
  try {
    const userRecord = await auth.getUserByEmail("balacuppy@yahoo.in");
    console.log("\n🔐 Firebase Auth Record:");
    console.log("   UID:", userRecord.uid);
    console.log("   Email:", userRecord.email);
    console.log("   Disabled:", userRecord.disabled);
  } catch (err) {
    console.log("\n❌ Firebase Auth:", err.message);
  }

  // 3. Try to verify the password by testing sign-in
  console.log("\n--- Password test ---");
  // We can't directly test passwords with Admin SDK, but we can reset it
  
  process.exit(0);
}

checkUser().catch(console.error);
