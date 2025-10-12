import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getClassDetail,
  getAllLecturer,
  getAllStudent,
  // addStudentToClass,
  // addLecturerToClass,
} from '../../services/userService';
import {
  Calendar,
  Users,
  FileText,
  Layers,
  UserCircle,
  PlusCircle,
  X,
} from 'lucide-react';

export default function ImprovedClassDetail() {
  const { classId } = useParams();
  const [classDetail, setClassDetail] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [lecturerList, setLecturerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showLecturerModal, setShowLecturerModal] = useState(false);

  useEffect(() => {
    const fetchClassDetail = async () => {
      try {
        setLoading(true);
        const response = await getClassDetail(classId);
        if (response) setClassDetail(response);
      } catch (err) {
        setError('Failed to load class details');
      } finally {
        setLoading(false);
      }
    };

    const fetchStudentList = async () => {
      try {
        const response = await getAllStudent();
        if (response) setStudentList(response);
      } catch (error) {
        console.log('Fetch student failed', error);
      }
    };

    const fetchLecturerList = async () => {
      try {
        const response = await getAllLecturer();
        if (response) setLecturerList(response);
      } catch (error) {
        console.log('Fetch lecturer failed', error);
      }
    };

    fetchClassDetail();
    fetchLecturerList();
    fetchStudentList();
  }, [classId]);

  const handleAddStudent = async (studentId) => {
    // try {
    //   await addStudentToClass(classId, studentId);
    //   alert('Student added successfully!');
    // } catch (error) {
    //   alert('Failed to add student.');
    // }
  };

  const handleAddLecturer = async (lecturerId) => {
    // try {
    //   await addLecturerToClass(classId, lecturerId);
    //   alert('Lecturer added successfully!');
    // } catch (error) {
    //   alert('Failed to add lecturer.');
    // }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-gray-500">Loading class details...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-red-500">{error}</p>
      </div>
    );

  if (!classDetail) return null;

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {classDetail.className}
          </h1>
          <p className="text-gray-600 text-sm">
            {classDetail.subjectCode} – {classDetail.subjectName}
          </p>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <Calendar size={18} />
          <span>
            Created on{' '}
            {new Date(classDetail.createdDate).toLocaleDateString('en-GB')}
          </span>
        </div>
      </div>

      {/* Class Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText size={20} /> Class Information
        </h2>
        <div className="grid md:grid-cols-2 gap-4 text-gray-700">
          <p>
            <strong>Lecturer:</strong> {classDetail.lecturerName} (
            {classDetail.lecturerCode})
          </p>
          <p>
            <strong>Members:</strong> {classDetail.memberCount}
          </p>
          <p>
            <strong>Teams:</strong> {classDetail.teamCount}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <span
              className={`font-medium ${
                classDetail.isActive ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {classDetail.isActive ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>
      </div>

      {/* Members */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users size={20} /> Class Members
          </h2>
          <button
            onClick={() => setShowStudentModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusCircle size={18} /> Add Student
          </button>
        </div>
        {classDetail.classMembers.length === 0 ? (
          <p className="text-gray-500">No members found.</p>
        ) : (
          <table className="min-w-full text-sm text-gray-700 border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Student Code</th>
                <th className="p-3 text-left">Full Name</th>
                <th className="p-3 text-left">Address</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {classDetail.classMembers.map((m) => (
                <tr key={m.classMemberId} className="border-t hover:bg-gray-50">
                  <td className="p-3">{m.studentCode}</td>
                  <td className="p-3">{m.fullname}</td>
                  <td className="p-3">{m.address}</td>
                  <td className="p-3">{m.phoneNumber}</td>
                  <td className="p-3">
                    {m.status === 0 ? (
                      <span className="text-yellow-600">Pending</span>
                    ) : (
                      <span className="text-green-600">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Projects */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Layers size={20} /> Project Assignments
        </h2>
        {classDetail.projectAssignments.length === 0 ? (
          <p className="text-gray-500">No projects assigned.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {classDetail.projectAssignments.map((p) => (
              <div
                key={p.projectAssignmentId}
                className="border rounded-lg p-4 hover:shadow transition bg-gray-50"
              >
                <h3 className="font-semibold text-gray-900 mb-1">
                  {p.projectName}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{p.description}</p>
                <p className="text-xs text-gray-500">
                  Assigned:{' '}
                  {new Date(p.assignedDate).toLocaleDateString('en-GB')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teams + Add Lecturer */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <UserCircle size={20} /> Teams
          </h2>
          <button
            onClick={() => setShowLecturerModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <PlusCircle size={18} /> Add Lecturer
          </button>
        </div>
        {classDetail.teams.length === 0 ? (
          <p className="text-gray-500">No teams created yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classDetail.teams.map((team) => (
              <div
                key={team.teamId}
                className="border rounded-lg p-5 hover:shadow transition bg-gray-50"
              >
                <h3 className="font-semibold text-gray-900 mb-1">
                  {team.teamName}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Project: {team.projectName}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(team.createdDate).toLocaleDateString('en-GB')} →{' '}
                  {new Date(team.endDate).toLocaleDateString('en-GB')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Student */}
      {showStudentModal && (
        <Modal
          title="Add Student to Class"
          onClose={() => setShowStudentModal(false)}
        >
          {studentList.length === 0 ? (
            <p className="text-gray-500">No students available.</p>
          ) : (
            <table className="min-w-full text-sm text-gray-700 border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Student Code</th>
                  <th className="p-3 text-left">Full Name</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {studentList.map((s) => (
                  <tr key={s.studentId} className="border-t hover:bg-gray-50">
                    <td className="p-3">{s.studentCode}</td>
                    <td className="p-3">{s.fullname}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleAddStudent(s.studentId)}
                        className="text-blue-600 hover:underline"
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      )}

      {/* Modal Lecturer */}
      {showLecturerModal && (
        <Modal
          title="Add Lecturer to Class"
          onClose={() => setShowLecturerModal(false)}
        >
          {lecturerList.length === 0 ? (
            <p className="text-gray-500">No lecturers available.</p>
          ) : (
            <table className="min-w-full text-sm text-gray-700 border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Lecturer Code</th>
                  <th className="p-3 text-left">Full Name</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {lecturerList.map((l) => (
                  <tr key={l.lecturerId} className="border-t hover:bg-gray-50">
                    <td className="p-3">{l.lecturerCode}</td>
                    <td className="p-3">{l.fullname}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleAddLecturer(l.lecturerId)}
                        className="text-green-600 hover:underline"
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      )}
    </div>
  );
}

/* ---------- Reusable Modal Component ---------- */
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="overflow-y-auto max-h-[60vh]">{children}</div>
      </div>
    </div>
  );
}
