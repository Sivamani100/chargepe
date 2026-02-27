import React, { useState } from 'react';
import { Calendar, Clock, Zap, CreditCard, QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import { useBookingSystem } from '../../hooks/useBookingSystem';

interface BookingSystemProps {
  stationId?: string;
  className?: string;
}

export const BookingSystem: React.FC<BookingSystemProps> = ({ stationId, className = "" }) => {
  const {
    bookings,
    activeSessions,
    createBooking,
    startSession,
    endSession,
    cancelBooking,
    isLoading,
  } = useBookingSystem();

  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [duration, setDuration] = useState(60);

  const handleCreateBooking = async () => {
    if (stationId && bookingDate && bookingTime) {
      await createBooking({
        stationId,
        startTime: `${bookingDate}T${bookingTime}`,
        duration,
      });
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Active Sessions */}
      <div className="brutal-card p-6">
        <h3 className="text-lg font-bold mb-4">Active Charging Sessions</h3>
        <div className="space-y-3">
          {activeSessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No active sessions</p>
          ) : (
            activeSessions.map((session) => (
              <div key={session.id} className="p-4 bg-accent rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      session.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <h4 className="font-medium">Session #{session.id.slice(-6)}</h4>
                      <p className="text-sm text-muted-foreground">{session.stationName}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full capitalize">
                    {session.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{session.duration || 0} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Energy Delivered</p>
                    <p className="font-medium">{session.energyDelivered || 0} kWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Power</p>
                    <p className="font-medium">{session.currentPower || 0} kW</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-border rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${session.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{session.progress || 0}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {session.status === 'confirmed' && (
                    <button
                      onClick={() => startSession(session.id)}
                      className="flex-1 brutal-btn bg-green-600 text-white py-2"
                    >
                      Start Session
                    </button>
                  )}
                  {session.status === 'active' && (
                    <button
                      onClick={() => endSession(session.id)}
                      className="flex-1 brutal-btn bg-red-600 text-white py-2"
                    >
                      End Session
                    </button>
                  )}
                  <button
                    onClick={() => cancelBooking(session.id)}
                    className="px-4 py-2 border-2 border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking Form */}
      {stationId && (
        <div className="brutal-card p-6">
          <h3 className="text-lg font-bold mb-4">Book Charging Slot</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
              </select>
            </div>

            <button
              onClick={handleCreateBooking}
              disabled={isLoading || !bookingDate || !bookingTime}
              className="w-full brutal-btn bg-primary text-primary-foreground py-3 disabled:opacity-50"
            >
              {isLoading ? 'Creating Booking...' : 'Book Slot'}
            </button>
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="brutal-card p-6">
        <h3 className="text-lg font-bold mb-4">Recent Bookings</h3>
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No bookings yet</p>
          ) : (
            bookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="p-4 bg-accent rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">Booking #{booking.id.slice(-6)}</h4>
                    <p className="text-sm text-muted-foreground">{booking.stationName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                      {new Date(booking.startTime).toLocaleDateString()} at {new Date(booking.startTime).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{booking.duration || 0} minutes</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cost</p>
                    <p className="font-medium">${booking.amount || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Energy</p>
                    <p className="font-medium">{booking.energyDelivered || 0} kWh</p>
                  </div>
                </div>

                {booking.status === 'confirmed' && (
                  <div className="mt-3 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <QrCode className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-800">Show QR code at station to start charging</p>
                  </div>
                )}

                {booking.status === 'completed' && (
                  <div className="mt-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-800">Charging completed successfully</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingSystem;
