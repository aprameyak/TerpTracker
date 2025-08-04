import './globals.css'
import { Analytics } from '@vercel/analytics/next'

export const metadata = {
  title: 'TerpTrack - Will Your UMD Schedule Kill You? | University of Maryland Course Analyzer',
  description: 'Analyze your UMD schedule with real PlanetTerp data. Get survivability scores, GPA predictions, and smart warnings for University of Maryland students.',
  keywords: 'UMD, University of Maryland, schedule analyzer, course planner, PlanetTerp, GPA calculator, Testudo alternative',
  authors: [{ name: 'TerpTrack Team' }],
  openGraph: {
    title: 'TerpTrack - UMD Schedule Survival Analyzer',
    description: 'Will your schedule kill you? Find out with real UMD course data.',
    url: 'https://terptrack.vercel.app',
    siteName: 'TerpTrack',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TerpTrack - UMD Schedule Analyzer',
    description: 'Analyze your UMD schedule with real data from PlanetTerp',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://terptrack.vercel.app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "TerpTrack",
              "description": "UMD schedule analyzer using real PlanetTerp data",
              "url": "https://terptrack.vercel.app",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}