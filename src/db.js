const admin = require("firebase-admin");
const serviceAccount = require("./depen/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const firestore = admin.firestore();

// config.firebaseConfig

module.exports = {
    auth,
    firestore
};
