import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "",
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.projectId &&
    firebaseConfig.projectId.trim().length > 0 &&
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.trim().length > 0
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
