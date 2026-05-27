/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { MapPin, Info, Compass, Sparkles } from "lucide-react";
import { Complaint, DistrictStats } from "../types";

interface TamilNaduMapProps {
  complaints: Complaint[];
  districtStats: DistrictStats[];
  selectedDistrict: string | null;
  onSelectDistrict: (district: string | null) => void;
  onMapPinSelect?: (lat: number, lng: number, address: string) => void;
}

// Coordinate locations approximation for SVG dimensions and positions (Map box: 500 x 600)
interface MapNode {
  name: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  description: string;
}

const DISTRICT_NODES: MapNode[] = [
  { name: "Chennai", x: 380, y: 70, lat: 13.0827, lng: 80.2707, description: "Capital Metro - High Density Tech Hub" },
  { name: "Kanchipuram", x: 340, y: 100, lat: 12.8342, lng: 79.7036, description: "Temple City & Weaver Industrial Zone" },
  { name: "Vellore", x: 260, y: 95, lat: 12.9165, lng: 79.1325, description: "Fort City & Premium Healthcare Hub" },
  { name: "Salem", x: 200, y: 190, lat: 11.6667, lng: 78.1133, description: "Steel City & Agricultural Transit" },
  { name: "Coimbatore", x: 90, y: 280, lat: 11.0168, lng: 76.9558, description: "Manchester of South India - Heavy Industry" },
  { name: "Trichy", x: 250, y: 290, lat: 10.8050, lng: 78.6856, description: "Rockfort Core - Central Connectivity Zone" },
  { name: "Thanjavur", x: 320, y: 310, lat: 10.7870, lng: 79.1378, description: "Granary of Tamil Nadu - Monument Heritage" },
  { name: "Madurai", x: 210, y: 380, lat: 9.9252, lng: 78.1198, description: "Ancient Temple City - Secondary Southern Corp" },
  { name: "Tuticorin", x: 215, y: 500, lat: 8.7642, lng: 78.1348, description: "Pearl Port Terminal & Coastal Logistics" },
  { name: "Tirunelveli", x: 160, y: 490, lat: 8.7139, lng: 77.7567, description: "Halwa Heritage - Scenic Dam Reserves" }
];

