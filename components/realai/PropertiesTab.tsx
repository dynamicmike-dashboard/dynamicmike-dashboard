"use strict";
import { useState } from 'react';
import { Property } from '@/lib/storage';
import { Bed, Bath, Frame, Search, Edit2, X, Save, MapPin, School, Hospital, Ship, ShoppingBag } from 'lucide-react';

const INITIAL_PROPERTIES: Property[] = [
    {
       id: '1',
       price: '$1,250,000',
       address: '123 Skyway Terrace, Ocean Side',
       beds: 4,
       baths: 3,
       sqft: '3,500',
       img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
       status: 'ACTIVE',
       statusColor: 'bg-green-500 text-white',
       proximityWaterfront: '0.2 miles',
       commuteTime: '15 mins',
       schools: 'Ocean View High (A+)',
       hospitals: 'General Hospital (2mi)',
       supermarkets: 'Whole Foods (1mi)'
    },
    {
       id: '2',
       price: '$850,000',
       address: '4508 Oak Avenue, Pasadena',
       beds: 3,
       baths: 2,
       sqft: '2,100',
       img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
       status: 'DRAFT',
       statusColor: 'bg-amber-400 text-slate-900', // Fixed mobile contrast
       proximityWaterfront: '15 miles',
       commuteTime: '30 mins',
       schools: 'Pasadena High',
       hospitals: 'City Medical (5mi)',
       supermarkets: 'Trader Joes (0.5mi)'
    }
];

export default function PropertiesTab() {
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit Form State
  const [editForm, setEditForm] = useState<Property | null>(null);

  const filteredProperties = properties.filter(p => 
    p.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.price.includes(searchTerm) ||
    p.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (prop: Property) => {
    setEditForm({ ...prop });
    setEditingId(prop.id);
  };

  const handleSave = () => {
    if (editForm) {
        setProperties(properties.map(p => p.id === editForm.id ? editForm : p));
        setEditingId(null);
        setEditForm(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editForm) {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      
      {/* Search Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input 
            type="text" 
            placeholder="Search properties by address, price, or status..." 
            className="flex-1 p-2 outline-none text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'Residential', 'Commercial', 'Price Range'].map((filter, i) => (
            <button 
                key={filter} 
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors whitespace-nowrap ${i === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}
            >
                {filter}
            </button>
        ))}
      </div>

      <div className="grid gap-6">
        {filteredProperties.map((prop) => (
            <div key={prop.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group">
                <div className="h-48 bg-slate-200 relative">
                    <img src={prop.img} className="w-full h-full object-cover" />
                    <span className={`absolute top-3 left-3 ${prop.statusColor} px-2 py-1 rounded-md text-[10px] font-black tracking-wider shadow-sm`}>
                        {prop.status}
                    </span>
                    <button 
                        onClick={() => handleEdit(prop)}
                        className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                        <Edit2 size={16} />
                    </button>
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-xl font-bold text-slate-900">{prop.price}</div>
                            <div className="text-sm text-slate-500 mb-4">{prop.address}</div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center gap-1"><Ship size={12}/> {prop.proximityWaterfront || 'N/A'}</div>
                        <div className="flex items-center gap-1"><MapPin size={12}/> {prop.commuteTime || 'N/A'}</div>
                        <div className="flex items-center gap-1"><School size={12}/> {prop.schools || 'N/A'}</div>
                        <div className="flex items-center gap-1"><Hospital size={12}/> {prop.hospitals || 'N/A'}</div>
                    </div>

                    <div className="flex gap-4 border-t border-slate-100 pt-3 text-slate-400 text-xs font-medium">
                        <span className="flex items-center gap-1"><Bed size={14}/> {prop.beds}</span>
                        <span className="flex items-center gap-1"><Bath size={14}/> {prop.baths}</span>
                        <span className="flex items-center gap-1"><Frame size={14}/> {prop.sqft} sqft</span>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingId && editForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Edit Property Details</h3>
                    <button onClick={() => setEditingId(null)} className="p-2 hover:bg-slate-200 rounded-full">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">AI Training Data (Personalized Info)</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><Ship size={12}/> Waterfront Proximity</label>
                            <input name="proximityWaterfront" value={editForm.proximityWaterfront} onChange={handleChange} className="w-full p-2 border rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><MapPin size={12}/> Commute Time</label>
                            <input name="commuteTime" value={editForm.commuteTime} onChange={handleChange} className="w-full p-2 border rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><School size={12}/> Schools</label>
                            <input name="schools" value={editForm.schools} onChange={handleChange} className="w-full p-2 border rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><Hospital size={12}/> Hospitals</label>
                            <input name="hospitals" value={editForm.hospitals} onChange={handleChange} className="w-full p-2 border rounded-lg text-sm" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><ShoppingBag size={12}/> Supermarkets</label>
                            <input name="supermarkets" value={editForm.supermarkets} onChange={handleChange} className="w-full p-2 border rounded-lg text-sm" />
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 my-4"></div>

                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Listing Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="price" value={editForm.price} onChange={handleChange} className="w-full p-2 border rounded-lg text-sm" placeholder="Price" />
                        <input name="address" value={editForm.address} onChange={handleChange} className="w-full p-2 border rounded-lg text-sm" placeholder="Address" />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button 
                        onClick={handleSave}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-500"
                    >
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
