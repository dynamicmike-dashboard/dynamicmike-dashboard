"use strict";
import { useEffect, useState } from 'react';
import { AgentConfig, Lead } from '@/lib/storage';
import { Users, Home, TrendingUp, Clock } from 'lucide-react';

interface DashboardTabProps {
  agent: AgentConfig;
}

export default function DashboardTab({ agent }: DashboardTabProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/leads?agentId=${agent.id}`)
      .then(res => res.json())
      .then(data => {
        setLeads(data.leads || []);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, [agent.id]);

  const stats = [
    { label: 'Total Leads', value: leads.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Properties', value: '290', icon: Home, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Response Rate', value: '98%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      
      {/* Welcome */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Overview for {agent.name}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Leads Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Recent Guard Captures</h3>
          <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
            {leads.length} New
          </span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {loading ? (
             <div className="p-8 text-center text-slate-400">Loading leads...</div>
          ) : leads.length === 0 ? (
             <div className="p-8 text-center text-slate-400">No leads captured yet. Enable Estate Guard to start.</div>
          ) : (
            leads.map((lead) => (
              <div key={lead.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                    {lead.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm">{lead.name}</h4>
                  <p className="text-xs text-slate-500">{lead.interest} • {lead.phone}</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded mt-1">
                        PENDING
                    </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
