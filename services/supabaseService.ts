import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Inquiry, InquiryStatus } from '../types';

// Helper to safely access env vars without crashing if process is undefined
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
  } catch {
    return undefined;
  }
};

const SUPABASE_URL = getEnv('SUPABASE_URL') || 'https://rhxxzvhemrzxvndolajg.supabase.co';
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoeHh6dmhlbXJ6eHZuZG9sYWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NjM5NjIsImV4cCI6MjA4MjAzOTk2Mn0.zY4NLNY7dIgaI9omKHX5QGCQwWE17GiGazYLL-T6YrE';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY.');
}

// Only create the client if we have a URL, otherwise export null to prevent runtime crash
export const supabase: SupabaseClient | null = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Key for storing statuses locally since we cannot modify the DB table
const STATUS_STORAGE_KEY = 'consultcrm_lead_statuses';

class SupabaseService {
  private statusMap: Record<string, InquiryStatus> = {};
  private onDataChange: ((data: Inquiry[]) => void) | null = null;
  private currentData: Inquiry[] = [];

  constructor() {
    this.loadLocalStatus();
  }

  private loadLocalStatus() {
    try {
      const stored = localStorage.getItem(STATUS_STORAGE_KEY);
      if (stored) {
        this.statusMap = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load local status', e);
    }
  }

  private saveLocalStatus() {
    try {
      localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(this.statusMap));
    } catch (e) {
      console.error('Failed to save status', e);
    }
  }

  private mapLeadToInquiry(lead: any): Inquiry {
    const id = lead.id.toString();
    // Use locally stored status if available, otherwise default to NEW
    const status = this.statusMap[id] || InquiryStatus.NEW;
    
    return {
      id: id,
      name: lead.name || 'Unknown',
      email: lead.email || '',
      phone: lead.phone || lead.phone_number || 'N/A',
      company: lead.brand_name || 'N/A', 
      message: lead.service_interest ? `Interested in: ${lead.service_interest}` : 'No details provided',
      createdAt: lead.created_at,
      status: status,
      budget: 'N/A'
    };
  }

  public async getInquiries(): Promise<Inquiry[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      return [];
    }

    this.currentData = (data || []).map(l => this.mapLeadToInquiry(l));
    return this.currentData;
  }

  public subscribe(callback: (data: Inquiry[]) => void) {
    this.onDataChange = callback;

    if (!supabase) {
      console.error("Cannot subscribe: Supabase client not initialized");
      // Return empty list so UI doesn't hang
      callback([]);
      return () => {};
    }

    // Initial fetch
    this.getInquiries().then(data => callback(data));

    // Real-time subscription to 'leads' table
    const channel = supabase
      .channel('leads-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          this.getInquiries().then(data => {
            if (this.onDataChange) {
              this.onDataChange(data);
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      this.onDataChange = null;
    };
  }

  public async updateStatus(id: string, status: InquiryStatus): Promise<void> {
    this.statusMap[id] = status;
    this.saveLocalStatus();

    this.currentData = this.currentData.map(item => 
      item.id === id ? { ...item, status } : item
    );

    if (this.onDataChange) {
      this.onDataChange(this.currentData);
    }
    
    // Simulate network delay for UX consistency
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

export const supabaseService = new SupabaseService();