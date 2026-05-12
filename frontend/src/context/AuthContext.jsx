import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, query, collection, where, limit, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [perms, setPerms] = useState([]);


  useEffect(() => {
    // Set persistence to local
    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          let data = null;
          let perms = [];

          // Fetch from both collections in parallel to save time
          const [userDoc, staffDoc] = await Promise.all([
            getDoc(doc(db, 'users', firebaseUser.uid)),
            getDoc(doc(db, 'staff', firebaseUser.uid))
          ]);

          if (userDoc.exists()) {
            data = userDoc.data();
          } else if (staffDoc.exists()) {
            data = staffDoc.data();
          }

          // 🚀 AUTOMATIC DATABASE REPAIR
          if (data && !data.restaurant_id && data.role_title !== "Super Admin" && firebaseUser.uid) {
            try {
              const staffQ = query(collection(db, "staff"), where("created_by", "==", firebaseUser.uid), limit(1));
              const staffSnap = await getDocs(staffQ);
              if (!staffSnap.empty) {
                const foundId = staffSnap.docs[0].data().restaurant_id;
                if (foundId) {
                  await updateDoc(doc(db, "users", firebaseUser.uid), { restaurant_id: foundId });
                  data.restaurant_id = foundId;
                  console.log(`[REPAIR] Auto-assigned restaurant: ${foundId}`);
                }
              }
            } catch (e) { console.error("Repair failed:", e); }
          }

          // Handle data and fetch roles if needed
          if (data) {
            if (data.role_id) {
              const roleDoc = await getDoc(doc(db, 'roles', String(data.role_id)));
              if (roleDoc.exists()) {
                const roleData = roleDoc.data();
                perms = roleData.permission_ids || roleData.permissions || [];
              }
            }
          } else {
            // User not found in Firestore - NO ACCESS
            data = { role_title: 'Unassigned', role_id: 0 };
            perms = [];
          }

          // 5. Finalize state and localStorage
          localStorage.setItem('user', JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...data
          }));
          localStorage.setItem('perms', JSON.stringify(perms));

          setPerms(perms);
          setUserData(data);

        } catch (err) {
          console.error("Firestore fetch error:", err);
          setUserData(null);
          setPerms([]);
          localStorage.removeItem('user');
          localStorage.removeItem('perms');
        }
      } else {
        setUser(null);
        setUserData(null);
        setPerms([]);
        localStorage.removeItem('user');
        localStorage.removeItem('perms');
        localStorage.removeItem('token');
      }
      setLoading(false);
    });


    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userData, perms, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
