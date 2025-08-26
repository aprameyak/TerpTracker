'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import AuthWrapper from './components/AuthWrapper'
import ClassmateFinder from './components/ClassmateFinder'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'

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

interface ScheduleAnalysis {
  survivabilityScore: number
  predictedGPA: { min: number; max: number }
  totalCredits: number
  warnings: string[]
  recommendations: string[]
  difficultyBreakdown: {
    easy: number
    medium: number
    hard: number
  }
  professorInsights: string[]
}

export default function Home() {
  const { user } = useUser()
  const [courseCode, setCourseCode] = useState('')
  const [schedule, setSchedule] = useState<Course[]>([])
  const [analysis, setAnalysis] = useState<ScheduleAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedSchedules, setSavedSchedules] = useState<{name: string, courses: Course[]}[]>([])
  const [editingSchedule, setEditingSchedule] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [activeTab, setActiveTab] = useState<'schedule' | 'classmates'>('schedule')

  // Load saved schedules on mount
  useEffect(() => {
    const saved = localStorage.getItem('terptrack-schedules')
    if (saved) {
      setSavedSchedules(JSON.parse(saved))
    }
  }, [])

  const addCourse = async () => {
    if (!courseCode || schedule.find(c => c.name === courseCode)) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/course/${courseCode}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch course: ${response.status}`)
      }
      
      const data = await response.json()
      
      const newCourse: Course = {
        id: Math.random().toString(),
        name: data.name,
        title: data.title,
        credits: data.credits || 3,
        average_gpa: data.average_gpa,
        professors: data.professors || []
      }
      setSchedule(prev => [...prev, newCourse])
      setCourseCode('')
    } catch (error) {
      console.error('Error adding course:', error)
      setError('Failed to add course. Please try again.')
      
      // Fallback: add course with basic info
      const newCourse: Course = {
        id: Math.random().toString(),
        name: courseCode,
        title: `${courseCode} - Course`,
        credits: 3,
        average_gpa: 0,
        professors: []
      }
      setSchedule(prev => [...prev, newCourse])
      setCourseCode('')
    } finally {
      setLoading(false)
    }
  }

  const updateCourseSection = (courseId: string, value: string) => {
    setSchedule(prev => prev.map(course => 
      course.id === courseId ? { ...course, section: value } : course
    ))
  }

  const removeCourse = (courseId: string) => {
    setSchedule(prev => prev.filter(c => c.id !== courseId))
  }

  const saveSchedule = () => {
    const name = prompt('Name your schedule:')
    if (name && schedule.length > 0) {
      const newSavedSchedule = { name, courses: [...schedule] }
      setSavedSchedules(prev => {
        const updated = [...prev, newSavedSchedule]
        localStorage.setItem('terptrack-schedules', JSON.stringify(updated))
        
        // Also save to user-specific storage for classmate finder
        if (user) {
          const userData = localStorage.getItem(`user-data-${user.id}`)
          const parsedData = userData ? JSON.parse(userData) : {}
          const userSchedules = parsedData.schedules || []
          userSchedules.push({
            id: Math.random().toString(),
            name,
            courses: [...schedule]
          })
          localStorage.setItem(`user-data-${user.id}`, JSON.stringify({
            ...parsedData,
            schedules: userSchedules
          }))
        }
        
        return updated
      })
    }
  }

  const loadSchedule = (savedSchedule: {name: string, courses: Course[]}) => {
    setSchedule(savedSchedule.courses)
    setAnalysis(null)
  }

  const deleteSchedule = (index: number) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      setSavedSchedules(prev => {
        const updated = prev.filter((_, i) => i !== index)
        localStorage.setItem('terptrack-schedules', JSON.stringify(updated))
        return updated
      })
    }
  }

  const startRename = (index: number, currentName: string) => {
    setEditingSchedule(index)
    setEditingName(currentName)
  }

  const saveRename = (index: number) => {
    if (editingName.trim()) {
      setSavedSchedules(prev => {
        const updated = prev.map((schedule, i) => 
          i === index ? { ...schedule, name: editingName.trim() } : schedule
        )
        localStorage.setItem('terptrack-schedules', JSON.stringify(updated))
        return updated
      })
    }
    setEditingSchedule(null)
    setEditingName('')
  }

  const cancelRename = () => {
    setEditingSchedule(null)
    setEditingName('')
  }

  const analyzeSchedule = async () => {
    if (schedule.length === 0) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/analyze-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses: schedule })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to analyze schedule: ${response.status}`)
      }
      
      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error('Error analyzing schedule:', error)
      setError('Failed to analyze schedule. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (gpa: number) => {
    if (gpa === 0) return 'text-gray-600 bg-gray-50' // No GPA data
    if (gpa >= 3.5) return 'text-green-600 bg-green-50'
    if (gpa >= 3.0) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const exportSchedule = () => {
    const scheduleText = schedule.map(course => 
      `${course.name} - ${course.title} (${course.credits} credits)`
    ).join('\n')
    
    const blob = new Blob([`TerpTrack Schedule\n\n${scheduleText}\n\nTotal Credits: ${schedule.reduce((sum, c) => sum + c.credits, 0)}`], 
      { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-schedule.txt'
    a.click()
  }

  return (
    <ErrorBoundary>
      <AuthWrapper>
        <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
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
            <h1 className="text-4xl font-bold text-red-600 mb-2">
              TerpTracker
            </h1>
            <p className="text-xl text-gray-700 mb-2">
              How Terrapin tough is your schedule?
            </p>
            <p className="text-sm text-gray-500">
              Real data from PlanetTerp • Built for Terps, by Terps
            </p>
            {user && (
              <div className="mt-4 text-sm text-gray-600">
                Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}!
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Schedule Builder
            </button>
            <button
              onClick={() => setActiveTab('classmates')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'classmates'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Find Classmates
            </button>
          </div>

          {/* Schedule Builder Tab */}
          {activeTab === 'schedule' && (
            <>
              {/* Saved Schedules */}
              {savedSchedules.length > 0 && (
                <div className="glass-effect rounded-xl shadow-lg p-6 mb-4">
                  <h2 className="text-lg font-semibold mb-3">Saved Schedules</h2>
                  <div className="space-y-2">
                    {savedSchedules.map((saved, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        {editingSchedule === idx ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && saveRename(idx)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              autoFocus
                            />
                            <button
                              onClick={() => saveRename(idx)}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelRename}
                              className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => loadSchedule(saved)}
                              className="flex-1 text-left hover:bg-gray-100 p-2 rounded"
                            >
                              <span className="font-medium">{saved.name}</span>
                              <span className="text-gray-500 ml-2">({saved.courses.length} courses)</span>
                            </button>
                            <div className="flex gap-1">
                              <button
                                onClick={() => startRename(idx, saved.name)}
                                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                title="Rename"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteSchedule(idx)}
                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                title="Delete"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="glass-effect rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Build Your Schedule</h2>
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="CMSC131, MATH140, ENGL101..."
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && addCourse()}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 text-lg"
                  />
                  <button
                    onClick={addCourse}
                    disabled={loading}
                    className="px-6 py-3 umd-red text-white rounded-lg disabled:opacity-50 font-medium transition-all"
                  >
                    {loading ? <LoadingSpinner size="sm" text="" /> : '+ Add'}
                  </button>
                </div>
                
                {schedule.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-700">Current Schedule</h3>
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {schedule.reduce((sum, c) => sum + c.credits, 0)} credits
                      </span>
                    </div>
                    {schedule.map(course => (
                      <div key={course.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-medium">{course.name}</span>
                            <span className="text-gray-600 ml-2">- {course.title}</span>
                            <span className={`ml-2 px-2 py-1 rounded text-sm ${getDifficultyColor(course.average_gpa)}`}>
                              GPA: {course.average_gpa > 0 ? course.average_gpa.toFixed(2) : 'No GPA data'}
                            </span>
                          </div>
                          <button
                            onClick={() => removeCourse(course.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                        
                        {/* Section Number */}
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Section number (e.g., 0101, 0201)"
                            value={course.section || ''}
                            onChange={(e) => updateCourseSection(course.id, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                        </div>
                        
                        {course.professors.length > 0 && (
                          <div className="text-sm text-gray-600 mt-2">
                            {course.professors.length} professor{course.professors.length !== 1 ? 's' : ''} available
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={analyzeSchedule}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                      >
                        {loading ? <LoadingSpinner size="sm" text="" /> : 'Check if I\'ll survive'}
                      </button>
                      <button
                        onClick={saveSchedule}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={exportSchedule}
                        className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Export
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {analysis && (
                <div className="space-y-6">
                  {/* Survivability Score */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-4 text-center">Your Schedule Report</h2>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                        <h3 className="font-semibold text-purple-800">Survival Rate</h3>
                        <p className="text-3xl font-bold text-purple-600">
                          {analysis.survivabilityScore}/10
                        </p>
                        <p className="text-sm text-purple-600">
                          {analysis.survivabilityScore >= 8 ? 'You got this' : 
                           analysis.survivabilityScore >= 6 ? 'Doable but tough' : 'RIP your GPA'}
                        </p>
                      </div>
                      
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <h3 className="font-semibold text-blue-800">Predicted GPA</h3>
                        <p className="text-2xl font-bold text-blue-600">
                          {analysis.predictedGPA.min.toFixed(1)}-{analysis.predictedGPA.max.toFixed(1)}
                        </p>
                        <p className="text-sm text-blue-600">Realistic Range</p>
                      </div>
                      
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <h3 className="font-semibold text-green-800">Total Credits</h3>
                        <p className="text-3xl font-bold text-green-600">{analysis.totalCredits}</p>
                        <p className="text-sm text-green-600">
                          {analysis.totalCredits >= 18 ? 'Overachiever' : 
                           analysis.totalCredits >= 15 ? 'Standard load' : 'Part-time vibes'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Warnings */}
                  {analysis.warnings.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-800 mb-3">Red Flags</h3>
                      <ul className="space-y-2">
                        {analysis.warnings.map((warning, idx) => (
                          <li key={idx} className="text-red-700 flex items-start">
                            <span className="mr-2">•</span>
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations & Professor Insights */}
                  {(analysis.recommendations.length > 0 || analysis.professorInsights?.length > 0) && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {analysis.recommendations.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-blue-800 mb-3">Pro Tips</h3>
                          <ul className="space-y-2">
                            {analysis.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-blue-700 flex items-start">
                                <span className="mr-2">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysis.professorInsights && analysis.professorInsights.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-green-800 mb-3">Professor Intel</h3>
                          <ul className="space-y-2">
                            {analysis.professorInsights.map((insight, idx) => (
                              <li key={idx} className="text-green-700 flex items-start">
                                <span className="mr-2">•</span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Classmate Finder Tab */}
          {activeTab === 'classmates' && (
            <ClassmateFinder />
          )}
        </div>
      </div>
        </AuthWrapper>
      </ErrorBoundary>
    )
  }