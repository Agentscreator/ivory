'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, User, XCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';

export default function TechBookingsPage() {
  const router = useRouter();
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [techNotes, setTechNotes] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const userStr = localStorage.getItem('ivoryUser');
      console.log('User from localStorage:', userStr ? 'Found' : 'null');
      
      if (!userStr) {
        console.error('No user found in localStorage');
        router.push('/auth');
        return;
      }

      const user = JSON.parse(userStr);
      
      const pendingRes = await fetch(`/api/bookings?status=pending&techId=${user.id}`);
      const pendingData = await pendingRes.json();
      console.log('Pending bookings response:', pendingRes.status, pendingData);
      if (pendingRes.ok) setPendingBookings(pendingData.bookings || []);

      const upcomingRes = await fetch(`/api/bookings?status=confirmed&techId=${user.id}`);
      const upcomingData = await upcomingRes.json();
      console.log('Upcoming bookings response:', upcomingRes.status, upcomingData);
      if (upcomingRes.ok) setUpcomingBookings(upcomingData.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleBookingAction = async (bookingId: number, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, techNotes }),
      });

      if (response.ok) {
        alert(`Booking ${status}!`);
        setSelectedBooking(null);
        setTechNotes('');
        fetchBookings();
      } else {
        alert('Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    }
  };


  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24 lg:pl-20">
      {/* Header */}
      <header className="bg-white/98 backdrop-blur-md border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16 py-5 sm:py-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="w-10 h-10 flex items-center justify-center hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1} />
            </button>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">
              Bookings
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-8 sm:py-12 pb-safe">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full mb-6 grid grid-cols-2 h-auto bg-white border border-[#E8E8E8] p-0 rounded-none">
            <TabsTrigger 
              value="pending"
              className="text-[11px] tracking-[0.25em] uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] data-[state=active]:bg-[#F8F7F5] text-[#6B6B6B] py-4 sm:py-5 transition-all duration-700 font-light"
            >
              Requests ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming"
              className="text-[11px] tracking-[0.25em] uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] data-[state=active]:bg-[#F8F7F5] text-[#6B6B6B] py-4 sm:py-5 transition-all duration-700 font-light"
            >
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-5 sm:space-y-6 mt-0">
            {pendingBookings.length === 0 ? (
              <Card className="border-[#E8E8E8] bg-white shadow-sm">
                <CardContent className="py-16 sm:py-20 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 border border-[#E8E8E8] bg-[#F8F7F5] flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-[#6B6B6B]" strokeWidth={1} />
                  </div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">No pending booking requests</p>
                </CardContent>
              </Card>
            ) : (
              pendingBookings.map((booking) => (
                <Card key={booking.id} className="border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-lg transition-all duration-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2 font-serif font-light tracking-tight">
                          <User className="h-4 w-4" strokeWidth={1} />
                          {booking.client?.username}
                        </CardTitle>
                        <CardDescription className="text-[10px] tracking-[0.2em] uppercase font-light">{booking.service?.name}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-[10px] tracking-wider uppercase font-light">
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm font-light">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1} />
                        <span className="text-[#1A1A1A]">{new Date(booking.appointmentDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1} />
                        <span className="text-[#1A1A1A]">{new Date(booking.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {booking.look && (
                        <div className="flex items-center gap-4">
                          <img
                            src={booking.look.imageUrl}
                            alt="Design"
                            className="w-24 h-24 object-cover border border-[#E8E8E8] cursor-pointer hover:border-[#8B7355] transition-all duration-700"
                            onClick={() => window.open(booking.look.imageUrl, '_blank')}
                          />
                          <div className="flex-1">
                            <p className="font-serif font-light text-base tracking-tight ">{booking.look.title}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-[#F8F7F5] p-4 border border-[#E8E8E8]">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-light tracking-wide text-[#1A1A1A]">Payment</span>
                        <Badge className="bg-green-500 text-[10px] tracking-wider uppercase font-light">Paid</Badge>
                      </div>
                      <div className="flex justify-between text-sm font-light mb-1">
                        <span className="text-[#6B6B6B]">Service Price:</span>
                        <span className="text-[#1A1A1A]">${booking.servicePrice}</span>
                      </div>
                      <div className="flex justify-between text-sm font-light ">
                        <span className="text-[#6B6B6B]">Platform Fee:</span>
                        <span className="text-[#1A1A1A]">${booking.serviceFee}</span>
                      </div>
                      <div className="flex justify-between text-sm font-light border-t border-[#E8E8E8] pt-2">
                        <span className="text-[#1A1A1A]">Total Paid:</span>
                        <span className="text-[#1A1A1A] font-medium">${booking.totalPrice}</span>
                      </div>
                      <p className="text-xs text-[#6B6B6B] mt-3 font-light leading-relaxed">
                        You'll receive ${booking.servicePrice} after the appointment is completed.
                      </p>
                    </div>

                    {booking.clientNotes && (
                      <div className="bg-[#F8F7F5] p-4 border border-[#E8E8E8]">
                        <p className="text-sm font-light mb-2 text-[#1A1A1A] tracking-wide">Client Notes:</p>
                        <p className="text-sm text-[#6B6B6B] font-light leading-relaxed">{booking.clientNotes}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3">
                      <span className="text-2xl font-light text-[#1A1A1A]">${booking.totalPrice}</span>
                      <div className="flex gap-3">
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-5 sm:space-y-6 mt-0">
            {upcomingBookings.length === 0 ? (
              <Card className="border-[#E8E8E8] bg-white shadow-sm">
                <CardContent className="py-16 sm:py-20 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 border border-[#E8E8E8] bg-[#F8F7F5] flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-[#6B6B6B]" strokeWidth={1} />
                  </div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">No upcoming appointments</p>
                </CardContent>
              </Card>
            ) : (
              upcomingBookings.map((booking) => (
                <Card key={booking.id} className="border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-lg transition-all duration-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2 font-serif font-light tracking-tight">
                          <User className="h-4 w-4" strokeWidth={1} />
                          {booking.client?.username}
                        </CardTitle>
                        <CardDescription className="text-[10px] tracking-[0.2em] uppercase font-light">{booking.service?.name}</CardDescription>
                      </div>
                      <Badge className="text-[10px] tracking-wider uppercase font-light">
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm font-light">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1} />
                        <span className="text-[#1A1A1A]">{new Date(booking.appointmentDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1} />
                        <span className="text-[#1A1A1A]">{new Date(booking.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {booking.look && (
                        <div className="flex items-center gap-4">
                          <img
                            src={booking.look.imageUrl}
                            alt="Design"
                            className="w-24 h-24 object-cover border border-[#E8E8E8] cursor-pointer hover:border-[#8B7355] transition-all duration-700"
                            onClick={() => window.open(booking.look.imageUrl, '_blank')}
                          />
                          <div className="flex-1">
                            <p className="font-serif font-light text-base tracking-tight ">{booking.look.title}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-[#F8F7F5] p-4 border border-[#E8E8E8]">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-light tracking-wide text-[#1A1A1A]">Payment</span>
                        <Badge className="bg-green-500 text-[10px] tracking-wider uppercase font-light">Paid</Badge>
                      </div>
                      <div className="flex justify-between text-sm font-light mb-1">
                        <span className="text-[#6B6B6B]">Service Price:</span>
                        <span className="text-[#1A1A1A]">${booking.servicePrice}</span>
                      </div>
                      <div className="flex justify-between text-sm font-light ">
                        <span className="text-[#6B6B6B]">Platform Fee:</span>
                        <span className="text-[#1A1A1A]">${booking.serviceFee}</span>
                      </div>
                      <div className="flex justify-between text-sm font-light border-t border-[#E8E8E8] pt-2">
                        <span className="text-[#1A1A1A]">Total Paid:</span>
                        <span className="text-[#1A1A1A] font-medium">${booking.totalPrice}</span>
                      </div>
                      <p className="text-xs text-[#6B6B6B] mt-3 font-light leading-relaxed">
                        You'll receive ${booking.servicePrice} after the appointment is completed.
                      </p>
                    </div>

                    {booking.clientNotes && (
                      <div className="bg-[#F8F7F5] p-4 border border-[#E8E8E8]">
                        <p className="text-sm font-light mb-2 text-[#1A1A1A] tracking-wide">Client Notes:</p>
                        <p className="text-sm text-[#6B6B6B] font-light leading-relaxed">{booking.clientNotes}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3">
                      <span className="text-2xl font-light text-[#1A1A1A]">${booking.totalPrice}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} centerActionLabel="Create" />
    </div>
  );
}
