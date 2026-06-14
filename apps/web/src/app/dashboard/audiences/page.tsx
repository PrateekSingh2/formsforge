"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Download, Filter, MoreHorizontal, Sparkles, Loader2, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchAudienceData } from "@/lib/supabase-actions";
import { useAuth } from "@/providers/auth-provider";
import { supabase } from "@/lib/supabase";

export default function AudiencesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [audienceData, setAudienceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;
      try {
        const data = await fetchAudienceData(user.uid);
        setAudienceData(data);
      } catch (error) {
        console.error("Failed to load audience data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    // Initial load
    loadData();

    // Auto-reload every 15 seconds as a fallback
    const interval = setInterval(loadData, 15000);
    
    // Supabase Realtime Hot-Reloading
    const channel = supabase.channel('audiences_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'submissions' },
        (payload) => {
          console.log('Hot Reload: New submission detected!', payload);
          loadData();
        }
      )
      .subscribe();
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [user]);

  const filteredData = audienceData.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ["Name,Email,Status,Forms Submitted,Last Active"];
    const rows = filteredData.map(u => `"${u.name}","${u.email}","${u.status}","${u.forms}","${u.lastActive}"`);
    const csvContent = headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "audience_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRunAnalysis = async () => {
    if (audienceData.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await fetch("/api/analyze-audience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audienceData })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error(err);
      setAnalysisResult("Failed to generate analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalContacts = audienceData.length;
  const activeUsers = audienceData.filter(u => u.status === 'Active').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-balsamiq text-[#333333] flex items-center gap-3">
            <Users className="w-8 h-8 text-[#8B5CF6]" />
            Audience
          </h1>
          <p className="text-gray-500 font-comic mt-1">Manage all the contacts you've collected across your forms.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-bold font-comic text-gray-600 hover:border-[#333333] transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border-2 border-[#333333] shadow-[4px_4px_0px_#333333] relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-100 rounded-full blur-2xl opacity-50"></div>
          <p className="text-sm font-bold text-gray-500 font-comic uppercase tracking-wider mb-2">Total Contacts</p>
          <h3 className="text-4xl font-black font-balsamiq text-[#333333]">{totalContacts}</h3>
          <p className="text-sm text-emerald-500 font-bold font-comic mt-2">Captured leads</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl border-2 border-[#333333] shadow-[4px_4px_0px_#333333] relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-50"></div>
          <p className="text-sm font-bold text-gray-500 font-comic uppercase tracking-wider mb-2">Active Users</p>
          <h3 className="text-4xl font-black font-balsamiq text-[#333333]">{activeUsers}</h3>
          <p className="text-sm text-gray-400 font-bold font-comic mt-2">Responded recently</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] p-6 rounded-2xl border-2 border-[#333333] shadow-[4px_4px_0px_#333333] flex flex-col justify-center text-white relative overflow-hidden">
          <Sparkles className="absolute -right-2 -bottom-2 w-32 h-32 opacity-10" />
          <h3 className="text-xl font-bold font-balsamiq mb-2">Audience Insights AI</h3>
          <p className="text-sm font-comic opacity-90 mb-4">Analyze your contacts to find your most engaged users automatically.</p>
          <button onClick={handleRunAnalysis} disabled={isAnalyzing || audienceData.length === 0} className="self-start px-4 py-2 bg-white text-[#8B5CF6] rounded-lg font-bold text-sm shadow-sm hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2">
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isAnalyzing ? "Analyzing..." : "Run Analysis"}
          </button>
        </motion.div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border-2 border-[#333333] shadow-[4px_4px_0px_#333333] overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b-2 border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 outline-none focus:border-[#8B5CF6] font-comic text-sm transition-colors"
            />
          </div>
          <div className="relative">
            <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className={`flex items-center gap-2 px-4 py-2 bg-white border-2 rounded-xl font-bold font-comic text-gray-600 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center ${statusFilter !== "All" ? "border-[#8B5CF6] text-[#8B5CF6]" : "border-gray-200"}`}>
              <Filter className="w-4 h-4" /> 
              {statusFilter === "All" ? "Filters" : statusFilter}
            </button>
            
            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border-2 border-[#333333] rounded-xl shadow-[4px_4px_0px_#333333] z-20 py-2"
                >
                  {["All", "Active", "Inactive"].map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setStatusFilter(opt); setShowFilterDropdown(false); }}
                      className="w-full text-left px-4 py-2 font-comic text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                    >
                      {opt} Status
                      {statusFilter === opt && <Check className="w-4 h-4 text-[#8B5CF6]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b-2 border-gray-100">
                <th className="px-6 py-4 font-balsamiq font-bold text-[#333333]">Contact</th>
                <th className="px-6 py-4 font-balsamiq font-bold text-[#333333]">Status</th>
                <th className="px-6 py-4 font-balsamiq font-bold text-[#333333]">Forms Submitted</th>
                <th className="px-6 py-4 font-balsamiq font-bold text-[#333333]">Last Active</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-comic">
                    No contacts found. Try publishing a form and collecting responses!
                  </td>
                </tr>
              ) : filteredData.map((user, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={user.id} 
                  className="hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-balsamiq ${user.color}`}>
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-[#333333] font-balsamiq">{user.name}</p>
                        <p className="text-sm text-gray-500 font-comic">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-comic ${
                      user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                      user.status === 'Inactive' ? 'bg-gray-100 text-gray-600' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-comic font-bold text-gray-600">
                    {user.forms}
                  </td>
                  <td className="px-6 py-4 font-comic text-sm text-gray-500">
                    {user.lastActive}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-[#8B5CF6] hover:bg-purple-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Analysis Modal */}
      <AnimatePresence>
        {analysisResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-[#333333]/40 backdrop-blur-sm" 
              onClick={() => setAnalysisResult(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white rounded-2xl border-2 border-[#333333] shadow-[8px_8px_0px_#333333] w-full max-w-2xl relative z-10 overflow-hidden"
            >
              <div className="p-4 border-b-2 border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-[#8B5CF6] font-balsamiq font-bold text-xl">
                  <Sparkles className="w-5 h-5" />
                  AI Audience Insights
                </div>
                <button onClick={() => setAnalysisResult(null)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 font-comic text-gray-700 leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                {analysisResult}
              </div>
              <div className="p-4 border-t-2 border-gray-200 bg-gray-50 flex justify-end">
                <button onClick={() => setAnalysisResult(null)} className="px-6 py-2 bg-[#8B5CF6] text-white border-2 border-[#333333] rounded-xl font-bold font-comic shadow-[4px_4px_0px_#333333] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#333333] transition-all">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
