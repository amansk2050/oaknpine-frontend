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
  ChevronDown,
  Briefcase
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BusinessStats {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  gstin: string | null;
  homestaysCount: number;
  bookingsCount: number;
}

export default function BusinessesPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  
  const [businesses, setBusinesses] = useState<BusinessStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'bookings' | 'homestays' | 'newest'>('newest');
  const [filterType, setFilterType] = useState<'all' | 'has_homestays' | 'has_bookings'>('all');
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLocalhost(
        window.location.hostname.includes('localhost') || 
        window.location.hostname === '127.0.0.1'
      );
    }
  }, []);

  useEffect(() => {
    if (sessionPending) return;

    if (!session?.user || session.user.roleType !== 'super_admin') {
      setError('Unauthorized access. Super Admin role required.');
      setLoading(false);
      return;
    }

    authClient.superAdmin.getStatistics()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message || 'Failed to fetch businesses');
        } else if (data) {
          setBusinesses(data.businesses || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Network error. Failed to load businesses.');
        setLoading(false);
      });
  }, [session, sessionPending]);

  if (sessionPending || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading SaaS Businesses...</p>
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

  const filteredBusinesses = businesses
    .filter((b) => {
      const matchQuery = searchQuery.toLowerCase();
      const matchesSearch = (
        (b.name || '').toLowerCase().includes(matchQuery) ||
        (b.slug || '').toLowerCase().includes(matchQuery) ||
        (b.email || '').toLowerCase().includes(matchQuery) ||
        (b.phone || '').includes(matchQuery)
      );

      if (!matchesSearch) return false;
      
      if (filterType === 'has_homestays') return b.homestaysCount > 0;
      if (filterType === 'has_bookings') return b.bookingsCount > 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'bookings') return b.bookingsCount - a.bookingsCount;
      if (sortBy === 'homestays') return b.homestaysCount - a.homestaysCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-8" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
      
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-emerald-600" />
          SaaS Tenants & Businesses
        </h1>
        <p className="text-slate-500 mt-1.5">Manage and monitor all travel business accounts and customer workspaces globally.</p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Filter Controls Header */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Workspace Filters</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, slug or contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-700 cursor-pointer"
              >
                <option value="all">All Businesses</option>
                <option value="has_homestays">Has Homestays</option>
                <option value="has_bookings">Has Bookings</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-700 cursor-pointer"
              >
                <option value="newest">Sort by Newest</option>
                <option value="name">Sort by Name</option>
                <option value="bookings">Sort by Bookings</option>
                <option value="homestays">Sort by Homestays</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table View */}
        {filteredBusinesses.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-base font-semibold">No businesses match the selection</p>
            <p className="text-sm mt-1">Try resetting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Business Profile</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Created Date</th>
                  <th className="py-4 px-6 text-center">Homestays</th>
                  <th className="py-4 px-6 text-center">Bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {filteredBusinesses.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/40 transition-colors">
                    
                    {/* Name & Slug */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{b.name || 'Unnamed Business'}</div>
                          <div className="text-xs text-slate-500 font-medium">slug: {b.slug}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contacts */}
                    <td className="py-4.5 px-6">
                      <div className="space-y-1 text-xs text-slate-600">
                        {b.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{b.email}</span>
                          </div>
                        )}
                        {b.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{b.phone}</span>
                          </div>
                        )}
                        {!b.email && !b.phone && (
                          <span className="text-slate-400 italic">No contact details</span>
                        )}
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="py-4.5 px-6 text-xs text-slate-500">
                      {new Date(b.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    {/* Homestays Count */}
                    <td className="py-4.5 px-6 text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border ${
                        b.homestaysCount > 0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {b.homestaysCount}
                      </span>
                    </td>

                    {/* Bookings Count */}
                    <td className="py-4.5 px-6 text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border ${
                        b.bookingsCount > 0
                          ? 'bg-violet-50 text-violet-750 border-violet-200'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {b.bookingsCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
