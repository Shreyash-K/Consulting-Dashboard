import { Inquiry, InquiryStatus } from './types';

export const GEMINI_MODEL_TEXT = 'gemini-3-flash-preview';

export const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Solutions',
    message: 'We are looking for a comprehensive audit of our cloud infrastructure. Can you provide a quote?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: InquiryStatus.NEW,
    budget: '$5k - $10k'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'm.chen@startups.io',
    phone: '+1 (555) 987-6543',
    company: 'Startups.io',
    message: 'Hi, I saw your case study on scaling React apps. We need similar help for our dashboard.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: InquiryStatus.CONTACTED,
    budget: '$10k+'
  },
  {
    id: '3',
    name: 'Sarah Smith',
    email: 'sarah.smith@retailgiant.com',
    phone: '+1 (555) 456-7890',
    company: 'Retail Giant',
    message: 'Urgent: Our database performance is degrading during peak hours. Need consultation immediately.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    status: InquiryStatus.NEW,
    budget: 'Undisclosed'
  },
  {
    id: '4',
    name: 'David Brown',
    email: 'dbrown@logistics.net',
    phone: '+1 (555) 111-2222',
    company: 'Fast Logistics',
    message: 'Do you offer training for junior developers? We have a team of 5 that needs TypeScript upskilling.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    status: InquiryStatus.CLOSED,
    budget: '$2k - $5k'
  },
  {
    id: '5',
    name: 'Emily White',
    email: 'emily@designstudio.org',
    phone: '+1 (555) 333-4444',
    company: 'Design Studio',
    message: 'Just checking if you handle UI/UX design as well or just engineering?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    status: InquiryStatus.NEW,
    budget: '< $2k'
  }
];

export const MOCK_NAMES = ['John Doe', 'Jane Smith', 'Robert Taylor', 'Lisa Wang', 'Chris Evans'];
export const MOCK_COMPANIES = ['Alpha Inc', 'Beta Corp', 'Gamma LLC', 'Delta Group', 'Epsilon Systems'];
export const MOCK_MESSAGES = [
  'Interested in your services for a new project.',
  'Can we schedule a call to discuss a potential partnership?',
  'Looking for React experts to join our team temporarily.',
  'We need help migrating our legacy system to the cloud.',
  'What represent your hourly rates for consultancy?'
];