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

const saveContactForm = async (contact) => {
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

const saveSubscriptionForm = async (subscription) => {
  try {
    const { name, email } = subscription;
    const docRef = await db.collection("subscriptions").add({
      name,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: docRef.id, message: "Subscription saved successfully" };
  } catch (error) {
    console.error("Error adding subscription:", error);
    throw new Error("Internal Server Error");
  }
};

const saveQuoteForm = async (quote) => {
  try {
    const docRef = await db.collection("quotes").add({
      ...quote,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: docRef.id, message: "Quote form saved successfully" };
  } catch (error) {
    console.error("Error adding quote:", error);
    throw new Error("Internal Server Error");
  }
};

export { saveContactForm, saveSubscriptionForm, saveQuoteForm };
