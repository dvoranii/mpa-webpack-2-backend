import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const db = admin.firestore();

const saveContact = async (contact) => {
  try {
    const { name, email, message } = contact;
    const docRef = await db.collection("contacts").add({
      name,
      email,
      message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: docRef.id, message: "Contact saved successfully" };
  } catch (error) {
    console.error("Error adding contact:", error);
    throw new Error("Internal Server Error");
  }
};

export { saveContact, db };
