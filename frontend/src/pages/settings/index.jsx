import React, { useEffect, useState, useMemo, useRef } from "react";
import Header from "../../components/common/header.jsx";
import Sidebar from "../../components/common/sidebar.jsx";
import Footer from "../../components/common/footer.jsx";
import { db } from "../../lib/firebase";
import { collection, doc, getDoc, updateDoc, onSnapshot, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, Save, Loader2, MapPin, Navigation, HelpCircle, ChevronDown, Store, Clock } from "lucide-react";
import { usePopup } from "../../context/PopupContext";
import { useAuth } from "../../context/AuthContext.jsx";
import { isSuperAdmin } from "../../utils/perm";
import { Mail, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export default function Settings() {
  const { showPopup } = usePopup();
  const { userData, perms } = useAuth();

  const isSuper = useMemo(() => {
    return isSuperAdmin(userData, perms);
  }, [userData, perms]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [radius, setRadius] = useState("50");
  const [autoLogoutHours, setAutoLogoutHours] = useState("15");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Persist the Apply to All toggle in localStorage so it doesn't reset on refresh
  const [applyToAll, setApplyToAll] = useState(() => {
    return localStorage.getItem("settings_apply_to_all") === "true";
  });

  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [showRestaurantMenu, setShowRestaurantMenu] = useState(false);
  const restaurantMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (restaurantMenuRef.current && !restaurantMenuRef.current.contains(event.target)) {
        setShowRestaurantMenu(false);
      }
    }
    if (showRestaurantMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showRestaurantMenu]);

  // Toggle handler that persists state
  const handleToggleApplyToAll = (checked) => {
    setApplyToAll(checked);
    localStorage.setItem("settings_apply_to_all", checked ? "true" : "false");
  };

  const [reportEmails, setReportEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");

  // Load global settings
  useEffect(() => {
    if (isSuper) {
      const unsub = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
        if (docSnap.exists() && docSnap.data().reportEmails) {
          setReportEmails(docSnap.data().reportEmails);
        } else {
          // Initialize with default if empty
          setReportEmails([
            { email: "rahulbadugu22@gmail.com", active: true },
            { email: "digitalbotsolutions@gmail.com", active: true }
          ]);
        }
      });
      return () => unsub();
    }
  }, [isSuper]);

  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      showPopup({ title: "Invalid Email", message: "Please enter a valid email address.", type: "warning" });
      return;
    }
    const updated = [...reportEmails, { email: newEmail.trim(), active: true }];
    await setDoc(doc(db, "settings", "global"), { reportEmails: updated }, { merge: true });
    setNewEmail("");
    showPopup({ title: "Email Added", message: "Recipient added successfully.", type: "success" });
  };

  const handleToggleEmail = async (index) => {
    const updated = [...reportEmails];
    updated[index].active = !updated[index].active;
    await setDoc(doc(db, "settings", "global"), { reportEmails: updated }, { merge: true });
  };

  const handleRemoveEmail = async (index) => {
    const updated = reportEmails.filter((_, i) => i !== index);
    await setDoc(doc(db, "settings", "global"), { reportEmails: updated }, { merge: true });
  };

  // Load list of all restaurants if Super Admin
  useEffect(() => {
    if (isSuper) {
      setLoading(true);
      const unsubRestaurants = onSnapshot(collection(db, "restaurants"), (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRestaurants(list);

        // Auto-select the first restaurant on load if none selected
        if (list.length > 0 && !selectedRestaurant) {
          setSelectedRestaurant(list[0].id);
        }
        setLoading(false);
      }, (err) => {
        console.error("Error loading restaurants:", err);
        setLoading(false);
      });
      return () => unsubRestaurants();
    } else {
      const rId = userData?.restaurant_id || userData?.uid || "";
      setSelectedRestaurant(rId);
      if (!rId) {
        setLoading(false);
      }
    }
  }, [isSuper, userData]);

  // Load the settings for the currently selected restaurant (always fetch so input fields are populated)
  useEffect(() => {
    if (!selectedRestaurant) return;

    const fetchSettings = async () => {
      try {
        setLoading(true);
        const restDoc = await getDoc(doc(db, "restaurants", selectedRestaurant));
        if (restDoc.exists()) {
          const data = restDoc.data();
          setRadius(data.geofence_radius !== undefined ? data.geofence_radius.toString() : "50");
          setAutoLogoutHours(data.auto_logout_hours !== undefined ? data.auto_logout_hours.toString() : "15");
        } else {
          setRadius("50");
          setAutoLogoutHours("15");
        }
      } catch (err) {
        console.error("Error fetching restaurant settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [selectedRestaurant]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const numericRadius = parseFloat(radius);
      if (isNaN(numericRadius) || numericRadius < 10) {
        showPopup({
          title: "Invalid Radius",
          message: "Please enter a valid radius of at least 10 meters.",
          type: "warning"
        });
        setSaving(false);
        return;
      }

      const numericHours = parseFloat(autoLogoutHours);
      if (isNaN(numericHours) || numericHours <= 0 || numericHours > 48) {
        showPopup({
          title: "Invalid Hours",
          message: "Please enter a valid auto logout threshold between 1 and 48 hours.",
          type: "warning"
        });
        setSaving(false);
        return;
      }

      if (applyToAll && isSuper) {
        const promises = restaurants.map(r =>
          updateDoc(doc(db, "restaurants", r.id), {
            geofence_radius: numericRadius,
            auto_logout_hours: numericHours,
            updated_at: new Date()
          })
        );
        await Promise.all(promises);
        showPopup({
          title: "Settings Saved",
          message: `Settings successfully applied to all ${restaurants.length} restaurants.`,
          type: "success"
        });
      } else {
        if (!selectedRestaurant) {
          showPopup({
            title: "No Restaurant",
            message: "Please select a restaurant to edit settings.",
            type: "warning"
          });
          setSaving(false);
          return;
        }

        await updateDoc(doc(db, "restaurants", selectedRestaurant), {
          geofence_radius: numericRadius,
          auto_logout_hours: numericHours,
          updated_at: new Date()
        });

        const restName = restaurants.find(r => r.id === selectedRestaurant)?.restaurant_name || "Restaurant";
        showPopup({
          title: "Settings Saved",
          message: `Geofence radius and auto logout threshold for "${restName}" updated successfully.`,
          type: "success"
        });
      }
    } catch (err) {
      console.error("Save settings error:", err);
      showPopup({
        title: "Save Failed",
        message: "Unable to update restaurant settings in database.",
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedRestData = useMemo(() => {
    if (isSuper && !applyToAll) {
      return restaurants.find(r => r.id === selectedRestaurant);
    }
    return null;
  }, [isSuper, restaurants, selectedRestaurant, applyToAll]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071428] via-[#0d1f45] to-[#071428] selection:bg-[#D0B079]/30 font-sans">
      <Header onToggleSidebar={() => setSidebarOpen((s) => !s)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`flex-1 flex flex-col pt-20 lg:pt-24 transition-all duration-300 ease-in-out ${sidebarOpen ? "lg:pl-72" : "lg:pl-0"}`}>
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#0b1a3d]/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/[0.08]">
                    <SettingsIcon className="text-yellow-400" size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
                    <p className="text-white/60 mt-1 text-sm font-medium tracking-wide">Configure dynamic rules and ranges per restaurant location</p>
                  </div>
                </div>

                {/* Global Apply Toggle for Super Admin */}
                {isSuper && (
                  <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] px-4 py-2.5 rounded-2xl backdrop-blur-md self-start sm:self-auto">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/70">Apply to All</span>
                    <button
                      type="button"
                      onClick={() => handleToggleApplyToAll(!applyToAll)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        applyToAll ? "bg-[#D0B079]" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-slate-900 transition-transform ${
                          applyToAll ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>

              {/* RESTAURANT SELECTOR (When not Applying to All) */}
              {isSuper && !applyToAll && (
                <div
                  ref={restaurantMenuRef}
                  className="relative z-40 mb-8 bg-[#0b1a3d]/60 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/[0.08] shadow-xl"
                >
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#D0B079] mb-3">
                    Target Restaurant Location
                  </label>
                  <div className="relative z-50">
                    <button
                      type="button"
                      onClick={() => setShowRestaurantMenu(!showRestaurantMenu)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all text-sm tracking-wide group"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Store size={18} className="text-[#D0B079] shrink-0" />
                        <span className="truncate">
                          {restaurants.find(r => r.id === selectedRestaurant)?.restaurant_name || "Select a restaurant"}
                        </span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-white/40 group-hover:text-white transition-transform duration-300 ${
                          showRestaurantMenu ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {showRestaurantMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-[#0a1835] border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden divide-y divide-white/5 max-h-60 overflow-y-auto backdrop-blur-2xl"
                        >
                          {restaurants.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => {
                                setSelectedRestaurant(r.id);
                                setShowRestaurantMenu(false);
                              }}
                              className={`w-full px-5 py-3.5 text-left text-sm font-semibold flex items-center justify-between hover:bg-white/5 transition-colors ${
                                selectedRestaurant === r.id ? "text-[#D0B079] bg-[#D0B079]/5" : "text-white/70"
                              }`}
                            >
                              <span>{r.restaurant_name}</span>
                              {selectedRestaurant === r.id && (
                                <span className="w-2 h-2 rounded-full bg-[#D0B079] shadow-[0_0_8px_#D0B079]" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Informational Banner when Apply to All is active */}
              {applyToAll && isSuper && (
                <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-200 text-sm">
                  <HelpCircle size={20} className="shrink-0 text-amber-400" />
                  <div>
                    <span className="font-bold">Global Mode Enabled:</span>
                    <p className="text-xs text-white/50 mt-1">Turn this on to update the geofence radius and auto logout hours for all active locations simultaneously</p>
                  </div>
                </div>
              )}

              {/* Report Recipients Section */}
              {isSuper && (
                <div className="relative z-10 bg-[#0b1a3d]/60 backdrop-blur-xl rounded-2xl p-6 sm:p-10 shadow-2xl border border-white/[0.08] mb-8">
                  <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4 mb-6">
                    <Mail className="text-[#D0B079]" size={22} />
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Daily Report Recipients</h3>
                      <p className="text-white/60 mt-1 text-sm">Manage who receives automated attendance and shift summary reports</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddEmail} className="flex gap-3 mb-6">
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                      <input
                        type="email"
                        placeholder="Add new email address..."
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#D0B079]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-3 bg-[#D0B079] hover:bg-[#b8965f] text-slate-900 font-bold rounded-xl text-sm flex items-center gap-2 transition-all"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </form>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {reportEmails.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${item.active ? 'bg-emerald-400' : 'bg-white/20'}`} />
                          <span className={`text-sm font-medium ${item.active ? 'text-white' : 'text-white/40 line-through'}`}>{item.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleEmail(idx)}
                            className="p-1.5 text-white/40 hover:text-white transition-colors"
                            title={item.active ? "Disable Recipient" : "Enable Recipient"}
                          >
                            {item.active ? <ToggleRight size={22} className="text-emerald-400" /> : <ToggleLeft size={22} className="text-white/30" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveEmail(idx)}
                            className="p-1.5 text-rose-400/60 hover:text-rose-400 transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {reportEmails.length === 0 && (
                      <p className="text-center text-sm text-white/30 py-4">No report recipients configured.</p>
                    )}
                  </div>
                </div>
              )}

              {/* MAIN FORM */}
              <div className="relative z-0 bg-[#0b1a3d]/60 backdrop-blur-xl rounded-2xl p-6 sm:p-10 shadow-2xl border border-white/[0.08]">
                {loading ? (
                  <div className="text-center py-20 text-white flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-[#D0B079]" size={36} />
                    <span className="text-sm font-bold tracking-wide animate-pulse">Loading configurations...</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
                      <Navigation className="text-[#D0B079]" size={22} />
                      <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">Geofencing & Timing Rules</h3>
                        <p className="text-white/60 mt-1 text-sm">
                          Set the Clock In/Out parameters for{" "}
                          <span className="text-[#D0B079] font-bold">
                            {applyToAll
                              ? "All Restaurant Locations"
                              : isSuper
                                ? selectedRestData?.restaurant_name || "the selected store"
                                : userData?.restaurant_name || "your store"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {selectedRestData && (
                      <div className="bg-white/[0.01] border border-white/[0.04] rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4 text-xs font-mono text-white/50">
                        <div>
                          <span className="text-white/30 block text-[9px] uppercase tracking-widest mb-1">Store Address</span>
                          <span className="text-white/80">{selectedRestData.restaurant_address || "No address listed"}</span>
                        </div>
                        <div className="shrink-0 flex gap-4">
                          <div>
                            <span className="text-white/30 block text-[9px] uppercase tracking-widest mb-1">Latitude</span>
                            <span className="text-white/80 font-bold">{parseFloat(selectedRestData.latitude || 0).toFixed(6)}</span>
                          </div>
                          <div>
                            <span className="text-white/30 block text-[9px] uppercase tracking-widest mb-1">Longitude</span>
                            <span className="text-white/80 font-bold">{parseFloat(selectedRestData.longitude || 0).toFixed(6)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-8">
                      {/* Geofence Radius Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold tracking-wide text-white ml-1">
                            Geofence Radius (meters)
                          </label>
                          <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#D0B079] transition-colors" size={18} />
                            <input
                              type="number"
                              name="geofence_radius"
                              value={radius}
                              onChange={(e) => setRadius(e.target.value)}
                              placeholder="50"
                              min="10"
                              max="5000"
                              required
                              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/[0.08] rounded-2xl text-white font-bold placeholder-white/10 focus:outline-none focus:ring-4 focus:ring-[#D0B079]/20 focus:border-[#D0B079]/40 transition-all hover:bg-white/10 shadow-inner"
                            />
                          </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex gap-3 text-xs text-white/60">
                          <HelpCircle className="text-[#D0B079] shrink-0" size={18} />
                          <div>
                            <p className="font-bold text-white mb-1">Geofence Radius</p>
                            <p className="leading-relaxed">
                              {applyToAll
                                ? "This geofencing range will be enforced across all restaurants."
                                : "Staff must be within this distance from the store coordinates to clock in or out. If a clocked-in user leaves this radius, they will be automatically logged out."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Auto Logout Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center border-t border-white/5 pt-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold tracking-wide text-white ml-1">
                            Auto Logout Threshold (hours)
                          </label>
                          <div className="relative group">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#D0B079] transition-colors" size={18} />
                            <input
                              type="number"
                              name="auto_logout_hours"
                              value={autoLogoutHours}
                              onChange={(e) => setAutoLogoutHours(e.target.value)}
                              placeholder="15"
                              min="1"
                              max="48"
                              step="0.5"
                              required
                              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/[0.08] rounded-2xl text-white font-bold placeholder-white/10 focus:outline-none focus:ring-4 focus:ring-[#D0B079]/20 focus:border-[#D0B079]/40 transition-all hover:bg-white/10 shadow-inner"
                            />
                          </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex gap-3 text-xs text-white/60">
                          <HelpCircle className="text-[#D0B079] shrink-0" size={18} />
                          <div>
                            <p className="font-bold text-white mb-1">Shift Duration Constraint</p>
                            <p className="leading-relaxed">
                              Staff will be automatically clocked out after working this many hours.
                              Default is <strong className="text-white">15 hours</strong>. Can be customized with decimal hours (e.g. 12.5).
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-8 border-t border-white/[0.08]">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#D0B079] to-[#b8965f] text-slate-900 font-bold rounded-2xl shadow-xl hover:shadow-[#D0B079]/20 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Settings
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
