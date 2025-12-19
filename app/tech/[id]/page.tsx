'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Star, Phone, Globe, Instagram, DollarSign, Clock, Navigation, Sparkles } from 'lucide-react';
import { TechLocationMap } from '@/components/tech-location-map';
import { BottomNav } from '@/components/bottom-nav';
import Image from 'next/image';

export default function TechProfilePage() {
  const router = useRouter();
  const params = useParams();
  const techId = params.id as string;
  const [tech, setTech] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    fetchTechProfile();
  }, [techId]);

  const fetchTechProfile = async () => {
    try {
      const response = await fetch(`/api/tech/${techId}`);
      const data = await response.json();
      if (response.ok) {
        setTech(data.tech);
      }
    } catch (error) {
      console.error('Error fetching tech profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!tech) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center space-y-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto border border-[#E8E8E8] flex items-center justify-center">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-[#E8E8E8]" strokeWidth={1} />
          </div>
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] mb-4 tracking-[-0.01em]">
              Profile Not Found
            </h2>
            <p className="text-base text-[#6B6B6B] font-light tracking-wide">
              This nail technician profile doesn't exist
            </p>
          </div>
          <Button 
            onClick={() => router.back()}
            className="bg-[#1A1A1A] hover:bg-[#8B7355] text-white h-14 px-10 text-[11px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-28 sm:pb-32">
      {/* Elegant Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-50 backdrop-blur-md bg-white/98">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16 py-6 sm:py-8">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-500 font-light group mb-6"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-500" strokeWidth={1.5} />
            Back
          </button>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-[-0.01em]">
            Nail Technician Profile
          </h1>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#F8F7F5] to-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16 py-12 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Profile Info */}
            <div className="space-y-8 sm:space-y-10">
              <div className="flex items-start gap-6">
                {tech.user?.avatar && (
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                    <Image
                      src={tech.user.avatar}
                      alt={tech.businessName}
                      fill
                      className="rounded-full object-cover border-2 border-[#E8E8E8]"
                      sizes="112px"
                    />
                    {tech.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-[#8B7355] text-white rounded-full p-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] tracking-[-0.01em] mb-4">
                    {tech.businessName || tech.user?.username}
                  </h2>
                  <div className="flex items-center gap-2 text-base text-[#6B6B6B] mb-4 font-light">
                    <MapPin className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                    <span className="truncate tracking-wide">{tech.location || 'Location not set'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-6 w-6 fill-[#8B7355] text-[#8B7355]" strokeWidth={1.5} />
                      <span className="text-xl font-light text-[#1A1A1A]">{tech.rating || '0.00'}</span>
                    </div>
                    <span className="text-base text-[#6B6B6B] font-light tracking-wide">
                      ({tech.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {tech.bio && (
                <div className="p-6 sm:p-8 bg-[#F8F7F5] border border-[#E8E8E8]">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-3 font-light">About</p>
                  <p className="text-base sm:text-lg text-[#6B6B6B] leading-[1.7] font-light tracking-wide">
                    {tech.bio}
                  </p>
                </div>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap gap-6">
                {tech.phoneNumber && (
                  <a 
                    href={`tel:${tech.phoneNumber}`} 
                    className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-500 font-light"
                  >
                    <Phone className="h-5 w-5" strokeWidth={1.5} />
                    <span className="hidden sm:inline">{tech.phoneNumber}</span>
                    <span className="sm:hidden">Call</span>
                  </a>
                )}
                {tech.website && (
                  <a 
                    href={tech.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-500 font-light"
                  >
                    <Globe className="h-5 w-5" strokeWidth={1.5} />
                    Website
                  </a>
                )}
                {tech.instagramHandle && (
                  <a 
                    href={`https://instagram.com/${tech.instagramHandle}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-500 font-light"
                  >
                    <Instagram className="h-5 w-5" strokeWidth={1.5} />
                    @{tech.instagramHandle}
                  </a>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-start justify-center lg:justify-end">
              <Button 
                onClick={() => router.push(`/book/${techId}`)}
                className="w-full sm:w-auto bg-[#1A1A1A] hover:bg-[#8B7355] text-white h-14 sm:h-16 px-10 sm:px-16 text-[11px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700 hover:scale-[1.02] active:scale-[0.98]"
              >
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-20 sm:top-24 z-40 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <div className="flex gap-8 sm:gap-12 overflow-x-auto scrollbar-hide">
            {['services', 'portfolio', 'reviews', 'location'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-5 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-light whitespace-nowrap transition-all duration-500 border-b-2 ${
                  activeTab === tab
                    ? 'border-[#1A1A1A] text-[#1A1A1A]'
                    : 'border-transparent text-[#6B6B6B] hover:text-[#8B7355]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16 py-12 sm:py-16 lg:py-20">
        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            <div className="mb-12 sm:mb-16 text-center">
              <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#8B7355] mb-4 font-light">
                Services
              </p>
              <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] tracking-[-0.01em]">
                What We Offer
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
              {tech.services && tech.services.length > 0 ? (
                tech.services.map((service: any) => (
                  <div 
                    key={service.id} 
                    className="border border-[#E8E8E8] p-8 sm:p-10 hover:border-[#8B7355] hover:shadow-2xl hover:shadow-[#8B7355]/5 transition-all duration-700 group"
                  >
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight mb-3">
                          {service.name}
                        </h4>
                        <p className="text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                          {service.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-[#E8E8E8]">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-6 w-6 text-[#8B7355]" strokeWidth={1.5} />
                          <span className="text-3xl font-serif font-light text-[#1A1A1A]">{service.price}</span>
                        </div>
                        <div className="flex items-center gap-2 text-base text-[#6B6B6B] font-light">
                          <Clock className="h-5 w-5" strokeWidth={1.5} />
                          <span>{service.duration} min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-8 border border-[#E8E8E8] flex items-center justify-center">
                    <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-[#E8E8E8]" strokeWidth={1} />
                  </div>
                  <p className="text-base text-[#6B6B6B] font-light tracking-wide">
                    No services listed yet
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div>
            <div className="mb-12 sm:mb-16 text-center">
              <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#8B7355] mb-4 font-light">
                Portfolio
              </p>
              <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] tracking-[-0.01em]">
                Our Work
              </h3>
            </div>
            {tech.portfolioImages && tech.portfolioImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7 lg:gap-8">
                {tech.portfolioImages.map((img: any) => (
                  <div key={img.id} className="group cursor-pointer" onClick={() => window.open(img.imageUrl, '_blank')}>
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <Image
                        src={img.imageUrl}
                        alt={img.caption || 'Portfolio'}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                    {img.caption && (
                      <p className="text-sm text-[#6B6B6B] mt-3 font-light tracking-wide">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-8 border border-[#E8E8E8] flex items-center justify-center">
                  <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-[#E8E8E8]" strokeWidth={1} />
                </div>
                <p className="text-base text-[#6B6B6B] font-light tracking-wide">
                  No portfolio images yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <div className="mb-12 sm:mb-16 text-center">
              <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#8B7355] mb-4 font-light">
                Reviews
              </p>
              <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] tracking-[-0.01em]">
                Client Feedback
              </h3>
            </div>
            <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
              {tech.reviews && tech.reviews.length > 0 ? (
                tech.reviews.map((review: any) => (
                  <div key={review.id} className="border border-[#E8E8E8] p-8 sm:p-10 hover:border-[#8B7355] transition-all duration-700">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        {review.client?.avatar && (
                          <div className="relative w-12 h-12 sm:w-14 sm:h-14">
                            <Image
                              src={review.client.avatar}
                              alt={review.client.username}
                              fill
                              className="rounded-full object-cover"
                              sizes="56px"
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-base font-light text-[#1A1A1A] mb-2 tracking-wide">{review.client?.username}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-[#8B7355] text-[#8B7355]'
                                    : 'text-[#E8E8E8]'
                                }`}
                                strokeWidth={1.5}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-[#6B6B6B] font-light tracking-wide">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-base text-[#6B6B6B] leading-[1.7] font-light tracking-wide mb-6">
                        {review.comment}
                      </p>
                    )}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-3 flex-wrap">
                        {review.images.map((img: string, idx: number) => (
                          <div key={idx} className="relative w-24 h-24 sm:w-28 sm:h-28 cursor-pointer group" onClick={() => window.open(img, '_blank')}>
                            <Image
                              src={img}
                              alt="Review"
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                              sizes="112px"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-8 border border-[#E8E8E8] flex items-center justify-center">
                    <Star className="w-10 h-10 sm:w-12 sm:h-12 text-[#E8E8E8]" strokeWidth={1} />
                  </div>
                  <p className="text-base text-[#6B6B6B] font-light tracking-wide">
                    No reviews yet
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location Tab */}
        {activeTab === 'location' && (
          <div>
            <div className="mb-12 sm:mb-16 text-center">
              <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#8B7355] mb-4 font-light">
                Location
              </p>
              <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] tracking-[-0.01em]">
                Find Us
              </h3>
            </div>
            <div className="border border-[#E8E8E8] overflow-hidden max-w-5xl mx-auto">
              <div className="p-8 sm:p-10 bg-[#F8F7F5]">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="h-6 w-6 text-[#8B7355]" strokeWidth={1.5} />
                  <h4 className="text-xl sm:text-2xl font-serif font-light text-[#1A1A1A] tracking-tight">
                    {tech.businessName || tech.user?.username}
                  </h4>
                </div>
                <p className="text-base text-[#6B6B6B] font-light tracking-wide">
                  {tech.location || 'Location not set'}
                </p>
              </div>
              {tech.location ? (
                <>
                  <TechLocationMap
                    location={tech.location}
                    businessName={tech.businessName}
                    className="w-full h-[400px] sm:h-[500px] lg:h-[600px]"
                  />
                  <div className="p-8 sm:p-10 grid sm:grid-cols-2 gap-4 sm:gap-5">
                    <Button
                      variant="outline"
                      className="border-[#E8E8E8] hover:border-[#8B7355] hover:bg-transparent text-[#1A1A1A] h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700"
                      onClick={() => {
                        const query = encodeURIComponent(tech.location);
                        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                      }}
                    >
                      <MapPin className="h-5 w-5 mr-2" strokeWidth={1.5} />
                      Open in Maps
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#E8E8E8] hover:border-[#8B7355] hover:bg-transparent text-[#1A1A1A] h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((position) => {
                            const { latitude, longitude } = position.coords;
                            const query = encodeURIComponent(tech.location);
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${query}`,
                              '_blank'
                            );
                          });
                        }
                      }}
                    >
                      <Navigation className="h-5 w-5 mr-2" strokeWidth={1.5} />
                      Get Directions
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-20 text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-[#E8E8E8]" strokeWidth={1} />
                  <p className="text-base text-[#6B6B6B] font-light tracking-wide">
                    Location not available
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} centerActionLabel="Create" />
    </div>
  );
}
