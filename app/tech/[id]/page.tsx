'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Star, Phone, Globe, Instagram, DollarSign, Clock, Navigation } from 'lucide-react';
import { TechLocationMap } from '@/components/tech-location-map';

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
          <div className="w-12 h-12 border-2 border-[#8B7355] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] font-light">Loading</p>
        </div>
      </div>
    );
  }

  if (!tech) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A]">Profile Not Found</h2>
          <Button 
            onClick={() => router.back()}
            className="bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all duration-500 px-8 h-11 text-xs tracking-widest uppercase rounded-none font-light"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-[#F8F7F5] to-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
          {/* Back Button */}
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-300 mb-8 sm:mb-12 font-light group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back
          </button>

          {/* Profile Header */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left: Profile Info */}
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-start gap-4 sm:gap-6">
                {tech.user?.avatar && (
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                    <img
                      src={tech.user.avatar}
                      alt={tech.businessName}
                      className="w-full h-full rounded-full object-cover border-2 border-[#E8E8E8]"
                    />
                    {tech.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-[#8B7355] text-white rounded-full p-1.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-tight">
                      {tech.businessName || tech.user?.username}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6B6B6B] mb-3 font-light">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{tech.location || 'Location not set'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-[#8B7355] text-[#8B7355]" />
                      <span className="font-light text-[#1A1A1A]">{tech.rating || '0.00'}</span>
                    </div>
                    <span className="text-sm text-[#6B6B6B] font-light">({tech.totalReviews || 0} reviews)</span>
                  </div>
                </div>
              </div>

              {tech.bio && (
                <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed font-light">
                  {tech.bio}
                </p>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 sm:gap-6">
                {tech.phoneNumber && (
                  <a 
                    href={`tel:${tech.phoneNumber}`} 
                    className="flex items-center gap-2 text-xs tracking-wider uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-300 font-light"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="hidden sm:inline">{tech.phoneNumber}</span>
                    <span className="sm:hidden">Call</span>
                  </a>
                )}
                {tech.website && (
                  <a 
                    href={tech.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-xs tracking-wider uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-300 font-light"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {tech.instagramHandle && (
                  <a 
                    href={`https://instagram.com/${tech.instagramHandle}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-xs tracking-wider uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-300 font-light"
                  >
                    <Instagram className="h-4 w-4" />
                    @{tech.instagramHandle}
                  </a>
                )}
              </div>

              {/* CTA Button - Mobile */}
              <Button 
                onClick={() => router.push(`/book/${techId}`)}
                className="w-full lg:hidden bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all duration-500 h-12 text-xs tracking-widest uppercase rounded-none font-light"
              >
                Book Appointment
              </Button>
            </div>

            {/* Right: CTA - Desktop */}
            <div className="hidden lg:flex items-start justify-end">
              <Button 
                onClick={() => router.push(`/book/${techId}`)}
                className="bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all duration-500 px-12 h-14 text-xs tracking-widest uppercase rounded-none font-light"
              >
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex gap-8 sm:gap-12 overflow-x-auto scrollbar-hide">
            {['services', 'portfolio', 'reviews', 'location'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-xs tracking-[0.2em] uppercase font-light whitespace-nowrap transition-colors duration-300 border-b-2 ${
                  activeTab === tab
                    ? 'border-[#8B7355] text-[#1A1A1A]'
                    : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-20">
        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4 sm:space-y-6">
            {tech.services && tech.services.length > 0 ? (
              tech.services.map((service: any) => (
                <div 
                  key={service.id} 
                  className="border border-[#E8E8E8] p-6 sm:p-8 hover:border-[#8B7355] transition-all duration-500 group"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg sm:text-xl font-light text-[#1A1A1A] tracking-tight">
                        {service.name}
                      </h3>
                      <p className="text-sm text-[#6B6B6B] font-light leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2 text-right">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-5 w-5 text-[#8B7355]" />
                        <span className="text-xl sm:text-2xl font-light text-[#1A1A1A]">{service.price}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-[#6B6B6B] font-light">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration} min</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] font-light">
                  No services listed yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div>
            {tech.portfolioImages && tech.portfolioImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {tech.portfolioImages.map((img: any) => (
                  <div key={img.id} className="group cursor-pointer" onClick={() => window.open(img.imageUrl, '_blank')}>
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={img.imageUrl}
                        alt={img.caption || 'Portfolio'}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                    </div>
                    {img.caption && (
                      <p className="text-xs text-[#6B6B6B] mt-2 font-light">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] font-light">
                  No portfolio images yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 sm:space-y-8">
            {tech.reviews && tech.reviews.length > 0 ? (
              tech.reviews.map((review: any) => (
                <div key={review.id} className="border border-[#E8E8E8] p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {review.client?.avatar && (
                        <img
                          src={review.client.avatar}
                          alt={review.client.username}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-light text-[#1A1A1A] mb-1">{review.client?.username}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                i < review.rating
                                  ? 'fill-[#8B7355] text-[#8B7355]'
                                  : 'text-[#E8E8E8]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-[#6B6B6B] font-light">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-[#6B6B6B] leading-relaxed font-light mb-4">
                      {review.comment}
                    </p>
                  )}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {review.images.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Review"
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(img, '_blank')}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] font-light">
                  No reviews yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Location Tab */}
        {activeTab === 'location' && (
          <div className="border border-[#E8E8E8] overflow-hidden">
            <div className="p-6 sm:p-8 bg-[#F8F7F5]">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-[#8B7355]" />
                <h3 className="text-lg font-light text-[#1A1A1A] tracking-tight">
                  {tech.businessName || tech.user?.username}
                </h3>
              </div>
              <p className="text-sm text-[#6B6B6B] font-light">
                {tech.location || 'Location not set'}
              </p>
            </div>
            {tech.location ? (
              <>
                <TechLocationMap
                  location={tech.location}
                  businessName={tech.businessName}
                  className="w-full h-[300px] sm:h-[400px] lg:h-[500px]"
                />
                <div className="p-6 sm:p-8 grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    className="border-[#E8E8E8] hover:border-[#8B7355] hover:bg-transparent text-[#1A1A1A] h-12 text-xs tracking-widest uppercase rounded-none font-light"
                    onClick={() => {
                      const query = encodeURIComponent(tech.location);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Open in Maps
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#E8E8E8] hover:border-[#8B7355] hover:bg-transparent text-[#1A1A1A] h-12 text-xs tracking-widest uppercase rounded-none font-light"
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
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-20 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-[#E8E8E8]" />
                <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] font-light">
                  Location not available
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
