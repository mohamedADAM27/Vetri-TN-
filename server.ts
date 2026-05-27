/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { Complaint, User, AIAnalysis, TimelineEvent, Comment } from "./src/types.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initial Seed Data for VETRI TN (Initialized empty to start analytics at 0)
let complaints: Complaint[] = [];

interface UserWithPassword extends User {
  password?: string;
}

// Pre-registered official commissioners and citizen accounts with passwords
let users: UserWithPassword[] = [
  {
    id: "user-official-1",
    name: "Dr. J. Radhakrishnan, IAS",
    phone: "9840123456",
    password: "pwdChennaiAdmin",
    role: "official",
    district: "Chennai",
    department: "Municipal Administration & Water Supply Dept"
  },
  {
    id: "user-official-2",
    name: "Tmt. M. Prathiba, CE",
    phone: "9150123456",
    password: "pwdMaduraiAdmin",
    role: "official",
    district: "Madurai",
    department: "Corporation Engineering Division"
  },
  {
    id: "user-official-3",
    name: "Thiru S. Amirtharaj, EE",
    phone: "9042123456",
    password: "pwdCoimbatoreAdmin",
    role: "official",
    district: "Coimbatore",
    department: "TANGEDCO Electrical Grid Wing"
  },
  {
    id: "user-citizen-1",
    name: "Shreya Ramachandran",
    phone: "9003198765",
    password: "pwdCitizen123",
    role: "citizen"
  },
  {
    id: "user-citizen-2",
    name: "Siddharth Chandrasekhar",
    phone: "9444012345",
    password: "pwdSiddharth94",
    role: "citizen"
  }
];

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const api_key = process.env.GEMINI_API_KEY;

if (api_key && api_key !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: api_key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    console.log("Gemini API Client configured successfully to server-side.");
  } catch (err) {
    console.error("Failed to initialize server-side Gemini client:", err);
  }
} else {
  console.log("No custom Gemini API Key discovered. Operating on smart backup heuristic generator.");
}

// REST API Endpoints

// Authentication API (Real-looking gateway authentication database)
app.post("/api/auth/login", (req, res) => {
  const { phone, password, role } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: "Missing login inputs (Phone number and password are required)." });
  }

  const user = users.find(u => u.phone === phone);
  if (!user) {
    return res.status(401).json({ error: "Security Alert: Access denied. Mobile number is not registered on VETRI SCIG gateway." });
  }

  // Password matching verification
  if (user.password !== password) {
    return res.status(401).json({ error: "Security Alert: Authentication failed. Invalid secret passcode credentials." });
  }

  // Cross-reference interface roles
  if (role && user.role !== role) {
    return res.status(401).json({ error: `Security Alert: Access denied. Account is registered as a ${user.role}, not an ${role}.` });
  }

  // Return secure reference payload
  const { password: _, ...userWithoutPassword } = user;
  res.json({ token: "unified-jwt-key-scig-secure", user: userWithoutPassword });
});

app.post("/api/auth/register", (req, res) => {
  const { name, phone, password, role, district, department } = req.body;
  
  if (!name || !phone || !password || !role) {
    return res.status(400).json({ error: "Validation Error: Name, Mobile number, password, and gateway access mode are required." });
  }

  // Check if mobile matches existing
  const exists = users.some(u => u.phone === phone);
  if (exists) {
    return res.status(400).json({ error: "Validation Error: A user has already registered this mobile number on our state node." });
  }

  // Insert to registry
  const newUser: UserWithPassword = {
    id: `user-scig-${Math.floor(10000 + Math.random() * 90000)}`,
    name,
    phone,
    password,
    role,
    district: role === "official" ? (district || "Chennai") : undefined,
    department: role === "official" ? (department || "Joint E-Governance Bureau") : undefined
  };

  users.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ token: "unified-jwt-key-scig-secure", user: userWithoutPassword });
});

// GET complaints list
app.get("/api/complaints", (req, res) => {
  res.json(complaints);
});

