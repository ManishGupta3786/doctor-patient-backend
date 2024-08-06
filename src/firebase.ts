import * as admin from "firebase-admin";
import serviceAccount from "../config/doctor-appointment-app-6e0e1-firebase-adminsdk-kezk7-a616e478aa.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const firestore = admin.firestore();
export { firestore };
