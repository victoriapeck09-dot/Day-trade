import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, deleteDoc, updateDoc, query, where } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export const registerUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export const logoutUser = async () => {
  await signOut(auth)
}

export const saveToWatchlist = async (userId, symbol) => {
  const watchlistRef = collection(db, 'watchlists')
  await addDoc(watchlistRef, { userId, symbol, addedAt: new Date() })
}

export const removeFromWatchlist = async (userId, symbol) => {
  const q = query(collection(db, 'watchlists'), where('userId', '==', userId), where('symbol', '==', symbol))
  const snapshot = await getDocs(q)
  snapshot.forEach(async (doc) => await deleteDoc(doc.ref))
}

export const getWatchlist = async (userId) => {
  const q = query(collection(db, 'watchlists'), where('userId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => doc.data().symbol)
}

export const saveToPortfolio = async (userId, symbol, shares, buyPrice, buyDate) => {
  const portfolioRef = collection(db, 'portfolio')
  await addDoc(portfolioRef, { userId, symbol, shares, buyPrice, buyDate, createdAt: new Date() })
}

export const getPortfolio = async (userId) => {
  const q = query(collection(db, 'portfolio'), where('userId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const updatePortfolio = async (docId, shares, sellPrice, sellDate) => {
  const docRef = doc(db, 'portfolio', docId)
  await updateDoc(docRef, { shares, sellPrice, sellDate, updatedAt: new Date() })
}

export const deleteFromPortfolio = async (docId) => {
  const docRef = doc(db, 'portfolio', docId)
  await deleteDoc(docRef)
}

export default app