// POST to create a new civic complaint
app.post("/api/complaints", async (req, res) => {
  const { category, description, district, location, citizenName, citizenPhone, imageUrl } = req.body;

  if (!category || !description || !district || !location) {
    return res.status(400).json({ error: "Missing required complaint parameters" });
  }

  const generatedId = `complaint-${101 + complaints.length + Math.floor(Math.random() * 500)}`;
  
  // Create skeletal new complaint
  const newComplaint: Complaint = {
    id: generatedId,
    category,
    description,
    district,
    location: {
      lat: Number(location.lat) || 13.0827,
      lng: Number(location.lng) || 80.2707,
      address: location.address || `Zone Ward, ${district}, Tamil Nadu`
    },
    imageUrl: imageUrl || null,
    citizenName: citizenName || "Citizen User",
    citizenPhone: citizenPhone || "9999999999",
    status: "pending",
    priority: "medium", // starting fallback
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedDepartment: `Municipal Corporation, ${district}`,
    upvotes: 1,
    isGeotagged: !!(location.lat && location.lng),
    comments: [],
    timeline: [
      {
        id: `tl-init-${Date.now()}`,
        status: "pending",
        title: "Complaint Received",
        description: "Complaint successfully uploaded via citizen smartphone applet.",
        timestamp: new Date().toISOString(),
        updatedBy: citizenName || "Citizen User"
      }
    ]
  };

  // Perform AI analysis
  let parsedAnalysis: AIAnalysis;

  if (ai) {
    try {
      console.log(`Analyzing new complaint server-side with Gemini API. Category: ${category}`);
      
      const prompt = `
        You are VETRI TN, the highly advanced, official AI triage agent of the Tamil Nadu Municipal Administration.
        Analyze this citizen infrastructure complaint and return a precise JSON analysis.
        
        Citizen Complaint Fields:
        - Reported Category: ${category}
        - Description: "${description}"
        - Tamil Nadu District: ${district}
        
        You must evaluate and output a JSON block that strictly conforms to this interface:
        {
          "autoCategory": "Verify category and choose the finest appropriate catalog (e.g. 'Road Infrastructure & Potholes', 'Waste Management & Garbage Dumping', 'Street Lights & Electricity', 'Water Supply & Sewage Leakage', 'Public Parks & Playgrounds', 'Traffic & Blockages')",
          "suggestedDepartment": "Name of specific Tamil Nadu department (e.g. 'Greater Chennai Corporation Parks Wing', 'Trichy Corporation Health Wing', 'State Highways PWD')",
          "calculatedPriority": "low", "medium", "high", or "critical" (Critical is ONLY for high biohazard, major traffic blocking of expressways, active danger of falling high-voltage lines, overflowing sewage at primary schools, etc.)",
          "confidenceScore": 0-100 integer rating,
          "reasoning": "A highly factual, human-sounding governance explanation of why you selected this priority and department (do not use systemese or technical variables)",
          "actionPlan": ["Step 1 concise action", "Step 2 concise action", "Step 3 concise action"],
          "publicSafetyNotice": "Concise safety warning for surrounding residents. (Null if no risk)"
        }

        Important styling rule: Write like an elegant, respectful, and structured public service officer of Tamil Nadu. DO NOT use any emojis.
        Response must be ONLY valid parseable JSON. Do not include markdown codeblocks or quotes.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "";
      console.log("Raw Gemini API Output:", responseText);

      parsedAnalysis = JSON.parse(responseText.trim());
      
      // Update complaint status parameters based on AI triage
      newComplaint.priority = parsedAnalysis.calculatedPriority || "medium";
      newComplaint.category = parsedAnalysis.autoCategory || category;
      newComplaint.assignedDepartment = parsedAnalysis.suggestedDepartment || newComplaint.assignedDepartment;
      newComplaint.aiAnalysis = parsedAnalysis;

      newComplaint.timeline.push({
        id: `tl-ai-${Date.now()}`,
        status: "verified",
        title: "VETRI AI Instant Triaged",
        description: `Verified by server-side AI model. Prioritized as [${newComplaint.priority.toUpperCase()}] assigned to [${newComplaint.assignedDepartment}].`,
        timestamp: new Date().toISOString(),
        updatedBy: "AI Core Engine"
      });

    } catch (err) {
      console.error("Gemini API server call failed. Deploying smart offline triage fallback.", err);
      parsedAnalysis = generateFallbackAnalysis(category, description, district);
    }
  } else {
    // Generate simulated smart response when GEMINI_API_KEY is inactive
    parsedAnalysis = generateFallbackAnalysis(category, description, district);
  }

  // Ensure fallback fits schema values
  if (!newComplaint.aiAnalysis) {
    newComplaint.priority = parsedAnalysis.calculatedPriority;
    newComplaint.category = parsedAnalysis.autoCategory;
    newComplaint.assignedDepartment = parsedAnalysis.suggestedDepartment;
    newComplaint.aiAnalysis = parsedAnalysis;
    newComplaint.timeline.push({
      id: `tl-ai-fb-${Date.now()}`,
      status: "verified",
      title: "VETRI Smart Triage Active (Heuristic Match)",
      description: `Civic metadata matched: prioritized as [${newComplaint.priority.toUpperCase()}] routed to [${newComplaint.assignedDepartment}].`,
      timestamp: new Date().toISOString(),
      updatedBy: "VETRI Analysis Core"
    });
  }

  // Push to local server state
  complaints.unshift(newComplaint);
  res.status(201).json(newComplaint);
});

// Helper for offline smart heuristics
function generateFallbackAnalysis(category: string, description: string, district: string): AIAnalysis {
  const dName = district || "Tamil Nadu Municipal Board";
  
  // Decide priority by scanning content
  let calculatedPriority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  let reasoning = `Automatic municipal router parsed structural keywords in the category ${category}.`;
  let safetyNotice: string | null = null;
  let actionPlan: string[] = [];

  const textToScan = description.toLowerCase();
  
  if (category.includes("Road")) {
    actionPlan = ["Cordon public sector pothole", "Pour durable cold bituminous filler", "Inspect grade quality"];
    if (textToScan.includes("accident") || textToScan.includes("slip") || textToScan.includes("danger")) {
      calculatedPriority = "high";
      reasoning = `Arterial link in ${dName} showing structural damage. swerve avoidance vectors trigger road safety alerts.`;
      safetyNotice = "SLIP CRATER HAZARD: Avoid speeding on this segment during damp hours.";
    } else {
      calculatedPriority = "medium";
      reasoning = `Standard road asphalt wear reported in ${dName}. Checked against municipal maintenance standards.`;
    }
  } else if (category.includes("Waste") || category.includes("Garbage")) {
    actionPlan = ["Dispatch heavy dump loaders", "Clear garbage storage bins", "Sanitize floor area with chloride powder"];
    if (textToScan.includes("smell") || textToScan.includes("drain") || textToScan.includes("overflow") || textToScan.includes("critical")) {
      calculatedPriority = "high";
      reasoning = `Unmanaged dump block in ${dName} causing potential drainage blockages and water stagnation hazard.`;
      safetyNotice = "BIOHAZARD WARNING: Keep pets clear of stagnating dump perimeters.";
    } else {
      calculatedPriority = "low";
      reasoning = `Standard civic waste overflow reported. Scheduled for standard secondary collection truck rotation.`;
    }
  } else if (category.includes("Water") || category.includes("Sewage")) {
    actionPlan = ["Shut main regional pipe valves", "Suck clogged sludge from pipeline", "Weld damaged supply connector"];
    if (textToScan.includes("primary school") || textToScan.includes("school") || textToScan.includes("contagion") || textToScan.includes("smelly")) {
      calculatedPriority = "critical";
      reasoning = `Raw waste backflow adjacent to high-sensitivity institution. Threat of bacterial contamination detected.`;
      safetyNotice = "CRITICAL PATHWAY DANGER: Do not come into contact with stagnant grey liquid.";
    } else {
      calculatedPriority = "high";
      reasoning = `Pipeline fracture reported near residential zone in ${dName}, triggering potential high supply waste lines drop.`;
    }
  } else if (category.includes("Street") || category.includes("Electricity")) {
    actionPlan = ["Open zone power distribution cabinet", "Secure cut/loose cable wires", "Affix high-efficiency LED heads"];
    if (textToScan.includes("shock") || textToScan.includes("wire") || textToScan.includes("exposed")) {
      calculatedPriority = "critical";
      reasoning = `High-voltage conductor cable exposed near pedestrian zone. Imminent electrocution warning active.`;
      safetyNotice = "DANGER LIVE VOLTAGE: Stay at least ten paces clear of iron lamppost base structure.";
    } else {
      calculatedPriority = "medium";
      reasoning = `Illumination outages in central pathway in ${dName}. Commuting safety risks during dark intervals.`;
    }
  } else {
    calculatedPriority = "medium";
    actionPlan = ["Verify onsite report coordinates", "Engage zonal division officer", "Monitor resolution progression"];
    reasoning = `Report catalogued under civic operations segment in ${dName}. Dispatching to local officer.`;
  }

  return {
    autoCategory: category,
    suggestedDepartment: `${dName} Corporation Joint Engineering Division`,
    calculatedPriority,
    confidenceScore: 82,
    reasoning,
    actionPlan,
    publicSafetyNotice: safetyNotice
  };
}

// POST upvote a complaint
app.post("/api/complaints/:id/upvote", (req, res) => {
  const { id } = req.params;
  const complaint = complaints.find(c => c.id === id);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  complaint.upvotes = (complaint.upvotes || 0) + 1;
  res.json({ id: complaint.id, upvotes: complaint.upvotes });
});

// POST update resolution status (Official Action)
app.post("/api/complaints/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, remarks, updatedBy } = req.body;

  if (!status) {
    return res.status(400).json({ error: "No status parameter provided" });
  }

  const complaint = complaints.find(c => c.id === id);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  complaint.status = status;
  complaint.updatedAt = new Date().toISOString();

  // Map nice labels
  let statusLabel = status.toUpperCase();
  if (status === "verified") statusLabel = "Authority Verified";
  if (status === "assigned") statusLabel = "Routing Complete";
  if (status === "in_progress") statusLabel = "Mobilized On-Site";
  if (status === "resolved") statusLabel = "Resolved Successfully";
  if (status === "rejected") statusLabel = "Rejected/Closed";

  complaint.timeline.push({
    id: `tl-update-${Date.now()}`,
    status: status,
    title: statusLabel,
    description: remarks || `Status moved to ${status} by municipal administration division.`,
    timestamp: new Date().toISOString(),
    updatedBy: updatedBy || "Zonal Municipal Officer"
  });

  res.json(complaint);
});

// POST add comment
app.post("/api/complaints/:id/comments", (req, res) => {
  const { id } = req.params;
  const { username, role, text } = req.body;

  if (!text || !username) {
    return res.status(400).json({ error: "Username and comment content are required" });
  }

  const complaint = complaints.find(c => c.id === id);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  const newComment: Comment = {
    id: `comm-${Date.now()}`,
    username,
    role: role || "citizen",
    text,
    createdAt: new Date().toISOString()
  };

  complaint.comments.push(newComment);
  res.json(newComment);
});

// GET general analytics API
app.get("/api/analytics", (req, res) => {
  // Aggregate stats
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === "resolved").length;
  const pending = complaints.filter(c => c.status === "pending").length;
  const inProgress = complaints.filter(c => c.status === "in_progress" || c.status === "assigned" || c.status === "verified").length;
  const criticalCount = complaints.filter(c => c.priority === "critical" && c.status !== "resolved").length;

  // Aggregate by Category
  const categoryCounts: Record<string, number> = {};
  complaints.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCounts).map(([name, value]) => {
    let color = "#800020"; // default maroon
    if (name.includes("Road")) color = "#B38F00"; // gold/ochre
    if (name.includes("Waste")) color = "#1b4d3e"; // forest green
    if (name.includes("Water")) color = "#005a9c"; // blue
    if (name.includes("Street")) color = "#ffb347"; // orange
    if (name.includes("Park")) color = "#4eb35c"; // light green
    return { name, value, color };
  });

  // Aggregate by district stats
  const districtList = ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tirunelveli", "Vellore", "Thanjavur"];
  const districtStats = districtList.map(dist => {
    const distComplaints = complaints.filter(c => c.district === dist);
    return {
      districtName: dist,
      totalIssues: distComplaints.length,
      resolvedIssues: distComplaints.filter(c => c.status === "resolved").length,
      pendingIssues: distComplaints.filter(c => c.status === "pending").length,
      criticalIssues: distComplaints.filter(c => c.priority === "critical" && c.status !== "resolved").length
    };
  });

  // Daily Trend calculation based on actual complaint database
  const dailyTrends = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Check start and end boundaries for today
    const dateStart = new Date(d);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(d);
    dateEnd.setHours(23, 59, 59, 999);
    
    const reported = complaints.filter(c => {
      const cDate = new Date(c.createdAt);
      return cDate >= dateStart && cDate <= dateEnd;
    }).length;

    const resolved = complaints.filter(c => {
      const cDate = new Date(c.updatedAt);
      return c.status === "resolved" && cDate >= dateStart && cDate <= dateEnd;
    }).length;

    return {
      date: dateStr,
      reported,
      resolved
    };
  });

  res.json({
    summary: {
      total,
      resolved,
      pending,
      inProgress,
      criticalCount
    },
    categoryDistribution: categoryData,
    districtStats,
    dailyTrends
  });
});

// Configure Vite or Production static files serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite Express development middleware.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Setting up production build file serving.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA routing fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VETRI TN Server running on host 0.0.0.0 at port ${PORT}`);
  });
}

startServer();
