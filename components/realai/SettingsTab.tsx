import { useState } from 'react';
import { AgentConfig } from '@/lib/storage';
import { Settings, Save, Palette, Key, Briefcase as BriefcaseIcon } from 'lucide-react';

const Field = ({ label, name, value, onChange, type = "text" }: any) => (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      <textarea 
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium text-sm min-h-[80px]" 
      />
    </div>
);

interface SettingsTabProps {
  agent: AgentConfig;
  onUpdate: (updates: Partial<AgentConfig>) => void;
}

export default function SettingsTab({ agent, onUpdate }: SettingsTabProps) {
  const [formData, setFormData] = useState(agent);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(formData);
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      
      {/* Identity Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-slate-500" />
          Agent Identity
        </h2>
        
        <div className="grid gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
            <input 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Agency Name</label>
            <input 
              name="agencyName"
              value={formData.agencyName}
              onChange={handleChange}
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bio (System Prompt)</label>
            <textarea 
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium min-h-[80px]" 
            />
          </div>
        </div>
      </div>

      {/* Branding Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
          <Palette className="w-5 h-5 text-purple-500" />
          Look & Feel
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Theme Color</label>
                 <div className="flex items-center gap-2">
                    <input 
                        type="color"
                        name="themeColor"
                        value={formData.themeColor}
                        onChange={handleChange}
                        className="w-10 h-10 rounded border border-slate-200 cursor-pointer"
                    />
                    <span className="font-mono text-sm text-slate-500">{formData.themeColor}</span>
                 </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Logo URL</label>
                <input 
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm text-slate-500" 
                />
            </div>
        </div>
      </div>

      {/* API Key Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
          <Key className="w-5 h-5 text-amber-500" />
          AI Brain
        </h2>
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Google Gemini API Key</label>
            <input 
              type="password"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              placeholder="AIza..."
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-mono text-sm" 
            />
            <p className="text-xs text-slate-400 mt-2">
                Your key is stored locally in <code>data/agents.json</code>.
            </p>
        </div>
      </div>

      {/* Business Knowledge Training */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
          <BriefcaseIcon className="w-5 h-5 text-emerald-600" />
          Business Knowledge Base
        </h2>
        <p className="text-sm text-slate-500 mb-6">Train your AI agent on your specific business details. Fill in as many as possible.</p>
        
        <div className="grid md:grid-cols-2 gap-6">
            <Field label="Terms & Conditions" name="termsAndConditions" value={formData.termsAndConditions} onChange={handleChange} />
            <Field label="Privacy Policy" name="privacyPolicy" value={formData.privacyPolicy} onChange={handleChange} />
            <Field label="NDA / Confidentiality" name="nda" value={formData.nda} onChange={handleChange} />
            <Field label="Location & Opening Hours" name="locationHours" value={formData.locationHours} onChange={handleChange} />
            <Field label="Service Areas" name="serviceAreas" value={formData.serviceAreas} onChange={handleChange} />
            <Field label="Commission Rates" name="commissionRates" value={formData.commissionRates} onChange={handleChange} />
            <Field label="Marketing Strategy" name="marketingStrategy" value={formData.marketingStrategy} onChange={handleChange} />
            <Field label="Team Members" name="teamMembers" value={formData.teamMembers} onChange={handleChange} />
            <Field label="Awards & Recognition" name="awards" value={formData.awards} onChange={handleChange} />
            <Field label="Legal Disclaimer" name="legalDisclaimer" value={formData.legalDisclaimer} onChange={handleChange} />
        </div>
      </div>

      <div className="flex justify-end">
        <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-500 disabled:opacity-50"
        >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

    </div>
  );
}
