'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Grid, List, Building2, Sparkles, Zap, Home, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  useHomestays,
  useCreateHomestay,
  useUpdateHomestay,
  useDeleteHomestay,
  CreateHomestayDto,
  Homestay,
} from '@/services/homestay';
import HomestayCard from '@/components/homestay/HomestayCard';
import HomestayModal from '@/components/homestay/HomestayModal';
import { useRouter } from 'next/navigation';

export default function HomestaysPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHomestay, setSelectedHomestay] = useState<Homestay | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // React Query hooks
  const { data: homestays, isLoading } = useHomestays();
  const createMutation = useCreateHomestay();
  const updateMutation = useUpdateHomestay();
  const deleteMutation = useDeleteHomestay();

  const handleAddHomestay = () => {
    setSelectedHomestay(null);
    setIsModalOpen(true);
  };

  const handleEditHomestay = (homestay: Homestay) => {
    setSelectedHomestay(homestay);
    setIsModalOpen(true);
  };

  const handleDeleteHomestay = async (id: string) => {
    if (confirm('Are you sure you want to delete this homestay? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete homestay:', error);
      }
    }
  };

  const handleViewHomestay = (id: string) => {
    router.push(`/dashboard/homestays/${id}`);
  };

  const handleSubmit = async (data: CreateHomestayDto) => {
    try {
      if (selectedHomestay) {
        await updateMutation.mutateAsync({
          id: selectedHomestay.id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsModalOpen(false);
      setSelectedHomestay(null);
    } catch (error) {
      console.error('Failed to save homestay:', error);
    }
  };

  const filteredHomestays = homestays?.filter((homestay) =>
    homestay.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    homestay.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    homestay.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRooms = homestays?.reduce((sum, h) => sum + h.totalRooms, 0) || 0;
  const activeHomestays = homestays?.filter((h) => h.status === 'active').length || 0;
  const maintenanceHomestays = homestays?.filter((h) => h.status === 'maintenance').length || 0;

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 rounded-2xl p-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-purple-300 text-sm font-medium">Property Management</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Homestays 🏡
            </h1>
            <p className="text-slate-300 text-lg">
              Manage your homestay properties and rooms
            </p>
          </div>
          <button
            onClick={handleAddHomestay}
            className="hidden md:flex px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all font-medium items-center gap-2 border border-white/20"
          >
            <Plus className="w-5 h-5" />
            Add Homestay
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <Zap className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Homestays</p>
            <p className="text-3xl font-bold text-slate-900">{homestays?.length || 0}</p>
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
            <p className="text-3xl font-bold text-slate-900">{activeHomestays}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Total
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Rooms</p>
            <p className="text-3xl font-bold text-slate-900">{totalRooms}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/30">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Maintenance</p>
            <p className="text-3xl font-bold text-slate-900">{maintenanceHomestays}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search homestays by name, city, or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAddHomestay}
              className="md:hidden flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Homestays Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredHomestays && filteredHomestays.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredHomestays.map((homestay) => (
            <HomestayCard
              key={homestay.id}
              homestay={homestay}
              onEdit={handleEditHomestay}
              onDelete={handleDeleteHomestay}
              onView={handleViewHomestay}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No homestays found</h3>
          <p className="text-slate-600 mb-6">Get started by adding your first homestay property</p>
          <button
            onClick={handleAddHomestay}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium"
          >
            Add Homestay
          </button>
        </div>
      )}

      {/* Modal */}
      <HomestayModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedHomestay(null);
        }}
        onSubmit={handleSubmit}
        homestay={selectedHomestay}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
