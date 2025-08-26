'use client'

import { useState, useEffect } from 'react'

// Try to import Clerk components, but provide fallbacks if they fail
let useUser: any = null
try {
  const clerk = require('@clerk/nextjs')
  useUser = clerk.useUser
} catch (error) {
  console.warn('Clerk not available, using fallback mode')
}
import LoadingSpinner from './LoadingSpinner'

interface Course {
  id: string
  name: string
  title: string
  credits: number
  average_gpa: number
  section?: string
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
  schedules: Array<{
    id: string
    name: string
    courses: Course[]
  }>
}

export default function ClassmateFinder() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [classmates, setClassmates] = useState<Classmate[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<string>('')

  // Only call useUser on the client side
  useEffect(() => {
    if (useUser) {
      try {
        const { user: clerkUser } = useUser()
        setUser(clerkUser)
      } catch (error) {
        console.warn('Clerk not available:', error)
      }
    }
  }, [])

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

      const currentSchedule = userData.schedules.find(s => s.id === selectedSchedule)
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

  if (!userData?.sharedSchedules) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          Enable schedule sharing in your profile to find classmates.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-effect rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Find Your Classmates</h2>
      
      {userData.schedules && userData.schedules.length > 0 ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Schedule to Search
            </label>
            <select
              value={selectedSchedule}
              onChange={(e) => setSelectedSchedule(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            >
              {userData.schedules.map(schedule => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.name} ({schedule.courses.length} courses)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={findClassmates}
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner size="sm" text="Finding classmates..." /> : 'Find Classmates'}
          </button>

          {classmates.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">
                Found {classmates.length} classmate{classmates.length !== 1 ? 's' : ''}
              </h3>
              
              <div className="space-y-3">
                {classmates.map((classmate, index) => (
                  <div key={index} className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{classmate.displayName}</h4>
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        {classmate.overlapPercentage.toFixed(0)}% overlap
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Instagram:</span>
                        <span className="font-medium">{classmate.instagramHandle}</span>
                      </div>
                      <button
                        onClick={() => copyInstagramHandle(classmate.instagramHandle)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Shared sections:</p>
                      <div className="space-y-1">
                        {classmate.sharedCourses.map(course => (
                          <div
                            key={course.id}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            <div className="font-medium">{course.name} - Section {course.section}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {classmates.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <p>No classmates found with the same course sections.</p>
              <p className="text-sm mt-1">Make sure to add course section numbers (e.g., 0101, 0201) to find exact classmates!</p>
              <p className="text-xs mt-2 text-gray-400">
                💡 You'll only see classmates who are in the exact same sections as you
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No schedules found.</p>
          <p className="text-sm mt-1">Create and save a schedule first!</p>
        </div>
      )}
    </div>
  )
}
