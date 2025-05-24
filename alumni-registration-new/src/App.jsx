function App() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          ทดสอบ Tailwind CSS
        </h1>
        <p className="text-gray-600 mb-6">
          ถ้าคุณเห็นข้อความนี้มีสีเทาและมีการ padding/margin ถูกต้อง แสดงว่า Tailwind ทำงานแล้ว!
        </p>
        <button className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors">
          ปุ่มทดสอบ
        </button>
      </div>
    </div>
  )
}

export default App