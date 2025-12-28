import React from 'react';

export enum InquiryStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  CLOSED = 'CLOSED',
  SPAM = 'SPAM'
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  message: string;
  createdAt: string; // ISO Date string
  status: InquiryStatus;
  budget?: string;
}

export interface StatMetric {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}