'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Calendar, Clock, Star } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { useIsAppleWatch } from '@/components/watch-optimized-layout';

export default function BookingsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [techs, setTechs] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const isWatch = useIsAppleWatch();

  useEffect(() => {
    // Check authentication using ivoryUser (consistent with rest of app)
    const userStr = localStorage.getItem('ivoryUser');
    if (!userStr) {
      router.push('/auth');
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      setUserId(user.id);
      setIsAuthenticated(true);
      fetchMyBookings(user.id);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth');
      return;
    }

    // Check for payment success/cancel in URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const bookingId = urlParams.get('booking_id');

    if (paymentStatus === 'success' && bookingId) {
      alert('Payment successful! Your booking request has been sent to the nail tech.');
      // Clean URL
      window.history.replaceState({}, '', '/bookings');
    } else if (paymentStatus === 'cancelled') {
      alert('Payment cancelled. Your booking was not completed.');
      window.history.replaceState({}, '', '/bookings');
    }
  }, []);

  const fetchMyBookings = async (userIdParam?: number) => {
    try {
      const userStr = localStorage.getItem('ivoryUser');
      if (!userStr) {
        router.push('/auth');
        return;
      }
      
      const user = JSON.parse(userStr);
      const id = userIdParam || user.id;
      
      const response = await fetch(`/api/bookings?userId=${id}`);
      
      if (response.status === 401) {
        // Session expired or invalid
        localStorage.removeItem('ivoryUser');
        router.push('/auth');
        return;
      }
      
      const data = await response.json();
      if (response.ok) {
        setMyBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const searchTechs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (location) params.append('location', location);

      const response = await fetch(`/api/tech/search?${params}`);
      const data = await response.json();
      if (response.ok) {
        setTechs(data.techs);
      }
    } catch (error) {
      console.error('Error searching techs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1A1A] mx-auto mb-4"></div>
          <p className="text-[#6B6B6B]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top ${isWatch ? 'watch-compact' : ''}`}>
        <div className={`max-w-screen-xl mx-auto ${isWatch ? 'px-3 py-2' : 'px-5 sm:px-6 py-4 sm:py-5'}`}>
          <h1 className={`font-serif font-light text-[#1A1A1A] tracking-tight ${isWatch ? 'text-sm' : 'text-xl sm:text-2xl'}`}>
            {isWatch ? "BOOKINGS" : "BOOKINGS"}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className={`max-w-4xl mx-auto pb-28 sm:pb-32 ${isWatch ? 'px-3 py-3' : 'px-4 sm:px-6 py-6 sm:py-8'}`}>
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="w-full mb-6 sm:mb-8 grid grid-cols-2 h-auto bg-white border-b border-[#E8E8E8] p-0 rounded-none">
            <TabsTrigger 
              value="search"
              className="text-xs sm:text-sm font-light tracking-wider uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] text-[#6B6B6B] py-3 sm:py-4 transition-all duration-300"
            >
              Find Nail Tech
            </TabsTrigger>
            <TabsTrigger 
              value="my-bookings"
              className="text-xs sm:text-sm font-light tracking-wider uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] text-[#6B6B6B] py-3 sm:py-4 transition-all duration-300"
            >
              My Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Search Section */}
            <Card className="border-[#E8E8E8] shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-lg font-light tracking-tight">Search Nail Technicians</CardTitle>
                <CardDescription className="text-[#6B6B6B]">Find the perfect nail tech for your design</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-[#6B6B6B]" />
                    <Input
                      placeholder="Search by name or specialty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-[#E8E8E8] focus:border-[#8B7355]"
                      onKeyDown={(e) => e.key === 'Enter' && searchTechs()}
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-[#6B6B6B]" />
                    <Input
                      placeholder="Location..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 border-[#E8E8E8] focus:border-[#8B7355]"
                      onKeyDown={(e) => e.key === 'Enter' && searchTechs()}
                    />
                  </div>
                  <Button 
                    onClick={searchTechs} 
                    disabled={loading}
                    className="bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tech Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {techs.map((tech) => (
                <Card key={tech.id} className="border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => router.push(`/tech/${tech.id}`)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{tech.businessName || tech.user.username}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {tech.location || 'Location not set'}
                        </CardDescription>
                      </div>
                      {tech.isVerified && (
                        <Badge variant="secondary">Verified</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 font-semibold">{tech.rating || '0.00'}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({tech.totalReviews || 0} reviews)
                      </span>
                    </div>

                    {/* Portfolio Preview */}
                    {tech.portfolioImages && tech.portfolioImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-1">
                        {tech.portfolioImages.slice(0, 3).map((img: any, idx: number) => (
                          <img
                            key={idx}
                            src={img.imageUrl}
                            alt="Portfolio"
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}

                    {/* Services */}
                    {tech.services && tech.services.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tech.services.slice(0, 3).map((service: any) => (
                          <Badge key={service.id} variant="outline" className="text-xs">
                            {service.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Button 
                      className="w-full bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all" 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/book/${tech.id}`);
                      }}
                    >
                      Book Appointment
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {techs.length === 0 && !loading && (
              <Card className="border-[#E8E8E8]">
                <CardContent className="py-12 text-center text-[#6B6B6B]">
                  Search for nail technicians to get started
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-bookings" className="space-y-4">
            {myBookings.length === 0 ? (
              <Card className="border-[#E8E8E8]">
                <CardContent className="py-12 text-center text-[#6B6B6B]">
                  No bookings yet. Find a nail tech to book your first appointment!
                </CardContent>
              </Card>
            ) : (
              myBookings.map((booking) => (
                <Card key={booking.id} className="border-[#E8E8E8] hover:border-[#8B7355] transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {booking.techProfile?.businessName || booking.techProfile?.user?.username}
                        </CardTitle>
                        <CardDescription>{booking.service?.name}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {new Date(booking.appointmentDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {new Date(booking.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {booking.look && (
                      <div className="flex items-center gap-2">
                        <img
                          src={booking.look.imageUrl}
                          alt="Design"
                          className="w-16 h-16 object-cover rounded"
                        />
                        <span className="text-sm font-medium">{booking.look.title}</span>
                      </div>
                    )}

                    {booking.clientNotes && (
                      <p className="text-sm text-gray-600">
                        <strong>Notes:</strong> {booking.clientNotes}
                      </p>
                    )}

                    {/* Payment Status */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E8E8]">
                      <div>
                        <p className="text-xs text-[#6B6B6B]">Payment Status</p>
                        <Badge className={booking.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                        </Badge>
                      </div>
                      {booking.totalPrice && (
                        <div className="text-right">
                          <p className="text-xs text-[#6B6B6B]">Total</p>
                          <p className="text-lg font-bold">${booking.totalPrice}</p>
                        </div>
                      )}
                    </div>

                    {booking.status === 'pending' && booking.paymentStatus !== 'paid' && (
                      <Button
                        className="w-full bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all"
                        onClick={async () => {
                          const response = await fetch('/api/stripe/create-booking-checkout', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ bookingId: booking.id }),
                          });
                          const data = await response.json();
                          if (response.ok) {
                            window.location.href = data.url;
                          }
                        }}
                      >
                        Complete Payment
                      </Button>
                    )}
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
