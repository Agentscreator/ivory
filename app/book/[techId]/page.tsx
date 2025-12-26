'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Clock, DollarSign, Calendar as CalendarIcon, CheckCircle2, Loader2, Sparkles, Upload } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import Image from 'next/image';
import { iapManager } from '@/lib/iap';

export default function BookAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const techId = params.techId as string;

  const [tech, setTech] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [myDesigns, setMyDesigns] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDesign, setSelectedDesign] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [clientNotes, setClientNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTechDetails();
    fetchMyDesigns();
  }, [techId]);

  useEffect(() => {
    if (selectedDate) {
      generateAvailableTimes();
    }
  }, [selectedDate]);

  const fetchTechDetails = async () => {
    try {
      const response = await fetch(`/api/tech/${techId}`);
      const data = await response.json();
      if (response.ok) {
        setTech(data.tech);
        setServices(data.tech.services || []);
      }
    } catch (error) {
      console.error('Error fetching tech:', error);
    }
  };

  const fetchMyDesigns = async () => {
    try {
      const response = await fetch('/api/looks?my=true');
      const data = await response.json();
      if (response.ok) {
        setMyDesigns(data.looks || []);
      }
    } catch (error) {
      console.error('Error fetching designs:', error);
    }
  };

  const generateAvailableTimes = () => {
    const times: string[] = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 0) break;
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeStr);
      }
    }
    setAvailableTimes(times);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      
      // Get user ID from localStorage
      const userStr = localStorage.getItem('ivoryUser');
      if (!userStr) {
        throw new Error('User session not found');
      }
      const user = JSON.parse(userStr);
      
      const lookResponse = await fetch('/api/looks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          title: `Uploaded Design - ${new Date().toLocaleDateString()}`,
          imageUrl: uploadData.url,
          isPublic: false,
        }),
      });

      if (!lookResponse.ok) {
        const errorData = await lookResponse.json();
        throw new Error(errorData.error || 'Failed to save design');
      }

      const lookData = await lookResponse.json();
      
      console.log('Look created successfully:', lookData);
      
      setUploadedImage(uploadData.url);
      setSelectedDesign(lookData.id.toString());
      setMyDesigns([lookData, ...myDesigns]);
      
      alert('Design uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image. Please try again.';
      alert(errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      alert('Please select service, date, and time');
      return;
    }

    if (!selectedDesign && !uploadedImage) {
      alert('Please select or upload a design for your appointment');
      return;
    }

    setLoading(true);
    try {
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          techProfileId: parseInt(techId),
          serviceId: parseInt(selectedService),
          lookId: parseInt(selectedDesign),
          appointmentDate: appointmentDateTime.toISOString(),
          clientNotes,
        }),
      });

      const bookingData = await bookingResponse.json();
      if (!bookingResponse.ok) {
        alert(bookingData.error || 'Failed to create booking');
        return;
      }

      // Check if running in Capacitor (mobile app) or web browser
      const isNativeApp = typeof (window as any).Capacitor !== 'undefined';
      
      if (isNativeApp) {
        // Use IAP for native mobile app
        await handleIAPPayment(bookingData.booking);
      } else {
        // Use Stripe Checkout for web browser
        await handleStripePayment(bookingData.booking);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async (booking: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stripe/create-booking-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to create payment session');
        return;
      }

      const data = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleIAPPayment = async (booking: any) => {
    try {
      const totalPrice = parseFloat(booking.totalPrice);
      const productId = iapManager.getBookingProductId(totalPrice);

      // Setup purchase listeners
      iapManager.onPurchaseComplete(async (result) => {
        try {
          // Validate receipt with backend
          const token = localStorage.getItem('token');
          const response = await fetch('/api/iap/validate-booking-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              receipt: result.receipt,
              productId: result.productId,
              transactionId: result.transactionId,
              bookingId: booking.id,
            }),
          });

          if (response.ok) {
            await iapManager.finishTransaction(result.transactionId);
            router.push(`/bookings?payment=success&booking_id=${booking.id}`);
          } else {
            const error = await response.json();
            alert(error.error || 'Payment validation failed');
          }
        } catch (error) {
          console.error('Error validating IAP payment:', error);
          alert('Payment validation failed');
        }
      });

      iapManager.onPurchaseError((error) => {
        console.error('IAP purchase error:', error);
        alert(`Payment failed: ${error.errorMessage}`);
      });

      // Initiate purchase
      await iapManager.purchase(productId);
    } catch (error) {
      console.error('Error initiating IAP payment:', error);
      alert('Failed to initiate payment');
    }
  };

  if (!tech) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">Loading...</p>
        </div>
      </div>
    );
  }

  const selectedServiceData = services.find(s => s.id.toString() === selectedService);

  return (
    <div className="min-h-screen bg-white pb-32 lg:pb-28">
      {/* Elegant Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-50 backdrop-blur-md bg-white/98">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16 py-4 sm:py-6 lg:py-8">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-500 font-light group mb-4 sm:mb-6"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-500" strokeWidth={1.5} />
            Back
          </button>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light text-[#1A1A1A] tracking-[-0.01em] mb-2 sm:mb-3">
                Book Your Appointment
              </h1>
              <p className="text-sm sm:text-base text-[#6B6B6B] font-light tracking-wide truncate">
                Reserve your session with {tech.businessName || tech.user?.username}
              </p>
            </div>
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#8B7355] flex-shrink-0" strokeWidth={1.5} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16 py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="grid lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-12 sm:space-y-16 lg:space-y-20">
            
            {/* Service Selection */}
            <div>
              <div className="mb-6 sm:mb-8 lg:mb-10">
                <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B7355] mb-2 sm:mb-3 font-light">Step 1</p>
                <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light text-[#1A1A1A] tracking-[-0.01em]">
                  Select Service
                </h2>
              </div>
              <RadioGroup value={selectedService} onValueChange={setSelectedService}>
                <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                  {services.map((service) => (
                    <label
                      key={service.id}
                      htmlFor={`service-${service.id}`}
                      className={`block border p-6 sm:p-8 lg:p-10 cursor-pointer transition-all duration-700 group ${
                        selectedService === service.id.toString()
                          ? 'border-[#8B7355] bg-[#FAFAF8] shadow-xl shadow-[#8B7355]/5'
                          : 'border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-xl hover:shadow-[#8B7355]/5'
                      }`}
                    >
                      <div className="flex items-start gap-4 sm:gap-5">
                        <RadioGroupItem value={service.id.toString()} id={`service-${service.id}`} className="mt-1 sm:mt-1.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-4 sm:gap-6">
                            <div className="flex-1">
                              <h3 className="text-lg sm:text-xl lg:text-2xl font-serif font-light text-[#1A1A1A] tracking-tight mb-2 sm:mb-3">
                                {service.name}
                              </h3>
                              <p className="text-sm sm:text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                                {service.description}
                              </p>
                            </div>
                            <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-8 pt-3 border-t border-[#E8E8E8]">
                              <div className="flex items-center gap-1.5">
                                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-[#8B7355]" strokeWidth={1.5} />
                                <span className="text-xl sm:text-2xl lg:text-3xl font-serif font-light text-[#1A1A1A]">{service.price}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm sm:text-base text-[#6B6B6B] font-light">
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
                                <span>{service.duration} min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Design Selection */}
            <div>
              <div className="mb-6 sm:mb-8 lg:mb-10">
                <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B7355] mb-2 sm:mb-3 font-light">Step 2</p>
                <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light text-[#1A1A1A] tracking-[-0.01em] mb-3 sm:mb-4">
                  Select Design
                  <span className="text-red-500 ml-2">*</span>
                </h2>
                <p className="text-sm sm:text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                  Choose a design you want the tech to recreate (required)
                </p>
              </div>

              {/* Upload Option */}
              <div className="mb-6 sm:mb-8 p-8 sm:p-10 border-2 border-dashed border-[#8B7355]/30 bg-[#FAFAF8] hover:border-[#8B7355] transition-all duration-700">
                <label htmlFor="design-upload" className="cursor-pointer block">
                  <div className="flex flex-col items-center gap-4 sm:gap-5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border border-[#E8E8E8] flex items-center justify-center">
                      {uploadingImage ? (
                        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-[#8B7355] animate-spin" strokeWidth={1.5} />
                      ) : (
                        <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-[#8B7355]" strokeWidth={1} />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm sm:text-base font-light text-[#1A1A1A] mb-1.5 sm:mb-2 tracking-wide">
                        {uploadingImage ? 'Uploading...' : 'Upload Your Design'}
                      </p>
                      <p className="text-xs sm:text-sm text-[#6B6B6B] font-light tracking-wide">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </div>
                  <input
                    id="design-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Design Gallery */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {myDesigns.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => {
                      setSelectedDesign(design.id.toString());
                      setUploadedImage('');
                    }}
                    className={`border-2 p-4 sm:p-5 transition-all duration-700 group ${
                      selectedDesign === design.id.toString()
                        ? 'border-[#8B7355] bg-[#FAFAF8] shadow-xl shadow-[#8B7355]/5'
                        : 'border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-xl hover:shadow-[#8B7355]/5'
                    }`}
                  >
                    <div className="relative aspect-square overflow-hidden mb-3 sm:mb-4">
                      <Image
                        src={design.imageUrl}
                        alt={design.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      {selectedDesign === design.id.toString() && (
                        <div className="absolute inset-0 bg-[#8B7355]/20 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#8B7355]" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-[#1A1A1A] font-light truncate tracking-wide">{design.title}</p>
                  </button>
                ))}
              </div>

              {myDesigns.length === 0 && !uploadedImage && (
                <div className="text-center py-12 sm:py-16 border border-[#E8E8E8] mt-4 sm:mt-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 border border-[#E8E8E8] flex items-center justify-center">
                    <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-[#E8E8E8]" strokeWidth={1} />
                  </div>
                  <p className="text-sm sm:text-base text-[#6B6B6B] font-light tracking-wide px-4">
                    No saved designs yet. Upload an image or create one in the app.
                  </p>
                </div>
              )}
            </div>

            {/* Date & Time Selection */}
            <div>
              <div className="mb-6 sm:mb-8 lg:mb-10">
                <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B7355] mb-2 sm:mb-3 font-light">Step 3</p>
                <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light text-[#1A1A1A] tracking-[-0.01em]">
                  Select Date & Time
                </h2>
              </div>
              <div className="border border-[#E8E8E8] p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 bg-[#FAFAF8]">
                <div>
                  <Label className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] mb-4 sm:mb-5 block font-light">
                    Date
                  </Label>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border-0 scale-90 sm:scale-100 origin-center"
                    />
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <Label className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] mb-4 sm:mb-5 block font-light">
                      Time
                    </Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-3 sm:py-4 text-xs sm:text-sm font-light transition-all duration-700 ${
                            selectedTime === time
                              ? 'bg-[#1A1A1A] text-white'
                              : 'border border-[#E8E8E8] bg-white text-[#1A1A1A] hover:border-[#8B7355]'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <div className="mb-6 sm:mb-8 lg:mb-10">
                <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B7355] mb-2 sm:mb-3 font-light">Step 4</p>
                <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light text-[#1A1A1A] tracking-[-0.01em] mb-3 sm:mb-4">
                  Additional Notes
                </h2>
                <p className="text-sm sm:text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                  Any special requests or information for the nail tech
                </p>
              </div>
              <Textarea
                placeholder="E.g., allergies, preferred colors, modifications to the design..."
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                rows={5}
                className="border-[#E8E8E8] focus:border-[#8B7355] font-light text-sm sm:text-base p-4 sm:p-6"
              />
            </div>
          </div>

          {/* Right Column - Summary (Sticky on desktop, fixed on mobile) */}
          <div className="lg:col-span-1">
            {/* Desktop Sticky Summary */}
            <div className="hidden lg:block lg:sticky lg:top-32">
              <div className="border border-[#E8E8E8] p-8 sm:p-10 bg-[#FAFAF8]">
                <h3 className="text-[11px] tracking-[0.25em] uppercase text-[#8B7355] mb-8 font-light">
                  Booking Summary
                </h3>
                
                <div className="space-y-6 mb-8">
                  {selectedServiceData && (
                    <>
                      <div className="pb-6 border-b border-[#E8E8E8]">
                        <p className="text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-3 font-light">Service</p>
                        <p className="text-lg font-light text-[#1A1A1A] tracking-wide">{selectedServiceData.name}</p>
                      </div>
                      <div className="pb-6 border-b border-[#E8E8E8]">
                        <p className="text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-3 font-light">Duration</p>
                        <p className="text-lg font-light text-[#1A1A1A] tracking-wide">{selectedServiceData.duration} minutes</p>
                      </div>
                    </>
                  )}
                  
                  {selectedDate && selectedTime && (
                    <div className="pb-6 border-b border-[#E8E8E8]">
                      <p className="text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-3 font-light">Date & Time</p>
                      <p className="text-base font-light text-[#1A1A1A] tracking-wide">
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-base font-light text-[#1A1A1A] mt-2 tracking-wide">{selectedTime}</p>
                    </div>
                  )}

                  {selectedServiceData && (
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between text-base">
                        <span className="text-[#6B6B6B] font-light tracking-wide">Service Price</span>
                        <span className="font-light text-[#1A1A1A]">
                          ${parseFloat(selectedServiceData.price).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span className="text-[#6B6B6B] font-light tracking-wide">Service Fee (12.5%)</span>
                        <span className="font-light text-[#1A1A1A]">
                          ${(parseFloat(selectedServiceData.price) * 0.125).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xl pt-4 border-t border-[#E8E8E8]">
                        <span className="font-serif font-light text-[#1A1A1A]">Total</span>
                        <span className="font-serif font-light text-[#1A1A1A]">
                          ${(parseFloat(selectedServiceData.price) * 1.125).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedDesign && (
                    <div className="pb-6 border-b border-[#E8E8E8]">
                      <p className="text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-3 font-light">Selected Design</p>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" strokeWidth={1.5} />
                        <p className="text-base font-light text-[#1A1A1A] tracking-wide">Design attached</p>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={loading || !selectedService || !selectedDate || !selectedTime || !selectedDesign}
                  className="w-full bg-[#1A1A1A] hover:bg-[#8B7355] text-white h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </Button>
                
                {!selectedDesign && (
                  <p className="text-sm text-center text-red-500 mt-4 font-light tracking-wide">
                    Please select or upload a design to continue
                  </p>
                )}
                
                <p className="text-sm text-center text-[#6B6B6B] mt-6 font-light leading-[1.7] tracking-wide">
                  Secure payment via {typeof (window as any).Capacitor !== 'undefined' ? 'Apple In-App Purchase' : 'Stripe'}. Your booking will be confirmed after payment.
                </p>
              </div>
            </div>

            {/* Mobile Fixed Bottom Summary */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8E8E8] p-4 backdrop-blur-md bg-white/98 safe-bottom">
              <div className="flex items-center justify-between gap-4 mb-3">
                {selectedServiceData && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#6B6B6B] font-light tracking-wide truncate">{selectedServiceData.name}</p>
                    <p className="text-lg font-serif font-light text-[#1A1A1A]">
                      ${(parseFloat(selectedServiceData.price) * 1.125).toFixed(2)}
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleBooking}
                  disabled={loading || !selectedService || !selectedDate || !selectedTime || !selectedDesign}
                  className="bg-[#1A1A1A] hover:bg-[#8B7355] text-white h-12 px-8 text-[10px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {loading ? 'Processing...' : 'Book Now'}
                </Button>
              </div>
              {!selectedDesign && (
                <p className="text-xs text-center text-red-500 font-light tracking-wide">
                  Please select a design to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} centerActionLabel="Create" />
    </div>
  );
}
