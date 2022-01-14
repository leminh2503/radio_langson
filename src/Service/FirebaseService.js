import firebase from "firebase";
import "firebase/messaging";

import apiNotify      from "../Api/Notify/Notify";
import {store}        from "../Redux/Store";
import {notifyChange} from "../Redux/Actions/notifyAction";

/**
 *
 */

export async function clearFirebaseApp() {
    if (firebase.apps.length === 0) return;
    await firebase.app().delete();
}

export async function FirebaseService() {
    let messaging = null;

    if (firebase.apps.length !== 0) {
        return;
    }

    firebase.initializeApp({
        apiKey: "AIzaSyB9FoqyTFj8NpAA0JHMd1ItP7J6fUV56yA",
        authDomain: "tinasoft-dev-notify.firebaseapp.com",
        projectId: "tinasoft-dev-notify",
        storageBucket: "tinasoft-dev-notify.appspot.com",
        messagingSenderId: "578204636115",
        appId: "1:578204636115:web:f79a2f2272c7eba3cf9526",
        measurementId: "G-4M3KYTVX4X"
    });

    const countUnreadNotify = () => {
        apiNotify.countUnread((err, res) => {
            if (res) {
                store.dispatch(notifyChange(res.count));
            }
        });
    };

    if (firebase.messaging.isSupported()) {
        try {
            await Notification.requestPermission();
        } catch (e) {
            console.log("Error when request permission notification: ", +e);
        }

        messaging = firebase.messaging();
        messaging.usePublicVapidKey("BA1c46gqznq44fQKgGgXBOGk0i3q7mbtpVLARjA3yExP8brirIatqdN_9Nl_oCnHLea0npSRBn5T6FPW79sOlko");
        try {
            await messaging.requestPermission();
        } catch (e) {
            console.log("Error when request permission firebase: " + e);
        }

        try {
            const token = await messaging.getToken();
            localStorage.setItem('fcmToken', token);
            apiNotify.setTokenFirebase({token_web: token}, (err) => {
                if (err) {
                    console.log('Error set token firebase');
                } else {
                    countUnreadNotify();
                }
            });
        } catch (e) {
            console.log('Error when get token firebase: ' + e);
        }
        messaging.onMessage((payload) => {
            if (payload.notification) {
                new Notification(payload.notification.title, {body: payload.notification.body});
                countUnreadNotify();
            }
        });
    }
}
