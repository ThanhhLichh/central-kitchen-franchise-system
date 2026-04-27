import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDEpTuase_1GWTBIKYXGmGz95Vm0jBaXlI",
  authDomain: "central-franchise.firebaseapp.com",
  projectId: "central-franchise",
  storageBucket: "central-franchise.firebasestorage.app",
  messagingSenderId: "922281015362",
  appId: "1:922281015362:web:3056877a460a43531415db",
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);