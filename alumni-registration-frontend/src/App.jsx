function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-blue-800 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md mx-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">🎓</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Alumni Registration System
        </h1>
        <p className="text-gray-600 mb-6">
          ระบบลงทะเบียนศิษย์เก่าวิทยาลัยเทคนิคอุดรธานี
        </p>
        <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
          🚀 ทดสอบ Tailwind CSS
        </button>
        <div className="mt-4 text-sm text-green-600 font-medium">
          ✅ Tailwind CSS ทำงานแล้ว!
        </div>
      </div>
    </div>
  )
}

export default App
