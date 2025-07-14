import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { courseCode: string } }
) {
  const { courseCode } = params
  
  try {
    // Fetch course data from PlanetTerp API
    const courseResponse = await fetch(`https://api.planetterp.com/v1/course?name=${courseCode}`)
    const courseData = await courseResponse.json()
    
    if (!courseResponse.ok || !courseData) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Fetch professors for this course
    const profResponse = await fetch(`https://api.planetterp.com/v1/professors?course=${courseCode}`)
    const profData = await profResponse.json()
    
    // Get reviews for top professors with NLP analysis
    const professorsWithReviews = await Promise.all(
      (profData || []).slice(0, 5).map(async (prof: any) => {
        try {
          const reviewResponse = await fetch(`https://api.planetterp.com/v1/reviews?professor=${prof.name}`)
          const reviews = await reviewResponse.json()
          
          // Analyze sentiment and extract tags
          const allReviewText = (reviews || []).map((r: any) => r.review || '').join(' ')
          const sentiment = analyzeSentiment(allReviewText)
          const tags = extractTags(reviews || [])
          
          return {
            ...prof,
            reviews: reviews || [],
            sentiment,
            tags,
            type: prof.type || 'Professor'
          }
        } catch {
          return { 
            ...prof, 
            reviews: [], 
            sentiment: 'neutral' as const,
            tags: [],
            type: 'Professor'
          }
        }
      })
    )

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

    return NextResponse.json({
      name: courseData.name,
      title: courseData.title,
      credits: courseData.credits || 3,
      average_gpa: courseData.average_gpa,
      professors: professorsWithReviews
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch course data' }, { status: 500 })
  }
}