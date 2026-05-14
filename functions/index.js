const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.updateUserCredentials = functions.https.onCall(async (data, context) => {
  // 1. Verify that the request came from an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Only authenticated users can call this function."
    );
  }

  const { uid, email, password } = data;

  if (!uid) {
    throw new functions.https.HttpsError("invalid-argument", "The 'uid' must be provided.");
  }

  try {
    const updatePayload = {};
    if (email) updatePayload.email = email;
    if (password) updatePayload.password = password;

    // Use the Firebase Admin SDK to forcefully update the user without needing the old password
    const userRecord = await admin.auth().updateUser(uid, updatePayload);

    return { success: true, message: "Successfully updated user credentials." };
  } catch (error) {
    console.error("Error updating user:", error);
    // Pass the actual Firebase error message to the frontend
    throw new functions.https.HttpsError("invalid-argument", error.message);
  }
});
