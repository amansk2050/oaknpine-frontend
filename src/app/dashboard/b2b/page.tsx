'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Copy,
  Check,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  Link as LinkIcon,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { useB2bPartners, useCreateB2bPartner } from '@/services/b2b';

export default function B2bPartnersDashboard() {
  const { data: partners = [], isLoading } = useB2bPartners();
  const createPartnerMutation = useCreateB2bPartner();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleCopyLink = (slug: string) => {
    const portalUrl = `${window.location.protocol}//${window.location.host}/b2b/portal/${slug}`;
    navigator.clipboard.writeText(portalUrl);
    setCopiedSlug(slug);
    toast.success('Partner portal URL copied! 📋');
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !contactPerson || !email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createPartnerMutation.mutateAsync({
        businessName,
        contactPerson,
        email,
        phone: phone || undefined,
        notes: notes || undefined,
      });

      toast.success('B2B Partner created successfully! 🎉');
      setIsModalOpen(false);

      // Reset form
      setBusinessName('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setNotes('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create partner link');
    }
  };

  const filteredPartners = partners.filter((p) =>
    p.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 mb-8 border border-slate-700/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">B2B Integration</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">B2B Partners Network</h1>
            <p className="text-slate-300 text-lg">
              Generate magic portal links for travel agents and manage booking requests.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/b2b/requests"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors font-medium flex items-center gap-2"
            >
              View Requests Queue
              <ChevronRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Generate Partner Link
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search partners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>

        <div className="text-sm text-slate-500 font-medium">
          Total Partners: {partners.length}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
          <p className="text-slate-500">Loading B2B partners...</p>
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No B2B Partners Found</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Create your first B2B partner link so travel agents can start sending you booking requests directly.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generate Partner Link
          </button>
        </div>
      ) : (
        /* Partners Grid/List */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Business Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Person</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Portal URL</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Requests</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{partner.businessName}</div>
                      {partner.notes && (
                        <div className="text-xs text-slate-400 mt-1 max-w-[200px] truncate">{partner.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{partner.contactPerson}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{partner.email}</span>
                      </div>
                      {partner.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{partner.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyLink(partner.uniqueSlug)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 border border-slate-200 bg-slate-50 flex items-center gap-1.5 text-xs transition-colors font-medium"
                          title="Copy Partner Portal Link"
                        >
                          {copiedSlug === partner.uniqueSlug ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-full">
                        {partner.totalRequestsSent}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold leading-none ${
                          partner.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {partner.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Partner Link Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-emerald-500" />
                Generate Partner Link
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Create a magic portal link for travel agents to submit booking requests.
              </p>
            </div>

            <form onSubmit={handleCreatePartner}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunshine Travels Pvt Ltd"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Primary Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="partner@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Any internal notes about the partner..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPartnerMutation.isPending}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {createPartnerMutation.isPending && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  Generate Portal Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
