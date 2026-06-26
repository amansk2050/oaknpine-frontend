'use client';

import React, { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  FileText, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';

export default function ProfilePage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'user' | 'business'>('user');

  // User details state
  const [userName, setUserName] = useState('');
  const [roleType, setRoleType] = useState('Owner');

  // Business details state
  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessWebsite, setBusinessWebsite] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessGstin, setBusinessGstin] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [businessLogo, setBusinessLogo] = useState('');

  // Status / Feedback states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize fields once session is fetched
  useEffect(() => {
    if (session?.user) {
      setUserName(session.user.name || '');
      setRoleType(session.user.roleType || 'Owner');
    }
  }, [session]);

  // Fetch current business profile on load
  useEffect(() => {
    authClient.organization.getCurrent().then(({ data, error }) => {
      if (data && !error) {
        setBusinessName(data.name || '');
        setBusinessPhone(data.phone || '');
        setBusinessEmail(data.email || '');
        setBusinessWebsite(data.website || '');
        setBusinessAddress(data.address || '');
        setBusinessGstin(data.gstin || '');
        setBusinessDescription(data.description || '');
        setBusinessLogo(data.logo || '');
      }
    });
  }, []);

  // Save User Profile
  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const { error } = await authClient.profile.update({
      name: userName
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message || 'Failed to update user profile.');
    } else {
      setSuccessMsg('User profile updated successfully!');
      // Reload page to refresh session state
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }
  }

  // Save Business Profile
  async function handleSaveBusiness(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const { error } = await authClient.organization.updateCurrent({
      name: businessName,
      phone: businessPhone || null,
      email: businessEmail || null,
      website: businessWebsite || null,
      address: businessAddress || null,
      gstin: businessGstin || null,
      description: businessDescription || null,
      logo: businessLogo || null
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message || 'Failed to update business profile.');
    } else {
      setSuccessMsg('Business profile updated successfully!');
      // Clear alert after 3 seconds
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    }
  }

  if (sessionPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account & Profile Settings</h1>
        <p className="text-slate-500 mt-1.5">Manage your personal account credentials and organization business settings.</p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => { setActiveTab('user'); setSuccessMsg(null); setErrorMsg(null); }}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'user'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          User Profile
        </button>
        {roleType !== 'super_admin' && (
          <button
            onClick={() => { setActiveTab('business'); setSuccessMsg(null); setErrorMsg(null); }}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
              activeTab === 'business'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Business Profile
          </button>
        )}
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-850 px-4 py-3.5 rounded-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-850 px-4 py-3.5 rounded-xl flex items-center gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        
        {activeTab === 'user' && (
          <form onSubmit={handleSaveUser} className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Full Name</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-800 transition-all text-sm"
                  placeholder="Sk Aman"
                />
              </div>

              {/* Email (Read-only) */}
              <div className="flex flex-col gap-1.5 opacity-60">
                <label className="text-sm font-semibold text-slate-800">Email Address (Cannot change)</label>
                <input
                  type="email"
                  disabled
                  value={session?.user?.email || ''}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed text-sm"
                />
              </div>

              {/* System Role (Read-only) */}
              <div className="flex flex-col gap-1.5 opacity-60">
                <label className="text-sm font-semibold text-slate-800">System Role</label>
                <input
                  type="text"
                  disabled
                  value={roleType === 'super_admin' ? 'Super Admin' : (roleType === 'Lease Owner' ? 'Lease Owner' : 'Owner')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed text-sm font-medium"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 disabled:opacity-60 transition-all hover:scale-[1.02]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {loading ? 'Saving Changes...' : 'Save Personal Details'}
              </button>
            </div>
          </form>
        )}

        {/* ── BUSINESS PROFILE FORM ── */}
        {activeTab === 'business' && (
          <form onSubmit={handleSaveBusiness} className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Organization & Company Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Business / Agency Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-800 text-sm transition-all"
                    placeholder="Darjeeling Hills Retreat"
                  />
                </div>
              </div>

              {/* Official Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Official Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-800 text-sm transition-all"
                    placeholder="contact@agency.com"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Official Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-800 text-sm transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Website */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={businessWebsite}
                    onChange={(e) => setBusinessWebsite(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-800 text-sm transition-all"
                    placeholder="https://agency.com"
                  />
                </div>
              </div>

              {/* GSTIN */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">GSTIN / Registration Number</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={businessGstin}
                    onChange={(e) => setBusinessGstin(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-800 text-sm transition-all"
                    placeholder="19AAAAA0000A1Z5"
                  />
                </div>
              </div>

              {/* Logo URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800 flex items-center justify-between">
                  <span>Logo Image URL</span>
                  {businessLogo && (
                    <span className="text-xs text-emerald-600 font-semibold">Preview Available</span>
                  )}
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={businessLogo}
                    onChange={(e) => setBusinessLogo(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-800 text-sm transition-all"
                    placeholder="https://domain.com/logo.png"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-800">Physical Business Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  rows={2}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-800 text-sm transition-all resize-none"
                  placeholder="12 Hill Station Road, Darjeeling, West Bengal, 734101"
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-800">Business Description</label>
              <textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-800 text-sm transition-all resize-none"
                placeholder="Brief introduction of your homestay business or travel agency..."
              />
            </div>

            {/* Preview Banner */}
            {businessLogo && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
                <img 
                  src={businessLogo} 
                  alt="Business Logo Preview" 
                  className="w-16 h-16 object-contain bg-white rounded-lg border border-slate-200 p-1"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Logo Preview</h4>
                  <p className="text-xs text-slate-500 mt-0.5">This logo will display on invoices, booking slips, and business summaries.</p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 disabled:opacity-60 transition-all hover:scale-[1.02]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {loading ? 'Saving Changes...' : 'Save Business Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
