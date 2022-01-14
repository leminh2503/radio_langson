importScripts("https://www.gstatic.com/firebasejs/8.2.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.1/firebase-messaging.js");

// const utils = require("./utils");
var firebaseConfig = {
    apiKey: "AIzaSyB9FoqyTFj8NpAA0JHMd1ItP7J6fUV56yA",
    authDomain: "tinasoft-dev-notify.firebaseapp.com",
    projectId: "tinasoft-dev-notify",
    storageBucket: "tinasoft-dev-notify.appspot.com",
    messagingSenderId: "578204636115",
    appId: "1:578204636115:web:f79a2f2272c7eba3cf9526",
    measurementId: "G-4M3KYTVX4X"
};

self.addEventListener('notificationclick', function (event) {
    const url = event.notification.data.FCM_MSG.notification.click_action;
    event.waitUntil(clients.matchAll({type: 'window'})
        .then(() => clients.openWindow(url))
    );
});

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
    const promiseChain = clients
        .matchAll({
            type: "window",
            includeUncontrolled: true
        })
        .then(windowClients => {
            for (let i = 0; i < windowClients.length; i++) {
                const windowClient = windowClients[i];
                windowClient.postMessage(payload);
            }
        })
        .then(() => {
            return registration.showNotification("my notification title");
        });
    return promiseChain;
});
