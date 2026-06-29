'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/services/axiosinstance';
import {
  usePackages,
  PackageStatus,
  PackageCategory,
  PackageType,
} from '@/services/packages';
import {
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  Loader2,
  Package,
} from 'lucide-react';

const categoryOptions = [
  { value: 'all', label: 'All Categories', emoji: '🌟' },
  { value: PackageCategory.ADVENTURE, label: 'Adventure', emoji: '🏔️' },
  { value: PackageCategory.HONEYMOON, label: 'Honeymoon', emoji: '💕' },
  { value: PackageCategory.FAMILY, label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { value: PackageCategory.BUDGET, label: 'Budget', emoji: '💰' },
  { value: PackageCategory.LUXURY, label: 'Luxury', emoji: '✨' },
  { value: PackageCategory.WEEKEND_GETAWAY, label: 'Weekend', emoji: '🌴' },
  { value: PackageCategory.PILGRIMAGE, label: 'Pilgrimage', emoji: '🙏' },
  { value: PackageCategory.WILDLIFE, label: 'Wildlife', emoji: '🦁' },
  { value: PackageCategory.CULTURAL, label: 'Cultural', emoji: '🎭' },
];

export default function PublicPackagesCatalog() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-[hsl(220,25%,97%)] space-y-4">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading catalog...</p>
      </div>
    }>
      <PublicPackagesCatalogContent />
    </Suspense>
  );
}

function PublicPackagesCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId') || '';
  const slug = searchParams.get('slug') || '';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch public organization branding details
  const { data: org } = useQuery<{
    name: string;
    slug: string;
    phone: string;
    email: string;
    website: string;
    address: string;
    logo: string;
    description: string;
  }>({
    queryKey: ['public-organization', orgId, slug],
    queryFn: async () => {
      const response = await axiosInstance.get('/auth/organization/public', {
        params: { orgId: orgId || undefined, slug: slug || undefined },
      });
      return response.data;
    },
  });

  // Fetch only ACTIVE (published) packages
  const { data: packages, isLoading, isError } = usePackages({
    status: PackageStatus.ACTIVE,
    organizationId: orgId || undefined,
    organizationSlug: slug || undefined,
  });

  // Filter packages locally for responsiveness and live search feel
  const filteredPackages = packages?.filter((pkg) => {
    const matchesSearch =
      search === '' ||
      pkg.name.toLowerCase().includes(search.toLowerCase()) ||
      pkg.destination.toLowerCase().includes(search.toLowerCase()) ||
      pkg.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || pkg.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[hsl(220,25%,97%)] text-[hsl(222,47%,11%)] overflow-x-hidden" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
      
      {/* ── PUBLIC HEADER ────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass shadow-lg shadow-black/5 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push(`/packages${(orgId || slug) ? `?${orgId ? `orgId=${orgId}` : `slug=${slug}`}` : ''}`)}>
            {org?.logo ? (
              <img src={org.logo} alt={org.name} className="h-8 w-auto object-contain" />
            ) : (
              <>
                <div className="w-8 h-8 text-emerald-700">
                  <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                    <path d="M16 3L6 14h5l-5 8h7v7h6v-7h7l-5-8h5L16 3z" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                    {org?.name ? org.name.split(' ')[0] : 'Oakn'}
                  </span>
                  <span className="text-[hsl(222,47%,11%)] ml-0.5">
                    {org?.name ? org.name.split(' ').slice(1).join(' ') : 'Pine'}
                  </span>
                </span>
              </>
            )}
          </div>

          {/* No sign-in/sign-up buttons here as this page is viewed by end customers */}
          <div />
        </div>
      </header>

      {/* ── HERO BANNER ───────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-indigo-900 via-emerald-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            Explore Verified Predefined Packages
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            Find Your Next Adventure
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Browse our hand-crafted, premium tour packages. Perfect rooms, curated schedules, and transparent pricing.
          </p>
        </div>
      </section>

      {/* ── SEARCH & FILTERS ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -translate-y-8 relative z-20">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/60 grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Search bar */}
          <div className="md:col-span-7 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by destination, package name, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-800"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-5 relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-800 appearance-none cursor-pointer"
            >
              {categoryOptions.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              ▼
            </div>
          </div>

        </div>
      </section>

      {/* ── PACKAGES LISTING ─────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
            <p className="text-slate-500 font-medium">Discovering best packages...</p>
          </div>
        )}

        {isError && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-red-500 font-semibold text-lg mb-2">Error loading packages</p>
            <p className="text-slate-500 text-sm">Please refresh the page or try again later.</p>
          </div>
        )}

        {!isLoading && !isError && filteredPackages?.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-1">No packages found</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              We couldn&apos;t find any packages matching your search or category filter. Try selecting &apos;All Categories&apos; or modifying your search terms.
            </p>
          </div>
        )}

        {!isLoading && !isError && filteredPackages && filteredPackages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => {
              // Calculate starting from price
              const minPricing = pkg.pricingTiers && pkg.pricingTiers.length > 0
                ? Math.min(...pkg.pricingTiers.map((p) => p.pricePerHead))
                : pkg.basePricePerHead;

              return (
                <div
                  key={pkg.id}
                  className="group bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer"
                  onClick={() => router.push(`/packages/${pkg.id}${(orgId || slug) ? `?${orgId ? `orgId=${orgId}` : `slug=${slug}`}` : ''}`)}
                >
                  {/* Thumbnail Image */}
                  <div className="relative h-56 overflow-hidden">
                    {pkg.thumbnailImage ? (
                      <img
                        src={pkg.thumbnailImage}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-700 text-white/40">
                        <Package className="w-16 h-16 text-white/50 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3.5 py-1.5 bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-bold rounded-full shadow-sm">
                        {categoryOptions.find((c) => c.value === pkg.category)?.emoji || '📦'}{' '}
                        {categoryOptions.find((c) => c.value === pkg.category)?.label || pkg.category}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2 line-clamp-1">
                        {pkg.name}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                        {pkg.description}
                      </p>

                      {/* Specs */}
                      <div className="flex flex-wrap gap-4 text-xs text-slate-600 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span>{pkg.destination || 'Multiple'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          <span>{pkg.numberOfNights}N/{pkg.numberOfDays}D</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-emerald-600" />
                          <span>{pkg.minPersons}-{pkg.maxPersons} Pax</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Starting from</p>
                        <p className="text-2xl font-black text-emerald-700 flex items-center">
                          <IndianRupee className="w-4 h-4" />
                          {Number(minPricing).toLocaleString('en-IN')}
                          <span className="text-xs text-slate-500 font-normal ml-0.5">/person</span>
                        </p>
                      </div>
                      
                      <button
                        className="p-3 bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white rounded-2xl transition-all duration-300 shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/packages/${pkg.id}${(orgId || slug) ? `?${orgId ? `orgId=${orgId}` : `slug=${slug}`}` : ''}`);
                        }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-[hsl(222,47%,7%)] text-white py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <p>© {new Date().getFullYear()} {org?.name || 'OaknPine Tourism'}. All rights reserved.</p>
            <p>Providing premium travel experiences in North Bengal & Sikkim.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
