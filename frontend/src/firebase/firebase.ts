import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

/*
For some magical reason, this does NOT work, even though this is exactly the same as
the firebaseConfig object below. Event checked using JSON.stringify(a) === JSON.stringify(b)
But it always shows incorrect api key.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
}
*/

const firebaseConfig = {
  apiKey: "AIzaSyAO7Xk4nn3a2asUKrZZsJwV3fwOf9f_Zoo",
  authDomain: "daniels-meeting-planner.firebaseapp.com",
  projectId: "daniels-meeting-planner",
  storageBucket: "daniels-meeting-planner.appspot.com",
  messagingSenderId: "134002009480",
  appId: "1:134002009480:web:633977914c80808095c63d",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export default app
