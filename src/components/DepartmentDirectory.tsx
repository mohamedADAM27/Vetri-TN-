/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, CheckCircle, Clock, Award, PhoneCall } from "lucide-react";

interface Division {
  id: string;
  name: string;
  zonalScope: string;
  activeCount: number;
  solvedCount: number;
  slaPerformance: string; // percentage
  chiefOfficer: string;
  contact: string;
}

const TAMIL_NADU_DIVISIONS: Division[] = [
  {
    id: "div-1",
    name: "State Highways & Public Works Department (PWD)",
    zonalScope: "State Highway Networks, Expressways & Core Arterial Flyovers",
    activeCount: 3,
    solvedCount: 58,
    slaPerformance: "94.2%",
    chiefOfficer: "Er. K. Murugesan (C.E.)",
    contact: "044-25671234"
  },
  {
    id: "div-2",
    name: "Tamil Nadu Water Supply & Drainage Board (TWAD)",
    zonalScope: "Inter-district drinking distribution, sewage mains & filtration",
    activeCount: 4,
    solvedCount: 91,
    slaPerformance: "91.8%",
    chiefOfficer: "Dr. Selvaganesh (IAS)",
    contact: "0452-2586711"
  },
  {
    id: "div-3",
    name: "Greater Chennai Corporation Engineering Room & Local Wards",
    zonalScope: "Metropolitan public roads, street lights, local parks",
    activeCount: 8,
    solvedCount: 204,
    slaPerformance: "96.5%",
    chiefOfficer: "Thiru. J. Radhakrishnan (IAS)",
    contact: "044-25619258"
  },
  {
    id: "div-4",
    name: "Madurai Corporation Solid Waste Management Wing",
    zonalScope: "Solid waste disposal networks, sanitary landfill zones",
    activeCount: 2,
    solvedCount: 85,
    slaPerformance: "89.4%",
    chiefOfficer: "Smt. L. Chitra (Asst Comm)",
    contact: "0452-2531234"
  },
  {
    id: "div-5",
    name: "Coimbatore Municipal Corporation Electrical Department",
    zonalScope: "Peelamedu, Singanallur & Gandhipuram grid streetlighting",
    activeCount: 1,
    solvedCount: 112,
    slaPerformance: "93.1%",
    chiefOfficer: "Er. S. Palanisamy",
    contact: "0422-2301112"
  }
];

export default function DepartmentDirectory() {
  return (
    <div id="departmental-directory-panel" className="bg-white border border-[#eae0d5] rounded-xl shadow-sm p-6 overflow-hidden">
      
      {/* Directory Title */}
      <div className="pb-4 border-b border-[#f4f1ea] mb-5">
        <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#800020] uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-[#B38F00]" />
          <span>Governance Directory Registry</span>
        </div>
        <h3 className="text-base font-sans font-bold text-stone-900 mt-1">
          Authorized Tamil Nadu Civic Divisions
        </h3>
        <p className="text-xs text-stone-500 mt-0.5">
          Real-time service indicators, active responsibilities, and department heads
        </p>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TAMIL_NADU_DIVISIONS.map((division) => (
          <div 
            key={division.id}
            className="border border-[#ede7e0] bg-[#faf9f6]/40 p-4 rounded-xl flex flex-col justify-between hover:shadow-xs transition-shadow"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-xs font-sans font-bold text-[#800020] leading-tight flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded bg-amber-500 flex-shrink-0" />
                  {division.name}
                </h4>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                  SLA {division.slaPerformance}
                </span>
              </div>

              <p className="text-[11px] text-stone-600 font-sans mb-3.5">
                {division.zonalScope}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-4 text-stone-600">
                <div className="bg-white p-1.5 rounded border border-[#ede7e0] text-center">
                  <span className="block text-stone-400 text-[9px]">ACTIVE LOAD</span>
                  <strong className="text-[#800020] text-xs font-bold">{division.activeCount} open</strong>
                </div>
                <div className="bg-white p-1.5 rounded border border-[#ede7e0] text-center">
                  <span className="block text-stone-400 text-[9px]">SOLVED ARCHIVE</span>
                  <strong className="text-emerald-700 text-xs font-bold">{division.solvedCount} resolved</strong>
                </div>
              </div>
            </div>

            <div className="border-t border-[#ede7e0] pt-2.5 flex items-center justify-between text-[10px] text-stone-500 font-sans">
              <div>
                <span className="block text-[9px] font-mono text-stone-400 uppercase">Zonal Commissioner</span>
                <span className="font-medium text-stone-700">{division.chiefOfficer}</span>
              </div>
              <div className="text-right">
                <span className="block text-[9px] font-mono text-stone-400 uppercase">Emergency Desk</span>
                <a 
                  href={`tel:${division.contact}`}
                  className="font-mono text-[#800020] hover:underline font-bold flex items-center gap-1 justify-end"
                >
                  <PhoneCall className="w-2.5 h-2.5 text-[#B38F00]" />
                  {division.contact}
                </a>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
