import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

// Frontend API helpers
export const api = {
  // Base URL for the server
  baseUrl: `https://${projectId}.supabase.co/functions/v1/make-server-8f84e63c`,
  
  // Helper to make authenticated requests
  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  },

  // Complaint API methods
  async submitComplaint(complaint: any) {
    return this.request('/complaints', {
      method: 'POST',
      body: JSON.stringify(complaint),
    });
  },

  async getComplaints(filters: any = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/complaints${queryParams ? `?${queryParams}` : ''}`);
  },

  async getComplaintById(id: string) {
    return this.request(`/complaints/${id}`);
  },

  async updateComplaint(id: string, updates: any) {
    return this.request(`/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async assignComplaint(id: string, assignedTo?: string | null, assignedDepartment?: string, note?: string) {
    return this.request(`/complaints/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedTo, assignedDepartment, note }),
    });
  },

  async addComment(complaintId: string, comment: any) {
    return this.request(`/complaints/${complaintId}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  },

  async getCommentsByComplaint(complaintId: string) {
    return this.request(`/complaints/${complaintId}/comments`);
  },

  async reassignToDepartment(id: string, department: string, staff?: string, note?: string) {
    return this.request(`/complaints/${id}/reassign`, {
      method: 'POST',
      body: JSON.stringify({ department, staff, note }),
    });
  },

  async deleteComplaint(id: string) {
    return this.request(`/complaints/${id}`, {
      method: 'DELETE',
    });
  },

  // User API methods
  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async getUserById(id: string) {
    return this.request(`/users/${id}`);
  },

  async getUserByMobile(mobile: string) {
    return this.request(`/users/mobile/${mobile}`);
  },

  async getStaffUsers() {
    return this.request('/users/staff');
  },

  async authenticateStaff(username: string, password: string) {
    return this.request('/auth/staff', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // OTP API methods
  async sendOTP(mobile: string) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  },

  async verifyOTP(mobile: string, otp: string) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
  },

  // Analytics API methods
  async getStats() {
    return this.request('/analytics/stats');
  },

  async getCategoryStats() {
    return this.request('/analytics/categories');
  },

  async getTrendData() {
    return this.request('/analytics/trends');
  },
};