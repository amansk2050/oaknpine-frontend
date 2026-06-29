'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Package,
  Sparkles,
  Zap,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Star,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle2,
  FileText,
  Send,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  usePackages,
  usePackageStatistics,
  useDeletePackage,
  useUpdatePackageStatus,
  useCustomPackages,
  useDeleteCustomPackage,
  PackageStatus,
  PackageCategory,
  CustomPackageStatus,
  Package as PackageType,
  CustomPackage,
} from '@/services/packages';

export default function PackagesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'predefined' | 'custom'>('predefined');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PackageStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<PackageCategory | ''>('');
  const [customStatusFilter, setCustomStatusFilter] = useState<CustomPackageStatus | ''>('');

  // Queries
  const { data: packages, isLoading: packagesLoading } = usePackages({
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    search: searchQuery || undefined,
  });
  const { data: statistics } = usePackageStatistics();
  const { data: customPackages, isLoading: customLoading } = useCustomPackages({
    status: customStatusFilter || undefined,
    search: searchQuery || undefined,
  });

  // Mutations
  const deletePackageMutation = useDeletePackage();
  const updateStatusMutation = useUpdatePackageStatus();
  const deleteCustomMutation = useDeleteCustomPackage();

  const handleDeletePackage = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      await deletePackageMutation.mutateAsync(id);
    }
  };

  const handleDeleteCustomPackage = async (id: string) => {
    if (confirm('Are you sure you want to delete this custom package?')) {
      await deleteCustomMutation.mutateAsync(id);
    }
  };

  const handleToggleStatus = async (pkg: PackageType) => {
    const newStatus = pkg.status === PackageStatus.ACTIVE ? PackageStatus.INACTIVE : PackageStatus.ACTIVE;
    await updateStatusMutation.mutateAsync({ id: pkg.id, status: newStatus });
  };

  const getStatusBadge = (status: PackageStatus) => {
    const configs = {
      [PackageStatus.ACTIVE]: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '✅ Active' },
      [PackageStatus.INACTIVE]: { bg: 'bg-slate-100', text: 'text-slate-700', label: '⏸️ Inactive' },
      [PackageStatus.DRAFT]: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '📝 Draft' },
    };
    const config = configs[status] || configs[PackageStatus.DRAFT];
    return (
      <span className={`px-2 py-1 ${config.bg} ${config.text} text-xs font-bold rounded-full`}>
        {config.label}
      </span>
    );
  };

  const getCustomStatusBadge = (status: CustomPackageStatus) => {
    const configs = {
      [CustomPackageStatus.DRAFT]: { bg: 'bg-slate-100', text: 'text-slate-700', label: '📝 Draft' },
      [CustomPackageStatus.QUOTE_SENT]: { bg: 'bg-blue-100', text: 'text-blue-700', label: '📤 Quote Sent' },
      [CustomPackageStatus.NEGOTIATING]: { bg: 'bg-orange-100', text: 'text-orange-700', label: '🤝 Negotiating' },
      [CustomPackageStatus.CONFIRMED]: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '✅ Confirmed' },
      [CustomPackageStatus.CANCELLED]: { bg: 'bg-red-100', text: 'text-red-700', label: '❌ Cancelled' },
      [CustomPackageStatus.COMPLETED]: { bg: 'bg-purple-100', text: 'text-purple-700', label: '🎉 Completed' },
    };
    const config = configs[status] || configs[CustomPackageStatus.DRAFT];
    return (
      <span className={`px-2 py-1 ${config.bg} ${config.text} text-xs font-bold rounded-full`}>
        {config.label}
      </span>
    );
  };

  const getCategoryBadge = (category: PackageCategory) => {
    const configs: Record<PackageCategory, { emoji: string; label: string }> = {
      [PackageCategory.ADVENTURE]: { emoji: '🏔️', label: 'Adventure' },
      [PackageCategory.HONEYMOON]: { emoji: '💕', label: 'Honeymoon' },
      [PackageCategory.FAMILY]: { emoji: '👨‍👩‍👧‍👦', label: 'Family' },
      [PackageCategory.BUDGET]: { emoji: '💰', label: 'Budget' },
      [PackageCategory.LUXURY]: { emoji: '✨', label: 'Luxury' },
      [PackageCategory.WEEKEND_GETAWAY]: { emoji: '🌴', label: 'Weekend' },
      [PackageCategory.PILGRIMAGE]: { emoji: '🙏', label: 'Pilgrimage' },
      [PackageCategory.WILDLIFE]: { emoji: '🦁', label: 'Wildlife' },
      [PackageCategory.CULTURAL]: { emoji: '🎭', label: 'Cultural' },
    };
    const config = configs[category] || { emoji: '📦', label: category };
    return (
      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
        {config.emoji} {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 rounded-2xl p-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-indigo-300 text-sm font-medium">Package Management</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Tour Packages 🎒</h1>
            <p className="text-slate-300 text-lg">
              Create and manage predefined & custom tour packages
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => {
                const url = `${window.location.origin}/packages`;
                void navigator.clipboard.writeText(url);
                toast.success('🔗 Public packages catalog link copied to clipboard!');
              }}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all font-medium flex items-center gap-2 border border-white/20"
            >
              <Share2 className="w-5 h-5" />
              Share Packages
            </button>
            <button
              onClick={() => router.push('/dashboard/packages/custom/create')}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all font-medium flex items-center gap-2 border border-white/20"
            >
              <FileText className="w-5 h-5" />
              Custom Package
            </button>
            <button
              onClick={() => router.push('/dashboard/packages/create')}
              className="px-5 py-3 bg-white text-indigo-900 rounded-xl transition-all font-medium flex items-center gap-2 hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Package
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
                <Package className="w-6 h-6 text-white" />
              </div>
              <Zap className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Packages</p>
            <p className="text-3xl font-bold text-slate-900">{statistics?.predefinedPackages?.total || 0}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Active</p>
            <p className="text-3xl font-bold text-slate-900">{statistics?.predefinedPackages?.active || 0}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-yellow-500/10 hover:border-yellow-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg shadow-yellow-500/30">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Featured</p>
            <p className="text-3xl font-bold text-slate-900">{statistics?.predefinedPackages?.featured || 0}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Custom Packages</p>
            <p className="text-3xl font-bold text-slate-900">{statistics?.customPackages?.total || 0}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                <Send className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Quotes Sent</p>
            <p className="text-3xl font-bold text-slate-900">{statistics?.customPackages?.quoteSent || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('predefined')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'predefined'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-5 h-5" />
            Predefined Packages
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'custom'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-5 h-5" />
            Custom Packages
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'predefined' ? 'Search packages by name, destination...' : 'Search by customer name, email, reference...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            {activeTab === 'predefined' ? (
              <>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PackageStatus | '')}
                  className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">All Status</option>
                  <option value={PackageStatus.ACTIVE}>Active</option>
                  <option value={PackageStatus.INACTIVE}>Inactive</option>
                  <option value={PackageStatus.DRAFT}>Draft</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as PackageCategory | '')}
                  className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">All Categories</option>
                  <option value={PackageCategory.ADVENTURE}>Adventure</option>
                  <option value={PackageCategory.HONEYMOON}>Honeymoon</option>
                  <option value={PackageCategory.FAMILY}>Family</option>
                  <option value={PackageCategory.BUDGET}>Budget</option>
                  <option value={PackageCategory.LUXURY}>Luxury</option>
                  <option value={PackageCategory.WEEKEND_GETAWAY}>Weekend</option>
                </select>
              </>
            ) : (
              <select
                value={customStatusFilter}
                onChange={(e) => setCustomStatusFilter(e.target.value as CustomPackageStatus | '')}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">All Status</option>
                <option value={CustomPackageStatus.DRAFT}>Draft</option>
                <option value={CustomPackageStatus.QUOTE_SENT}>Quote Sent</option>
                <option value={CustomPackageStatus.NEGOTIATING}>Negotiating</option>
                <option value={CustomPackageStatus.CONFIRMED}>Confirmed</option>
                <option value={CustomPackageStatus.COMPLETED}>Completed</option>
                <option value={CustomPackageStatus.CANCELLED}>Cancelled</option>
              </select>
            )}
            <button
              onClick={() => router.push(activeTab === 'predefined' ? '/dashboard/packages/create' : '/dashboard/packages/custom/create')}
              className="md:hidden px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'predefined' ? (
        packagesLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : packages && packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                onView={() => router.push(`/dashboard/packages/${pkg.id}`)}
                onEdit={() => router.push(`/dashboard/packages/${pkg.id}/edit`)}
                onDelete={() => handleDeletePackage(pkg.id)}
                onToggleStatus={() => handleToggleStatus(pkg)}
                getStatusBadge={getStatusBadge}
                getCategoryBadge={getCategoryBadge}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No packages found"
            description="Create your first tour package to get started"
            buttonText="Create Package"
            onClick={() => router.push('/dashboard/packages/create')}
          />
        )
      ) : customLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : customPackages && customPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customPackages.map((pkg) => (
            <CustomPackageCard
              key={pkg.id}
              package={pkg}
              onView={() => router.push(`/dashboard/packages/custom/${pkg.id}`)}
              onEdit={() => router.push(`/dashboard/packages/custom/${pkg.id}/edit`)}
              onDelete={() => handleDeleteCustomPackage(pkg.id)}
              getStatusBadge={getCustomStatusBadge}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No custom packages found"
          description="Create a custom package for your customers"
          buttonText="Create Custom Package"
          onClick={() => router.push('/dashboard/packages/custom/create')}
        />
      )}
    </div>
  );
}

