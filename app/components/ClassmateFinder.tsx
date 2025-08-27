'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import LoadingSpinner from './LoadingSpinner'
import ClientOnly from './ClientOnly'

interface Course {
  id: string
  name: string
  title: string
  credits: number
  average_gpa: number
  professors: Professor[]
  timeSlots?: string[]
  section?: string
}

interface Professor {
  name: string
  average_gpa: number
  reviews: Review[]
  sentiment: 'positive' | 'neutral' | 'negative'
  tags: string[]
  type: string
}

interface Review {
  review: string
  rating: number
}

interface Classmate {
  userId: string
  displayName: string
  instagramHandle: string
  sharedCourses: Course[]
  overlapPercentage: number
}

interface UserData {
  universityVerified: boolean
  instagramHandle?: string
  sharedSchedules: boolean
  displayName?: string
  schedules?: Array<{
    id: string
    name: string
    courses: Course[]
  }>
}

function ClassmateFinderContent() {
  const { user } = useUser()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [classmates, setClassmates] = useState<Classmate[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<string>('')

  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`user-data-${user.id}`)
      if (savedData) {
        const data = JSON.parse(savedData)
        setUserData(data)
        if (data.schedules && data.schedules.length > 0) {
          setSelectedSchedule(data.schedules[0].id)
        }
      }
    }
  }, [user])

  const findClassmates = async () => {
    if (!selectedSchedule || !userData) return

    setLoading(true)
    
    try {
      // Get all shared schedules from localStorage
      const allUserData: { [key: string]: UserData } = {}
      const keys = Object.keys(localStorage)
      
      keys.forEach(key => {
        if (key.startsWith('user-data-') && key !== `user-data-${user?.id}`) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}')
            if (data.universityVerified && data.sharedSchedules) {
              allUserData[key] = data
            }
          } catch (e) {
            // Skip invalid data
          }
        }
      })

      const currentSchedule = userData.schedules?.find(s => s.id === selectedSchedule)
      if (!currentSchedule) return

      const foundClassmates: Classmate[] = []

      Object.entries(allUserData).forEach(([userId, data]) => {
        data.schedules?.forEach(schedule => {
          // Match by exact course name AND section
          const sharedCourses = currentSchedule.courses.filter(course =>
            schedule.courses.some(scheduleCourse => 
              scheduleCourse.name === course.name && 
              scheduleCourse.section === course.section &&
              scheduleCourse.section && course.section // Both must have sections
            )
          )

          if (sharedCourses.length > 0) {
            const overlapPercentage = (sharedCourses.length / currentSchedule.courses.length) * 100
            
            foundClassmates.push({
              userId: userId.replace('user-data-', ''),
              displayName: data.displayName || 'Anonymous Terp',
              instagramHandle: data.instagramHandle || 'No Instagram',
              sharedCourses,
              overlapPercentage
            })
          }
        })
      })

      // Sort by overlap percentage
      foundClassmates.sort((a, b) => b.overlapPercentage - a.overlapPercentage)
      setClassmates(foundClassmates)
    } catch (error) {
      console.error('Error finding classmates:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyInstagramHandle = (handle: string) => {
    navigator.clipboard.writeText(handle)
    // You could add a toast notification here
  }

  if (!userData?.universityVerified) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Please verify your UMD email to use the classmate finder feature.
        </p>
      </div>
    )
  }

  if (!userData?.schedules || userData.schedules.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          You need to save at least one schedule to find classmates. Go to the Schedule Builder tab to create and save a schedule.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Find Your Classmates</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a schedule to find classmates:
        </label>
        <select
          value={selectedSchedule}
          onChange={(e) => setSelectedSchedule(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
        >
          {userData.schedules.map((schedule) => (
            <option key={schedule.id} value={schedule.id}>
              {schedule.name} ({schedule.courses.length} courses)
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={findClassmates}
        disabled={loading}
        className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        {loading ? <LoadingSpinner /> : 'Find Classmates'}
      </button>

      {classmates.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Found {classmates.length} classmate{classmates.length !== 1 ? 's' : ''}:
          </h3>
          <div className="space-y-4">
            {classmates.map((classmate) => (
              <div key={classmate.userId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">{classmate.displayName}</h4>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    {classmate.overlapPercentage.toFixed(0)}% overlap
                  </span>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Shared courses:</p>
                  <div className="space-y-1">
                    {classmate.sharedCourses.map((course) => (
                      <div key={course.id} className="text-sm bg-gray-50 px-2 py-1 rounded">
                        {course.name} - {course.title}
                        {course.section && <span className="text-gray-500 ml-2">(Section {course.section})</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Instagram: {classmate.instagramHandle}
                  </span>
                  <button
                    onClick={() => copyInstagramHandle(classmate.instagramHandle)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Copy Handle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {classmates.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          <p>No classmates found with the selected schedule.</p>
          <p className="text-sm mt-2">
            Make sure your schedule has section numbers and other students have shared their schedules.
          </p>
        </div>
      )}
    </div>
  )
}

export default function ClassmateFinder() {
  return (
    <ClientOnly fallback={
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-6"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <ClassmateFinderContent />
    </ClientOnly>
  )
}
