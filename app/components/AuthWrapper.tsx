'use client'

import { useUser, SignIn, SignUp } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { UserProfile } from '@clerk/nextjs'

interface UserData {
  universityVerified: boolean
  instagramHandle?: string
  sharedSchedules: boolean
  displayName?: string
  schedules?: Array<{
    id: string
    name: string
    courses: any[]
  }>
}

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    if (isSignedIn && user) {
      // Load user data from localStorage or API
      const savedData = localStorage.getItem(`user-data-${user.id}`)
      if (savedData) {
        setUserData(JSON.parse(savedData))
      } else {
        setUserData({
          universityVerified: false,
          sharedSchedules: false
        })
      }
    }
  }, [isSignedIn, user])

  const saveUserData = (data: Partial<UserData>) => {
    if (user && userData) {
      const updatedData = { ...userData, ...data }
      setUserData(updatedData)
      localStorage.setItem(`user-data-${user.id}`, JSON.stringify(updatedData))
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    const [showSignUp, setShowSignUp] = useState(false)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4">
        <div className="max-w-md mx-auto mt-20">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
                <circle cx="16" cy="16" r="15" fill="#DC2626" stroke="#B91C1C" stroke-width="2"/>
                <ellipse cx="16" cy="18" rx="8" ry="6" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1"/>
                <path d="M12 16 Q16 14 20 16 Q16 18 12 16" fill="#F59E0B" opacity="0.6"/>
                <path d="M12 18 Q16 16 20 18 Q16 20 12 18" fill="#F59E0B" opacity="0.4"/>
                <ellipse cx="16" cy="12" rx="3" ry="2" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1"/>
                <circle cx="14.5" cy="11.5" r="0.5" fill="#1F2937"/>
                <circle cx="17.5" cy="11.5" r="0.5" fill="#1F2937"/>
                <rect x="8" y="6" width="3" height="3" rx="0.5" fill="#FFFFFF" opacity="0.9"/>
                <rect x="12" y="6" width="3" height="3" rx="0.5" fill="#FFFFFF" opacity="0.9"/>
                <rect x="16" y="6" width="3" height="3" rx="0.5" fill="#FFFFFF" opacity="0.9"/>
                <rect x="20" y="6" width="3" height="3" rx="0.5" fill="#FFFFFF" opacity="0.9"/>
                <line x1="10" y1="8" x2="14" y2="10" stroke="#FFFFFF" stroke-width="1" opacity="0.7"/>
                <line x1="22" y1="8" x2="18" y2="10" stroke="#FFFFFF" stroke-width="1" opacity="0.7"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-red-600 mb-2">TerpTracker</h1>
            <p className="text-gray-600">Connect with your UMD classmates</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            {showSignUp ? (
              <>
                <SignUp routing="hash" />
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">Already have an account?</p>
                  <button
                    onClick={() => setShowSignUp(false)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Sign In
                  </button>
                </div>
              </>
            ) : (
              <>
                <SignIn routing="hash" />
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">Don't have an account?</p>
                  <button
                    onClick={() => setShowSignUp(true)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Create Account
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show profile setup if user hasn't completed verification
  if (userData && !userData.universityVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4">
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Complete Your Profile</h2>
            <p className="text-gray-600 text-center mb-6">
              To use the classmate finder feature, you need to verify your UMD email, add your Instagram handle, and include course section numbers in your schedules.
            </p>
            
            <div className="space-y-6">
              {/* UMD Email Verification */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">1. Verify Your UMD Email</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Add your @umd.edu email to verify you're a UMD student
                </p>
                <button
                  onClick={() => setShowProfile(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Add UMD Email
                </button>
              </div>

              {/* Instagram Handle */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">2. Add Your Instagram Handle</h3>
                <p className="text-sm text-gray-600 mb-3">
                  This will be shared with classmates who have the same courses
                </p>
                <input
                  type="text"
                  placeholder="@your_instagram_handle"
                  value={userData.instagramHandle || ''}
                  onChange={(e) => saveUserData({ instagramHandle: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Enable Classmate Finder */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">3. Enable Classmate Finder</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Share your schedule to find classmates in the same sections
                </p>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userData.sharedSchedules}
                    onChange={(e) => saveUserData({ sharedSchedules: e.target.checked })}
                    className="mr-2"
                  />
                  Share my schedules with classmates
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Add course section numbers (e.g., 0101, 0201) to find exact classmates
                </p>
              </div>
            </div>

            {userData.universityVerified && userData.instagramHandle && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowProfile(false)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
                >
                  Continue to TerpTracker
                </button>
              </div>
            )}
          </div>
        </div>

        {showProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Add UMD Email</h3>
                  <button
                    onClick={() => setShowProfile(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4">
                <UserProfile routing="hash" />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return <>{children}</>
}
