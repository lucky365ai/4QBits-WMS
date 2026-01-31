function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Workshop Management System
        </h1>
        <p className="text-gray-600">
          System is running successfully!
        </p>
        <div className="mt-4 space-y-2">
          <div className="text-sm">
            <strong>Frontend:</strong> http://localhost:3000
          </div>
          <div className="text-sm">
            <strong>Backend:</strong> http://localhost:5000
          </div>
        </div>
      </div>
    </div>
  )
}

export default App