"use strict";
import { BookOpen, Search, Edit, Settings } from 'lucide-react';

export default function UserManualTab() {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            User Manual
        </h2>
        <p className="text-slate-500 text-sm">Guide to using your new RealAI Agent features.</p>
      </div>

      <div className="space-y-4">
        
        {/* Search Feature */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-start gap-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                    <Search size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900">Portfolio Search</h3>
                    <p className="text-slate-500 text-sm mt-1">
                        Use the search bar in the <strong>Properties</strong> tab to instantly filter your portfolio. 
                        You can search by <strong>Address</strong> (e.g., "Pasadena"), <strong>Price</strong>, or <strong>Status</strong> (e.g., "Active").
                    </p>
                </div>
            </div>
        </div>

        {/* Property Training */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-start gap-4">
                <div className="bg-purple-50 text-purple-600 p-3 rounded-xl">
                    <Edit size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900">Training Property AI</h3>
                    <p className="text-slate-500 text-sm mt-1">
                        Click the <strong>Edit (Pencil)</strong> icon on any property card to open the Training Data editor. 
                        Add personalized details like <strong>Schools</strong>, <strong>Commute Times</strong>, and <strong>Waterfront Proximity</strong>. 
                        The AI agent uses this data to answer buyer questions more accurately.
                    </p>
                </div>
            </div>
        </div>

        {/* Business Settings */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-start gap-4">
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
                    <Settings size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900">Business Identity</h3>
                    <p className="text-slate-500 text-sm mt-1">
                        In the <strong>Settings</strong> tab, scroll down to the <strong>Business Knowledge Base</strong>. 
                        Fill in your Terms, Privacy Policy, Opening Hours, and other operational details. 
                        This ensures the AI stays compliant and helpful.
                    </p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
