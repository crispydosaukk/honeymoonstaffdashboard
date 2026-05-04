import { 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch, 
  doc, 
  Timestamp, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { sendPushNotification } from "./fcm";

/**
 * Ported logic from Firebase Functions: cleanupOldAttendance
 * This runs on the frontend when an Admin is active.
 */
export const performAttendanceCleanup = async () => {
  console.log("[Cleanup] Starting attendance cleanup...");
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  
  const attendanceRef = collection(db, "attendance");
  const q = query(
    attendanceRef, 
    where("clock_out", "==", null)
  );
 
  try {
    const snapshot = await getDocs(q);
 
    if (snapshot.empty) {
      console.log("[Cleanup] No active attendance records found.");
      return;
    }
 
    // Filter by time in memory to avoid needing a composite index
    const oldRecords = snapshot.docs.filter(docSnap => {
      const data = docSnap.data();
      return data.clock_in && data.clock_in.toDate() < twentyFourHoursAgo;
    });
 
    if (oldRecords.length === 0) {
      console.log("[Cleanup] No old attendance records requiring auto clock-out.");
      return;
    }
 
    const batch = writeBatch(db);
    const notificationsRef = collection(db, "notifications");
 
    oldRecords.forEach((docSnap) => {
      const data = docSnap.data();
      const staffId = data.staff_id;
      const staffName = data.staff_name || "Unknown Staff";
      
      // 1. Auto Clock-out: Set to exactly 24 hours after they started
      const clockInDate = data.clock_in.toDate();
      const forcedClockOutDate = new Date(clockInDate.getTime() + (24 * 60 * 60 * 1000));
      
      batch.update(docSnap.ref, {
        clock_out: Timestamp.fromDate(forcedClockOutDate),
        total_minutes: 1440, // Exactly 24 hours
        auto_clocked_out: true,
        notes: "System: Auto clock-out (Forgot to logout). Recorded 24h limit reached."
      });

      // 2. Notify Staff Member
      const staffNotifRef = doc(notificationsRef);
      const staffNotifData = {
        title: "Auto Clock-Out Triggered",
        body: "Your shift was automatically closed because you forgot to clock out yesterday.",
        staff_id: staffId,
        staff_name: staffName,
        type: "alert",
        priority: "high",
        status: "pending",
        sent_at: serverTimestamp(),
        fcm_token: data.fcm_token || data.fcmToken || null
      };
      batch.set(staffNotifRef, staffNotifData);

      // Trigger push for staff
      if (staffNotifData.fcm_token) {
        sendPushNotification({
          fcm_token: staffNotifData.fcm_token,
          title: staffNotifData.title,
          body: staffNotifData.body,
          priority: "high",
          type: "alert",
          notificationId: staffNotifRef.id
        });
      }

      // 3. Notify Admin Dashboard
      const adminNotifRef = doc(notificationsRef);
      batch.set(adminNotifRef, {
        title: "Staff Attendance Alert",
        body: `FAIL: ${staffName} did not clock out on ${clockInDate.toLocaleDateString()}. System performed auto clock-out.`,
        staff_id: "admin_dashboard_alert",
        staff_name: "System Monitor",
        type: "alert",
        priority: "urgent",
        status: "pending",
        sent_at: serverTimestamp()
      });
    });

    await batch.commit();
    console.log(`[Cleanup] Successfully auto-closed ${snapshot.size} attendance records.`);
  } catch (error) {
    console.error("[Cleanup] Error during attendance cleanup:", error);
  }
};
