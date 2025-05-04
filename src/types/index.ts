
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    name?: string;
    email?: string;
  };
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  university: string;
  major: string;
  graduation_year: string;
  bio?: string;
  interests?: string[];
  gender?: string;
  avatar_url?: string;
  additional_photos?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface VideoRoom {
  id: string;
  room_token: string;
  user1_id: string;
  user2_id: string;
  status: 'active' | 'ended';
  created_at: string;
  ended_at?: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  details?: string;
  room_id?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface ReportReason {
  id: string;
  label: string;
  description: string;
}

export interface MatchFilters {
  university?: string;
  gender?: string;
  major?: string;
  graduationYear?: string;
  maxDistance?: number;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export const UNIVERSITIES = [
  "Harvard University",
  "Yale University",
  "Princeton University",
  "Columbia University",
  "Brown University",
  "Dartmouth College",
  "University of Pennsylvania",
  "Cornell University"
];

export const REPORT_REASONS: ReportReason[] = [
  { id: "inappropriate", label: "Inappropriate Behavior", description: "User displayed inappropriate content or behavior" },
  { id: "harassment", label: "Harassment", description: "User engaged in harassment or bullying" },
  { id: "not_ivy", label: "Not Ivy League Student", description: "User does not appear to be an Ivy League student" },
  { id: "technical", label: "Technical Issues", description: "Technical problems during the call" },
  { id: "other", label: "Other", description: "Other issues not listed" }
];

export const INTERESTS = [
  "Computer Science", "Engineering", "Medicine", "Law", "Business",
  "Art & Design", "Literature", "Physics", "Mathematics", "Chemistry", "Biology",
  "Psychology", "Philosophy", "History", "Political Science", "Economics",
  "Music", "Film & Media", "Environmental Studies", "Social Sciences",
  "Entrepreneurship", "Athletics", "Debate", "Performing Arts", "Volunteering"
];
