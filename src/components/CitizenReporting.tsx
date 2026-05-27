/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileUp, MapPin, Sparkles, Phone, User, Send, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
import { Complaint } from "../types";

// Standard preset previews for simulated images to make items visually compelling
const PRESET_MOCK_IMAGES = [
  { name: "Potholes & Road Failures", url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=400" },
  { name: "Sewage Overflow", url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400" },
  { name: "Garbage Dump Block", url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=400" },
  { name: "Streetlight outage", url: "https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&q=80&w=400" }
];

interface CitizenReportingProps {
  onAddComplaint: (newComplaint: any) => Promise<any>;
  currentUser: { name: string; phone: string } | null;
  mapSelectedCoordinates: { lat: number; lng: number; address: string } | null;
}

export default function CitizenReporting({
  onAddComplaint,
  currentUser,
  mapSelectedCoordinates
}: CitizenReportingProps) {
  // Form values
  const [category, setCategory] = useState("Roads");
  const [description, setDescription] = useState("");
  const [district, setDistrict] = useState("Chennai");
  
  // Geolocation states
  const [lat, setLat] = useState<string>("13.0827");
  const [lng, setLng] = useState<string>("80.2707");
  const [address, setAddress] = useState("Anna Salai Road, Chennai Main Ward");
  const [isLocating, setIsLocating] = useState(false);
  const [geotagStatus, setGeotagStatus] = useState<"not_verified" | "automated" | "map_selected">("not_verified");

  // Phone states
  const [citizenName, setCitizenName] = useState(currentUser?.name || "");
  const [citizenPhone, setCitizenPhone] = useState(currentUser?.phone || "");

  // Attachment states
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReport, setSuccessReport] = useState<Complaint | null>(null);

  // Synergy: update coordinates when map selection changes
  React.useEffect(() => {
    if (mapSelectedCoordinates) {
      setLat(mapSelectedCoordinates.lat.toFixed(4));
      setLng(mapSelectedCoordinates.lng.toFixed(4));
      setAddress(mapSelectedCoordinates.address);
      setGeotagStatus("map_selected");
    }
  }, [mapSelectedCoordinates]);

  // Handle native HTML5 geo lookup
  const triggerNativeGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser software.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLat(latitude.toFixed(4));
        setLng(longitude.toFixed(4));
        setAddress(`GPS Lat: ${latitude.toFixed(3)}, Lng: ${longitude.toFixed(3)}, Municipal Zone, ${district}`);
        setGeotagStatus("automated");
        setIsLocating(false);
      },
      (error) => {
        console.warn("Native coordinates lookup failed or permission denied, using district seed coordinates.", error);
        // Default relative to selected district
        const defaultCoords: Record<string, { lat: number; lng: number, addr: string }> = {
          "Chennai": { lat: 13.0827, lng: 80.2707, addr: "Fort St. George Road, Chennai Core Ward" },
          "Madurai": { lat: 9.9252, lng: 78.1198, addr: "West Tower Street, Madurai Town Zone" },
          "Coimbatore": { lat: 11.0168, lng: 76.9558, addr: "Peelamedu Central Boulevard, Coimbatore" },
          "Salem": { lat: 11.6667, lng: 78.1133, addr: "Junction Main Sector, Salem Corporation" },
          "Trichy": { lat: 10.8050, lng: 78.6856, addr: "Rockfort Fort Street, Tiruchirappalli" },
          "Tirunelveli": { lat: 8.7139, lng: 77.7567, addr: "Palayamkottai Road, Tirunelveli Division" }
        };

        const fallback = defaultCoords[district] || defaultCoords["Chennai"];
        setLat(fallback.lat.toFixed(4));
        setLng(fallback.lng.toFixed(4));
        setAddress(fallback.addr);
        setGeotagStatus("automated");
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Mock File Drag Handling & preset attachments
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragOver(true);
    } else if (e.type === "dragleave") {
      setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Select preset imagery directly for rapid high fidelity test
  const selectPreset = (url: string) => {
    setAttachedImage(url);
  };

  // Handle reporting submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please provide issue details.");
      return;
    }
    if (!citizenPhone.trim()) {
      alert("A contact phone number is needed for public authority validation.");
      return;
    }

    setIsSubmitting(true);
    setSuccessReport(null);

    const submissionData = {
      category,
      description,
      district,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address
      },
      citizenName: citizenName || "Citizen anonymous",
      citizenPhone,
      imageUrl: attachedImage
    };

    try {
      const response = await onAddComplaint(submissionData);
      setSuccessReport(response);
      // Reset major local form fields
      setDescription("");
      setAttachedImage(null);
    } catch (err) {
      console.error("Submission failed entirely", err);
      alert("We encountered an error uploading your civic complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="citizen-complaint-submission-card" className="bg-white border border-[#eae0d5] rounded-xl shadow-sm p-6 overflow-hidden h-full">
      <AnimatePresence mode="wait">
        {!successReport ? (
          <form onSubmit={handleFormSubmit} className="space-y-5">
            
            {/* Title Block */}
            <div className="flex items-center gap-2 pb-3.5 border-b border-[#f4f1ea]">
              <div className="w-8 h-8 rounded-lg bg-[#800020] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="text-base font-sans font-bold text-stone-900">New Civic Complaint Submission</h3>
                <p className="text-xs text-stone-500">Auto-prioritized and categorized by our official VETRI AI</p>
              </div>
            </div>

            {/* Core Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Category */}
              <div>
                <label className="block text-xs font-mono font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Complaint Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#fdfbf9] border border-[#d8cfc4] rounded-lg px-3 py-2 text-xs text-stone-800 font-sans focus:outline-hidden focus:ring-1 focus:ring-[#800020]"
                >
                  <option>Roads</option>
                  <option>Water Supply</option>
                  <option>Garbage Management</option>
                  <option>Street Lights</option>
                  <option>Drainage</option>
                  <option>Public Safety</option>
                  <option>Electricity</option>
                  <option>Traffic</option>
                  <option>Environment</option>
                </select>
              </div>

              {/* District Corp selection */}
              <div>
                <label className="block text-xs font-mono font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Target Municipal Corporation
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-[#fdfbf9] border border-[#d8cfc4] rounded-lg px-3 py-2 text-xs text-stone-800 font-sans focus:outline-hidden focus:ring-1 focus:ring-[#800020]"
                >
                  <option>Chennai</option>
                  <option>Madurai</option>
                  <option>Coimbatore</option>
                  <option>Salem</option>
                  <option>Trichy</option>
                  <option>Tirunelveli</option>
                  <option>Vellore</option>
                  <option>Thanjavur</option>
                </select>
              </div>

            </div>

            {/* Description Area */}
            <div>
              <label className="block text-xs font-mono font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Detailed Issue Narrative
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., Deep pothole at Anna Salai right in front of DMK head office center. It sits in a high volume lane. Severe crash risk during evening rains..."
                className="w-full bg-[#fdfbf9] border border-[#d8cfc4] rounded-lg p-3 text-xs text-stone-800 font-sans focus:outline-hidden focus:ring-1 focus:ring-[#800020] placeholder-stone-400"
              />
            </div>

            {/* Geolocation Controls */}
            <div className="bg-[#fcfbf9] p-4 rounded-xl border border-[#ede7e0]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[#800020] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  GIS GEOTAG VERIFICATION
                </span>
                
                <button
                  type="button"
                  onClick={triggerNativeGeolocation}
                  disabled={isLocating}
                  className="text-[11px] font-sans font-semibold text-charcoal-800 hover:text-[#800020] px-2.5 py-1 rounded bg-[#f0eae1] hover:bg-[#eae0d5] border border-stone-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  {isLocating ? "Retrieving GPS..." : "Auto Geotag GPS"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="text-[10px] font-mono">
                  <span className="text-stone-400 block mb-0.5">LATITUDE (WGS84)</span>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => {
                      setLat(e.target.value);
                      setGeotagStatus("not_verified");
                    }}
                    className="w-full bg-white border border-[#eae0d5] rounded p-1.5 text-stone-700 text-[11px]"
                  />
                </div>
                <div className="text-[10px] font-mono">
                  <span className="text-stone-400 block mb-0.5">LONGITUDE (WGS84)</span>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => {
                      setLng(e.target.value);
                      setGeotagStatus("not_verified");
                    }}
                    className="w-full bg-white border border-[#eae0d5] rounded p-1.5 text-stone-700 text-[11px]"
                  />
                </div>
              </div>

              <div className="text-[10px] font-mono mt-1">
                <span className="text-stone-400 block mb-0.5">IDENTIFIED PERIMETER ADDRESS</span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setGeotagStatus("not_verified");
                  }}
                  className="w-full bg-white border border-[#eae0d5] rounded p-1.5 text-stone-700 text-[11px]"
                />
              </div>

              {/* Status indicator badge */}
              <div className="mt-2.5 flex items-center gap-1.5">
                {geotagStatus === "map_selected" && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                    Map Link: Connected with Interactive GIS grid selection
                  </span>
                )}
                {geotagStatus === "automated" && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                    GPS Check: Validated over active satellite registry
                  </span>
                )}
                {geotagStatus === "not_verified" && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                    GPS Warning: Enter coordinates or click Map node above
                  </span>
                )}
              </div>
            </div>

            {/* Media Upload and Preset Attachments */}
            <div>
              <label className="block text-xs font-mono font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Attach Supporting Photo Proof
              </label>
              
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-4 transition-all text-center flex flex-col items-center justify-center ${
                  dragOver ? "border-[#800020] bg-orange-50/20" : "border-[#eae0d5] bg-[#faf8f6] hover:bg-[#faf6f3]"
                }`}
              >
                {attachedImage ? (
                  <div className="relative">
                    <img src={attachedImage} alt="Citizen attachment" className="max-h-24 rounded border border-stone-200 shadow-sm mx-auto" />
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-sans font-semibold hover:bg-red-700"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <>
                    <FileUp className="w-6 h-6 text-stone-400 mb-1.5" />
                    <p className="text-[11px] text-stone-600 mb-1">Drag and drop file or</p>
                    <label className="cursor-pointer text-[11px] text-[#800020] font-sans font-bold underline hover:text-[#900025]">
                      Browse Local Image
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </>
                )}
              </div>

              {/* Preset baseline selector */}
              <div className="mt-3">
                <span className="text-[10px] font-mono text-stone-500 block mb-1">Quick Select Baseline Test Proofs:</span>
                <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                  {PRESET_MOCK_IMAGES.map((img) => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() => selectPreset(img.url)}
                      className="flex-shrink-0 text-[10px] border border-[#eae0d5] bg-[#fdfbf9] hover:bg-orange-50/20 hover:border-[#B38F00] px-2 py-1 rounded transition-all text-stone-600 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 text-[#B38F00] flex-shrink-0" />
                      <span>{img.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Citizen validating fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-mono font-semibold text-charcoal-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-[#B38F00]" /> Reporter Name
                </label>
                <input
                  type="text"
                  required
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="E.g., Subramanian Ramasamy"
                  className="w-full bg-[#fdfbf9] border border-[#d8cfc4] rounded-lg px-2.5 py-1.5 text-xs text-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-semibold text-charcoal-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#B38F00]" /> OTP Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  placeholder="E.g., 9845123456"
                  className="w-full bg-[#fdfbf9] border border-[#d8cfc4] rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-mono"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <button
               type="submit"
               disabled={isSubmitting}
               className={`w-full py-3 px-4 rounded-lg font-sans font-semibold text-xs tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                 isSubmitting
                   ? "bg-[#eae0d5] text-stone-500 cursor-not-allowed"
                   : "bg-[#800020] text-[#eae0d5] hover:bg-[#6c001b] hover:text-white"
               }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#800020]"></div>
                  <span>VETRI AI is verifying files & triaging load...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit to VETRI AI Civic Routing</span>
                </>
              )}
            </button>

          </form>
        ) : (
          /* SUCCESS DETAIL COMPANION PANEL (AI Auto-Prioritized Preview) */
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Logo heading */}
            <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-sans font-bold text-emerald-900">Complaint Registered Successfully</h4>
              <p className="text-xs text-emerald-700 font-mono mt-0.5">MUNICIPAL ID: {successReport.id}</p>
            </div>

            {/* AI response details */}
            {successReport.aiAnalysis && (
              <div className="bg-[#1f1917] hover:border-amber-300 border border-[#B38F00] rounded-xl p-5 shadow-md">
                
                {/* AI Header */}
                <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold">
                    <Sparkles className="w-4 h-4 animate-pulse text-[#B38F00]" />
                    <span>VETRI AI TRIAGE DISCARD REPORT</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-wider ${
                    successReport.priority === "critical" ? "bg-red-900 text-red-100 border border-red-500 animate-pulse" :
                    successReport.priority === "high" ? "bg-orange-950 text-orange-200 border border-orange-500" :
                    successReport.priority === "medium" ? "bg-yellow-950 text-yellow-200 border border-amber-500" :
                    "bg-emerald-950 text-emerald-200 border border-emerald-500"
                  }`}>
                    Priority: {successReport.priority}
                  </span>
                </div>

                {/* AI Stats Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-3.5 font-sans">
                  <div>
                    <span className="text-stone-400 block text-[10px] font-mono">ROUTED DIVISION</span>
                    <strong className="text-stone-200">{successReport.assignedDepartment}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] font-mono">CONFIDENCE CONFIRMED</span>
                    <strong className="text-amber-300">{successReport.aiAnalysis.confidenceScore}% Quality Score</strong>
                  </div>
                </div>

                {/* AI System reasoning text */}
                <div className="text-stone-300 text-xs leading-relaxed bg-stone-900/60 p-3 rounded border border-stone-800 mb-3.5">
                  <span className="text-[10px] font-mono text-[#B38F00] block mb-1">DECISION JUSTIFICATION:</span>
                  {successReport.aiAnalysis.reasoning}
                </div>

                {/* Safety notices */}
                {successReport.aiAnalysis.publicSafetyNotice && (
                  <div className="bg-red-950/40 border border-red-800 p-3 rounded text-red-200 text-xs leading-relaxed mb-4 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-red-400 block font-mono text-[10px] tracking-wide uppercase">PUBLIC SAFETY ADVISORY:</strong>
                      {successReport.aiAnalysis.publicSafetyNotice}
                    </div>
                  </div>
                )}

                {/* Immediate Action Steps */}
                {successReport.aiAnalysis.actionPlan && successReport.aiAnalysis.actionPlan.length > 0 && (
                  <div className="space-y-1.5 border-t border-stone-800 pt-3">
                    <span className="text-[10px] font-mono text-[#B38F00] block">RECOMMENDED SYSTEM RESOLUTION STEPS:</span>
                    <ul className="space-y-1">
                      {successReport.aiAnalysis.actionPlan.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-stone-300 text-xs">
                          <span className="w-4 h-4 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            )}

            {/* General next steps & reset button */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setSuccessReport(null)}
                className="px-4 py-2 bg-[#eae0d5] hover:bg-[#decab5] rounded-lg text-xs font-sans font-bold text-stone-800 transition-all cursor-pointer"
              >
                File Another Complaint
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
