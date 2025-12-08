"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check, DollarSign, MessageCircle } from "lucide-react"
import Image from "next/image"

type ClientRequest = {
  id: string
  clientName: string
  designImage: string
  message: string
  status: "pending" | "approved" | "modified"
  date: string
}

const mockRequests: ClientRequest[] = [
  {
    id: "1",
    clientName: "Emma Wilson",
    designImage: "/elegant-french-manicure-nails.jpg",
    message: "Would love this for my wedding next week!",
    status: "pending",
    date: "2024-01-20",
  },
  {
    id: "2",
    clientName: "Sophia Lee",
    designImage: "/pink-ombre-nail-design.jpg",
    message: "Can we add some sparkle?",
    status: "pending",
    date: "2024-01-19",
  },
]

export default function TechDashboardPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<ClientRequest[]>(mockRequests)

  const handleApprove = (id: string) => {
    setRequests(requests.map((req) => (req.id === id ? { ...req, status: "approved" as const } : req)))
  }

  const handleRequestModification = (id: string) => {
    router.push(`/tech/review/${id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-serif text-xl font-bold text-charcoal">Tech Dashboard</h1>
          </div>
          <Button variant="outline" onClick={() => router.push("/profile")}>
            Profile
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="requests" className="flex-1">
              Client Requests
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex-1">
              Approved
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex-1">
              My Gallery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {requests
              .filter((req) => req.status === "pending")
              .map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-6 flex-col md:flex-row">
                      {/* Design Image */}
                      <div className="w-full md:w-48 h-48 relative rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={request.designImage || "/placeholder.svg"}
                          alt="Client design"
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-serif text-xl font-bold text-charcoal mb-1">{request.clientName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(request.date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <Badge variant="secondary">New</Badge>
                        </div>

                        {request.message && (
                          <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                            <p className="text-sm text-foreground">{request.message}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" onClick={() => handleApprove(request.id)}>
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRequestModification(request.id)}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Request Changes
                          </Button>
                          <Button size="sm" variant="outline">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Offer Add-ons
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {requests.filter((req) => req.status === "pending").length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No pending requests at the moment</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {requests
              .filter((req) => req.status === "approved")
              .map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-6 items-center">
                      <div className="w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={request.designImage || "/placeholder.svg"}
                          alt="Approved design"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-charcoal mb-1">{request.clientName}</h3>
                        <Badge className="bg-green-500">Approved</Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {requests.filter((req) => req.status === "approved").length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No approved designs yet</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="gallery">
            <Card className="p-12 text-center">
              <h3 className="font-serif text-xl font-bold text-charcoal mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">Your portfolio gallery will be displayed here</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
