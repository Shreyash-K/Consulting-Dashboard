import React, { useState, useEffect } from 'react';
import { Inquiry, InquiryStatus } from '../types';
import { X, Mail, Building, Calendar, DollarSign, Bot, Loader2, Phone } from 'lucide-react';
import { analyzeInquiry } from '../services/geminiService';
import { supabaseService } from '../services/supabaseService';

interface Props {
  inquiry: Inquiry | null;
  onClose: () => void;
}

const InquiryDetail: React.FC<Props> = ({ inquiry, onClose }) => {
  const [analysis, setAnalysis] = useState<{ summary: string; sentiment: string; suggestedReply: string } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Reset state when inquiry changes
  useEffect(() => {
    setAnalysis(null);
    setLoadingAI(false);
    setStatusUpdating(false);
  }, [inquiry]);

  if (!inquiry) return null;

  const handleRunAI = async () => {
    setLoadingAI(true);
    const result = await analyzeInquiry(inquiry.message, `Client Name: ${inquiry.name}, Company: ${inquiry.company}`);
    setAnalysis(result);
    setLoadingAI(false);
  };

  const handleStatusChange = async (newStatus: InquiryStatus) => {
    setStatusUpdating(true);
    await supabaseService.updateStatus(inquiry.id, newStatus);
    setStatusUpdating(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col z-50 overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800">Inquiry Details</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
             <div>
               <h3 className="text-2xl font-bold text-slate-900">{inquiry.name}</h3>
               <div className="flex items-center text-slate-500 mt-1">
                 <Building className="w-4 h-4 mr-2" />
                 <span>{inquiry.company}</span>
               </div>
             </div>
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
               inquiry.status === 'NEW' ? 'bg-blue-50 text-blue-700 border-blue-100' :
               inquiry.status === 'CONTACTED' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
               inquiry.status === 'CLOSED' ? 'bg-green-50 text-green-700 border-green-100' :
               'bg-slate-50 text-slate-600 border-slate-200'
             }`}>
               {inquiry.status}
             </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mt-4">
            <div className="flex items-center text-slate-600">
              <Mail className="w-4 h-4 mr-2 text-slate-400" />
              {inquiry.email}
            </div>
            <div className="flex items-center text-slate-600">
              <Phone className="w-4 h-4 mr-2 text-slate-400" />
              {inquiry.phone || 'N/A'}
            </div>
            <div className="flex items-center text-slate-600">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              {new Date(inquiry.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center text-slate-600">
              <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
              {inquiry.budget || 'N/A'}
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Message */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Message</h4>
          <div className="bg-slate-50 p-4 rounded-lg text-slate-700 leading-relaxed border border-slate-200">
            {inquiry.message}
          </div>
        </div>

        {/* AI Analysis Section */}
        <div>
           <div className="flex items-center justify-between mb-3">
             <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center">
               <Bot className="w-4 h-4 mr-2 text-accent" />
               AI Insights
             </h4>
             {!analysis && (
               <button 
                 onClick={handleRunAI}
                 disabled={loadingAI}
                 className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md transition-colors flex items-center shadow-sm disabled:opacity-50"
               >
                 {loadingAI ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                 {loadingAI ? 'Analyzing...' : 'Generate Analysis'}
               </button>
             )}
           </div>

           {analysis && (
             <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg space-y-3">
                  <div className="flex gap-2">
                    <span className="text-xs font-bold text-indigo-800 bg-indigo-200 px-2 py-0.5 rounded">Summary</span>
                    <p className="text-sm text-indigo-900">{analysis.summary}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs font-bold text-indigo-800 bg-indigo-200 px-2 py-0.5 rounded">Sentiment</span>
                    <p className="text-sm text-indigo-900 font-medium">{analysis.sentiment}</p>
                  </div>
                </div>

                <div>
                   <span className="text-xs font-bold text-slate-500 uppercase">Suggested Reply</span>
                   <textarea 
                    className="w-full mt-2 p-3 text-sm text-slate-700 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent min-h-[150px]"
                    defaultValue={analysis.suggestedReply}
                   />
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-6 border-t border-slate-200 bg-slate-50">
        <h4 className="text-sm font-medium text-slate-500 mb-3">Update Status</h4>
        <div className="flex gap-2">
          <button 
            disabled={statusUpdating}
            onClick={() => handleStatusChange(InquiryStatus.CONTACTED)}
            className={`flex-1 py-2 rounded-md text-sm font-medium border shadow-sm transition-colors ${
              inquiry.status === InquiryStatus.CONTACTED 
              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
            }`}
          >
            Mark Contacted
          </button>
          <button 
            disabled={statusUpdating}
            onClick={() => handleStatusChange(InquiryStatus.CLOSED)}
            className={`flex-1 py-2 rounded-md text-sm font-medium border shadow-sm transition-colors ${
              inquiry.status === InquiryStatus.CLOSED
              ? 'bg-green-100 text-green-800 border-green-200'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
            }`}
          >
            Mark Closed
          </button>
        </div>
      </div>
    </div>
  );
};

export default InquiryDetail;