// Package Card Component
interface PackageCardProps {
  package: PackageType;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  getStatusBadge: (status: PackageStatus) => React.ReactNode;
  getCategoryBadge: (category: PackageCategory) => React.ReactNode;
}

function PackageCard({
  package: pkg,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  getStatusBadge,
  getCategoryBadge,
}: PackageCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const minPricing = pkg.pricingTiers?.reduce((min, tier) => 
    tier.pricePerHead < min ? tier.pricePerHead : min, 
    pkg.basePricePerHead
  ) || pkg.basePricePerHead;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 transition-all duration-300">
      {/* Image/Header */}
      <div className="relative h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        {pkg.thumbnailImage ? (
          <img src={pkg.thumbnailImage} alt={pkg.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-white/50" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          {getStatusBadge(pkg.status)}
          {pkg.isFeatured && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" /> Featured
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-white" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-10">
                <button
                  onClick={() => { onView(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" /> View
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/packages/${pkg.id}`;
                    void navigator.clipboard.writeText(url);
                    toast.success('🔗 Public share link copied to clipboard!');
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-emerald-700 font-semibold"
                >
                  <Share2 className="w-4 h-4" /> Share Link
                </button>
                <button
                  onClick={() => { onEdit(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => { onToggleStatus(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> 
                  {pkg.status === PackageStatus.ACTIVE ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-3 left-3">
          {getCategoryBadge(pkg.category)}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-xs text-indigo-600 font-medium mb-1">{pkg.packageCode}</p>
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{pkg.name}</h3>
        
        <div className="flex items-center gap-2 text-slate-600 text-sm mb-3">
          <MapPin className="w-4 h-4 text-indigo-500" />
          <span className="line-clamp-1">{pkg.destination}</span>
        </div>

        <div className="flex items-center gap-4 text-sm mb-4">
          <div className="flex items-center gap-1 text-slate-600">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span>{pkg.numberOfNights}N/{pkg.numberOfDays}D</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <Users className="w-4 h-4 text-blue-500" />
            <span>{pkg.minPersons}-{pkg.maxPersons} pax</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500">Starting from</p>
            <p className="text-xl font-bold text-emerald-600 flex items-center">
              <IndianRupee className="w-4 h-4" />
              {Number(minPricing).toLocaleString('en-IN')}
              <span className="text-xs text-slate-500 font-normal ml-1">/person</span>
            </p>
          </div>
          <button
            onClick={onView}
            className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

// Custom Package Card Component
interface CustomPackageCardProps {
  package: CustomPackage;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  getStatusBadge: (status: CustomPackageStatus) => React.ReactNode;
}

function CustomPackageCard({
  package: pkg,
  onView,
  onEdit,
  onDelete,
  getStatusBadge,
}: CustomPackageCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-purple-600 font-medium mb-1">{pkg.referenceCode}</p>
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{pkg.title}</h3>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-10">
              <button
                onClick={() => { onView(); setShowMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" /> View
              </button>
              <button
                onClick={() => { onEdit(); setShowMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => { onDelete(); setShowMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        {getStatusBadge(pkg.status)}
      </div>

      {/* Customer Info */}
      <div className="p-3 bg-slate-50 rounded-xl mb-4">
        <p className="text-sm font-semibold text-slate-900">{pkg.customerName}</p>
        <p className="text-xs text-slate-500">{pkg.customerEmail}</p>
        <p className="text-xs text-slate-500">{pkg.customerPhone}</p>
      </div>

      {/* Trip Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="w-4 h-4 text-purple-500" />
          <span className="line-clamp-1">{pkg.destinations.join(', ')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span>{pkg.numberOfNights}N/{pkg.numberOfDays}D</span>
          <span className="text-slate-400">•</span>
          <span>{new Date(pkg.travelStartDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="w-4 h-4 text-emerald-500" />
          <span>{pkg.numberOfAdults} Adults, {pkg.numberOfChildren} Children</span>
        </div>
      </div>

      {/* Pricing */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div>
          {pkg.totalQuotedPrice ? (
            <>
              <p className="text-xs text-slate-500">Quoted Price</p>
              <p className="text-lg font-bold text-emerald-600 flex items-center">
                <IndianRupee className="w-4 h-4" />
                {Number(pkg.totalQuotedPrice).toLocaleString('en-IN')}
              </p>
            </>
          ) : pkg.customerBudget ? (
            <>
              <p className="text-xs text-slate-500">Budget</p>
              <p className="text-lg font-bold text-slate-700 flex items-center">
                <IndianRupee className="w-4 h-4" />
                {Number(pkg.customerBudget).toLocaleString('en-IN')}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">No budget set</p>
          )}
        </div>
        <button
          onClick={onView}
          className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

function EmptyState({ title, description, buttonText, onClick }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-10 h-10 text-indigo-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6">{description}</p>
      <button
        onClick={onClick}
        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-medium"
      >
        {buttonText}
      </button>
    </div>
  );
}
