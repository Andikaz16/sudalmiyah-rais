import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import {
  ServiceAccount,
  initializeApp as initializeAdminApp,
  getApps as getAdminApps,
  cert,
} from "firebase-admin/app";
import {
  getFirestore as getAdminFirestore,
  Firestore as AdminFirestore,
} from "firebase-admin/firestore";

const ADMIN_APP_NAME = "sudalmiyah-admin";

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

function parseServiceAccountFromEnv(): ServiceAccount | null {
  try {
    const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
    const rawBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64?.trim();

    let jsonStr = rawJson;
    if (!jsonStr && rawBase64) {
      jsonStr = Buffer.from(rawBase64, "base64").toString("utf-8");
    }

    if (jsonStr) {
      const parsed = JSON.parse(jsonStr) as ServiceAccount & {
        private_key?: string;
        client_email?: string;
        project_id?: string;
      };
      if (parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      }
      if (parsed.client_email && parsed.private_key) {
        return parsed;
      }
    }

    const clientEmail = (
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
      process.env.FIREBASE_CLIENT_EMAIL
    )?.trim();
    const privateKey = (
      process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
      process.env.FIREBASE_PRIVATE_KEY
    )
      ?.trim()
      ?.replace(/\\n/g, "\n");

    if (clientEmail && privateKey) {
      return {
        projectId: firebaseConfig.projectId,
        clientEmail,
        privateKey,
      };
    }
  } catch (err) {
    console.error("Failed to parse Firebase Admin service account:", err);
  }
  return null;
}

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(parseServiceAccountFromEnv());
}

export function getAdminFirestoreDb(): AdminFirestore | null {
  const serviceAccount = parseServiceAccountFromEnv();
  if (!serviceAccount) return null;

  try {
    const existing = getAdminApps().find((a) => a.name === ADMIN_APP_NAME);
    const app =
      existing ||
      initializeAdminApp(
        {
          credential: cert(serviceAccount),
          projectId:
            (serviceAccount as { project_id?: string }).project_id ||
            serviceAccount.projectId ||
            firebaseConfig.projectId,
        },
        ADMIN_APP_NAME
      );
    return getAdminFirestore(app);
  } catch (err) {
    console.error("Firebase Admin Firestore initialization error:", err);
    return null;
  }
}

export function isFirebaseConfigured(): boolean {
  return (
    isFirebaseAdminConfigured() ||
    Boolean(
      firebaseConfig.projectId &&
      firebaseConfig.projectId.length > 0 &&
      firebaseConfig.apiKey &&
      firebaseConfig.apiKey.length > 0
    )
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

export async function getFirestoreDoc(
  collectionName: string,
  docId: string
): Promise<Record<string, unknown> | null> {
  const adminDb = getAdminFirestoreDb();
  if (adminDb) {
    const snap = await adminDb.collection(collectionName).doc(docId).get();
    return snap.exists ? ((snap.data() as Record<string, unknown>) || null) : null;
  }

  const clientDb = getFirestoreDb();
  if (!clientDb) return null;
  const snap = await getDoc(doc(clientDb, collectionName, docId));
  return snap.exists() ? ((snap.data() as Record<string, unknown>) || null) : null;
}

export async function setFirestoreDoc(
  collectionName: string,
  docId: string,
  data: Record<string, unknown>,
  merge = false
): Promise<void> {
  const adminDb = getAdminFirestoreDb();
  if (adminDb) {
    await adminDb.collection(collectionName).doc(docId).set(data, { merge });
    return;
  }

  const clientDb = getFirestoreDb();
  if (!clientDb) {
    throw new Error("Firebase Firestore is not configured.");
  }
  await setDoc(doc(clientDb, collectionName, docId), data, { merge });
}

export async function deleteFirestoreDoc(
  collectionName: string,
  docId: string
): Promise<void> {
  const adminDb = getAdminFirestoreDb();
  if (adminDb) {
    await adminDb.collection(collectionName).doc(docId).delete();
    return;
  }

  const clientDb = getFirestoreDb();
  if (!clientDb) return;
  await deleteDoc(doc(clientDb, collectionName, docId));
}

/**
 * Uploads media file to Firebase Firestore media_store collection.
 * Automatically chunks large files to bypass Firestore 1MiB document limits.
 * Returns public URL /api/media/<id>.
 */
export async function uploadMediaToFirebase(
  filename: string,
  buffer: Buffer,
  contentType: string,
  folder: string = "general"
): Promise<string> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase Firestore is not configured.");
  }

  const id = `med-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
  const fullBase64 = buffer.toString("base64");
  const CHUNK_SIZE = 600 * 1024; // 600KB chunks (safe under 1MiB Firestore limit)

  if (fullBase64.length <= CHUNK_SIZE) {
    await setFirestoreDoc("media_store", id, {
      id,
      filename,
      folder,
      contentType,
      base64: fullBase64,
      isChunked: false,
      size: buffer.length,
      createdAt: new Date().toISOString(),
    });
  } else {
    const totalChunks = Math.ceil(fullBase64.length / CHUNK_SIZE);
    await setFirestoreDoc("media_store", id, {
      id,
      filename,
      folder,
      contentType,
      isChunked: true,
      totalChunks,
      size: buffer.length,
      createdAt: new Date().toISOString(),
    });

    for (let i = 0; i < totalChunks; i++) {
      const chunkStr = fullBase64.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      await setFirestoreDoc("media_store", `${id}_c${i}`, { chunk: chunkStr });
    }
  }

  return `/api/media/${id}`;
}

/**
 * Retrieves media file from Firebase Firestore media_store collection.
 * Handles both single-doc and chunked media.
 */
export async function getMediaFromFirebase(
  id: string
): Promise<{ data: Buffer; contentType: string; filename: string } | null> {
  if (!isFirebaseConfigured()) return null;

  try {
    const data = await getFirestoreDoc("media_store", id);
    if (!data) return null;

    let base64 = typeof data.base64 === "string" ? data.base64 : "";
    if (data.isChunked && typeof data.totalChunks === "number") {
      const chunks: string[] = [];
      for (let i = 0; i < data.totalChunks; i++) {
        const chunkData = await getFirestoreDoc("media_store", `${id}_c${i}`);
        if (chunkData && typeof chunkData.chunk === "string") {
          chunks.push(chunkData.chunk);
        }
      }
      base64 = chunks.join("");
    }

    if (!base64) return null;

    return {
      data: Buffer.from(base64, "base64"),
      contentType: (typeof data.contentType === "string" && data.contentType) || "image/jpeg",
      filename: (typeof data.filename === "string" && data.filename) || "file",
    };
  } catch (err) {
    console.error("Error retrieving media from Firebase:", err);
    return null;
  }
}

/**
 * Deletes media file from Firebase Firestore media_store collection.
 * Also cleans up chunked documents if present.
 */
export async function deleteMediaFromFirebase(idOrUrl: string): Promise<void> {
  if (!isFirebaseConfigured()) return;

  try {
    const id = idOrUrl.startsWith("/api/media/")
      ? idOrUrl.replace("/api/media/", "").trim()
      : idOrUrl.trim();
    if (!id) return;

    const data = await getFirestoreDoc("media_store", id);
    if (data?.isChunked && typeof data.totalChunks === "number") {
      for (let i = 0; i < data.totalChunks; i++) {
        try {
          await deleteFirestoreDoc("media_store", `${id}_c${i}`);
        } catch {
          // Ignore individual chunk delete error
        }
      }
    }
    await deleteFirestoreDoc("media_store", id);
  } catch (err) {
    console.warn("Notice: Failed to delete media doc from Firebase:", err);
  }
}
