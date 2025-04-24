import { useState } from 'react'

const data = [
    { id: 1, title: "Apple Pie Recipe", content: "A delicious apple pie with a flaky crust." },
    { id: 2, title: "Banana Bread", content: "Moist banana bread with walnuts." },
    { id: 3, title: "Cherry Tart", content: "Sweet and tangy cherry tart." },
    { id: 4, title: "Apple Smoothie", content: "Refreshing apple and yogurt smoothie." },
    { id: 5, title: "Orange Cake", content: "Zesty orange-flavored cake." },
    { id: 6, title: "Blueberry Muffin", content: "Soft muffins with fresh blueberries." },
    { id: 7, title: "Apple Crumble", content: "Warm apple crumble with oats." },
    { id: 8, title: "Lemon Pie", content: "Creamy lemon pie with meringue." },
    { id: 9, title: "Strawberry Jam", content: "Homemade strawberry jam." },
    { id: 10, title: "Mango Sorbet", content: "Cool and tropical mango sorbet." },
    { id: 11, title: "Tiramisu Classic", content: "Italian Tiramisu with espresso and mascarpone." }
]

interface SearchResult {
  id: number;
  title: string;
  content: string;
}

const SearchEngine = () => {
   const [query, setQuery] = useState('')
  const [isCaseSensitive, setIsCaseSensitive] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const resultsPerPage = 5

  const performSearch = (searchQuery: string) => {
    setHasSearched(true)
    if (!searchQuery.trim()) {
      setError('Please enter a search query.')
      setResults([])
      return
    }

    if (searchQuery.length > 255) {
      setError('Query is too long. Maximum 255 characters allowed.')
      setResults([])
      return
    }

    setError('');
    
    const filteredResults = data.filter(item => {
      const searchText = isCaseSensitive ? searchQuery : searchQuery.toLowerCase()
      const itemTitle = isCaseSensitive ? item.title : item.title.toLowerCase()
      const itemContent = isCaseSensitive ? item.content : item.content.toLowerCase()
      const matches = itemTitle.includes(searchText) || itemContent.includes(searchText)
      return matches
    })

    setResults(filteredResults)
    setCurrentPage(1)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    setHasSearched(false)
    setResults([])
    setError('')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch(query)
    }
  }

  const totalPages = Math.ceil(results.length / resultsPerPage);
  const paginatedResults = results.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Simple Search Engine</h1>
        
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              onKeyPress={handleKeyPress}
              placeholder="Enter search query..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="search-input"
            />
            <button
              onClick={() => {performSearch(query)}}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              data-testid="search-button"
            >
              Search
            </button>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isCaseSensitive}
              onChange={() => setIsCaseSensitive(!isCaseSensitive)}
              className="mr-2"
              data-testid="case-sensitive-checkbox"
            />
            <label>Case Sensitive</label>
          </div>

          {error && (
            <p className="text-red-500" data-testid="error-message">{error}</p>
          )}

          {results.length > 0 ? (
            <div>
              <p className="mb-2 text-gray-700">Found {results.length} results</p>
              <ul className="space-y-2" data-testid="results-list">
                {paginatedResults.map(item => (
                  <li key={item.id} className="p-2 border rounded-lg hover:bg-gray-50">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-gray-600">{item.content}</p>
                  </li>
                ))}
              </ul>

              {totalPages > 1 && (
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                    data-testid="prev-page"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600" data-testid="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                    data-testid="next-page"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            hasSearched && error === '' && query.trim() !== '' && (
              <p className="text-gray-500" data-testid="no-results">
                No results found for "{query}"
              </p>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchEngine 