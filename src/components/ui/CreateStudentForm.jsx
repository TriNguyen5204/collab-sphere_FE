import React, { useState } from "react";

const CreateStudentForm = () => {
    const [student, setStudent] = useState({
    fullname: "",
    address: "",
    phone: "",
    yearOfBirth: new Date().getFullYear() - 18,
    school: "",
    major: "",
    avatar_img: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
  const handleSubmit = async (e) => {
    //call api
  }
  return (
    <div className="p-6 max-w-lg mx-auto border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create Student</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fullname */}
        <input
          type="text"
          name="fullname"
          value={student.fullname}
          onChange={handleChange}
          placeholder="Full Name"
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

        {/* Phone */}
        <input
          type="text"
          name="phone"
          value={student.phone}
          onChange={handleChange}
          placeholder="Phone"
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