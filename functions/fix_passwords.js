/**
 * EMERGENCY FIX SCRIPT
 * Syncs all Firebase Auth passwords with passwords stored in Firestore staff collection.
 * 
 * HOW TO RUN:
 * 1. Download service account key from:
 *    https://console.firebase.google.com/project/honeymoonstaff-prod/settings/serviceaccounts/adminsdk
 * 2. Click "Generate new private key" → save the file as serviceAccountKey.json in this folder
 * 3. Run: node fix_passwords.js
 */

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

async function fixAllPasswords() {
  console.log("🔧 Starting emergency password sync...\n");

  const snapshot = await db.collection("staff").get();
  const staffList = snapshot.docs;

  console.log(`Found ${staffList.length} staff members.\n`);

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const docSnap of staffList) {
    const uid = docSnap.id;
    const data = docSnap.data();
    const email = data.email;
    const password = data.password;

    if (!email || !password) {
      console.log(`⚠️  SKIPPED (no email/password): ${data.full_name || uid}`);
      skipped++;
      continue;
    }

    try {
      await auth.updateUser(uid, {
        email: email,
        password: password,
        displayName: data.full_name || "",
      });
      console.log(`✅ FIXED: ${data.full_name || uid} (${email})`);
      fixed++;
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        // User doesn't exist in Auth at all - recreate them
        try {
          await auth.createUser({
            uid: uid,
            email: email,
            password: password,
            displayName: data.full_name || "",
          });
          console.log(`🆕 CREATED: ${data.full_name || uid} (${email})`);
          fixed++;
        } catch (createErr) {
          console.error(`❌ FAILED to create ${email}: ${createErr.message}`);
          errors++;
        }
      } else {
        console.error(`❌ FAILED ${email}: ${err.message}`);
        errors++;
      }
    }
  }

  console.log(`\n========== DONE ==========`);
  console.log(`✅ Fixed:   ${fixed}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log(`❌ Errors:  ${errors}`);
  console.log(`==========================\n`);

  if (fixed > 0) {
    console.log("🎉 All staff members should now be able to log in with their Firestore passwords!");
  }
}

fixAllPasswords().catch(console.error);
