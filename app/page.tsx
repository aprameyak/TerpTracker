'use client'

import { useState } from 'react'

interface CourseData {
  name: string
  title: string
  average_gpa: number
  professors: Array<{
    name: string
    average_gpa: number
    reviews: Array<{
      review: string
      rating: number
    }>
  }>
}

interface AnalysisResult {
  difficulty: 'Easy' | 'Medium' | 'Hard'
  workload: 'Light' | 'Moderate' | 'Heavy'
  recommendation: string
}

export default function Home() {
  const [courseCode, setCourseCode] = useState('')
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyzeCourse = async () => {
    if (!courseCode) return
    
    setLoading(true)
    setError('')
    setCourseData(null)
    
    try {
      const response = await fetch(`/api/course/${courseCode}`)
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Course not found')
      } else {
        setCourseData(data)
      }
    } catch (error) {
      setError('Failed to fetch course data')
    }
    setLoading(false)
  }

  const getAnalysis = (gpa: number): AnalysisResult => {
    if (gpa >= 3.5) return { difficulty: 'Easy', workload: 'Light', recommendation: 'Great choice! This course has high success rates.' }
    if (gpa >= 3.0) return { difficulty: 'Medium', workload: 'Moderate', recommendation: 'Manageable course with proper preparation.' }
    return { difficulty: 'Hard', workload: 'Heavy', recommendation: 'Challenging course - consider your schedule carefully.' }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          🧠 TerpTrack
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Your Smart UMD Schedule Analyzer
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Enter course code (e.g., CMSC131)"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={analyzeCourse}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {courseData && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-2">{courseData.name}</h2>
              <p className="text-gray-600 mb-4">{courseData.title}</p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Average GPA</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {courseData.average_gpa?.toFixed(2) || 'N/A'}
                  </p>
                </div>
                
                {courseData.average_gpa && (
                  <>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-800">Difficulty</h3>
                      <p className="text-xl font-bold text-green-600">
                        {getAnalysis(courseData.average_gpa).difficulty}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <h3 className="font-semibold text-purple-800">Workload</h3>
                      <p className="text-xl font-bold text-purple-600">
                        {getAnalysis(courseData.average_gpa).workload}
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              {courseData.average_gpa && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Recommendation:</strong> {getAnalysis(courseData.average_gpa).recommendation}
                  </p>
                </div>
              )}
            </div>

            {courseData.professors && courseData.professors.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Top Professors</h3>
                <div className="grid gap-4">
                  {courseData.professors.map((prof, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-lg">{prof.name}</h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          GPA: {prof.average_gpa?.toFixed(2) || 'N/A'}
                        </span>
                      </div>
                      {prof.reviews && prof.reviews.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 italic">
                            "{prof.reviews[0].review?.substring(0, 150)}..."
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Rating: {prof.reviews[0].rating}/5
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}