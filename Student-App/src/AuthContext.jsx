import {
  useEffect,
  useState,
  useRef,
  useMemo
} from "react";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "firebase/auth";

import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import { auth, googleProvider, db } from "./firebase";
import AuthContext from "./authContextInstance";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userDocUnsub = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setRole(null);

      // Clean old listener
      if (userDocUnsub.current) {
        userDocUnsub.current();
        userDocUnsub.current = null;
      }

      setUser(currentUser);
      setError("");

      if (!currentUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || "",
            photoURL: currentUser.photoURL || "",
            role: "user",
            createdAt: serverTimestamp(),
          });
        }

        // Live listener for role changes
        userDocUnsub.current = onSnapshot(
          userRef,
          (snapshot) => {
            if (snapshot.exists()) {
              setRole(snapshot.data().role || "user");
            }
            setLoading(false);
          },
          (err) => {
            console.error("Role listener error:", err);
            setError("Unable to load your account role.");
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Account initialization error:", err);
        const code = typeof err?.code === "string" ? ` (${err.code})` : "";
        const message = err instanceof Error ? err.message : "Unknown Firebase error.";
        setError(`Unable to initialize your account${code}: ${message}`);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (userDocUnsub.current) userDocUnsub.current();
    };
  }, []);

  async function loginWithGoogle() {
    try {
      setError("");
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    setRole(null);
  }

  const normalizedRole = typeof role === "string" ? role.trim().toLowerCase() : "";

  const value = useMemo(() => ({
    user,
    role,
    isAdmin: normalizedRole === "admin",
    isUser: normalizedRole === "user",
    loading,
    error,
    loginWithGoogle,
    logout,
  }), [user, role, normalizedRole, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}