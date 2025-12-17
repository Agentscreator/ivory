'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Star, Phone, Globe, Instagram, DollarSign, Clock, Map, Navigation } from 'lucide-react';
import { TechLocationMap } from '@/components/tech-location-map';

export default function TechProfilePage() {
  const router = useRouter();
  const params = useParams();
  const techId = params.id as string;
  const [tech, setTech] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    return <div className="p-4">Loading...</div>;
  }

  if (!tech) {
    return <div className="p-4">Tech not found</div>;
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto p-4">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4 hover:bg-[#F8F7F5]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-start gap-4">
            {tech.user?.avatar && (
              <img
                src={tech.user.avatar}
                alt={tech.businessName}
                className="w-20 h-20 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{tech.businessName || tech.user?.username}</h1>
                {tech.isVerified && <Badge>Verified</Badge>}
              </div>
              <div className="flex items-center gap-1 text-gray-600 mb-2">
                <MapPin className="h-4 w-4" />
                <span>{tech.location || 'Location not set'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-semibold">{tech.rating || '0.00'}</span>
                </div>
                <span className="text-gray-500">({tech.totalReviews || 0} reviews)</span>
              </div>
            </div>
            <Button 
              size="lg" 
              className="bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all"
              onClick={() => router.push(`/book/${techId}`)}
            >
              Book Appointment
            </Button>
          </div>

          {tech.bio && (
            <p className="mt-4 text-gray-600">{tech.bio}</p>
          )}

          {/* Contact Info */}
          <div className="flex gap-4 mt-4">
            {tech.phoneNumber && (
              <a href={`tel:${tech.phoneNumber}`} className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary">
                <Phone className="h-4 w-4" />
                {tech.phoneNumber}
              </a>
            )}
            {tech.website && (
              <a href={tech.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary">
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
            {tech.instagramHandle && (
              <a href={`https://instagram.com/${tech.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary">
                <Instagram className="h-4 w-4" />
                @{tech.instagramHandle}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4">
        <Tabs defaultValue="services" className="w-full">
          <TabsList>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="location">
              <Map className="h-4 w-4 mr-2" />
              Location
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4 mt-6">
            {tech.services && tech.services.length > 0 ? (
              tech.services.map((service: any) => (
                <Card key={service.id} className="border-[#E8E8E8] hover:border-[#8B7355] transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{service.name}</CardTitle>
                        <CardDescription>{service.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-bold">
                          <DollarSign className="h-5 w-5" />
                          {service.price}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {service.duration} min
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <Card className="border-[#E8E8E8]">
                <CardContent className="py-12 text-center text-[#6B6B6B]">
                  No services listed yet
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="mt-6">
            {tech.portfolioImages && tech.portfolioImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tech.portfolioImages.map((img: any) => (
                  <div key={img.id} className="aspect-square">
                    <img
                      src={img.imageUrl}
                      alt={img.caption || 'Portfolio'}
                      className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(img.imageUrl, '_blank')}
                    />
                    {img.caption && (
                      <p className="text-sm text-gray-600 mt-1">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-[#E8E8E8]">
                <CardContent className="py-12 text-center text-[#6B6B6B]">
                  No portfolio images yet
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4 mt-6">
            {tech.reviews && tech.reviews.length > 0 ? (
              tech.reviews.map((review: any) => (
                <Card key={review.id} className="border-[#E8E8E8]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {review.client?.avatar && (
                          <img
                            src={review.client.avatar}
                            alt={review.client.username}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{review.client?.username}</p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-[#6B6B6B]">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  {review.comment && (
                    <CardContent>
                      <p className="text-[#6B6B6B]">{review.comment}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {review.images.map((img: string, idx: number) => (
                            <img
                              key={idx}
                              src={img}
                              alt="Review"
                              className="w-20 h-20 object-cover rounded cursor-pointer"
                              onClick={() => window.open(img, '_blank')}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))
            ) : (
              <Card className="border-[#E8E8E8]">
                <CardContent className="py-12 text-center text-[#6B6B6B]">
                  No reviews yet
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="location" className="mt-6">
            <Card className="border-[#E8E8E8]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#8B7355]" />
                  {tech.businessName || tech.user?.username}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {tech.location || 'Location not set'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tech.location ? (
                  <>
                    <TechLocationMap
                      location={tech.location}
                      businessName={tech.businessName}
                      className="w-full h-[400px] rounded-lg overflow-hidden border border-[#E8E8E8]"
                    />
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-[#E8E8E8] hover:border-[#8B7355]"
                        onClick={() => {
                          const query = encodeURIComponent(tech.location);
                          window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                        }}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-[#E8E8E8] hover:border-[#8B7355]"
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
                  <div className="py-12 text-center text-[#6B6B6B]">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-[#E8E8E8]" />
                    <p>Location not available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
