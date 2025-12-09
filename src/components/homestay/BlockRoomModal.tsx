'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface BlockRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { reason: string; blockedFrom?: string; blockedUntil?: string }) => void;
  roomNumber: string;
  isLoading?: boolean;
}

export default function BlockRoomModal({
  isOpen,
  onClose,
  onSubmit,
  roomNumber,
  isLoading,
}: BlockRoomModalProps) {
  const [reason, setReason] = useState('');
  const [blockedFrom, setBlockedFrom] = useState('');
  const [blockedUntil, setBlockedUntil] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      reason,
      blockedFrom: blockedFrom || undefined,
      blockedUntil: blockedUntil || undefined,
    });
    // Reset form
    setReason('');
    setBlockedFrom('');
    setBlockedUntil('');
  };

  const handleClose = () => {
    setReason('');
    setBlockedFrom('');
    setBlockedUntil('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Block Room</h2>
            <p className="text-sm text-slate-600 mt-1">Room {roomNumber}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason for Blocking *
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Enter reason (e.g., Under renovation, Maintenance required)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Block From Date (Optional)
              </label>
              <input
                type="date"
                value={blockedFrom}
                onChange={(e) => setBlockedFrom(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Block Until Date (Optional)
              </label>
              <input
                type="date"
                value={blockedUntil}
                onChange={(e) => setBlockedUntil(e.target.value)}
                min={blockedFrom || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                <strong>Note:</strong> This room will not be available for booking during the blocked period.
                {!blockedUntil && ' Leave end date empty to block indefinitely.'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Blocking...' : 'Block Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
