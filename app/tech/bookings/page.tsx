'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, User, XCircle, CheckCircle2, Sparkles, ArrowLeft } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';

export default function TechBookingsPage() {
  const router = useRouter();
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [techNotes, setTechNotes] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const pendingRes = await fetch('/api/bookings?status=pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pendingData = await pendingRes.json();
      if (pendingRes.ok) setPendingBookings(pendingData.bookings || []);

      const upcomingRes = await fetch('/api/bookings?status=confirmed', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const upcomingData = await upcomingRes.json();
      if (upcomingRes.ok) setUpcomingBookings(upcomingData.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleBookingAction = async (bookingId: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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

  const generateDesignBreakdown = async (lookId: number, bookingId: number) => {
    setLoadingBreakdown(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/design-breakdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lookId, bookingId }),
      });

      const data = await response.json();
      if (response.ok) {
        setBreakdown(data.breakdown);
        setShowBreakdown(true);
      } else {
        alert(data.error || 'Failed to generate breakdown');
      }
    } catch (error) {
      console.error('Error generating breakdown:', error);
      alert('Failed to generate breakdown');
    } finally {
      setLoadingBreakdown(false);
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
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <img
                            src={booking.look.imageUrl}
                            alt="Design"
                            className="w-24 h-24 object-cover border border-[#E8E8E8] cursor-pointer hover:border-[#8B7355] transition-all duration-700"
                            onClick={() => window.open(booking.look.imageUrl, '_blank')}
                          />
                          <div className="flex-1">
                            <p className="font-serif font-light text-base tracking-tight mb-2">{booking.look.title}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white transition-all duration-700 text-[10px] tracking-[0.2em] uppercase font-light h-9"
                              onClick={() => generateDesignBreakdown(booking.look.id, booking.id)}
                              disabled={loadingBreakdown}
                            >
                              <Sparkles className="h-3 w-3 mr-1.5" strokeWidth={1} />
                              {loadingBreakdown ? 'Generating...' : 'Get Breakdown'}
                            </Button>
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
                      <div className="flex justify-between text-sm font-light mb-2">
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#E8E8E8] hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-700 text-[10px] tracking-[0.2em] uppercase font-light h-10 px-4"
                          onClick={() => {
                            setSelectedBooking(booking);
                            handleBookingAction(booking.id, 'cancelled');
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1.5" strokeWidth={1} />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all duration-700 text-[10px] tracking-[0.2em] uppercase font-light h-10 px-4"
                          onClick={() => {
                            setSelectedBooking(booking);
                            handleBookingAction(booking.id, 'confirmed');
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1.5" strokeWidth={1} />
                          Confirm
                        </Button>
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
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <img
                            src={booking.look.imageUrl}
                            alt="Design"
                            className="w-24 h-24 object-cover border border-[#E8E8E8] cursor-pointer hover:border-[#8B7355] transition-all duration-700"
                            onClick={() => window.open(booking.look.imageUrl, '_blank')}
                          />
                          <div className="flex-1">
                            <p className="font-serif font-light text-base tracking-tight mb-2">{booking.look.title}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white transition-all duration-700 text-[10px] tracking-[0.2em] uppercase font-light h-9"
                              onClick={() => generateDesignBreakdown(booking.look.id, booking.id)}
                              disabled={loadingBreakdown}
                            >
                              <Sparkles className="h-3 w-3 mr-1.5" strokeWidth={1} />
                              {loadingBreakdown ? 'Generating...' : 'Get Breakdown'}
                            </Button>
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
                      <div className="flex justify-between text-sm font-light mb-2">
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white transition-all duration-700 text-[10px] tracking-[0.2em] uppercase font-light h-10 px-4"
                        onClick={() => handleBookingAction(booking.id, 'completed')}
                      >
                        Mark Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Design Breakdown Dialog */}
        <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto border-[#E8E8E8]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-light tracking-tight">Design Breakdown</DialogTitle>
              <DialogDescription className="text-[10px] tracking-[0.2em] uppercase font-light">
                Step-by-step instructions to recreate this design
              </DialogDescription>
            </DialogHeader>

            {breakdown && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-[#F8F7F5] border border-[#E8E8E8]">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] font-light mb-2">Difficulty</p>
                    <p className="font-light text-lg capitalize text-[#1A1A1A]">{breakdown.difficulty}</p>
                  </div>
                  <div className="text-center p-4 bg-[#F8F7F5] border border-[#E8E8E8]">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] font-light mb-2">Est. Time</p>
                    <p className="font-light text-lg text-[#1A1A1A]">{breakdown.estimatedTime} min</p>
                  </div>
                  <div className="text-center p-4 bg-[#F8F7F5] border border-[#E8E8E8]">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] font-light mb-2">Steps</p>
                    <p className="font-light text-lg text-[#1A1A1A]">{breakdown.breakdown?.steps?.length || 0}</p>
                  </div>
                </div>

                {breakdown.productsNeeded && breakdown.productsNeeded.length > 0 && (
                  <div className="border border-[#E8E8E8] p-5 bg-white">
                    <h3 className="font-serif text-lg font-light tracking-tight mb-3 text-[#1A1A1A]">Products & Tools Needed:</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {breakdown.productsNeeded.map((product: string, idx: number) => (
                        <li key={idx} className="text-sm font-light text-[#6B6B6B]">{product}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {breakdown.techniques && breakdown.techniques.length > 0 && (
                  <div className="border border-[#E8E8E8] p-5 bg-white">
                    <h3 className="font-serif text-lg font-light tracking-tight mb-3 text-[#1A1A1A]">Techniques Used:</h3>
                    <div className="flex flex-wrap gap-2">
                      {breakdown.techniques.map((technique: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-[10px] tracking-wider uppercase font-light">{technique}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {breakdown.breakdown?.steps && (
                  <div className="border border-[#E8E8E8] p-5 bg-white">
                    <h3 className="font-serif text-lg font-light tracking-tight mb-4 text-[#1A1A1A]">Step-by-Step Instructions:</h3>
                    <div className="space-y-5">
                      {breakdown.breakdown.steps.map((step: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-[#8B7355] pl-5">
                          <h4 className="font-light text-base text-[#1A1A1A] mb-2">
                            Step {step.stepNumber}: {step.title}
                          </h4>
                          <p className="text-sm text-[#6B6B6B] font-light leading-relaxed">{step.description}</p>
                          {step.tips && (
                            <p className="text-sm text-[#8B7355] mt-3 font-light">
                              💡 <strong>Tip:</strong> {step.tips}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {breakdown.breakdown?.proTips && breakdown.breakdown.proTips.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 p-5">
                    <h3 className="font-serif text-lg font-light tracking-tight mb-3 text-[#1A1A1A]">Pro Tips:</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {breakdown.breakdown.proTips.map((tip: string, idx: number) => (
                        <li key={idx} className="text-sm font-light text-[#6B6B6B]">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {breakdown.breakdown?.commonMistakes && breakdown.breakdown.commonMistakes.length > 0 && (
                  <div className="bg-red-50 border border-red-200 p-5">
                    <h3 className="font-serif text-lg font-light tracking-tight mb-3 text-[#1A1A1A]">Common Mistakes to Avoid:</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {breakdown.breakdown.commonMistakes.map((mistake: string, idx: number) => (
                        <li key={idx} className="text-sm font-light text-[#6B6B6B]">{mistake}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} centerActionLabel="Create" />
    </div>
  );
}
