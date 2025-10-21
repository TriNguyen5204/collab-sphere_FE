import React, { useState } from "react";
import { createStudent } from "../../services/userService"; // đổi đường dẫn theo project của bạn

const CreateStudentForm = () => {
  const [student, setStudent] = useState({
    fullName: "",
    email: "",
    password: "",
    studentCode: "",
    address: "",
    phoneNumber: "",
    yearOfBirth: new Date().getFullYear() - 18,
    school: "",
    major: "",
    avatar_img: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  // handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setStudent((prev) => ({ ...prev, avatar_img: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // chuẩn bị FormData (nếu backend nhận file upload)
      const formData = new FormData();
      formData.append("email", student.email);
      formData.append("password", student.password);
      formData.append("fullName", student.fullName);
      formData.append("address", student.address);
      formData.append("phoneNumber", student.phoneNumber);
      formData.append("yob", Number(student.yearOfBirth));
      formData.append("school", student.school);
      formData.append("studentCode", student.studentCode);
      formData.append("major", student.major);
      if (student.avatar_img) formData.append("avatar_img", student.avatar_img);

      const response = await createStudent(formData);
      if(response){
        setMessage("✅ Student created successfully!");
      }
      
    } catch (error) {
      console.error("Create student failed:", error);
      setMessage("❌ Failed to create student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create Student</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <input
          type="text"
          name="fullName"
          value={student.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full p-2 border rounded"
          required
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          value={student.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 border rounded"
          required
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          value={student.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full p-2 border rounded"
          required
        />

        {/* Student Code */}
        <input
          type="text"
          name="studentCode"
          value={student.studentCode}
          onChange={handleChange}
          placeholder="Student Code"
          className="w-full p-2 border rounded"
          required
        />

        {/* Address */}
        <input
          type="text"
          name="address"
          value={student.address}
          onChange={handleChange}
          placeholder="Address"
          className="w-full p-2 border rounded"
          required
        />

        {/* Phone Number */}
        <input
          type="text"
          name="phoneNumber"
          value={student.phoneNumber}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full p-2 border rounded"
          required
        />

        {/* Year of Birth */}
        <input
          type="number"
          name="yearOfBirth"
          value={student.yearOfBirth}
          onChange={handleChange}
          placeholder="Year of Birth"
          className="w-full p-2 border rounded"
          required
        />

        {/* School */}
        <input
          type="text"
          name="school"
          value={student.school}
          onChange={handleChange}
          placeholder="School"
          className="w-full p-2 border rounded"
          required
        />

        {/* Major */}
        <input
          type="text"
          name="major"
          value={student.major}
          onChange={handleChange}
          placeholder="Major"
          className="w-full p-2 border rounded"
          required
        />

        {/* Avatar */}
        <div>
          <label className="block mb-1">Avatar Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
          {preview && (
            <img
              src={preview}
              alt="Avatar Preview"
              className="mt-2 w-24 h-24 object-cover rounded"
            />
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded w-full"
        >
          {loading ? "Creating..." : "Create Student"}
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default CreateStudentForm;
