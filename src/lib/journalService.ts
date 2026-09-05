import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { JournalEntry } from "../types";

const getEntriesCollection = (userId: string) =>
  collection(db, "users", userId, "entries");

const getEntryDoc = (userId: string, entryId: string) =>
  doc(db, "users", userId, "entries", entryId);

export async function createJournalEntry(
  userId: string,
  entryData: {
    title: string;
    content: string;
    mood: JournalEntry["mood"];
    tags: string[];
    aiReflection?: string;
    aiKeyTakeaway?: string;
    aiSummary?: string;
    aiStudySuggestion?: string;
  }
): Promise<string> {
  const path = `users/${userId}/entries`;
  try {
    const wordCount = entryData.content.trim().split(/\s+/).filter(Boolean).length;
    const now = new Date().toISOString();

    const docRef = await addDoc(getEntriesCollection(userId), {
      userId,
      title: entryData.title.trim() || "Untitled Entry",
      content: entryData.content,
      mood: entryData.mood,
      tags: entryData.tags,
      createdAt: now,
      updatedAt: now,
      wordCount,
      aiReflection: entryData.aiReflection || null,
      aiKeyTakeaway: entryData.aiKeyTakeaway || null,
      aiSummary: entryData.aiSummary || null,
      aiStudySuggestion: entryData.aiStudySuggestion || null,
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateJournalEntry(
  userId: string,
  entryId: string,
  updates: Partial<Omit<JournalEntry, "id" | "userId">>
): Promise<void> {
  const path = `users/${userId}/entries/${entryId}`;
  try {
    const dataToUpdate: Record<string, any> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (typeof updates.content === "string") {
      dataToUpdate.wordCount = updates.content.trim().split(/\s+/).filter(Boolean).length;
    }

    await updateDoc(getEntryDoc(userId, entryId), dataToUpdate);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  const path = `users/${userId}/entries/${entryId}`;
  try {
    await deleteDoc(getEntryDoc(userId, entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchUserEntries(userId: string): Promise<JournalEntry[]> {
  const path = `users/${userId}/entries`;
  try {
    const q = query(getEntriesCollection(userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<JournalEntry, "id">),
    }));
  } catch {
    try {
      // Fallback without orderBy if indexing is propagating
      const snapshot = await getDocs(getEntriesCollection(userId));
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<JournalEntry, "id">),
      }));
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (fallbackError) {
      handleFirestoreError(fallbackError, OperationType.LIST, path);
    }
  }
}

export function subscribeUserEntries(
  userId: string,
  onUpdate: (entries: JournalEntry[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const path = `users/${userId}/entries`;
  try {
    const q = query(getEntriesCollection(userId), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const entries = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<JournalEntry, "id">),
        }));
        onUpdate(entries);
      },
      () => {
        // Fallback to basic query if ordering fails
        const basicCollection = getEntriesCollection(userId);
        return onSnapshot(
          basicCollection,
          (basicSnap) => {
            const entries = basicSnap.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<JournalEntry, "id">),
            }));
            entries.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            onUpdate(entries);
          },
          (error) => {
            onError(error);
          }
        );
      }
    );
  } catch (err: any) {
    try {
      handleFirestoreError(err, OperationType.LIST, path);
    } catch (e: any) {
      onError(e);
    }
    return () => {};
  }
}

