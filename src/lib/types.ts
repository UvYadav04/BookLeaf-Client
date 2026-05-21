export type UserRole = "author" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isAdmin: boolean;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isAdmin: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Book {
  id: string;
  authorId: string;
  title: string;
  isbn: string;
  genre: string;
  publicationDate?: string;
  status: string;
  mrp: number;
  totalCopiesSold: number;
  totalRoyaltyEarned: number;
  royaltyPaid: number;
  royaltyPending: number;
}

export interface Ticket {
  id: string;
  authorId: string;
  bookId?: string | null;
  imageUrl?: string | null;
  subject: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  category:
    | "Royalty & Payments"
    | "ISBN & Metadata Issues"
    | "Printing & Quality"
    | "Distribution & Availability"
    | "Book Status & Production Updates"
    | "General Inquiry";
  priority: "Critical" | "High" | "Medium" | "Low";
  assigneeId?: string | null;
  aiMeta?: {
    classification?: { category: string; confidence: number; source: string; reason?: string };
    priority?: { priority: string; confidence: number; source: string; reason?: string };
    draft?: { draft: string; source: string; reason?: string };
  };
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderRole: "author" | "admin";
  senderId: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}
