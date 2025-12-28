import React, { useEffect, useState } from 'react';
import { supabaseService } from './services/supabaseService';
import { Inquiry, InquiryStatus } from './types';
import StatCard from './components/StatCard';
import InquiryDetail from './components/InquiryDetail';
import RecentActivityChart from './components/RecentActivityChart';
import { LayoutDashboard, MessageSquare, Bell, Search, Filter, Clock, ArrowRight, User, Building, Mail, Phone } from 'lucide-react';

export default function App() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<InquiryStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = supabaseService.subscribe((data) => {
      setInquiries(data);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Derived state for stats
  const totalInquiries = inquiries.length;
  const newInquiriesCount = inquiries.filter(i => i.status === InquiryStatus.NEW).length;
  const closedInquiriesCount = inquiries.filter(i => i.status === InquiryStatus.CLOSED).length;
  
  // Split inquiries into New (Active) and History
  const newInquiries = inquiries.filter(i => i.status === InquiryStatus.NEW);
  const historicInquiries = inquiries.filter(i => i.status !== InquiryStatus.NEW);

  // Search logic
  const matchesSearch = (inquiry: Inquiry) => 
    inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inquiry.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inquiry.email.toLowerCase().includes(searchQuery.toLowerCase());

  const filteredNewInquiries = newInquiries.filter(matchesSearch);
  
  const filteredHistory = historicInquiries.filter(inquiry => {
    const matchesStatus = filterStatus === 'ALL' || inquiry.status === filterStatus;
    return matchesStatus && matchesSearch(inquiry);
  });

  const selectedInquiry = inquiries.find(i => i.id === selectedInquiryId) || null;

  // Formatting helper for time
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* Simplified Sidebar - Just Branding */}
      <aside className="w-20 lg:w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center justify-center lg:justify-start lg:space-x-2">
           <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
             <LayoutDashboard className="w-6 h-6 text-white" />
           </div>
           <span className="font-bold text-xl tracking-tight hidden lg:block">ConsultCRM</span>
        </div>
        {/* No navigation links as requested - single screen focus */}
        <div className="flex-1 flex flex-col justify-end p-6">
           <div className="bg-slate-800 rounded-xl p-4 hidden lg:block">
             <p className="text-xs text-slate-400 mb-2">System Status</p>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-sm font-medium text-green-400">Live Updates On</span>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 lg:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
               <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">ConsultCRM</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-slate-500 text-sm">
             <span className="px-3 py-1 bg-slate-100 rounded-full border border-slate-200 flex items-center gap-2">
               <Clock className="w-3.5 h-3.5" />
               {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </span>
          </div>

          <div className="flex items-center space-x-4">
             <div className="relative">
               <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search inquiries..." 
                 className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 sm:w-64 transition-all"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
             <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
               <Bell className="w-5 h-5" />
               {newInquiriesCount > 0 && (
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
               )}
             </button>
             <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 border-2 border-white shadow-sm ring-2 ring-slate-100"></div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 bg-slate-50/50">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <StatCard 
              metric={{
                label: 'Total Inquiries',
                value: totalInquiries,
                icon: <MessageSquare className="w-5 h-5" />,
                change: '+12%',
                trend: 'up'
              }}
            />
            <StatCard 
              metric={{
                label: 'Action Required',
                value: newInquiriesCount,
                icon: <Bell className="w-5 h-5" />,
                change: 'Live',
                trend: newInquiriesCount > 0 ? 'up' : 'neutral'
              }}
            />
            <StatCard 
              metric={{
                label: 'Closed Deals',
                value: closedInquiriesCount,
                icon: <ArrowRight className="w-5 h-5" />,
                change: '+2%',
                trend: 'neutral'
              }}
            />
          </div>

          {/* New Inquiries Section - "Separately" */}
          {filteredNewInquiries.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  New Arrivals
                  <span className="text-xs font-normal text-slate-500 ml-2 px-2 py-0.5 bg-white border rounded-full">
                    {filteredNewInquiries.length} unread
                  </span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNewInquiries.map(inquiry => (
                  <div 
                    key={inquiry.id}
                    onClick={() => setSelectedInquiryId(inquiry.id)}
                    className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-slate-800 text-sm">{inquiry.name}</span>
                      </div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {formatTimeAgo(inquiry.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 mb-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Building className="w-3 h-3 text-slate-400" />
                        {inquiry.company}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {inquiry.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {inquiry.phone || 'N/A'}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed border-t border-slate-50 pt-3">
                      {inquiry.message}
                    </p>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                       <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Lead</span>
                       <span className="text-blue-600 text-xs font-medium group-hover:translate-x-1 transition-transform flex items-center">
                         Review <ArrowRight className="w-3 h-3 ml-1" />
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Table Section - History */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Inquiry History</h2>
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select 
                      className="py-1.5 text-sm border-none bg-transparent focus:ring-0 text-slate-600 font-medium cursor-pointer"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                    >
                      <option value="ALL">All Status</option>
                      <option value={InquiryStatus.CONTACTED}>Contacted</option>
                      <option value={InquiryStatus.CLOSED}>Closed</option>
                    </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/50 text-slate-900 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                          <div className="flex flex-col items-center gap-2">
                             <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                             <span>Loading data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredHistory.length === 0 ? (
                       <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                          No history found.
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((inquiry) => (
                        <tr key={inquiry.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{inquiry.name}</div>
                            <div className="text-xs text-slate-400 mt-1">{inquiry.company}</div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                              <span>{inquiry.email}</span>
                              <span className="text-slate-300">•</span>
                              <span>{inquiry.phone || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              inquiry.status === InquiryStatus.CONTACTED ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                              inquiry.status === InquiryStatus.CLOSED ? 'bg-green-50 text-green-700 border-green-100' :
                              'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {inquiry.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => setSelectedInquiryId(inquiry.id)}
                              className="text-slate-400 hover:text-blue-600 font-medium text-sm transition-colors"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Activity Volume</h3>
              <p className="text-sm text-slate-500 mb-6">Traffic over last 7 days.</p>
              <div className="flex-1 min-h-[200px]">
                <RecentActivityChart data={inquiries} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Slide-over Modal */}
      <InquiryDetail 
        inquiry={selectedInquiry} 
        onClose={() => setSelectedInquiryId(null)} 
      />

      {/* Overlay for mobile modal */}
      {selectedInquiryId && (
        <div 
          className="fixed inset-0 bg-slate-900/20 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedInquiryId(null)}
        />
      )}
    </div>
  );
}