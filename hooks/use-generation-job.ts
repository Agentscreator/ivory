import { useState, useEffect, useCallback, useRef } from 'react'

export type GenerationJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface GenerationJob {
  jobId: string
  status: GenerationJobStatus
  resultImages?: string[]
  errorMessage?: string
  createdAt?: string
  completedAt?: string
}

export function useGenerationJob(jobId: string | null) {
  const [job, setJob] = useState<GenerationJob | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchJobStatus = useCallback(async () => {
    if (!jobId) return

    try {
      const response = await fetch(`/api/generation-job/${jobId}`)
      if (response.ok) {
        const data = await response.json()
        setJob(data)

        // Stop polling if job is completed or failed
        if (data.status === 'completed' || data.status === 'failed') {
          setIsPolling(false)
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
          }
        }
      }
    } catch (error) {
      console.error('Error fetching job status:', error)
    }
  }, [jobId])

  // Start polling
  const startPolling = useCallback(() => {
    if (isPolling || !jobId) return

    setIsPolling(true)
    
    // Fetch immediately
    fetchJobStatus()

    // Then poll every 3 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchJobStatus()
    }, 3000)
  }, [jobId, isPolling, fetchJobStatus])

  // Stop polling
  const stopPolling = useCallback(() => {
    setIsPolling(false)
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }, [])

  // Auto-start polling when jobId changes
  useEffect(() => {
    if (jobId) {
      startPolling()
    }

    return () => {
      stopPolling()
    }
  }, [jobId])

  return {
    job,
    isPolling,
    startPolling,
    stopPolling,
    refetch: fetchJobStatus,
  }
}
