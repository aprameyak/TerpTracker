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
    
    // Get reviews for top professors
    const professorsWithReviews = await Promise.all(
      (profData || []).slice(0, 3).map(async (prof: any) => {
        try {
          const reviewResponse = await fetch(`https://api.planetterp.com/v1/reviews?professor=${prof.name}`)
          const reviews = await reviewResponse.json()
          return {
            ...prof,
            reviews: reviews || []
          }
        } catch {
          return { ...prof, reviews: [] }
        }
      })
    )

    return NextResponse.json({
      name: courseData.name,
      title: courseData.title,
      average_gpa: courseData.average_gpa,
      professors: professorsWithReviews
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch course data' }, { status: 500 })
  }
}