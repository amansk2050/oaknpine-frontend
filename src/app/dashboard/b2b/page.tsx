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
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useB2bPartners,
  useCreateB2bPartner,
  useB2bInvitations,
  useCreateB2bInvitation,
  useRevokeInvitation,
} from '@/services/b2b';

type ActiveTab = 'partners' | 'invitations';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  expired: 'bg-slate-100 text-slate-500 border-slate-200',
  revoked: 'bg-red-50 text-red-700 border-red-200',
};

export default function B2bPartnersDashboard() {
  const { data: partners = [], isLoading } = useB2bPartners();
  const { data: invitations = [], isLoading: invitationsLoading } = useB2bInvitations();
  const createPartnerMutation = useCreateB2bPartner();
  const createInvitationMutation = useCreateB2bInvitation();
  const revokeInvitationMutation = useRevokeInvitation();

  const [activeTab, setActiveTab] = useState<ActiveTab>('invitations');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isLegacyModalOpen, setIsLegacyModalOpen] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Open invite modal — optionally pre-fill email from a legacy partner
  const openInviteModal = (email = '') => {
    setInviteEmail(email);
    setInviteNotes('');
    setIsInviteModalOpen(true);
  };

  // Invitation form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteNotes, setInviteNotes] = useState('');

  // Legacy partner form
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

  const handleCopyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.protocol}//${window.location.host}/b2b/invite/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedToken(token);
    toast.success('Invitation link copied! 🔗');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }
    try {
      await createInvitationMutation.mutateAsync({ invitedEmail: inviteEmail, notes: inviteNotes || undefined });
      toast.success('Invitation sent! 🎉');
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteNotes('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invitation');
    }
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !contactPerson || !email) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createPartnerMutation.mutateAsync({ businessName, contactPerson, email, phone: phone || undefined, notes: notes || undefined });
      toast.success('B2B Partner created successfully! 🎉');
      setIsLegacyModalOpen(false);
      setBusinessName(''); setContactPerson(''); setEmail(''); setPhone(''); setNotes('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create partner link');
    }
  };

  const handleRevokeInvitation = async (id: string) => {
    if (!confirm('Revoke this invitation? The partner will no longer be able to accept it.')) return;
    try {
      await revokeInvitationMutation.mutateAsync(id);
      toast.success('Invitation revoked');
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke invitation');
    }
  };

  const filteredPartners = partners.filter((p) =>
    p.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvitations = invitations.filter((i) =>
    i.invitedEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingInvitations = invitations.filter((i) => i.status === 'pending').length;

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 mb-6 border border-slate-700/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">B2B Integration</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">B2B Partners Network</h1>
            <p className="text-slate-300 text-sm md:text-base">
              Send invitation links to travel agents and manage their booking requests.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/b2b/partner/dashboard"
              className="px-4 py-2.5 bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-sm rounded-xl transition-all font-semibold flex items-center gap-1.5 text-sm"
            >
              Go to Partner Dashboard
            </Link>

            <Link
              href="/dashboard/b2b/requests"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors font-medium flex items-center gap-2 text-sm"
            >
              View Requests Queue
              <ChevronRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => openInviteModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] text-sm"
            >
              <Send className="w-4 h-4" />
              Send Invitation
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">
        <button
          onClick={() => setActiveTab('invitations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'invitations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Invitations
          {pendingInvitations > 0 && (
            <span className="w-5 h-5 flex items-center justify-center bg-emerald-500 text-white text-xs rounded-full">
              {pendingInvitations}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('partners')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'partners' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Booking Portal Links
          {partners.length > 0 && (
            <span className="w-5 h-5 flex items-center justify-center bg-slate-400 text-white text-xs rounded-full">
              {partners.length}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'invitations' ? 'Search by email...' : 'Search partners...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div className="text-sm text-slate-500 font-medium">
          {activeTab === 'invitations' ? `${invitations.length} invitations` : `${partners.length} partners`}
        </div>
      </div>

      {/* Invitations Tab */}
      {activeTab === 'invitations' && (
        <>
          {invitationsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : filteredInvitations.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
              <Send className="w-14 h-14 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Invitations Yet</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                Send invitation links to travel agents and tour operators to make them your B2B partners.
              </p>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
              >
                <Send className="w-4 h-4" />
                Send First Invitation
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Mobile: Card view */}
              <div className="block sm:hidden divide-y divide-slate-100">
                {filteredInvitations.map((inv) => (
                  <div key={inv.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{inv.invitedEmail}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Expires {new Date(inv.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[inv.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {inv.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleCopyInviteLink(inv.invitationToken)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            {copiedToken === inv.invitationToken ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedToken === inv.invitationToken ? 'Copied!' : 'Copy Link'}
                          </button>
                          <button
                            onClick={() => handleRevokeInvitation(inv.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table view */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sent</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expires</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInvitations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-900">{inv.invitedEmail}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[inv.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {inv.status === 'pending' && <Clock className="w-3 h-3" />}
                            {inv.status === 'accepted' && <CheckCircle className="w-3 h-3" />}
                            {inv.status === 'revoked' && <XCircle className="w-3 h-3" />}
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-500">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {inv.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleCopyInviteLink(inv.invitationToken)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                  {copiedToken === inv.invitationToken ? <><Check className="w-3.5 h-3.5 text-emerald-500" /><span className="text-emerald-600">Copied!</span></> : <><Copy className="w-3.5 h-3.5" />Copy Link</>}
                                </button>
                                <button
                                  onClick={() => handleRevokeInvitation(inv.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Revoke invitation"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Legacy Partners Tab */}
      {activeTab === 'partners' && (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setIsLegacyModalOpen(true)}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Booking Portal Link
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
              <Briefcase className="w-14 h-14 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Legacy Partners</h3>
              <p className="text-slate-500 mb-4 max-w-sm mx-auto text-sm">
                Use &quot;Send Invitation&quot; instead — it&apos;s the new and better way to onboard B2B partners.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Mobile card view */}
              <div className="block sm:hidden divide-y divide-slate-100">
                {filteredPartners.map((partner) => (
                  <div key={partner.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{partner.businessName}</p>
                        <p className="text-sm text-slate-600">{partner.contactPerson}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${partner.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {partner.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Mail className="w-3 h-3" />{partner.email}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyLink(partner.uniqueSlug)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        {copiedSlug === partner.uniqueSlug ? <><Check className="w-3.5 h-3.5 text-emerald-500" /><span className="text-emerald-600">Copied!</span></> : <><Copy className="w-3.5 h-3.5" />Copy Portal Link</>}
                      </button>
                      <button
                        onClick={() => openInviteModal(partner.email)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title={`Send invitation to ${partner.email}`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Invite
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table view */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Business Name</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Portal URL</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Requests</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Upgrade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPartners.map((partner) => (
                      <tr key={partner.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">{partner.businessName}</div>
                          {partner.notes && <div className="text-xs text-slate-400 mt-0.5 max-w-[180px] truncate">{partner.notes}</div>}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-700">{partner.contactPerson}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5"><Mail className="w-3 h-3" />{partner.email}</div>
                          {partner.phone && <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5"><Phone className="w-3 h-3" />{partner.phone}</div>}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleCopyLink(partner.uniqueSlug)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            {copiedSlug === partner.uniqueSlug ? <><Check className="w-3.5 h-3.5 text-emerald-500" /><span className="text-emerald-600">Copied!</span></> : <><Copy className="w-3.5 h-3.5" />Copy Link</>}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 bg-slate-100 text-slate-800 text-xs font-bold rounded-full">
                            {partner.totalRequestsSent}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${partner.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {partner.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => openInviteModal(partner.email)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                            title={`Send invitation to ${partner.email}`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            Send Invitation
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Send Invitation Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-500" />
                Send B2B Invitation
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                The partner will receive a secure invitation link to create their account.
              </p>
            </div>

            <form onSubmit={handleSendInvite}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Partner Email *</label>
                  <input
                    type="email" required
                    placeholder="partner@travelsco.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Internal Notes <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <textarea
                    placeholder="e.g. Corporate travel agent from Bangalore..."
                    value={inviteNotes}
                    onChange={(e) => setInviteNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-xs text-blue-700">
                    💡 A unique invitation link will be generated. Copy and share it with the partner — they&apos;ll create their own PineZone partner account to accept it.
                  </p>
                </div>
              </div>

              <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-sm font-medium">Cancel</button>
                <button type="submit" disabled={createInvitationMutation.isPending} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50">
                  {createInvitationMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Generate Invitation Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Legacy Generate Partner Link Modal */}
      {isLegacyModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-slate-500" />
                Create Booking Portal Link
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Generates an anonymous booking portal URL for this partner — no account needed on their side.
              </p>
            </div>

            <form onSubmit={handleCreatePartner}>
              <div className="p-5 space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Business Name *</label>
                  <input type="text" required placeholder="e.g. Sunshine Travels Pvt Ltd" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Person *</label>
                  <input type="text" required placeholder="e.g. Ramesh Kumar" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email *</label>
                  <input type="email" required placeholder="partner@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                    <input type="text" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>
                    <input type="text" placeholder="Optional notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm" />
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setIsLegacyModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-sm font-medium">Cancel</button>
                <button type="submit" disabled={createPartnerMutation.isPending} className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl transition-colors text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50">
                  {createPartnerMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Generate Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
