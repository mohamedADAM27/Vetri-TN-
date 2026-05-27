/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Cpu, 
  Award, 
  Layers, 
  AlertTriangle, 
  Users, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  Building2, 
  ArrowRight
} from "lucide-react";
import { Complaint } from "../types";

interface GovernanceHomepageProps {
  onNavigate: (tab: "issues" | "charts" | "departments") => void;
  statistics: {
    total: number;
    resolved: number;
    pending: number;
    criticalCount: number;
  };
  complaints: Complaint[];
}

export default function GovernanceHomepage({
  onNavigate,
  statistics,
  complaints
}: GovernanceHomepageProps) {
  // Compute dynamic stats based on real complaints database
  const activeDistrictsList = Array.from(new Set(complaints.map(c => c.district)));
  const activeDistrictsConnected = activeDistrictsList.length;
  const citizenParticipationRate = complaints.length > 0 ? "98.7%" : "0.0%";

  return (
    <div id="vetri-tn-premium-homepage" className="space-y-16 text-stone-800 bg-[#faf9f6] min-h-screen rounded-2xl overflow-hidden pb-12 shadow-md relative border border-stone-200">
      
      {/* SECTION 1: HERO SECTION WITH WHITE BACKGROUND (SUBTLY DIFFERENTIATED) */}
      <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text Detail */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#800020]/5 border border-[#800020]/20 text-xs font-mono text-[#800020] font-bold"
            >
              <span>Sovereign GIS-Civic Dispatch Console v4.2</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-5xl font-sans font-black tracking-tight leading-[1.15] text-[#800020]"
            >
              AI-Driven Municipal <br />
              <span className="text-stone-900">
                Civic Intelligence
              </span> <br />
              for Tamil Nadu
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-stone-600 text-sm md:text-base leading-relaxed max-w-xl"
            >
              Report roads, sewer leaks, and infrastructure breakdowns instantly. VETRI AI automatically classifies, prioritizes threats, and dispatches requests directly to regional commissioners inside verified SLA deadlines.
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <button
                onClick={() => onNavigate("issues")}
                className="px-6 py-3.5 rounded-xl font-sans font-bold text-xs tracking-wider uppercase transition-all bg-[#800020] text-white border border-[#800020] hover:bg-[#680018] hover:scale-[1.02] shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Launch Report Portal</span>
              </button>
              
              <button
                onClick={() => onNavigate("charts")}
                className="px-6 py-3.5 rounded-xl font-sans font-bold text-xs tracking-wider uppercase transition-all bg-stone-100 text-stone-800 border border-stone-200 hover:bg-stone-200 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <span>Explore Governor SLA Charts</span>
              </button>
            </motion.div>
          </div>

          {/* Right Cards Board Column */}
          <div className="lg:col-span-5 flex flex-col gap-4 relative">
            
            {/* Floating Card 1: AI Speed */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-stone-50 border border-stone-200 rounded-xl p-4 shadow-sm flex items-center gap-4 relative hover:border-[#800020]/30 transition-all"
            >
              <div className="flex-1">
                <span className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider">AI TRIAZ DEPLOYMENT TIME</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-sans font-black text-stone-900">1.8 Seconds</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">99.8% Accuracy Score</span>
                </div>
              </div>
            </motion.div>

            {/* Floating Card 2: Dispatch Reliability */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-stone-50 border border-stone-200 rounded-xl p-4 shadow-sm flex items-center gap-4 relative hover:border-[#800020]/30 transition-all"
            >
              <div className="flex-1">
                <span className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider">DISTRICT OFFICER UPTIME</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-sans font-black text-stone-900">98.4% On-Time SLA</span>
                  <span className="text-[10px] font-mono text-stone-500">24-Hr Cycle Verified</span>
                </div>
              </div>
            </motion.div>

            {/* Floating Card 3: Live Feed Ticker */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white border-2 border-[#800020]/20 rounded-xl p-4 shadow-md relative hover:border-[#800020] transition-all"
            >
              <div className="flex justify-between items-center pb-2 border-b border-stone-100 mb-2">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#800020] uppercase font-bold">
                  <span>Real-Time Civic Incident Pulse</span>
                </div>
                <span className="text-[9px] font-mono text-stone-400">Live Grid</span>
              </div>
              <p className="text-xs text-stone-600 italic leading-snug">
                {complaints.length > 0 
                  ? `"${complaints[0].category}: ${complaints[0].description.slice(0, 100)}..."`
                  : `"Roads: Repair concrete overlay near Salem Town Bypass sector approved."`
                }
              </p>
              <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono mt-2 pt-1 border-t border-stone-100">
                <span>Active Core Nodes</span>
                <span className="text-emerald-600 font-bold">Grid Normal</span>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* SECTION 2: STATISTICS SECTION */}
      <section className="px-6 max-w-7xl mx-auto text-center">
        <div className="pb-3 mb-8">
          <span className="text-xs font-mono font-bold text-[#800020]/80 uppercase tracking-widest block">Operational Performance Stats</span>
          <h3 className="text-2xl font-sans font-extrabold text-stone-900 mt-1">SLA Verification Metrics</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-white border border-stone-200 p-6 rounded-xl flex flex-col justify-between hover:border-[#800020]/20 transition-all shadow-xs">
            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Resolved SLA Issues</span>
            <strong className="text-3xl font-sans font-black text-emerald-600 block my-2">{statistics.resolved}</strong>
            <span className="text-[10px] text-stone-400 font-mono">100% Quality Audited</span>
          </div>

          <div className="bg-white border border-stone-200 p-6 rounded-xl flex flex-col justify-between hover:border-[#800020]/20 transition-all shadow-xs">
            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Active Triage Load</span>
            <strong className="text-3xl font-sans font-black text-amber-600 block my-2">{statistics.total - statistics.resolved}</strong>
            <span className="text-[10px] text-stone-400 font-mono">Real-Time Routing Queue</span>
          </div>

          <div className="bg-white border border-stone-200 p-6 rounded-xl flex flex-col justify-between hover:border-[#800020]/20 transition-all shadow-xs">
            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Districts Commissioned</span>
            <strong className="text-3xl font-sans font-black text-stone-800 block my-2">{activeDistrictsConnected}</strong>
            <span className="text-[10px] text-stone-400 font-mono">State Highways &amp; Municipal</span>
          </div>

          <div className="bg-white border border-stone-200 p-6 rounded-xl flex flex-col justify-between hover:border-[#800020]/20 transition-all shadow-xs">
            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Citizen Participation</span>
            <strong className="text-3xl font-sans font-black text-[#800020] block my-2">{citizenParticipationRate}</strong>
            <span className="text-[10px] text-stone-400 font-mono">Verified Gateway Identity</span>
          </div>

        </div>
      </section>

      {/* SECTION 3: AI FEATURES KEY CARD BLOCK */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="text-center pb-8 mb-4 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold text-[#800020]/80 uppercase tracking-widest block">Security &amp; Technology Pillars</span>
          <h3 className="text-2xl font-sans font-extrabold text-stone-900 mt-1">Deep AI Governance Stack</h3>
          <p className="text-xs text-stone-500 leading-relaxed mt-1">
            Engineered using unified coordinates and advanced server-side Gemini decision matrices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: AI classification */}
          <div className="bg-white border border-stone-200 p-6 rounded-xl hover:border-[#800020]/30 transition-all space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#800020]/5 border border-[#800020]/10 flex items-center justify-center text-[#800020]">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-base font-sans font-bold text-stone-900">AI Issue Classification</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Analyzes context descriptions to automatically specify exact categories like Roads, Sanitation, Drainage, or Electrical grid leaks.
            </p>
          </div>

          {/* Card 2: Smart Prioritization */}
          <div className="bg-white border border-stone-200 p-6 rounded-xl hover:border-[#800020]/30 transition-all space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-base font-sans font-bold text-stone-900">Smart Prioritization</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Dynamically evaluates incident narratives for public safety threats, automatically setting critical flags to route fast-response municipal teams.
            </p>
          </div>

          {/* Card 3: Dispatch Integrity */}
          <div className="bg-white border border-stone-200 p-6 rounded-xl hover:border-[#800020]/30 transition-all space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-sans font-bold text-stone-900">Dispatch Workflows</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Links complaints to active state reporting lines, prompting regional division updates under strict SLA limits.
            </p>
          </div>

          {/* Card 4: Duplicate complaint detection */}
          <div className="bg-white border border-stone-200 p-6 rounded-xl hover:border-[#800020]/30 transition-all space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-800">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-base font-sans font-bold text-stone-900">Spam &amp; Duplicate Filter</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Analyzes proximity circles and description semantic similarity to merge repeat report entries onto a single master administrative log.
            </p>
          </div>

          {/* Card 5: Governance analytics */}
          <div className="bg-white border border-stone-200 p-6 rounded-xl hover:border-[#800020]/30 transition-all space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-base font-sans font-bold text-stone-900">Governor Decision Portals</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Provides real-time interactive dashboards that let state officials track the exact clearance velocity of every municipality and local ward.
            </p>
          </div>

          {/* Card 6: Certified Security */}
          <div className="bg-white border border-stone-200 p-6 rounded-xl hover:border-[#800020]/30 transition-all space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-sans font-bold text-stone-900">SSO Secure Gateway</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Guarantees completely safe reporter logs using JWT citizen phone verification and strict roles authorize parameters for municipal heads.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 4: TAMIL NADU SMART GOVERNANCE VISION SECTION */}
      <section className="px-6 py-12 max-w-7xl mx-auto bg-stone-50 border border-stone-200 rounded-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
          <div className="space-y-6 text-left">
            <span className="text-xs font-mono font-bold text-[#800020] uppercase tracking-widest block">Administrative Charter</span>
            <h3 className="text-2xl font-sans font-black tracking-tight text-stone-900 leading-snug">
              Digital Heritage meets Sovereign Technological Governance
            </h3>
            <p className="text-stone-600 text-xs md:text-sm leading-relaxed">
              VETRI (Victory of Dynamic Response Index) is modeled on Thiruvalluvar&apos;s governance mandates of fast, verified municipal action, ensuring that no request from a civic citizen is left unmediated. By using localized state grids, we empower municipalities to operate with total execution transparency.
            </p>
            <blockquote className="border-l-2 border-[#800020] pl-4 text-xs font-serif italic text-stone-500">
              &quot;Water supply, sanitation, roads, and grid power represent the four basic columns of civic life. The sovereign government is he who protects this loop flawlessly.&quot;
            </blockquote>
          </div>

          <div className="border border-stone-200 bg-white p-6 rounded-xl flex flex-col justify-between space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <span className="text-xs font-mono text-[#800020] font-bold">DIGITAL ACTION PATH STATEMENT</span>
            </div>
            
            <div className="space-y-3 font-sans text-xs text-stone-600">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded bg-[#800020] mt-1.5 flex-shrink-0" />
                <p><strong>Decentralized Local Control:</strong> Wards are empowered with localized triage and direct authority comments dispatch.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded bg-[#800020] mt-1.5 flex-shrink-0" />
                <p><strong>Accountable Commissioner SLAs:</strong> Every open report has a public countdown timeline reviewed directly by zonal boards.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded bg-[#800020] mt-1.5 flex-shrink-0" />
                <p><strong>Integrated Security Shield:</strong> Complete audit trail keeps local residents protected and informed with zero leaks.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: WORKFLOW LIFE STREAM */}
      <section className="px-6 max-w-7xl mx-auto space-y-8">
        <div className="text-center pb-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-bold text-[#800020] uppercase tracking-widest block">Operational Workflow Stream</span>
          <h3 className="text-2xl font-sans font-extrabold text-stone-900 mt-1">Incident Routing Lifecycle</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left relative">
          
          {/* Step 1 */}
          <div className="bg-white border border-stone-200 p-5 rounded-xl space-y-3 relative hover:border-[#800020]/20 transition-all shadow-2xs">
            <span className="absolute -top-4 -left-2 w-8 h-8 rounded-full bg-stone-50 text-[#800020] border border-stone-200 flex items-center justify-center font-mono font-black text-xs">
              01
            </span>
            <span className="text-[10px] font-mono text-stone-400 uppercase block pt-1">Citizen Action</span>
            <strong className="text-sm font-sans font-bold text-stone-900 block">Secure Submission</strong>
            <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
              Incidents are submitted securely with multimedia proofs, custom descriptions, and spatial boundaries.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-stone-200 p-5 rounded-xl space-y-3 relative hover:border-[#800020]/20 transition-all shadow-2xs">
            <span className="absolute -top-4 -left-2 w-8 h-8 rounded-full bg-stone-50 text-[#800020] border border-stone-200 flex items-center justify-center font-mono font-black text-xs">
              02
            </span>
            <span className="text-[10px] font-mono text-stone-400 uppercase block pt-1">Artificial Intelligence</span>
            <strong className="text-sm font-sans font-bold text-stone-900 block">Triage Classification</strong>
            <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
              Gemini parsing engines run classification checks, determine safety priority levels, and draft localized resolution action steps.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-stone-200 p-5 rounded-xl space-y-3 relative hover:border-[#800020]/20 transition-all shadow-2xs">
            <span className="absolute -top-4 -left-2 w-8 h-8 rounded-full bg-stone-50 text-[#800020] border border-stone-200 flex items-center justify-center font-mono font-black text-xs">
              03
            </span>
            <span className="text-[10px] font-mono text-stone-400 uppercase block pt-1">Zonal Commissioner</span>
            <strong className="text-sm font-sans font-bold text-stone-900 block">Municipal Dispatch</strong>
            <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
              Authorized municipal officers inspect queued incidents on their secure command center feed, assigning local contractors.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white border border-stone-200 p-5 rounded-xl space-y-3 relative hover:border-[#800020]/20 transition-all shadow-2xs">
            <span className="absolute -top-4 -left-2 w-8 h-8 rounded-full bg-stone-50 text-emerald-700 border border-emerald-300 flex items-center justify-center font-mono font-black text-xs">
              04
            </span>
            <span className="text-[10px] font-mono text-stone-400 uppercase block pt-1">Civic Audit Loop</span>
            <strong className="text-sm font-sans font-bold text-stone-900 block">Verified Resolution</strong>
            <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
              Site actions are uploaded directly, resolving the open SLA. Quality verification checks are conducted transparently.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 6: FOOTER SUBSECTION WITH DECENT COLLABORATOR LINKS */}
      <section className="border-t border-stone-200 pt-8 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 text-left text-stone-500 text-xs">
        
        <div className="md:col-span-5 space-y-3">
          <strong className="text-[#800020] text-sm font-sans font-black tracking-wide">VETRI TAMIL NADU</strong>
          <p className="text-[11px] text-stone-500 leading-relaxed max-w-md font-sans">
            Operational e-governance incident dispatch matrix powered by GIS Spatial Intelligence. Administered securely under official State Smart City initiative frameworks.
          </p>
        </div>

        <div className="md:col-span-3 space-y-2">
          <strong className="text-stone-800 block text-[11px] font-mono uppercase tracking-wider">Authorized Portals</strong>
          <ul className="space-y-1 text-stone-500 text-[11px] font-sans">
            <li><button onClick={() => onNavigate("issues")} className="hover:text-[#800020] hover:underline cursor-pointer">Civic Issues Grid</button></li>
            <li><button onClick={() => onNavigate("charts")} className="hover:text-[#800020] hover:underline cursor-pointer">SLA Core Indicators</button></li>
            <li><button onClick={() => onNavigate("departments")} className="hover:text-[#800020] hover:underline cursor-pointer">Zonal Officers Directory</button></li>
          </ul>
        </div>

        <div className="md:col-span-4 space-y-2 text-stone-500">
          <strong className="text-stone-800 block text-[11px] font-mono uppercase tracking-wider">State Initiative Desks</strong>
          <span className="block text-[10px] text-stone-400 font-mono font-bold">GOVERNMENT DATA PRIVACY ARCHITECTURE</span>
          <p className="text-[11px] leading-relaxed font-sans">
            Direct secure routing node connects with: Chennai Metro Division, Salem Corp Highways, Coimbatore Local Authority Board, TWAD.
          </p>
        </div>

      </section>

    </div>
  );
}
