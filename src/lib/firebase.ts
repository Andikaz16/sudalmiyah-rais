import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyC9fp4Mjpd6rHOQmOEPT-hLrKvPttjms7I",
  authDomain: "masjid-ums.firebaseapp.com",
  projectId: "masjid-ums",
  storageBucket: "masjid-ums.firebasestorage.app",
  messagingSenderId: "938250854409",
  appId: "1:938250854409:web:e6973e16da81ef7bf5d8d8",
};

const firebaseConfig = {
  apiKey: (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.FIREBASE_API_KEY ||
    DEFAULT_FIREBASE_CONFIG.apiKey
  ).trim(),
  authDomain: (
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    process.env.FIREBASE_AUTH_DOMAIN ||
    DEFAULT_FIREBASE_CONFIG.authDomain
  ).trim(),
  projectId: (
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    DEFAULT_FIREBASE_CONFIG.projectId
  ).trim(),
  storageBucket: (
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.FIREBASE_STORAGE_BUCKET ||
    DEFAULT_FIREBASE_CONFIG.storageBucket
  ).trim(),
  messagingSenderId: (
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.FIREBASE_MESSAGING_SENDER_ID ||
    DEFAULT_FIREBASE_CONFIG.messagingSenderId
  ).trim(),
  appId: (
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    process.env.FIREBASE_APP_ID ||
    DEFAULT_FIREBASE_CONFIG.appId
  ).trim(),
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.projectId &&
    firebaseConfig.projectId.length > 0 &&
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.length > 0
  );
}

export function getFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

export function getFirestoreDb() {
  if (!isFirebaseConfigured()) return null;
  try {
    const app = getFirebaseApp();
    return getFirestore(app);
  } catch (err) {
    console.error("Firebase Firestore initialization error:", err);
    return null;
  }
}

/**
 * Uploads media file to Firebase Firestore media_store collection.
 * Returns public URL /api/media/<id>.
 */
export async function uploadMediaToFirebase(
  filename: string,
  buffer: Buffer,
  contentType: string,
  folder: string = "general"
): Promise<string> {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error("Firebase Firestore is not configured.");
  }

  const id = `med-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, "media_store", id);

  await setDoc(docRef, {
    id,
    filename,
    folder,
    contentType,
    base64: buffer.toString("base64"),
    size: buffer.length,
    createdAt: new Date().toISOString(),
  });

  return `/api/media/${id}`;
}

/**
 * Retrieves media file from Firebase Firestore media_store collection.
 */
export async function getMediaFromFirebase(
  id: string
): Promise<{ data: Buffer; contentType: string; filename: string } | null> {
  const db = getFirestoreDb();
  if (!db) return null;

  try {
    const docRef = doc(db, "media_store", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    if (!data || !data.base64) return null;

    return {
      data: Buffer.from(data.base64, "base64"),
      contentType: data.contentType || "image/jpeg",
      filename: data.filename || "file",
    };
  } catch (err) {
    console.error("Error retrieving media from Firebase:", err);
    return null;
  }
}

/**
 * Deletes media file from Firebase Firestore media_store collection.
 */
export async function deleteMediaFromFirebase(idOrUrl: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;

  try {
    const id = idOrUrl.startsWith("/api/media/")
      ? idOrUrl.replace("/api/media/", "").trim()
      : idOrUrl.trim();
    if (!id) return;
    const docRef = doc(db, "media_store", id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Notice: Failed to delete media doc from Firebase:", err);
  }
}
