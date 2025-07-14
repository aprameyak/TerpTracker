interface Professor {
  name: string
  average_gpa: number
  reviews: Array<{ review: string; rating: number }>
  sentiment: 'positive' | 'neutral' | 'negative'
  tags: string[]
  type: string
}

interface ProfessorPickerProps {
  professors: Professor[]
  onSelect: (professor: Professor) => void
  onClose: () => void
}

export default function ProfessorPicker({ professors, onSelect, onClose }: ProfessorPickerProps) {
  const getSentimentColor = (sentiment: string) => {
    switch(sentiment) {
      case 'positive': return 'text-green-600 bg-green-50'
      case 'negative': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Choose Professor</h3>
        {professors.map((prof, idx) => (
          <div key={idx} className="p-4 border border-gray-200 rounded-lg mb-3 hover:bg-gray-50 cursor-pointer"
               onClick={() => onSelect(prof)}>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{prof.name}</h4>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  GPA: {prof.average_gpa?.toFixed(2) || 'N/A'}
                </span>
                {prof.sentiment && (
                  <span className={`px-2 py-1 rounded text-sm ${getSentimentColor(prof.sentiment)}`}>
                    {prof.sentiment}
                  </span>
                )}
              </div>
            </div>
            
            {prof.tags && prof.tags.length > 0 && (
              <div className="flex gap-1 mb-2">
                {prof.tags.slice(0, 3).map((tag, tagIdx) => (
                  <span key={tagIdx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {prof.reviews && prof.reviews.length > 0 && (
              <p className="text-sm text-gray-600 italic">
                "{prof.reviews[0].review?.substring(0, 120)}..."
              </p>
            )}
          </div>
        ))}
        
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}