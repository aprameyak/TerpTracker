'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import AuthWrapper from './components/AuthWrapper'
import ClassmateFinder from './components/ClassmateFinder'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'
import ClientOnly from './components/ClientOnly'

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

function HomeContent() {
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
        title: `Course ${courseCode}`,
        credits: 3,
        average_gpa: 3.0,
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
    if (schedule.length === 0) return
    
    const name = prompt('Enter a name for this schedule:')
    if (!name) return
    
    const newSchedule = { name, courses: [...schedule] }
    setSavedSchedules(prev => [...prev, newSchedule])
    
    // Save to localStorage
    const allSchedules = [...savedSchedules, newSchedule]
    localStorage.setItem('terptrack-schedules', JSON.stringify(allSchedules))
    
    // Clear current schedule
    setSchedule([])
  }

  const loadSchedule = (index: number) => {
    setSchedule([...savedSchedules[index].courses])
  }

  const deleteSchedule = (index: number) => {
    const newSchedules = savedSchedules.filter((_, i) => i !== index)
    setSavedSchedules(newSchedules)
    localStorage.setItem('terptrack-schedules', JSON.stringify(newSchedules))
  }

  const editScheduleName = (index: number) => {
    setEditingSchedule(index)
    setEditingName(savedSchedules[index].name)
  }

  const saveScheduleName = () => {
    if (editingSchedule === null) return
    
    const newSchedules = [...savedSchedules]
    newSchedules[editingSchedule].name = editingName
    setSavedSchedules(newSchedules)
    localStorage.setItem('terptrack-schedules', JSON.stringify(newSchedules))
    setEditingSchedule(null)
  }

  const analyzeSchedule = async () => {
    if (schedule.length === 0) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/analyze-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courses: schedule }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to analyze schedule')
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">TerpTracker</h1>
          <p className="text-gray-600">UMD Schedule Analyzer</p>
          {user && (
            <p className="text-sm text-gray-500 mt-2">Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}!</p>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              Schedule Builder
            </button>
            <button
              onClick={() => setActiveTab('classmates')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'classmates'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              Find Classmates
            </button>
          </div>
        </div>

        {activeTab === 'schedule' ? (
          <div className="max-w-4xl mx-auto">
            {/* Course Input */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Course</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                  placeholder="Enter course code (e.g., CMSC131)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={addCourse}
                  disabled={!courseCode || loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <LoadingSpinner /> : 'Add Course'}
                </button>
              </div>
              {error && <p className="text-red-600 mt-2">{error}</p>}
            </div>

            {/* Current Schedule */}
            {schedule.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Schedule</h2>
                <div className="space-y-3">
                  {schedule.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-800">{course.name}</h3>
                        <p className="text-gray-600 text-sm">{course.title}</p>
                        <p className="text-gray-500 text-xs">{course.credits} credits • GPA: {course.average_gpa}</p>
                      </div>
                      <button
                        onClick={() => removeCourse(course.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={analyzeSchedule}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? <LoadingSpinner /> : 'Analyze Schedule'}
                  </button>
                  <button
                    onClick={saveSchedule}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save Schedule
                  </button>
                </div>
              </div>
            )}

            {/* Schedule Analysis */}
            {analysis && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Schedule Analysis</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Overall Score</h3>
                    <div className="text-3xl font-bold text-blue-600">{analysis.survivabilityScore}%</div>
                    <p className="text-gray-600">Chance of academic success</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Predicted GPA</h3>
                    <div className="text-2xl font-bold text-green-600">
                      {analysis.predictedGPA.min} - {analysis.predictedGPA.max}
                    </div>
                    <p className="text-gray-600">Expected grade range</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Difficulty Breakdown</h3>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{analysis.difficultyBreakdown.easy}</div>
                      <div className="text-sm text-gray-600">Easy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{analysis.difficultyBreakdown.medium}</div>
                      <div className="text-sm text-gray-600">Medium</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{analysis.difficultyBreakdown.hard}</div>
                      <div className="text-sm text-gray-600">Hard</div>
                    </div>
                  </div>
                </div>

                {analysis.warnings.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-yellow-700 mb-2">⚠️ Warnings</h3>
                    <ul className="list-disc list-inside text-yellow-700">
                      {analysis.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.recommendations.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-blue-700 mb-2">💡 Recommendations</h3>
                    <ul className="list-disc list-inside text-blue-700">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Saved Schedules */}
            {savedSchedules.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Saved Schedules</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedSchedules.map((saved, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        {editingSchedule === index ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 px-2 py-1 border rounded"
                            onKeyPress={(e) => e.key === 'Enter' && saveScheduleName()}
                          />
                        ) : (
                          <h3 className="font-semibold text-gray-800">{saved.name}</h3>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{saved.courses.length} courses</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadSchedule(index)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => editScheduleName(index)}
                          className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSchedule(index)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <ClassmateFinder />
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <ErrorBoundary>
      <AuthWrapper>
        <ClientOnly fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
          </div>
        }>
          <HomeContent />
        </ClientOnly>
      </AuthWrapper>
    </ErrorBoundary>
  )
}