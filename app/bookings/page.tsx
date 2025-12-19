'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Calendar, Clock, Star, Sparkles, ArrowRight } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { useIsAppleWatch } from '@/components/watch-optimized-layout';
import { BookingReviewDialog } from '@/components/booking-review-dialog';
import Image from 'next/image';

export default function BookingsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [techs, setTechs] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'bookings'>('search');
  const isWatch = useIsAppleWatch();

  useEffect(() => {
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

    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const bookingId = urlParams.get('booking_id');

    if (paymentStatus === 'success' && bookingId) {
      alert('Payment successful! Your booking request has been sent to the nail tech.');
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1A1A] mx-auto mb-4"></div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Elegant Header */}
      <header className={`bg-white border-b border-[#E8E8E8] sticky top-0 z-50 backdrop-blur-md bg-white/98 safe-top ${isWatch ? 'watch-compact' : ''}`}>
        <div className={`max-w-[1400px] mx-auto ${isWatch ? 'px-3 py-3' : 'px-6 sm:px-8 lg:px-16 py-6 sm:py-8'}`}>
          <div className="flex items-center justify-between">
            <h1 className={`font-serif font-light text-[#1A1A1A] tracking-[-0.01em] ${isWatch ? 'text-base' : 'text-2xl sm:text-3xl lg:text-4xl'}`}>
              Book Your Appointment
            </h1>
            <Sparkles className={`text-[#8B7355] ${isWatch ? 'w-5 h-5' : 'w-6 h-6 sm:w-7 sm:h-7'}`} strokeWidth={1.5} />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className={`bg-white border-b border-[#E8E8E8] sticky ${isWatch ? 'top-12' : 'top-20 sm:top-24'} z-40`}>
        <div className={`max-w-[1400px] mx-auto ${isWatch ? 'px-3' : 'px-6 sm:px-8 lg:px-16'}`}>
          <div className="flex">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-4 sm:py-5 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-light transition-all duration-500 border-b-2 ${
                activeTab === 'search'
                  ? 'border-[#1A1A1A] text-[#1A1A1A]'
                  : 'border-transparent text-[#6B6B6B] hover:text-[#8B7355]'
              }`}
            >
              Find Nail Tech
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 py-4 sm:py-5 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-light transition-all duration-500 border-b-2 ${
                activeTab === 'bookings'
                  ? 'border-[#1A1A1A] text-[#1A1A1A]'
                  : 'border-transparent text-[#6B6B6B] hover:text-[#8B7355]'
              }`}
            >
              My Bookings {myBookings.length > 0 && `(${myBookings.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`max-w-[1400px] mx-auto pb-28 sm:pb-32 ${isWatch ? 'px-3 py-4' : 'px-6 sm:px-8 lg:px-16 py-12 sm:py-16 lg:py-20'}`}>
        {activeTab === 'search' ? (
          <div className="space-y-12 sm:space-y-16 lg:space-y-20">
            {/* Search Hero Section */}
            <div className="text-center space-y-6 sm:space-y-8">
              <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#8B7355] font-light">
                Discover
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-[#1A1A1A] tracking-[-0.01em] leading-[1.1]">
                Find Your Perfect Match
              </h2>
              <p className="text-base sm:text-lg text-[#6B6B6B] leading-[1.7] font-light max-w-2xl mx-auto tracking-wide">
                Connect with skilled nail technicians who bring your vision to life
              </p>
            </div>

            {/* Elegant Search Box */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#F8F7F5] border border-[#E8E8E8] p-6 sm:p-8 lg:p-10 space-y-5 sm:space-y-6">
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B] group-focus-within:text-[#8B7355] transition-colors" />
                    <Input
                      placeholder="Name or specialty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-14 border-[#E8E8E8] bg-white focus:border-[#8B7355] rounded-none text-base font-light"
                      onKeyDown={(e) => e.key === 'Enter' && searchTechs()}
                    />
                  </div>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B] group-focus-within:text-[#8B7355] transition-colors" />
                    <Input
                      placeholder="Location..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-12 h-14 border-[#E8E8E8] bg-white focus:border-[#8B7355] rounded-none text-base font-light"
                      onKeyDown={(e) => e.key === 'Enter' && searchTechs()}
                    />
                  </div>
                </div>
                <Button 
                  onClick={searchTechs} 
                  disabled={loading}
                  className="w-full bg-[#1A1A1A] hover:bg-[#8B7355] text-white h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? 'Searching...' : 'Search Nail Technicians'}
                </Button>
              </div>
            </div>

            {/* Tech Results Grid */}
            {techs.length > 0 && (
              <div>
                <div className="mb-8 sm:mb-12">
                  <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#8B7355] mb-3 font-light">
                    Results
                  </p>
                  <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-[-0.01em]">
                    Available Nail Technicians
                  </h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                  {techs.map((tech) => (
                    <div
                      key={tech.id}
                      className="group cursor-pointer border border-[#E8E8E8] hover:border-[#8B7355] transition-all duration-700 hover:shadow-2xl hover:shadow-[#8B7355]/5"
                      onClick={() => router.push(`/tech/${tech.id}`)}
                    >
                      {/* Portfolio Image */}
                      {tech.portfolioImages && tech.portfolioImages.length > 0 ? (
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={tech.portfolioImages[0].imageUrl}
                            alt={tech.businessName || tech.user.username}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          {tech.isVerified && (
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-white/95 text-[#1A1A1A] border-0 text-[10px] tracking-[0.2em] uppercase font-light">
                                Verified
                              </Badge>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-[4/3] bg-[#F8F7F5] flex items-center justify-center">
                          <Sparkles className="w-12 h-12 text-[#E8E8E8]" strokeWidth={1} />
                        </div>
                      )}

                      {/* Tech Info */}
                      <div className="p-6 sm:p-8 space-y-4 sm:space-y-5">
                        <div>
                          <h4 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                            {tech.businessName || tech.user.username}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-[#6B6B6B] font-light">
                            <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                            {tech.location || 'Location not set'}
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 fill-[#8B7355] text-[#8B7355]" strokeWidth={1.5} />
                            <span className="text-base font-light text-[#1A1A1A]">{tech.rating || '0.00'}</span>
                          </div>
                          <span className="text-sm text-[#6B6B6B] font-light">
                            ({tech.totalReviews || 0} reviews)
                          </span>
                        </div>

                        {/* Services */}
                        {tech.services && tech.services.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {tech.services.slice(0, 3).map((service: any) => (
                              <Badge
                                key={service.id}
                                variant="outline"
                                className="text-[10px] tracking-[0.15em] uppercase font-light border-[#E8E8E8] text-[#6B6B6B]"
                              >
                                {service.name}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Button
                          className="w-full bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white h-12 text-[11px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700 group-hover:bg-[#1A1A1A] group-hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/book/${tech.id}`);
                          }}
                        >
                          Book Now
                          <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {techs.length === 0 && !loading && (
              <div className="text-center py-16 sm:py-24 lg:py-32">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-8 border border-[#E8E8E8] flex items-center justify-center">
                  <Search className="w-10 h-10 sm:w-12 sm:h-12 text-[#E8E8E8]" strokeWidth={1} />
                </div>
                <p className="text-base sm:text-lg text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                  Search for nail technicians to discover talented artists near you
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16 lg:space-y-20">
            {/* Bookings Hero */}
            <div className="text-center space-y-6 sm:space-y-8">
              <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#8B7355] font-light">
                Your Appointments
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-[#1A1A1A] tracking-[-0.01em] leading-[1.1]">
                Upcoming & Past Bookings
              </h2>
            </div>

            {/* Bookings List */}
            {myBookings.length === 0 ? (
              <div className="text-center py-16 sm:py-24 lg:py-32">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-8 border border-[#E8E8E8] flex items-center justify-center">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-[#E8E8E8]" strokeWidth={1} />
                </div>
                <p className="text-base sm:text-lg text-[#6B6B6B] font-light leading-[1.7] mb-8 tracking-wide">
                  No bookings yet. Find a nail tech to book your first appointment
                </p>
                <Button
                  onClick={() => setActiveTab('search')}
                  className="bg-[#1A1A1A] hover:bg-[#8B7355] text-white h-14 px-10 text-[11px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700"
                >
                  Find Nail Tech
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:gap-8 max-w-4xl mx-auto">
                {myBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-[#E8E8E8] hover:border-[#8B7355] transition-all duration-700 hover:shadow-xl hover:shadow-[#8B7355]/5"
                  >
                    <div className="p-6 sm:p-8 lg:p-10 space-y-6">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                            {booking.techProfile?.businessName || booking.techProfile?.user?.username}
                          </h3>
                          <p className="text-sm sm:text-base text-[#6B6B6B] font-light tracking-wide">
                            {booking.service?.name}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(booking.status)} text-white text-[10px] tracking-[0.2em] uppercase font-light`}>
                          {booking.status}
                        </Badge>
                      </div>

                      {/* Date & Time */}
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm sm:text-base text-[#6B6B6B] font-light">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" strokeWidth={1.5} />
                          {new Date(booking.appointmentDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" strokeWidth={1.5} />
                          {new Date(booking.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Design Preview */}
                      {booking.look && (
                        <div className="flex items-center gap-4 p-4 bg-[#F8F7F5] border border-[#E8E8E8]">
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                            <Image
                              src={booking.look.imageUrl}
                              alt={booking.look.title}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-1 font-light">
                              Your Design
                            </p>
                            <p className="text-sm sm:text-base font-light text-[#1A1A1A]">{booking.look.title}</p>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {booking.clientNotes && (
                        <div className="p-4 bg-[#F8F7F5] border border-[#E8E8E8]">
                          <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-2 font-light">
                            Your Notes
                          </p>
                          <p className="text-sm sm:text-base text-[#6B6B6B] font-light leading-[1.7]">
                            {booking.clientNotes}
                          </p>
                        </div>
                      )}

                      {/* Payment Info */}
                      <div className="flex items-center justify-between pt-6 border-t border-[#E8E8E8]">
                        <div>
                          <p className="text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-2 font-light">
                            Payment Status
                          </p>
                          <Badge className={booking.paymentStatus === 'paid' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}>
                            {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                          </Badge>
                        </div>
                        {booking.totalPrice && (
                          <div className="text-right">
                            <p className="text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-2 font-light">
                              Total
                            </p>
                            <p className="text-2xl sm:text-3xl font-serif font-light text-[#1A1A1A]">
                              ${booking.totalPrice}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {booking.status === 'pending' && booking.paymentStatus !== 'paid' && (
                        <Button
                          className="w-full bg-[#1A1A1A] hover:bg-[#8B7355] text-white h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700"
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

                      {booking.status === 'completed' && !booking.hasReview && (
                        <BookingReviewDialog
                          bookingId={booking.id}
                          techName={booking.techProfile?.businessName || booking.techProfile?.user?.username || 'this tech'}
                          onReviewSubmitted={() => fetchMyBookings(userId || undefined)}
                        />
                      )}

                      {booking.status === 'completed' && booking.hasReview && (
                        <div className="flex items-center justify-center gap-2 py-4 text-sm text-[#6B6B6B] font-light">
                          <Star className="w-4 h-4 fill-[#8B7355] text-[#8B7355]" strokeWidth={1.5} />
                          <span className="tracking-wide">Review submitted</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} centerActionLabel="Create" />
    </div>
  );
}
