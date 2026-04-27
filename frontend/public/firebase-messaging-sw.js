importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDEpTuase_1GWTBIKYXGmGz95Vm0jBaXlI",
  authDomain: "central-franchise.firebaseapp.com",
  projectId: "central-franchise",
  messagingSenderId: "922281015362",
  appId: "1:922281015362:web:3056877a460a43531415db",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});