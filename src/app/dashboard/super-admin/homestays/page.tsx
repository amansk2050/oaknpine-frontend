'use client';

import React, { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { 
  Building2, 
  Search, 
  Mail, 
  Phone, 
  ShieldAlert, 
  Loader2, 
  Home,
  ChevronDown,
  ChevronUp,
  MapPin,
  Tag,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Room {
  id: string;
  roomNumber: string;
  roomName: string;
  roomType: string;
  capacity: number;
  pricePerHead: number;
  status: string;
}

interface HomestayData {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactNumber: string;
  email: string | null;
  totalRooms: number;
  status: string;
  ownershipType: string;
  createdAt: string;
  businessName: string | null;
  businessSlug: string | null;
  rooms: Room[];
}

export default function SuperAdminHomestaysPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  
  const [homestays, setHomestays] = useState<HomestayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'Owner' | 'Lease Owner'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionPending) return;

    if (!session?.user || session.user.roleType !== 'super_admin') {
      setError('Unauthorized access. Super Admin role required.');
      setLoading(false);
      return;
    }

    authClient.superAdmin.getHomestays()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message || 'Failed to fetch homestays');
        } else if (data) {
          setHomestays(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Network error. Failed to load homestays.');
        setLoading(false);
      });
  }, [session, sessionPending]);

  if (sessionPending || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading Global Homestays...</p>
      </div>
    );
  }

  if (error && (!session?.user || session.user.roleType !== 'super_admin')) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl border border-red-200 p-8 shadow-md text-center space-y-5">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-sm text-slate-500">Super Admin privileges are required to view this page.</p>
        <button onClick={() => router.push('/dashboard')} className="px-6 py-2.5 bg-slate-900 text-white font-semibold text-sm rounded-xl">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredHomestays = homestays.filter((h) => {
    const matchQuery = searchQuery.toLowerCase();
    const matchesSearch = (
      (h.name || '').toLowerCase().includes(matchQuery) ||
      (h.city || '').toLowerCase().includes(matchQuery) ||
      (h.state || '').toLowerCase().includes(matchQuery) ||
      (h.businessName || '').toLowerCase().includes(matchQuery)
    );

    if (!matchesSearch) return false;

    if (statusFilter !== 'all' && h.status !== statusFilter) return false;
    if (ownershipFilter !== 'all' && h.ownershipType !== ownershipFilter) return false;

    return true;
  });

  return (
    <div className="space-y-8" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
      
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Home className="w-8 h-8 text-emerald-600" />
          Global Properties & Homestays
        </h1>
        <p className="text-slate-500 mt-1.5">View and monitor homestays and rooms listed across all registered SaaS businesses.</p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Filter Controls Header */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Property Filters</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search homestay, city, business..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm"
              />
            </div>

            {/* Filter Status */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-700 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Filter Ownership */}
            <div className="relative">
              <select
                value={ownershipFilter}
                onChange={(e) => setOwnershipFilter(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-700 cursor-pointer"
              >
                <option value="all">All Ownerships</option>
                <option value="Owner">Owner</option>
                <option value="Lease Owner">Lease Owner</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table View */}
        {filteredHomestays.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-base font-semibold">No homestays found</p>
            <p className="text-sm mt-1">Try relaxing your filters or query terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 w-10"></th>
                  <th className="py-4 px-6">Homestay Details</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6 text-center">Rooms</th>
                  <th className="py-4 px-6 text-center">Ownership</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {filteredHomestays.map((h) => {
                  const isExpanded = expandedId === h.id;
                  
                  return (
                    <React.Fragment key={h.id}>
                      <tr 
                        onClick={() => toggleExpand(h.id)}
                        className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                      >
                        {/* Toggle button */}
                        <td className="py-4.5 px-6 text-center">
                          <button type="button" className="text-slate-400 hover:text-slate-700">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>

                        {/* Name & Tenant Business */}
                        <td className="py-4.5 px-6">
                          <div>
                            <div className="font-bold text-slate-900">{h.name}</div>
                            {h.businessName && (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-55 text-indigo-700 border border-indigo-100 mt-1">
                                <Building2 className="w-3 h-3" />
                                {h.businessName}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* City / State */}
                        <td className="py-4.5 px-6">
                          <div className="text-slate-800 font-medium">{h.city}</div>
                          <div className="text-xs text-slate-500">{h.state}</div>
                        </td>

                        {/* Total Rooms */}
                        <td className="py-4.5 px-6 text-center font-bold text-slate-900">
                          {h.totalRooms || h.rooms?.length || 0}
                        </td>

                        {/* Ownership Type */}
                        <td className="py-4.5 px-6 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            h.ownershipType === 'Lease Owner'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            <Tag className="w-3.5 h-3.5 shrink-0" />
                            {h.ownershipType || 'Owner'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4.5 px-6 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            h.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : h.status === 'maintenance'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}>
                            {h.status}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Section */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-slate-50/50 p-6 border-l-2 border-emerald-500 animate-fadeIn">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Left column: basic details */}
                              <div className="lg:col-span-1 space-y-4">
                                <div>
                                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">Description</h4>
                                  <p className="text-sm text-slate-655 mt-1 leading-relaxed">{h.description || 'No description provided.'}</p>
                                </div>
                                
                                <div>
                                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">Address</h4>
                                  <div className="flex items-start gap-1 text-sm text-slate-655 mt-1">
                                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <span>{h.address}, {h.city}, {h.state} - {h.pincode}</span>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">Contacts</h4>
                                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{h.contactNumber}</span>
                                  </div>
                                  {h.email && (
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{h.email}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right column: Rooms grid */}
                              <div className="lg:col-span-2 space-y-3">
                                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">Listed Rooms ({h.rooms?.length || 0})</h4>
                                {(!h.rooms || h.rooms.length === 0) ? (
                                  <p className="text-sm text-slate-450 italic">No rooms added to this property yet.</p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {h.rooms.map((room) => (
                                      <div key={room.id} className="bg-white p-3.5 rounded-xl border border-slate-200 flex justify-between items-center shadow-xs">
                                        <div>
                                          <div className="font-bold text-slate-900">Room {room.roomNumber}</div>
                                          <div className="text-xs text-slate-500 mt-0.5 uppercase tracking-wider">{room.roomType.replace('_', ' ')} • Max {room.capacity} Guests</div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-extrabold text-emerald-700 text-sm">₹{room.pricePerHead}/head</div>
                                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase mt-1 ${
                                            room.status === 'available'
                                              ? 'bg-emerald-50 text-emerald-700'
                                              : 'bg-red-50 text-red-700'
                                          }`}>
                                            {room.status}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
