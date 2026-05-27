/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export interface AIAnalysis {
  autoCategory: string;
  suggestedDepartment: string;
  calculatedPriority: 'low' | 'medium' | 'high' | 'critical';
  confidenceScore: number; // percentage
  reasoning: string;
  actionPlan: string[];
  publicSafetyNotice: string | null;
}

export interface Comment {
  id: string;
  username: string;
  role: 'citizen' | 'official';
  text: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  status: 'pending' | 'verified' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
  title: string;
  description: string;
  timestamp: string;
  updatedBy: string;
}

export interface Complaint {
  id: string;
  category: string;
  description: string;
  district: string;
  location: LocationData;
  imageUrl: string | null;
  citizenName: string;
  citizenPhone: string;
  status: 'pending' | 'verified' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  aiAnalysis?: AIAnalysis;
  assignedDepartment: string;
  upvotes: number;
  isGeotagged: boolean;
  comments: Comment[];
  timeline: TimelineEvent[];
}

export type UserRole = 'citizen' | 'official';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  district?: string;
  department?: string;
}

export interface DistrictStats {
  districtName: string;
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  criticalIssues: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

export interface DailyTrend {
  date: string;
  reported: number;
  resolved: number;
}
