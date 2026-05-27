/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  User, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  X,
  FileText,
  TrendingUp,
  Sliders,
  LogIn,
  LogOut,
  Sparkles,
  Info,
  ChevronRight,
  ListFilter
} from "lucide-react";
import TamilNaduMap from "./components/TamilNaduMap";
import CitizenReporting from "./components/CitizenReporting";
import AdminDashboard from "./components/AdminDashboard";
import GovernorCharts from "./components/GovernorCharts";
import DepartmentDirectory from "./components/DepartmentDirectory";
import GovernanceHomepage from "./components/GovernanceHomepage";
import { Complaint, User as UserType, DistrictStats, DailyTrend, CategoryDistribution } from "./types";

export default function App() {
  // Navigation panel Tabs
  const [activeTab, setActiveTab] = useState<"home" | "issues" | "charts" | "departments">("home");

  // Core backend dataset states
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<{
    summary: { total: number; resolved: number; pending: number; inProgress: number; criticalCount: number };
    categoryDistribution: CategoryDistribution[];
    districtStats: DistrictStats[];
    dailyTrends: DailyTrend[];
  } | null>(null);

  // Filters from Map and Search
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Authentication states
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    const cached = localStorage.getItem("vetri_user");
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRole, setLoginRole] = useState<"citizen" | "official">("citizen");

  // Registration specific states
  const [registerName, setRegisterName] = useState("");
  const [registerDistrict, setRegisterDistrict] = useState("Chennai");
  const [registerDepartment, setRegisterDepartment] = useState("Municipal Highways Ward");

  const [authError, setAuthError] = useState("");

  // Map pin placement state
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lng: number; address: string } | null>(null);

  // Fetch initial parameters from custom server
  const fetchBackendData = async () => {
    try {
      const responseComplaints = await fetch("/api/complaints");
      const list: Complaint[] = await responseComplaints.json();
      setComplaints(list);

      const responseAnalytics = await fetch("/api/analytics");
      const stats = await responseAnalytics.json();
      setAnalytics(stats);
    } catch (err) {
      console.error("Connection failed with Express server backend, operating on client fallback state.", err);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  // Handle reporting form submission (proxy fetch to Express server)
  const handleAddNewComplaint = async (submissionData: any) => {
    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(submissionData)
      });
      const addedItem: Complaint = await response.json();
      
      // Update local React state instantly
      setComplaints(prev => [addedItem, ...prev]);
      
      // Pull fresh charts data automatically
      fetchBackendData();
      return addedItem;
    } catch (err) {
      console.error("HTTP failure saving entry", err);
      throw err;
    }
  };

  // Upvote an issue (proxy fetch)
  const handleUpvote = async (id: string) => {
    try {
      const response = await fetch(`/api/complaints/${id}/upvote`, {
        method: "POST"
      });
      const result = await response.json();
      
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, upvotes: result.upvotes } : c));
    } catch (err) {
      console.error(err);
    }
  };

  // Official: Update Status (proxy fetch)
  const handleUpdateStatus = async (id: string, status: string, remarks: string, updatedBy: string) => {
    try {
      const response = await fetch(`/api/complaints/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, remarks, updatedBy })
      });
      const updatedComplaint: Complaint = await response.json();
      
      setComplaints(prev => prev.map(c => c.id === id ? updatedComplaint : c));
      fetchBackendData();
      return updatedComplaint;
    } catch (err) {
      console.error(err);
    }
  };

  // Add Comment (proxy fetch)
  const handleAddComment = async (id: string, text: string) => {
    try {
      const payload = {
        username: currentUser?.name || "Citizen User",
        role: currentUser?.role || "citizen",
        text
      };

      const response = await fetch(`/api/complaints/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const addedComment = await response.json();

      setComplaints(prev => prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            comments: [...(c.comments || []), addedComment]
          };
        }
        return c;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // SCIG secure authentication submission handler (Login & Custom Registration)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    if (!loginPhone.trim()) {
      setAuthError("Credential Error: Must provide a registered phone number.");
      return;
    }
    if (!loginPassword.trim()) {
      setAuthError("Credential Error: Must provide a secure passcode PIN.");
      return;
    }

    try {
      const endpoint = isSignUpMode ? "/api/auth/register" : "/api/auth/login";
      const payload = isSignUpMode ? {
        name: registerName,
        phone: loginPhone,
        password: loginPassword,
        role: loginRole,
        district: registerDistrict,
        department: registerDepartment
      } : {
        phone: loginPhone,
        password: loginPassword,
        role: loginRole
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.error) {
        setAuthError(data.error);
        return;
      }

      setCurrentUser(data.user);
      localStorage.setItem("vetri_user", JSON.stringify(data.user));
      setIsLoginModalOpen(false);
      
      // Clean states
      setLoginPhone("");
      setLoginPassword("");
      setRegisterName("");
      setAuthError("");
    } catch (err) {
      setAuthError("Server Connection Failed: Gateway timeout.");
    }
  };

  // Gateway Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("vetri_user");
    setSelectedDistrict(null);
  };

  // Map click triggers pin placement coordinate retrieval
  const handleMapPinSelect = (lat: number, lng: number, address: string) => {
    setMapCoordinates({ lat, lng, address });
  };

  // Clean filters matches for display in citizen lists
  const filteredCitizenList = complaints.filter(c => {
    const matchesDistrict = !selectedDistrict || c.district.toLowerCase() === selectedDistrict.toLowerCase();
    const matchesSearch = !searchPhrase || 
      c.description.toLowerCase().includes(searchPhrase.toLowerCase()) || 
      c.id.toLowerCase().includes(searchPhrase.toLowerCase());
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;

    return matchesDistrict && matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-stone-900 font-sans flex flex-col antialiased">
      
      {/* Top Premium Tamil Nadu Governance Header - Changed from sticky to relative to scroll along with page (movable) */}
      <header className="bg-gradient-to-r from-[#800020] via-[#5c0017] to-[#1a1311] text-[#eae0d5] border-b border-[#B38F00] shadow-md relative z-40 select-none">
        
        {/* State Banner Accent line */}
        <div className="h-1 bg-gradient-to-r from-[#B38F00] via-saffron-500 to-[#B38F00] w-full"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo & Shield */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FAF9F6] border-2 border-[#B38F00] rounded-full flex items-center justify-center shadow-inner flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-10 h-10">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#800020" strokeWidth="2" />
                {/* Traditional representation of Gopuram Gate tower */}
                <path d="M 50,15 L 34,75 L 66,75 Z" fill="#800020" />
                <path d="M 42,45 L 58,45" stroke="#B38F00" strokeWidth="2.5" />
                <path d="M 46,30 L 54,30" stroke="#B38F00" strokeWidth="2.5" />
                <path d="M 38,60 L 62,60" stroke="#B38F00" strokeWidth="2.5" />
                <rect x="46" y="65" width="8" height="10" fill="#FAF9F6" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono tracking-widest text-[#B38F00] font-bold uppercase block text-left">
                  Government of Tamil Nadu Initiative
                </span>
              </div>
              <h1 className="text-xl font-sans font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>VETRI TN</span>
                <span className="text-xs bg-[#B38F00] text-black px-2 py-0.5 rounded font-mono font-bold tracking-normal">
                  GIS-CIVIC CORE
                </span>
              </h1>
              <p className="text-[11px] text-stone-300 text-left">
                AI-Powered Crowdsourced Civic Issue Reporting & Resolution Grid
              </p>
            </div>
          </div>

          {/* Tab Sub-Navigation & SSO identity button */}
          <div className="flex items-center gap-3.5 flex-wrap">
            {currentUser ? (
              <nav className="flex gap-1.5 bg-[#45000f]/40 p-1 rounded-lg border border-stone-700/60 text-xs">
                <button
                  id="tab-home"
                  onClick={() => setActiveTab("home")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    activeTab === "home" ? "bg-[#800020] text-amber-300 font-bold border border-[#B38F00]/30 shadow-xs" : "text-stone-300 hover:text-white"
                  }`}
                >
                  Home Portal
                </button>
                <button
                  id="tab-issues"
                  onClick={() => setActiveTab("issues")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    activeTab === "issues" ? "bg-[#800020] text-amber-300 font-bold border border-[#B38F00]/30 shadow-xs" : "text-stone-300 hover:text-white"
                  }`}
                >
                  Issue Repository
                </button>
                <button
                  id="tab-charts"
                  onClick={() => setActiveTab("charts")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    activeTab === "charts" ? "bg-[#800020] text-amber-300 font-bold border border-[#B38F00]/30 shadow-xs" : "text-stone-300 hover:text-white"
                  }`}
                >
                  SLA Analytics
                </button>
                <button
                  id="tab-departments"
                  onClick={() => setActiveTab("departments")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    activeTab === "departments" ? "bg-[#800020] text-amber-300 font-bold border border-[#B38F00]/30 shadow-xs" : "text-stone-300 hover:text-white"
                  }`}
                >
                  Authorized Divisions
                </button>
              </nav>
            ) : (
              <div className="text-xs font-mono px-3 py-1 bg-stone-900/40 text-[#B38F00] font-bold rounded border border-stone-800">
                ● SECURITY GATE ACTIVE
              </div>
            )}

            {/* Simulated Identity Portal toggler */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-[#2d1810] border border-[#B38F00]/50 p-1.5 rounded-lg text-xs">
                <div className="w-6 h-6 rounded-md bg-amber-500/15 flex items-center justify-center text-[#B38F00]">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="max-w-[120px] text-left leading-normal">
                  <div className="font-semibold block truncate text-stone-100">{currentUser.name}</div>
                  <span className="text-[9px] text-amber-400 font-mono uppercase block">{currentUser.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 hover:bg-[#800020] hover:text-white rounded text-stone-400 transition-all cursor-pointer border border-stone-800"
                  title="Logout Gateway SSO"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

        </div>
      </header>

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col">
        
        {/* Subtle decorative Tamil Nadu themed top banner alert */}
        <div className="bg-[#FAF9F6] border border-[#eae0d5] rounded-xl p-3.5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-3xs select-none">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-sans leading-tight">
              <strong>VETRI TN Active Monitor</strong>: Operational node running perfectly on port 3000. Verified server-side triaging active.
            </span>
          </div>
          <div className="flex gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#fdf2e9] text-[#800020] font-mono font-bold text-[10px] uppercase border border-[#f0eae1]">
              Live 625001 - 600001
            </span>
          </div>
        </div>

        {/* Core Sections Router */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {!currentUser ? (
              <motion.div
                key="landing-gateway"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2 pb-12 w-full text-left"
              >
                {/* Information and Brand Column */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-8 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#800020]/5 border border-[#800020]/20 text-xs font-mono text-[#800020] font-bold">
                      <span>UNIFIED DISPATCH GATEWAY</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-sans font-black tracking-tight text-[#800020] leading-snug">
                      Welcome to VETRI TN <br />
                      <span className="text-stone-950">Sovereign Civic Core Portal</span>
                    </h2>
                    
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                      VETRI TN is the authorized GIS-civic core portal of the Government of Tamil Nadu. 
                      Leveraging server-side intelligence dispatch arrays, the platform enables citizens to securely 
                      report municipal infrastructure failures and tracks resolution performance under strict SLAs monitored by regional heads.
                    </p>

                    {/* Operational performance markers - default to 0 count for new visitors as requested */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-100">
                      <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                        <span className="block text-[9px] font-mono text-stone-400 uppercase">Incidents Load</span>
                        <strong className="text-xl font-sans font-black text-[#800020]">{complaints.length}</strong>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                        <span className="block text-[9px] font-mono text-stone-400 uppercase">Resolved Cases</span>
                        <strong className="text-xl font-sans font-black text-emerald-600">
                          {complaints.filter(c => c.status === "resolved").length}
                        </strong>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                        <span className="block text-[9px] font-mono text-stone-400 uppercase">Active Districts</span>
                        <strong className="text-xl font-sans font-black text-stone-800">8 Regions</strong>
                      </div>
                    </div>

                    {/* Highlights list */}
                    <div className="space-y-3 pt-2 text-xs text-stone-600">
                      <div className="flex gap-2.5 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#800020] mt-1.5 flex-shrink-0" />
                        <p><strong>Verified Identification:</strong> Access protect personal identity whilst enabling legitimate authorities verification.</p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#800020] mt-1.5 flex-shrink-0" />
                        <p><strong>AI-Assisted Routing:</strong> Automatic analysis evaluates description patterns to catalog and dispatch issues in under 2 seconds.</p>
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono italic">
                        * Note: Main stats lists start at 0 before user input is saved. Real-time entries update the indicators automatically.
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                    <span>GOVERNMENT OF TAMIL NADU E-GOVERNANCE AGENCY</span>
                    <span>SECURED AES-256</span>
                  </div>
                </div>

                {/* Secure Login & Registration Form Panel */}
                <div className="lg:col-span-5 bg-white border border-[#B38F00]/30 rounded-2xl p-6 sm:p-8 shadow-md flex flex-col justify-center">
                  
                  <div className="text-center space-y-1 mb-6">
                    <h3 className="font-sans font-black text-base text-[#800020] uppercase tracking-wide">
                      Sovereign Identity Gateway
                    </h3>
                    <p className="text-[10px] text-stone-500 uppercase font-mono">
                      Enter credentials or register below
                    </p>
                  </div>

                  {/* Mode Selector Tabs (Sign In vs Register) */}
                  <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-lg mb-6 text-xs font-semibold select-none">
                    <button
                      type="button"
                      onClick={() => { setIsSignUpMode(false); setAuthError(""); }}
                      className={`py-2 rounded transition-all cursor-pointer text-center ${
                        !isSignUpMode ? "bg-[#800020] text-white shadow-xs font-bold" : "text-stone-600 hover:text-[#800020]"
                      }`}
                    >
                      Sign In Gateway
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsSignUpMode(true); setAuthError(""); }}
                      className={`py-2 rounded transition-all cursor-pointer text-center ${
                        isSignUpMode ? "bg-[#800020] text-white shadow-xs font-bold" : "text-stone-600 hover:text-[#800020]"
                      }`}
                    >
                      Register Profile
                    </button>
                  </div>

                  {authError && (
                    <div className="p-3 mb-4 rounded bg-red-50 text-red-900 text-xs font-medium border border-red-100 font-sans">
                      {authError}
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs font-sans">
                    
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                        Gateway Access Role
                      </label>
                      <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setLoginRole("citizen")}
                          className={`py-1 rounded transition-all font-semibold cursor-pointer ${
                            loginRole === "citizen" ? "bg-white text-[#800020] shadow-2xs font-sans font-bold" : "text-stone-500 hover:text-stone-800"
                          }`}
                        >
                          Citizen User
                        </button>
                        <button
                          type="button"
                          onClick={() => setLoginRole("official")}
                          className={`py-1 rounded transition-all font-semibold cursor-pointer ${
                            loginRole === "official" ? "bg-white text-[#800020] shadow-2xs font-sans font-bold" : "text-stone-500 hover:text-stone-800"
                          }`}
                        >
                          Official Admin
                        </button>
                      </div>
                    </div>

                    {isSignUpMode && (
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider mb-1">
                          Full Legal Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="E.g. Shreya Ramachandran"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          className="w-full bg-[#fcfbf9] border border-stone-300 rounded px-3 py-2 text-xs focus:outline-[#800020]"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider mb-1">
                        Registered Mobile Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="E.g. 9840123456"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        className="w-full bg-[#fcfbf9] border border-stone-300 rounded px-3 py-2 text-xs focus:outline-[#800020] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider mb-1">
                        Secret passcode PIN
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-[#fcfbf9] border border-stone-300 rounded px-3 py-2 text-xs focus:outline-[#800020] font-mono"
                      />
                    </div>

                    {isSignUpMode && loginRole === "official" && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider mb-1">
                            Assigned District
                          </label>
                          <select
                            value={registerDistrict}
                            onChange={(e) => setRegisterDistrict(e.target.value)}
                            className="w-full bg-white border border-stone-300 rounded px-2 py-1.5 text-stone-700 font-sans"
                          >
                            <option value="Chennai">Chennai</option>
                            <option value="Coimbatore">Coimbatore</option>
                            <option value="Madurai">Madurai</option>
                            <option value="Trichy">Trichy</option>
                            <option value="Salem">Salem</option>
                            <option value="Tirunelveli">Tirunelveli</option>
                            <option value="Vellore">Vellore</option>
                            <option value="Thanjavur">Thanjavur</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-[#800020] uppercase tracking-wider mb-1">
                            Unit
                          </label>
                          <select
                            value={registerDepartment}
                            onChange={(e) => setRegisterDepartment(e.target.value)}
                            className="w-full bg-white border border-stone-300 rounded px-2 py-1.5 text-stone-700 truncate font-sans"
                          >
                            <option value="Municipal Highways Division">Highways & PWD</option>
                            <option value="Water Supply & Sewage Board">Sewage & Water</option>
                            <option value="Solid Waste Management Wing">Solid Waste</option>
                            <option value="TANGEDCO Electrical Division">Electrical Division</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Pre-seeded Realistic Credentials Index */}
                    {!isSignUpMode && (
                      <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-[10px] sm:text-[10.5px] leading-relaxed text-stone-600 font-sans">
                        <div className="font-bold text-[#800020] uppercase font-mono tracking-wide text-[9px] mb-1">
                          Demo Gate Credentials (SCIG Gateway):
                        </div>
                        <div className="space-y-1 font-mono">
                          <div>
                            👨‍✈️ <strong>Chennai IAS</strong>: <br />
                            Phone: <span className="font-bold text-stone-800 select-all">9840123456</span> | PIN: <span className="font-bold text-stone-800 select-all">pwdChennaiAdmin</span>
                          </div>
                          <div>
                            👷‍♀️ <strong>Madurai Chief Eng</strong>: <br />
                            Phone: <span className="font-bold text-stone-800 select-all">9150123456</span> | PIN: <span className="font-bold text-stone-800 select-all">pwdMaduraiAdmin</span>
                          </div>
                          <div>
                            👩‍💼 <strong>Citizen User</strong>: <br />
                            Phone: <span className="font-bold text-stone-800 select-all">9003198765</span> | PIN: <span className="font-bold text-stone-800 select-all">pwdCitizen123</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-[#800020] text-white hover:bg-[#680018] font-sans font-bold py-2.5 rounded shadow-xs tracking-wider uppercase cursor-pointer text-xs"
                    >
                      {isSignUpMode ? "Register & Enter SCIG" : "Approve Gateway Credentials"}
                    </button>

                  </form>

                </div>
              </motion.div>
            ) : (
              <>
                {/* TAB 0: Governance Homepage Portal */}
                {activeTab === "home" && (
                  <motion.div
                    key="home-view"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.18 }}
                  >
                    <GovernanceHomepage 
                      onNavigate={(tab) => {
                        setActiveTab(tab);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      statistics={analytics?.summary || { 
                        total: complaints.length, 
                        resolved: complaints.filter(c => c.status === "resolved").length, 
                        pending: complaints.filter(c => c.status === "pending").length, 
                        criticalCount: complaints.filter(c => c.severity === "critical").length 
                      }}
                      complaints={complaints}
                    />
                  </motion.div>
                )}

            {/* TAB 1: Issues Grid Module */}
            {activeTab === "issues" && (
              <motion.div
                key="issues-view"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                {/* Official Mode triggers full-screen Admin Console instantly */}
                {currentUser?.role === "official" ? (
                  <div className="bg-white border border-[#eae0d5] rounded-xl shadow-xs p-5 pb-6">
                    <div className="flex items-center justify-between pb-4 border-b border-[#f4f1ea] mb-5">
                      <div>
                        <h2 className="text-base font-sans font-bold text-stone-900">Official Municipal Dispatch Hub</h2>
                        <p className="text-xs text-stone-500">Zonal review board - monitor automatically categorized AI logs & coordinate timelines</p>
                      </div>
                      <div className="bg-[#800020] text-amber-300 font-mono text-[10px] font-bold px-3 py-1 rounded border border-[#B38F00]/40">
                        OFFICER INTERFACE
                      </div>
                    </div>
                    <AdminDashboard 
                      complaints={complaints}
                      currentUser={currentUser}
                      onUpdateComplaintStatus={handleUpdateStatus}
                      onAddComment={handleAddComment}
                    />
                  </div>
                ) : (
                  /* Standard citizen workspace (Side-By-Side GIS Map + Submission Card) */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left block (Span 7) - Interactive SVG Map and Filters */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                      
                      <div className="h-[480px]">
                        <TamilNaduMap 
                          complaints={complaints}
                          districtStats={analytics?.districtStats || []}
                          selectedDistrict={selectedDistrict}
                          onSelectDistrict={setSelectedDistrict}
                          onMapPinSelect={handleMapPinSelect}
                        />
                      </div>

                      {/* Other Citizen Feed section */}
                      <div id="citizens-public-complaints-list" className="bg-white border border-[#eae0d5] rounded-xl p-5 shadow-xs flex-1 flex flex-col">
                        
                        <div className="border-b border-[#f4f1ea] pb-3 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <h4 className="text-xs font-mono font-bold text-[#800020] uppercase tracking-wider">Crowdsourced Citizen Activity Feed</h4>
                            <p className="text-[11px] text-stone-500">Verified community entries logged around Tamil Nadu</p>
                          </div>
                          
                          {/* Search inputs */}
                          <div className="flex gap-2 w-full sm:w-auto">
                            <input
                              type="text"
                              placeholder="Fuzzy filter..."
                              value={searchPhrase}
                              onChange={(e) => setSearchPhrase(e.target.value)}
                              className="px-2.5 py-1 text-[11px] border border-[#d8cfc4] rounded bg-[#FAF9F6] w-full sm:w-32 placeholder-stone-400"
                            />
                            <select
                              value={categoryFilter}
                              onChange={(e) => setCategoryFilter(e.target.value)}
                              className="px-2.5 py-1 text-[11px] border border-[#d8cfc4] rounded bg-white text-stone-600"
                            >
                              <option value="all">Categories (All)</option>
                              <option value="Roads">Roads</option>
                              <option value="Water Supply">Water Supply</option>
                              <option value="Garbage Management">Garbage</option>
                              <option value="Street Lights">Lights</option>
                              <option value="Drainage">Drainage</option>
                              <option value="Public Safety">Safety</option>
                              <option value="Electricity">Electricity</option>
                              <option value="Traffic">Traffic</option>
                              <option value="Environment">Environment</option>
                            </select>
                          </div>
                        </div>

                        {/* List output */}
                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 divide-y divide-stone-100">
                          {filteredCitizenList.length > 0 ? (
                            filteredCitizenList.map((comp) => (
                              <div key={comp.id} className="pt-3 first:pt-0 flex gap-3.5 items-start text-xs font-sans">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-mono text-stone-400 font-semibold">{comp.id}</span>
                                    <span className="text-stone-300">•</span>
                                    <span className="text-[#800020] font-semibold text-[10px]">{comp.category}</span>
                                    <span className="text-stone-300">•</span>
                                    <span className="bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded font-medium text-[10px]">{comp.district}</span>
                                  </div>
                                  <p className="text-stone-700 leading-relaxed font-sans">{comp.description}</p>
                                  
                                  <div className="mt-2 text-[10px] font-mono text-stone-400">
                                    Coordinates: {comp.location.address}
                                  </div>
                                  
                                  {/* Timeline & details on feed */}
                                  <div className="mt-3 flex items-center justify-between text-[10px] text-stone-500 font-sans border-t border-dashed border-stone-100 pt-2">
                                    <div>
                                      <span>Status: </span>
                                      <span className={`font-semibold capitalize ${
                                        comp.status === "resolved" ? "text-emerald-700" :
                                        comp.status === "in_progress" ? "text-blue-700" : "text-amber-700"
                                      }`}>{comp.status.replace("_", " ")}</span>
                                    </div>
                                    <div className="flex gap-3">
                                      <button 
                                        onClick={() => handleUpvote(comp.id)}
                                        className="hover:text-[#800020] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                                      >
                                        Upvote ({comp.upvotes || 1})
                                      </button>
                                      <span>•</span>
                                      <span>{new Date(comp.createdAt).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center py-6 text-[11px] text-stone-400 font-mono">
                              No public reports found matching the filter specs. Click a district on the map or type to clear.
                            </p>
                          )}
                        </div>

                      </div>

                    </div>

                    {/* Right block (Span 5) - Citizen reporting Form */}
                    <div className="lg:col-span-5">
                      <CitizenReporting 
                        onAddComplaint={handleAddNewComplaint}
                        currentUser={currentUser}
                        mapSelectedCoordinates={mapCoordinates}
                      />
                    </div>

                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: GovernorCharts Analytics Panel */}
            {activeTab === "charts" && (
              <motion.div
                key="charts-view"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18 }}
              >
                {analytics ? (
                  <GovernorCharts 
                    summary={analytics.summary}
                    categoryDistribution={analytics.categoryDistribution}
                    dailyTrends={analytics.dailyTrends}
                    districtStats={analytics.districtStats}
                  />
                ) : (
                  <div className="bg-white border border-[#eae0d5] rounded-xl p-12 text-center text-xs text-stone-400 font-mono animate-pulse">
                    Pulling real-time database indicators for Tamil Nadu...
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 3: Department Directory Module */}
            {activeTab === "departments" && (
              <motion.div
                key="departments-view"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18 }}
              >
                <DepartmentDirectory />
              </motion.div>
            )}

              </>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#1f1917] text-stone-400 border-t border-stone-800 py-6 mt-12 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>VETRI TN (Version 4.1.0-Release) • Digital Administration Ecosystem</span>
          </div>
          <div className="text-center md:text-right">
            <p>Administered under State Municipal E-Governance Protocol Guidelines.</p>
            <p className="text-[10px] font-mono text-stone-600 mt-0.5">Secure SSO JWT Sandbox Session Verified</p>
          </div>
        </div>
      </footer>

      {/* Simulated Authority Gateway SSO Modal */}
      {isLoginModalOpen && (
        <div id="identity-sso-gateway-modal" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#FAF9F6] border-2 border-[#B38F00] rounded-xl w-full max-w-sm p-6 shadow-2xl relative"
          >
            {/* Close button */}
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute right-4 top-4 hover:bg-stone-200 p-1 rounded-full text-stone-600 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal logo */}
            <div className="text-center space-y-2 mb-4 select-none">
              <div className="w-10 h-10 bg-[#800020] rounded-lg flex items-center justify-center text-white mx-auto">
                <ShieldCheck className="w-6 h-6 text-amber-300" />
              </div>
              <h3 className="font-sans font-black text-sm text-[#800020] uppercase tracking-wider">
                Tamil Nadu Secure Portal
              </h3>
              <p className="text-[10px] text-stone-500 uppercase font-mono">
                Sovereign Civic Identity Gateway (SCIG)
              </p>
            </div>

            {/* Security Mode Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#f0eae1] p-1 rounded-lg mb-4 text-xs font-semibold select-none">
              <button
                type="button"
                onClick={() => { setIsSignUpMode(false); setAuthError(""); }}
                className={`py-1.5 rounded transition-all cursor-pointer ${
                  !isSignUpMode ? "bg-[#800020] text-white shadow-2xs font-bold" : "text-stone-600 hover:text-[#800020]"
                }`}
              >
                Sign In Gateway
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUpMode(true); setAuthError(""); }}
                className={`py-1.5 rounded transition-all cursor-pointer ${
                  isSignUpMode ? "bg-[#800020] text-white shadow-2xs font-bold" : "text-stone-600 hover:text-[#800020]"
                }`}
              >
                Register Citizen/Admin
              </button>
            </div>

            {/* Error alerts */}
            {authError && (
              <div className="p-2.5 mb-3 rounded bg-red-100 text-red-800 text-[11px] font-medium leading-relaxed">
                {authError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4 font-sans text-xs">
              
              <div>
                <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Gateway Access Mode
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[#f0eae1] p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setLoginRole("citizen")}
                    className={`py-1 rounded transition-all font-semibold font-sans cursor-pointer ${
                      loginRole === "citizen" ? "bg-white text-[#800020] shadow-2xs animate-fade-in" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    Citizen
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginRole("official")}
                    className={`py-1 rounded transition-all font-semibold font-sans cursor-pointer ${
                      loginRole === "official" ? "bg-white text-[#800020] shadow-2xs animate-fade-in" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    Official Admin
                  </button>
                </div>
              </div>

              {isSignUpMode && (
                <div>
                  <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Shreya Kumar"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full bg-[#fcfbf9] border border-stone-300 rounded px-2.5 py-1.5 focus:outline-[#800020]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Registered Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="E.g. 9840123456"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="w-full bg-[#fcfbf9] border border-stone-300 rounded px-2.5 py-1.5 focus:outline-[#800020]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Secret passcode PIN
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#fcfbf9] border border-stone-300 rounded px-2.5 py-1.5 focus:outline-[#800020] font-mono"
                />
              </div>

              {isSignUpMode && loginRole === "official" && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider mb-1">
                      Assigned District
                    </label>
                    <select
                      value={registerDistrict}
                      onChange={(e) => setRegisterDistrict(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded px-2 py-1.5 text-stone-700"
                    >
                      <option value="Chennai">Chennai</option>
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Madurai">Madurai</option>
                      <option value="Trichy">Trichy</option>
                      <option value="Salem">Salem</option>
                      <option value="Tirunelveli">Tirunelveli</option>
                      <option value="Vellore">Vellore</option>
                      <option value="Thanjavur">Thanjavur</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider mb-1">
                      Department Unit
                    </label>
                    <select
                      value={registerDepartment}
                      onChange={(e) => setRegisterDepartment(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded px-2 py-1.5 text-stone-700 truncate"
                    >
                      <option value="Municipal Highways Division">Highways & PWD</option>
                      <option value="Water Supply & Sewage Board">Sewage & Water</option>
                      <option value="Solid Waste Management Wing">Solid Waste</option>
                      <option value="TANGEDCO Electrical Division">Electrical Division</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Pre-seeded Realistic Credentials Index */}
              {!isSignUpMode && (
                <div className="bg-stone-100 border border-stone-200 rounded p-2.5 text-[10.5px] leading-relaxed text-stone-600 font-sans">
                  <div className="font-bold text-[#800020] uppercase font-mono tracking-wide text-[9.5px] mb-1">
                    Demo Seed Credentials Index:
                  </div>
                  <div className="space-y-1 select-all font-mono">
                    <div>
                      👨‍✈️ <strong>Chennai IAS</strong>: <br />
                      Phone: <span className="font-bold text-stone-800">9840123456</span> | PIN: <span className="font-bold text-stone-800">pwdChennaiAdmin</span>
                    </div>
                    <div>
                      👷‍♀️ <strong>Madurai Chief Eng</strong>: <br />
                      Phone: <span className="font-bold text-stone-800">9150123456</span> | PIN: <span className="font-bold text-stone-800">pwdMaduraiAdmin</span>
                    </div>
                    <div>
                      👩‍💼 <strong>Citizen User</strong>: <br />
                      Phone: <span className="font-bold text-stone-800">9003198765</span> | PIN: <span className="font-bold text-stone-800">pwdCitizen123</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-[#800020] mt-1.5">
                    * You can also use the registration tab above to instantly register and login with any custom profile!
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#800020] text-[#eae0d5] hover:bg-[#680018] font-sans font-bold py-2 rounded shadow-xs tracking-wider uppercase cursor-pointer text-xs"
              >
                {isSignUpMode ? "Register & Enter Gateway" : "Approve Gateway Credentials"}
              </button>

            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
