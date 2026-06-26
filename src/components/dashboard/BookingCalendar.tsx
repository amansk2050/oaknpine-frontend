'use client';

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useHomestays, useBookings } from '@/services';
import { Calendar, ChevronLeft, ChevronRight, Users, CheckCircle2, XCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isWithinInterval } from 'date-fns';
import { toast } from 'sonner';
import BookingDetailModal from './BookingDetailModal';
import { Booking } from '@/services/room-booking/types';

export default function BookingCalendar() {
  const queryClient = useQueryClient();
  const [selectedHomestayId, setSelectedHomestayId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch homestays
  const { data: homestays, isLoading: loadingHomestays } = useHomestays();

  // Set initial selected homestay
  useEffect(() => {
    if (homestays && homestays.length > 0 && !selectedHomestayId) {
      setSelectedHomestayId(homestays[0].id);
    }
  }, [homestays, selectedHomestayId]);

  // Fetch bookings for selected homestay
  const { data: bookings, isLoading: loadingBookings } = useBookings(
    selectedHomestayId ? { homestayId: selectedHomestayId } : undefined,
    { enabled: !!selectedHomestayId } as any
  );

  // Establish WebSocket connection for real-time updates
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL
      ? process.env.NEXT_PUBLIC_BACKEND_BASE_URL.replace('/api/v1', '')
      : 'http://localhost:4001';

    const socket = io(backendUrl);

    socket.on('connect', () => {
      console.log('Connected to PineZone real-time gateway');
    });

    socket.on('booking.created', (data: any) => {
      if (data.homestayId === selectedHomestayId) {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        toast.success(`New booking created for ${data.guestName}!`, {
          description: `Ref: ${data.bookingReference}`,
          icon: <Calendar className="w-5 h-5 text-emerald-500" />,
        });
      }
    });

    socket.on('booking.updated', (data: any) => {
      if (data.homestayId === selectedHomestayId) {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        toast.info(`Booking status updated for ${data.guestName}`, {
          description: `Status: ${data.status.replace('_', ' ').toUpperCase()}`,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedHomestayId, queryClient]);

  const activeHomestay = homestays?.find((h) => h.id === selectedHomestayId);
  const rooms = activeHomestay?.rooms || [];

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  // Helper to determine if a room is booked on a specific day, returning the booking
  const getBookingForRoomAndDay = (roomId: string, day: Date): Booking | null => {
    if (!bookings) return null;
    return (
      bookings.find((booking) => {
        // Exclude cancelled bookings from calendar
        if (booking.status === 'cancelled') return false;

        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);

        // Check if the booking includes this room
        const hasRoom = booking.rooms.some((r) => r.roomId === roomId);
        if (!hasRoom) return false;

        // Check if the day is within the booking checkIn/checkOut interval (inclusive checkIn, exclusive checkOut)
        const checkInTime = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate()).getTime();
        const checkOutTime = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate()).getTime();
        const dayTime = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();

        return dayTime >= checkInTime && dayTime < checkOutTime;
      }) || null
    );
  };

  // Get status color coding
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500/90 text-white hover:bg-emerald-600';
      case 'checked_in':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'checked_out':
        return 'bg-slate-500/80 text-white hover:bg-slate-600';
      case 'pending':
        return 'bg-amber-500/90 text-slate-900 hover:bg-amber-600';
      default:
        return 'bg-indigo-600 text-white hover:bg-indigo-700';
    }
  };

  if (loadingHomestays) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-slate-600 font-medium">Loading properties...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {/* Calendar Header Control Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Visual Room Scheduler
          </h2>
          <p className="text-slate-500 text-sm">Real-time room occupancy & reservation timeline</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Homestay Selector */}
          <select
            value={selectedHomestayId}
            onChange={(e) => setSelectedHomestayId(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {homestays?.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          {/* Month Navigation */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-white rounded-lg transition text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-slate-800 text-sm min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-white rounded-lg transition text-slate-600 hover:text-slate-900"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Timeline Scheduler */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="min-w-full border-collapse">
          {/* Header Row (Days of the Month) */}
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="sticky left-0 z-20 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700 border-r border-slate-200 min-w-[160px] shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                Room No / Details
              </th>
              {days.map((day) => (
                <th
                  key={day.toISOString()}
                  className={`px-2 py-3 text-center border-r border-slate-200 min-w-[45px] text-xs font-semibold ${
                    day.getDay() === 0 || day.getDay() === 6
                      ? 'bg-slate-100/70 text-slate-700'
                      : 'text-slate-500'
                  } ${isSameDay(day, new Date()) ? 'bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20' : ''}`}
                >
                  <div>{format(day, 'E')}</div>
                  <div className="text-sm mt-0.5">{format(day, 'd')}</div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Rooms Rows */}
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={days.length + 1} className="text-center py-8 text-slate-400 font-medium">
                  No rooms configured for this homestay yet.
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                  {/* Room Label */}
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 border-r border-slate-200 font-medium text-slate-800 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                    <div className="font-semibold text-slate-900">{room.roomNumber}</div>
                    <div className="text-[10px] text-slate-500 capitalize flex items-center gap-1 mt-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          room.roomType === 'view' ? 'bg-cyan-500' : 'bg-slate-400'
                        }`}
                      />
                      {room.roomType.replace('_', ' ')} · Cap: {room.capacity}
                    </div>
                  </td>

                  {/* Days cells */}
                  {days.map((day) => {
                    const booking = getBookingForRoomAndDay(room.id, day);

                    return (
                      <td
                        key={day.toISOString()}
                        className={`p-1 border-r border-slate-200 relative align-middle ${
                          day.getDay() === 0 || day.getDay() === 6 ? 'bg-slate-50/30' : ''
                        } ${isSameDay(day, new Date()) ? 'bg-emerald-50/20' : ''}`}
                      >
                        {booking ? (
                          <div
                            onClick={() => handleBookingClick(booking)}
                            className={`h-8 rounded-md flex items-center justify-between px-2 text-[10px] font-semibold cursor-pointer shadow-sm select-none truncate transition-all duration-200 ${getStatusClasses(
                              booking.status
                            )}`}
                            title={`${booking.guestName} (${booking.bookingReference})`}
                          >
                            <span className="truncate">{booking.guestName}</span>
                          </div>
                        ) : (
                          <div className="h-8 w-full group flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 font-medium transition-all">
                              +
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <BookingDetailModal
          bookingId={selectedBooking.id}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}
