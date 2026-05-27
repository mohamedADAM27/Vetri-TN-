/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Building, 
  Calendar, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Search, 
  SlidersHorizontal, 
  User, 
  AlertOctagon, 
  Eye, 
  MapPin, 
  Sparkles, 
  Wrench, 
  RotateCcw,
  Plus
} from "lucide-react";
import { Complaint, Comment, User as UserType } from "../types";

interface AdminDashboardProps {
  complaints: Complaint[];
  currentUser: UserType | null;
  onUpdateComplaintStatus: (id: string, status: string, remarks: string, updatedBy: string) => Promise<any>;
  onAddComment: (id: string, text: string) => Promise<any>;
}

export default function AdminDashboard({
  complaints,
  currentUser,
  onUpdateComplaintStatus,
  onAddComment
}: AdminDashboardProps) {
  // Search & Filter state variables
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Selection Detail Card state
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(
    complaints.length > 0 ? complaints[0].id : null
  );

  // Administrative action form states
  const [actionStatus, setActionStatus] = useState("in_progress");
  const [actionRemarks, setActionRemarks] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter complaints based on multiple states
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch = 
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    const matchesDistrict = selectedDistrict === "all" || c.district === selectedDistrict;
    const matchesPriority = selectedPriority === "all" || c.priority === selectedPriority;
    const matchesStatus = selectedStatus === "all" || c.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesDistrict && matchesPriority && matchesStatus;
  });

  const activeComplaint = complaints.find((c) => c.id === activeComplaintId) || filteredComplaints[0];

  // Helper styles for priority
  const getPriorityBadge = (priority: string) => {
    const caps = priority.toUpperCase();
    switch (priority) {
      case "critical":
        return "bg-red-50 text-red-800 border-red-200 animate-pulse";
      case "high":
        return "bg-orange-50 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-50 text-amber-800 border-amber-200";
      default:
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
    }
  };

  // Helper styles for status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-emerald-100 text-emerald-900 border-emerald-200";
      case "rejected":
        return "bg-stone-100 text-stone-700 border-stone-200";
      case "in_progress":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "assigned":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "verified":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      default:
        return "bg-amber-50 text-amber-850 border-amber-200";
    }
  };

  // Handle Dispatch status shift
  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;
    if (!actionRemarks.trim()) {
      alert("Please supply authority remarks justifying this transition.");
      return;
    }

    setIsUpdating(true);
    try {
      const solverName = currentUser?.name || "Zonal Officer (Admin)";
      await onUpdateComplaintStatus(activeComplaint.id, actionStatus, actionRemarks, solverName);
      setActionRemarks("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Comment posting on complaint
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint || !commentText.trim()) return;

    try {
      await onAddComment(activeComplaint.id, commentText);
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  };

  // Clean filters reset
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedDistrict("all");
    setSelectedPriority("all");
    setSelectedStatus("all");
  };

  return (
    <div id="authority-complaint-panel" className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* Search and Filters Block (Column 12 Span) */}
      <div className="xl:col-span-12 bg-[#faf9f6]/90 border border-[#eae0d5] rounded-xl p-4 shadow-3xs">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search via ID, text keyword or citizen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#d8cfc4] rounded-lg pl-9 pr-4 py-2 text-xs text-stone-800 font-sans focus:outline-hidden focus:ring-1 focus:ring-[#800020]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto flex-1 md:pl-4">
            
            {/* Category selection */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-[#d8cfc4] rounded-lg px-2.5 py-1.5 text-[11px] text-stone-700"
            >
              <option value="all">All Categories</option>
              <option value="Roads">Roads</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Garbage Management">Garbage Management</option>
              <option value="Street Lights">Street Lights</option>
              <option value="Drainage">Drainage</option>
              <option value="Public Safety">Public Safety</option>
              <option value="Electricity">Electricity</option>
              <option value="Traffic">Traffic</option>
              <option value="Environment">Environment</option>
            </select>

            {/* District selecting */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-white border border-[#d8cfc4] rounded-lg px-2.5 py-1.5 text-[11px] text-stone-700"
            >
              <option value="all">All Districts</option>
              <option value="Chennai">Chennai</option>
              <option value="Madurai">Madurai</option>
              <option value="Coimbatore">Coimbatore</option>
              <option value="Salem">Salem</option>
              <option value="Trichy">Trichy</option>
              <option value="Tirunelveli">Tirunelveli</option>
              <option value="Vellore">Vellore</option>
              <option value="Thanjavur">Thanjavur</option>
            </select>

            {/* Priority filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-white border border-[#d8cfc4] rounded-lg px-2.5 py-1.5 text-[11px] text-stone-700"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High &amp; Critical</option>
              <option value="medium">Medium Load</option>
              <option value="low">Low Load</option>
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-[#d8cfc4] rounded-lg px-2.5 py-1.5 text-[11px] text-stone-700"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

          </div>

          <button
            onClick={resetFilters}
            className="p-2 text-stone-500 hover:text-[#800020] bg-white border border-[#d8cfc4] rounded-lg hover:bg-stone-50 transition-all cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

        </div>
      </div>

      {/* LEFT COLUMN: Complaints Table Listing (Span 7) */}
      <div className="xl:col-span-7 bg-white border border-[#eae0d5] rounded-xl shadow-xs overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#f4f1ea] bg-[#fdfbf9] flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">
            Report Inventory Grid ({filteredComplaints.length})
          </h4>
          <span className="text-[10px] font-mono bg-stone-100 text-[#800020] px-2 py-0.5 rounded-full font-bold">
            Authorized Division View
          </span>
        </div>

        <div className="overflow-y-auto max-h-[580px] divide-y divide-stone-100">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((comp) => (
              <div
                key={comp.id}
                onClick={() => {
                  setActiveComplaintId(comp.id);
                  // Auto sync current complaint status value in admin status updating tool
                  setActionStatus(comp.status === "pending" ? "assigned" : comp.status);
                }}
                className={`p-4 transition-all hover:bg-orange-50/10 cursor-pointer flex gap-4 items-start ${
                  activeComplaintId === comp.id ? "bg-[#fdf9f5] border-l-4 border-l-[#800020]" : "border-l-4 border-l-transparent"
                }`}
              >
                
                {/* Details info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-stone-400 font-semibold">{comp.id}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-[10px] font-sans font-bold text-[#800020] truncate">{comp.category}</span>
                  </div>

                  <p className="text-xs text-stone-700 font-sans font-medium line-clamp-2 leading-relaxed mb-2.5">
                    {comp.description}
                  </p>

                  <div className="flex flex-wrap gap-2 items-center text-[10px] text-stone-500 font-sans">
                    <span className="font-semibold text-stone-800">{comp.district} Corp</span>
                    <span>•</span>
                    <span>Upvotes: {comp.upvotes}</span>
                    <span>•</span>
                    <span>{new Date(comp.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Right badges */}
                <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${getPriorityBadge(comp.priority)}`}>
                    {comp.priority}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold border ${getStatusBadge(comp.status)}`}>
                    {comp.status}
                  </span>
                </div>

              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-stone-400 font-mono">
              No reported issues fit current selective parameters.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Complaint Detail Visualizer (Span 5) */}
      <div className="xl:col-span-5 space-y-6">
        {activeComplaint ? (
          <div id="complaint-visual-detail-card" className="bg-[#faf8f5] border border-[#eae0d5] rounded-xl shadow-xs overflow-hidden">
            
            {/* Header detail */}
            <div className="p-4 border-b border-[#eae1d6] bg-[#eae0d5]/40">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">{activeComplaint.id} Details</span>
                  <h3 className="text-sm font-sans font-bold text-stone-900 mt-0.5 leading-tight">{activeComplaint.category}</h3>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`px-2 py-1 rounded text-[10px] border font-mono font-bold block ${getStatusBadge(activeComplaint.status)}`}>
                    {activeComplaint.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-5">
              
              {/* Supporting proof picture (if any) */}
              {activeComplaint.imageUrl && (
                <div className="rounded-lg overflow-hidden border border-stone-200 shadow-sm max-h-48 bg-stone-100 relative group">
                  <img src={activeComplaint.imageUrl} alt="Complaint attachment proof" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white font-mono text-[9px] font-semibold">
                    CITIZEN MULTIMEDIA PROOF ATTACHED
                  </span>
                </div>
              )}

              {/* Geographic description */}
              <div className="text-xs bg-white p-3 rounded-lg border border-[#ede7e0]">
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#800020] mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#B38F00]" />
                  <span>IDENTIFIED GEOLOCATION</span>
                </div>
                <p className="text-stone-800 font-sans leading-relaxed">{activeComplaint.location.address}</p>
                <span className="text-[10px] font-mono text-stone-400 block mt-1">
                  Coords: {activeComplaint.location.lat.toFixed(4)}, {activeComplaint.location.lng.toFixed(4)} • Geotag Checked
                </span>
              </div>

              {/* Citizen Description narrative */}
              <div>
                <span className="text-[10px] font-mono text-stone-400 block mb-1">CITIZEN BRIEF:</span>
                <p className="text-xs text-stone-800 leading-relaxed font-sans font-medium whitespace-pre-wrap bg-white p-3 border border-[#ede7e0] rounded-lg">
                  {activeComplaint.description}
                </p>
                <div className="flex justify-between items-center mt-1.5 text-[10px] text-stone-400 font-mono">
                  <span>Reported by: {activeComplaint.citizenName}</span>
                  <span>Contact: {activeComplaint.citizenPhone}</span>
                </div>
              </div>

              {/* VETRI AI Triage Assist details if present */}
              {activeComplaint.aiAnalysis && (
                <div className="bg-[#1f1917] border border-[#B38F00] rounded-xl p-4 text-xs font-sans text-stone-300">
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold border-b border-stone-800 pb-2 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#B38F00]" />
                    <span>VETRI AI TRIAGE INSIGHT</span>
                  </div>

                  <p className="text-stone-300 mb-2 leading-relaxed">
                    <span className="font-mono text-[#B38F00] text-[10px] block mb-0.5">DECISION RATIONALE:</span>
                    {activeComplaint.aiAnalysis.reasoning}
                  </p>

                  {activeComplaint.aiAnalysis.publicSafetyNotice && (
                    <p className="text-red-300 mb-2 font-medium bg-red-950/40 p-2 rounded border border-red-900 leading-relaxed">
                      <span className="font-mono text-red-500 text-[10px] block font-bold uppercase">SAFETY THREAT ALARM:</span>
                      {activeComplaint.aiAnalysis.publicSafetyNotice}
                    </p>
                  )}

                  {activeComplaint.aiAnalysis.actionPlan && (
                    <div className="space-y-1 mt-2.5 border-t border-stone-800 pt-2.5">
                      <span className="text-[10px] font-mono text-[#B38F00] block mb-1">AUTO PROCEDURAL ACTION PLAN:</span>
                      <ul className="space-y-1 text-[11px] text-stone-300 font-sans">
                        {activeComplaint.aiAnalysis.actionPlan.map((pt, j) => (
                          <li key={j} className="flex gap-1.5 items-start">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Status Update Form (Zonal official execution tool) */}
              <div className="bg-white p-4 rounded-xl border border-stone-200">
                <h4 className="text-xs font-mono font-bold text-stone-900 border-b border-stone-100 pb-2 mb-3 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#800020]" />
                  MUNICIPAL ACTION CONSOLE
                </h4>
                
                <form onSubmit={handleUpdateStatusSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-stone-400 mb-1">Workflow Status</label>
                      <select
                        value={actionStatus}
                        onChange={(e) => setActionStatus(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded p-1.5 text-xs text-stone-700"
                      >
                        <option value="verified">Verified</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected/Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-stone-400 mb-1">Division Department</label>
                      <input
                        type="text"
                        disabled
                        value={activeComplaint.assignedDepartment}
                        className="w-full bg-stone-100 border border-stone-200 rounded p-1.5 text-xs text-stone-500 font-sans cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 mb-1">Official Resolution Remarks</label>
                    <textarea
                      rows={2}
                      required
                      value={actionRemarks}
                      onChange={(e) => setActionRemarks(e.target.value)}
                      placeholder="E.g., cold bituminous seal applied, compaction verified on site with zone sanitary officer."
                      className="w-full border border-stone-300 rounded p-2 text-xs font-sans placeholder-stone-400 focus:outline-[#800020]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full bg-stone-900 text-amber-300 py-2 rounded font-sans font-bold text-xs hover:bg-[#800020] hover:text-white transition-all cursor-pointer shadow-3xs"
                  >
                    {isUpdating ? "Updating state..." : "Transmit Resolution Status Update"}
                  </button>
                </form>
              </div>

              {/* Status Timeline Progress visually */}
              <div className="bg-white p-4 rounded-xl border border-[#ede7e0]">
                <h4 className="text-xs font-mono font-bold text-stone-900 border-b border-stone-100 pb-2 mb-3">
                  AUDITED ACTION TIMELINE
                </h4>
                <div className="space-y-3.5 relative pl-4 border-l-2 border-stone-100">
                  {activeComplaint.timeline.map((evt, idx) => (
                    <div key={evt.id} className="relative text-xs">
                      {/* Timeline status indicator node bullet */}
                      <span className={`absolute -left-[23px] top-1 rounded-full w-2.5 h-2.5 border-2 border-white ${
                        evt.status === "resolved" ? "bg-emerald-600 shadow-xs" :
                        evt.status === "in_progress" ? "bg-blue-600 animate-pulse" :
                        evt.status === "rejected" ? "bg-stone-500" : "bg-[#B38F00]"
                      }`} />
                      
                      <div className="flex justify-between items-start">
                        <strong className="text-stone-800 font-sans font-medium">{evt.title}</strong>
                        <span className="text-[9px] font-mono text-stone-400">
                          {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-stone-600 mt-0.5 text-[11px] font-sans leading-relaxed">{evt.description}</p>
                      <span className="text-[9px] font-mono text-stone-400 block mt-0.5">By: {evt.updatedBy}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crowdsourced Citizens Comments block */}
              <div className="bg-white p-4 rounded-xl border border-[#ede7e0] space-y-3">
                <h4 className="text-xs font-mono font-bold text-stone-900 border-b border-stone-100 pb-2">
                  DISCUSSIONS & REVIEWS ({activeComplaint.comments?.length || 0})
                </h4>

                {/* Comment feeds */}
                <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
                  {activeComplaint.comments && activeComplaint.comments.length > 0 ? (
                    activeComplaint.comments.map((comm) => (
                      <div key={comm.id} className="text-xs bg-stone-50 p-2.5 rounded border border-stone-100">
                        <div className="flex justify-between font-mono text-[9px] mb-1">
                          <span className={comm.role === "official" ? "text-amber-700 font-bold" : "text-stone-500 font-medium"}>
                            {comm.username} ({comm.role.toUpperCase()})
                          </span>
                          <span className="text-stone-400">
                            {new Date(comm.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-stone-700 text-[11px] leading-normal font-sans">{comm.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-stone-400 font-mono text-center py-2">
                      No citizen comments posted on this channel.
                    </p>
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-1 border-t border-stone-100">
                  <input
                    type="text"
                    required
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={currentUser?.role === "official" ? "Enter official authority announcement..." : "Post community review..."}
                    className="flex-1 border bg-stone-50 border-stone-300 rounded px-2.5 py-1.5 text-xs font-sans placeholder-stone-400 focus:outline-[#800020]"
                  />
                  <button
                    type="submit"
                    className="bg-[#800020] text-white px-3 py-1.5 rounded text-xs font-sans font-bold hover:bg-[#680018] transition-all cursor-pointer flex items-center gap-1 flex-shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </form>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#eae0d5] rounded-xl p-8 text-center text-xs text-stone-400 font-mono">
            No complaints loaded to inspect details.
          </div>
        )}
      </div>

    </div>
  );
}
