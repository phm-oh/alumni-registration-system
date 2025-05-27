import React from "react";

const RegisterForm = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4 flex items-center justify-center">
      <form className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl space-y-6">
        <h2 className="text-2xl font-bold text-center text-blue-600">แบบฟอร์มลงทะเบียนศิษย์เก่า</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">ชื่อ</label>
            <input type="text" name="firstName" className="w-full border p-2 rounded-lg" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">นามสกุล</label>
            <input type="text" name="lastName" className="w-full border p-2 rounded-lg" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">เลขบัตรประชาชน</label>
            <input type="text" name="idCard" className="w-full border p-2 rounded-lg" required maxLength={13} />
          </div>
          <div>
            <label className="block mb-1 font-medium">ที่อยู่</label>
            <input type="text" name="address" className="w-full border p-2 rounded-lg" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">ปีที่จบการศึกษา</label>
            <input type="number" name="graduationYear" className="w-full border p-2 rounded-lg" required min={1900} max={2100} />
          </div>
          <div>
            <label className="block mb-1 font-medium">แผนกที่เรียน</label>
            <input type="text" name="department" className="w-full border p-2 rounded-lg" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">เบอร์โทรศัพท์</label>
            <input type="tel" name="phone" className="w-full border p-2 rounded-lg" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">อีเมล</label>
            <input type="email" name="email" className="w-full border p-2 rounded-lg" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">อาชีพปัจจุบัน</label>
            <input type="text" name="currentJob" className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Facebook</label>
            <input type="text" name="facebook" className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Line ID</label>
            <input type="text" name="lineId" className="w-full border p-2 rounded-lg" />
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold transition-all duration-300">
          ส่งข้อมูล
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