export default function TamilNaduMap({
  complaints,
  districtStats,
  selectedDistrict,
  onSelectDistrict,
  onMapPinSelect
}: TamilNaduMapProps) {

  // Retrieve stats for count rendering
  const getStats = (name: string) => {
    return districtStats.find(d => d.districtName === name) || {
      totalIssues: 0,
      resolvedIssues: 0,
      pendingIssues: 0,
      criticalIssues: 0
    };
  };

  // Compute color based on open/critical issues
  const getNodeColor = (name: string) => {
    const stats = getStats(name);
    const active = stats.totalIssues - stats.resolvedIssues;
    if (active === 0) return "border-emerald-600 bg-emerald-50 text-emerald-800 focus:ring-emerald-400";
    if (stats.criticalIssues > 0) return "border-red-600 bg-red-50 text-red-800 animate-pulse";
    if (active > 2) return "border-[#800020] bg-orange-50 text-[#800020]";
    return "border-[#B38F00] bg-yellow-50 text-[#800020]";
  };

  const handleNodeClick = (node: MapNode) => {
    onSelectDistrict(selectedDistrict === node.name ? null : node.name);
    if (onMapPinSelect) {
      onMapPinSelect(node.lat, node.lng, `${node.name} Central Ward, Municipal Zone, Tamil Nadu`);
    }
  };

  return (
    <div id="tamil-nadu-interactive-map" className="relative bg-white border border-[#eae0d5] rounded-xl p-5 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Map Header */}
      <div className="flex items-start justify-between border-b border-[#eae0d5] pb-3 mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#800020] uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive GIS Map Node</span>
          </div>
          <h3 className="text-lg font-sans font-semibold text-charcoal-700 mt-1">Tamil Nadu District Grid</h3>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-50 border border-amber-200 text-amber-800">
            <Sparkles className="w-2.5 h-2.5" />
            Click city to auto-locate form
          </span>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center min-h-[360px] bg-[#fdfbf7] rounded-lg border border-[#f0eae1] p-2 overflow-hidden">
        
        {/* Subtle Background Traditional Accent Pattern overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#800020_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>
        
        {/* Simplified SVG Map of Tamil Nadu underlay */}
        <svg viewBox="0 0 500 600" className="absolute inset-0 w-full h-full p-4 pointer-events-none select-none opacity-20">
          {/* General abstract shapes suggesting TM geographic coastal outline */}
          <path 
            d="M 350,55 L 420,80 L 440,110 L 390,200 L 410,260 L 360,330 L 380,360 L 350,420 L 300,430 L 250,520 L 220,580 L 160,570 L 130,520 L 110,480 L 140,430 L 110,380 L 80,340 L 70,260 L 110,200 L 160,140 L 220,120 L 260,110 Z" 
            fill="none" 
            stroke="#800020" 
            strokeWidth="2.5" 
            strokeDasharray="4 4"
          />
          <path 
            d="M 330,310 C 230,280 180,380 210,380" 
            fill="none" 
            stroke="#B38F00" 
            strokeWidth="1.5" 
          />
        </svg>

        {/* Dynamic Complaint Pins Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {complaints
            .filter(c => c.status !== "resolved")
            .map((c) => {
              // Approximate district node based on name to place visual pin
              const parentNode = DISTRICT_NODES.find(n => n.name.toLowerCase() === c.district.toLowerCase()) || DISTRICT_NODES[0];
              // Offset slightly by ID to avoid overlapping
              const uniqueOffsetIndex = (c.id.charCodeAt(c.id.length - 1) % 5) - 2;
              const px = parentNode.x + (uniqueOffsetIndex * 9);
              const py = parentNode.y + (uniqueOffsetIndex * -9);

              const isCritical = c.priority === "critical";

              return (
                <div 
                  key={`pin-${c.id}`} 
                  style={{ left: `${px}%`, top: `${py}%`, transform: 'translate(-50%, -100%)', position: 'absolute' }}
                  className="transition-all duration-300"
                >
                  <div className="relative group">
                    <span className={`inline-flex rounded-full h-3 w-3 ${isCritical ? 'bg-red-500 animate-ping' : 'bg-amber-400 animate-ping'} absolute`}></span>
                    <MapPin className={`w-5 h-5 ${isCritical ? 'text-red-700' : 'text-amber-700'} drop-shadow-md relative z-10`} />
                  </div>
                </div>
              );
            })}
        </div>

        {/* Nodes layer */}
        <div className="absolute inset-0 w-full h-full">
          {DISTRICT_NODES.map((node) => {
            const stats = getStats(node.name);
            const activeIssues = stats.totalIssues - stats.resolvedIssues;
            const isSelected = selectedDistrict === node.name;

            return (
              <motion.button
                key={node.name}
                id={`map-node-${node.name.toLowerCase()}`}
                onClick={() => handleNodeClick(node)}
                style={{ left: `${(node.x / 500) * 100}%`, top: `${(node.y / 600) * 100}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Visual Circle Marker with active glow */}
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                  isSelected 
                    ? "bg-[#800020] border-[#B38F00] text-white ring-4 ring-offset-2 ring-amber-400 scale-110" 
                    : getNodeColor(node.name)
                }`}>
                  {activeIssues}
                </div>

                {/* Subtitle tag */}
                <span className={`absolute top-9 left-1/2 -translate-x-1/2 px-2 py-0.5 whitespace-nowrap rounded text-[10px] font-sans font-medium border transition-all pointer-events-none drop-shadow-sm ${
                  isSelected 
                    ? "bg-[#800020] border-[#B38F00] text-amber-300 font-semibold"
                    : "bg-white border-[#eae0d5] text-charcoal-800 opacity-90 group-hover:opacity-100 group-hover:bg-[#eae0d5]"
                }`}>
                  {node.name}
                </span>

                {/* Tooltip Hover detail */}
                <div className="absolute bottom-11 left-1/2 -translate-x-1/2 pointer-events-none hidden group-hover:block bg-[#1a1311] text-white text-[11px] p-2 rounded shadow-xl w-48 z-40">
                  <div className="font-semibold text-amber-300 border-b border-stone-700 pb-1 mb-1">{node.name} Corporation</div>
                  <div className="mb-1 leading-relaxed opacity-90">{node.description}</div>
                  <div className="flex justify-between text-[10px] font-mono text-stone-300">
                    <span>Total: {stats.totalIssues}</span>
                    <span className="text-emerald-400">Fixed: {stats.resolvedIssues}</span>
                    <span className="text-red-400">Urgent: {stats.criticalIssues}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

      </div>

      {/* Map statistics summary footer */}
      <div className="bg-[#fdfbf7] p-3 rounded-lg border border-[#f0eae1] mt-3 flex items-start gap-2.5 text-[11px] leading-relaxed text-charcoal-700 select-none">
        <Info className="w-4 h-4 text-[#B38F00] flex-shrink-0 mt-0.5" />
        <div>
          {selectedDistrict ? (
            <p>
              Displaying issues filtered uniquely for <strong className="text-[#800020]">{selectedDistrict} Corporation</strong>. Click the selected city label again to reset globally.
            </p>
          ) : (
            <p>
              Hover over markers for district ward data or click a district unit. Localized issues can be filed by selecting coordinates directly relative to regional grids.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
