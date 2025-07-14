'use client'

import { useState } from 'react'

interface Course {
  id: string
  name: string
  title: string
  credits: number
  average_gpa: number
  selectedProfessor?: Professor
  professors: Professor[]
  timeSlots?: string[]
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
  timeConflicts: string[]
  workloadDistribution: { [day: string]: number }
  professorInsights: string[]
}

export default function Home() {
  const [courseCode, setCourseCode] = useState('')
  const [schedule, setSchedule] = useState<Course[]>([])
  const [analysis, setAnalysis] = useState<ScheduleAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showProfessorPicker, setShowProfessorPicker] = useState<string | null>(null)
  const [savedSchedules, setSavedSchedules] = useState<{name: string, courses: Course[]}[]>([])

  const addCourse = async () => {
    if (!courseCode || schedule.find(c => c.name === courseCode)) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/course/${courseCode}`)
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Course not found')
      } else {
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
      }
    } catch (error) {
      setError('Failed to fetch course data')
    }
    setLoading(false)
  }

  const removeCourse = (courseId: string) => {
    setSchedule(prev => prev.filter(c => c.id !== courseId))
  }

  const selectProfessor = (courseId: string, professor: Professor) => {
    setSchedule(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, selectedProfessor: professor }
        : course
    ))
    setShowProfessorPicker(null)
  }

  const saveSchedule = () => {
    const name = prompt('Name your schedule:')
    if (name && schedule.length > 0) {
      setSavedSchedules(prev => [...prev, { name, courses: [...schedule] }])
      localStorage.setItem('terptrack-schedules', JSON.stringify([...savedSchedules, { name, courses: schedule }]))
    }
  }

  const loadSchedule = (savedSchedule: {name: string, courses: Course[]}) => {
    setSchedule(savedSchedule.courses)
    setAnalysis(null)
  }

  // Load saved schedules on mount
  useState(() => {
    const saved = localStorage.getItem('terptrack-schedules')
    if (saved) {
      setSavedSchedules(JSON.parse(saved))
    }
  })

  const analyzeSchedule = async () => {
    if (schedule.length === 0) return
    
    try {
      const response = await fetch('/api/analyze-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses: schedule })
      })
      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      setError('Failed to analyze schedule')
    }
  }

  const getDifficultyColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-green-600 bg-green-50'
    if (gpa >= 3.0) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getSentimentColor = (sentiment: string) => {
    switch(sentiment) {
      case 'positive': return 'text-green-600 bg-green-50'
      case 'negative': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const exportSchedule = () => {
    const scheduleText = schedule.map(course => 
      `${course.name} - ${course.title} (${course.credits} credits)${course.selectedProfessor ? ` - Prof. ${course.selectedProfessor.name}` : ''}`
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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">
            TerpTrack
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            How Terrapin tough is your schedule?
          </p>
          <p className="text-sm text-gray-500">
            Real data from PlanetTerp • Built for Terps, by Terps
          </p>
        </div>

        {/* Saved Schedules */}
        {savedSchedules.length > 0 && (
          <div className="glass-effect rounded-xl shadow-lg p-6 mb-4">
            <h2 className="text-lg font-semibold mb-3">Saved Schedules</h2>
            <div className="flex gap-2 flex-wrap">
              {savedSchedules.map((saved, idx) => (
                <button
                  key={idx}
                  onClick={() => loadSchedule(saved)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  {saved.name} ({saved.courses.length} courses)
                </button>
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
              {loading ? 'Adding...' : '+ Add'}
            </button>
          </div>
          
          {schedule.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-700">Spring 2024 Schedule</h3>
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
                        GPA: {course.average_gpa?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <button
                      onClick={() => removeCourse(course.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  
                  {course.selectedProfessor ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600">✓ Prof. {course.selectedProfessor.name} (GPA: {course.selectedProfessor.average_gpa?.toFixed(2)})</span>
                      <button
                        onClick={() => setShowProfessorPicker(course.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Change
                      </button>
                    </div>
                  ) : course.professors.length > 0 && (
                    <button
                      onClick={() => setShowProfessorPicker(course.id)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Choose Professor ({course.professors.length} available)
                    </button>
                  )}
                </div>
              ))}
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={analyzeSchedule}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Check if I'll survive
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
              
              <div className="grid md:grid-cols-4 gap-4 mb-6">
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
                
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                  <h3 className="font-semibold text-orange-800">Course Mix</h3>
                  <div className="text-sm text-orange-600">
                    <div>Easy: {analysis.difficultyBreakdown.easy}</div>
                    <div>Medium: {analysis.difficultyBreakdown.medium}</div>
                    <div>Hard: {analysis.difficultyBreakdown.hard}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Warnings & Time Conflicts */}
            {(analysis.warnings.length > 0 || analysis.timeConflicts?.length > 0) && (
              <div className="grid md:grid-cols-2 gap-4">
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
                
                {analysis.timeConflicts && analysis.timeConflicts.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-800 mb-3">Schedule Issues</h3>
                    <ul className="space-y-2">
                      {analysis.timeConflicts.map((conflict, idx) => (
                        <li key={idx} className="text-orange-700 flex items-start">
                          <span className="mr-2">•</span>
                          {conflict}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
            
            {/* Workload Distribution */}
            {analysis.workloadDistribution && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">When you'll be crying</h3>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(analysis.workloadDistribution).map(([day, load]) => (
                    <div key={day} className="text-center">
                      <div className="text-sm font-medium text-gray-600 mb-1">{day.slice(0,3)}</div>
                      <div className={`h-16 rounded flex items-end justify-center text-white font-bold ${
                        load >= 4 ? 'bg-red-500' : load >= 3 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}>
                        <div className="mb-2">{load}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Green = chill, Yellow = busy, Red = no sleep
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}