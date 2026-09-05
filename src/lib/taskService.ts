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
import { StudentTask } from "../types";

const getTasksCollection = (userId: string) =>
  collection(db, "users", userId, "tasks");

const getTaskDoc = (userId: string, taskId: string) =>
  doc(db, "users", userId, "tasks", taskId);

export async function createStudentTask(
  userId: string,
  taskData: Omit<StudentTask, "id" | "createdAt">
): Promise<string> {
  const path = `users/${userId}/tasks`;
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(getTasksCollection(userId), {
      userId,
      title: taskData.title.trim(),
      category: taskData.category || "Study Goals",
      dueDate: taskData.dueDate || "Today",
      completed: Boolean(taskData.completed),
      priority: taskData.priority || "medium",
      aiSuggested: Boolean(taskData.aiSuggested),
      createdAt: now,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleStudentTask(
  userId: string,
  taskId: string,
  completed: boolean
): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    await updateDoc(getTaskDoc(userId, taskId), {
      completed,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteStudentTask(
  userId: string,
  taskId: string
): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    await deleteDoc(getTaskDoc(userId, taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchUserTasks(userId: string): Promise<StudentTask[]> {
  const path = `users/${userId}/tasks`;
  try {
    const q = query(getTasksCollection(userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<StudentTask, "id">),
    }));
  } catch {
    try {
      const snapshot = await getDocs(getTasksCollection(userId));
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<StudentTask, "id">),
      }));
      return list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    } catch (fallbackError) {
      handleFirestoreError(fallbackError, OperationType.LIST, path);
    }
  }
}

export function subscribeUserTasks(
  userId: string,
  onUpdate: (tasks: StudentTask[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const path = `users/${userId}/tasks`;
  try {
    const q = query(getTasksCollection(userId), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const tasks = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<StudentTask, "id">),
        }));
        onUpdate(tasks);
      },
      () => {
        const basicCollection = getTasksCollection(userId);
        return onSnapshot(
          basicCollection,
          (basicSnap) => {
            const tasks = basicSnap.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<StudentTask, "id">),
            }));
            tasks.sort(
              (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime()
            );
            onUpdate(tasks);
          },
          (err) => onError(err)
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
