import { NextRequest, NextResponse } from 'next/server'

interface Course {
  name: string
  title: string
  credits: number
  average_gpa: number
  professors: any[]
}

// Simple NLP sentiment analysis
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['great', 'excellent', 'amazing', 'good', 'helpful', 'clear', 'easy', 'fair', 'nice', 'awesome']
  const negativeWords = ['terrible', 'awful', 'bad', 'difficult', 'hard', 'unfair', 'boring', 'confusing', 'worst', 'hate']
  
  const words = text.toLowerCase().split(/\s+/)
  const positiveCount = words.filter(word => positiveWords.includes(word)).length
  const negativeCount = words.filter(word => negativeWords.includes(word)).length
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

// Extract tags from reviews
function extractTags(reviews: any[]): string[] {
  const tagPatterns = {
    'tough grader': /tough.{0,10}grad|hard.{0,10}grad|strict.{0,10}grad/i,
    'exam heavy': /exam.{0,10}heavy|lots.{0,10}exam|many.{0,10}exam/i,
    'attendance required': /attendance.{0,10}required|must.{0,10}attend/i,
    'clear explanations': /clear|explain.{0,10}well|good.{0,10}explain/i,
    'responsive': /responsive|quick.{0,10}reply|answers.{0,10}email/i,
    'group projects': /group.{0,10}project|team.{0,10}work/i
  }
  
  const tags: string[] = []
  const allReviewText = reviews.map(r => r.review || '').join(' ')
  
  Object.entries(tagPatterns).forEach(([tag, pattern]) => {
    if (pattern.test(allReviewText)) {
      tags.push(tag)
    }
  })
  
  return tags
}

export async function POST(request: NextRequest) {
  try {
    const { courses }: { courses: Course[] } = await request.json()
    
    if (!courses || courses.length === 0) {
      return NextResponse.json({ error: 'No courses provided' }, { status: 400 })
    }

    // Calculate metrics
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)
    const coursesWithGPA = courses.filter(course => course.average_gpa > 0)
    const avgGPA = coursesWithGPA.length > 0 
      ? coursesWithGPA.reduce((sum, course) => sum + (course.average_gpa || 0), 0) / coursesWithGPA.length
      : 0
    
    // Difficulty breakdown
    const difficultyBreakdown = courses.reduce((acc, course) => {
      const gpa = course.average_gpa || 0
      if (gpa === 0) acc.medium++ // Treat courses without GPA data as medium difficulty
      else if (gpa >= 3.5) acc.easy++
      else if (gpa >= 3.0) acc.medium++
      else acc.hard++
      return acc
    }, { easy: 0, medium: 0, hard: 0 })

    // Generate warnings
    const warnings: string[] = []
    const professorInsights: string[] = []
    
    if (difficultyBreakdown.hard >= 3) {
      warnings.push('3+ hard classes = recipe for disaster. Maybe spread these out?')
    }
    if (totalCredits >= 18) {
      warnings.push('18+ credits? Hope you like coffee and all-nighters')
    }
    if (avgGPA > 0 && avgGPA < 2.8) {
      warnings.push('These courses have brutal averages. Consider adding an easy A')
    }
    
    // Warn about courses without GPA data
    const coursesWithoutGPA = courses.filter(c => c.average_gpa === 0).length
    if (coursesWithoutGPA > 0) {
      warnings.push(`${coursesWithoutGPA} course${coursesWithoutGPA !== 1 ? 's' : ''} without GPA data - analysis may be less accurate`)
    }
    
    // Check for specific course combinations
    const csCourses = courses.filter(c => c.name.startsWith('CMSC')).length
    const mathCourses = courses.filter(c => c.name.startsWith('MATH')).length
    const chemCourses = courses.filter(c => c.name.startsWith('CHEM')).length
    const physCourses = courses.filter(c => c.name.startsWith('PHYS')).length
    
    if (csCourses >= 3) {
      warnings.push('3+ CS courses = coding every night. Stock up on energy drinks')
    }
    if (mathCourses >= 2 && csCourses >= 2) {
      warnings.push('Math + CS combo = your brain will hurt. A lot.')
    }
    if (chemCourses >= 2 || physCourses >= 2) {
      warnings.push('Multiple lab sciences = lab reports will consume your life')
    }
    if (courses.some(c => c.name === 'ORGO') || courses.some(c => c.name.includes('CHEM231'))) {
      warnings.push('Organic Chemistry detected. RIP your social life')
    }

    // Generate recommendations
    const recommendations: string[] = []
    if (difficultyBreakdown.hard > difficultyBreakdown.easy) {
      recommendations.push('Add an easy elective to balance this out')
    }
    if (totalCredits < 12) {
      recommendations.push(`Only ${totalCredits} credits? Add more if you need to graduate on time`)
    }
    if (avgGPA >= 3.5) {
      recommendations.push('This schedule looks pretty manageable. Nice job!')
    }

    // Calculate survivability score (1-10)
    let survivabilityScore = 10
    survivabilityScore -= difficultyBreakdown.hard * 1.5
    survivabilityScore -= Math.max(0, totalCredits - 15) * 0.5
    if (avgGPA > 0) {
      survivabilityScore -= Math.max(0, 3.5 - avgGPA) * 2
    } else {
      survivabilityScore -= 1 // Penalty for no GPA data
    }
    survivabilityScore = Math.max(1, Math.min(10, Math.round(survivabilityScore)))

    // Predict GPA range
    const gpaVariance = 0.3
    const predictedGPA = avgGPA > 0 ? {
      min: Math.max(0, avgGPA - gpaVariance),
      max: Math.min(4.0, avgGPA + gpaVariance)
    } : {
      min: 0,
      max: 4.0
    }

    return NextResponse.json({
      survivabilityScore,
      predictedGPA,
      totalCredits,
      warnings,
      recommendations,
      difficultyBreakdown,
      professorInsights
    })

  } catch (error) {
    console.error('Schedule analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze schedule' }, { status: 500 })
  }
}