"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function BackgroundGenerationMonitor() {
  const router = useRouter()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    // Only check once when component mounts
    if (hasChecked) return

    const checkPendingGenerations = async () => {
      try {
        const response = await fetch('/api/user/pending-generations')
        if (!response.ok) return

        const { activeJobs, completedJobs } = await response.json()

        // Show notification for active jobs
        if (activeJobs && activeJobs.length > 0) {
          toast.info(`${activeJobs.length} design${activeJobs.length > 1 ? 's' : ''} generating`, {
            description: 'Your designs are being created in the background',
            duration: 5000,
          })
        }

        // Auto-save completed jobs
        if (completedJobs && completedJobs.length > 0) {
          console.log(`Found ${completedJobs.length} completed job(s) to auto-save`)
          
          let totalSaved = 0
          
          for (const job of completedJobs) {
            try {
              const saveResponse = await fetch(`/api/generation-job/${job.jobId}/auto-save`, {
                method: 'POST',
              })

              if (saveResponse.ok) {
                const { savedCount } = await saveResponse.json()
                totalSaved += savedCount
              }
            } catch (error) {
              console.error('Error auto-saving job:', job.jobId, error)
            }
          }

          if (totalSaved > 0) {
            toast.success(`${totalSaved} design${totalSaved > 1 ? 's' : ''} completed! 🎉`, {
              description: 'Your designs have been saved to your collection',
              duration: 5000,
              action: {
                label: 'View',
                onClick: () => {
                  // Get user type from localStorage
                  const userStr = localStorage.getItem('ivoryUser')
                  if (userStr) {
                    const user = JSON.parse(userStr)
                    if (user.userType === 'tech') {
                      router.push('/tech/dashboard?tab=designs')
                    } else {
                      router.push('/home')
                    }
                  } else {
                    router.push('/home')
                  }
                },
              },
            })
          }
        }

        setHasChecked(true)
      } catch (error) {
        console.error('Error checking pending generations:', error)
        setHasChecked(true)
      }
    }

    // Check after a short delay to let the page load
    const timer = setTimeout(() => {
      checkPendingGenerations()
    }, 1000)

    return () => clearTimeout(timer)
  }, [hasChecked, router])

  // This component doesn't render anything
  return null
}
