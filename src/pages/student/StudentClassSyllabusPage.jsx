import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { getSyllabusOfSubjectBySubjectId } from '../../services/studentApi';
import { ClassDetailsSkeleton } from '../../features/student/components/skeletons/StudentSkeletons';

const StudentClassSyllabusPage = () => {
  const { classSlug } = useParams();
  const { state } = useLocation();
  const details = state?.details || null;

  const [loading, setLoading] = useState(false);
  const [syllabusData, setSyllabusData] = useState(null);

  const subjectId = details?.subjectId || details?.subject?.subjectId || null;

  useEffect(() => {
    (async () => {
      if (!subjectId) return;
      try {
        setLoading(true);
        const data = await getSyllabusOfSubjectBySubjectId(subjectId);
        setSyllabusData(data);
      } catch (err) {
        console.error('Failed to load syllabus', err);
        toast.error('Failed to load syllabus');
      } finally {
        setLoading(false);
      }
    })();
  }, [subjectId]);

  const syllabus = syllabusData?.subjectSyllabus || null;

  if (!details) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Link to="/student/classes" className="text-blue-600 hover:underline">
            ← Back to classes
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-2">{classSlug || 'Class'}</h1>
        <p className="text-gray-600">No data available. Please open this page from the Class view.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link to="/student/classes" className="text-orangeFpt-500 hover:underline">
          ← Back to classes
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-800">
            {details.subjectName || details.className || classSlug}
          </h1>
          <span className={`px-3 py-1 text-sm rounded-full ${details.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {details.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {loading && !syllabus ? (
          <ClassDetailsSkeleton />
        ) : syllabus ? (
          <>
            <div className="bg-white shadow-md rounded-2xl p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">{syllabus.syllabusName}</h2>
              {syllabus.description && <p className="text-gray-600 mb-4">{syllabus.description}</p>}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Subject Code:</span>
                  <span> {syllabus.subjectCode ?? details.subjectCode}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Credits:</span>
                  <span> {syllabus.noCredit ?? '-'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created Date:</span>
                  <span> {syllabus.createdDate ? new Date(syllabus.createdDate).toLocaleDateString() : '-'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`${syllabus.isActive ? 'text-green-600 font-medium' : ''}`}> {syllabus.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-2xl p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Grade Components</h3>
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Component</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Percentage (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(syllabus.subjectGradeComponents) && syllabus.subjectGradeComponents.length ? (
                    syllabus.subjectGradeComponents.map((g) => (
                      <tr key={g.subjectGradeComponentId} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2">{g.componentName}</td>
                        <td className="px-4 py-2 text-orange-600 font-semibold">{g.referencePercentage}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t border-gray-100">
                      <td colSpan={2} className="px-4 py-2 text-gray-600">No grade components.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-white shadow-md rounded-2xl p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Learning Outcomes</h3>
              {Array.isArray(syllabus.subjectOutcomes) && syllabus.subjectOutcomes.length ? (
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {syllabus.subjectOutcomes.map((o) => (
                    <li key={o.subjectOutcomeId}>{o.outcomeDetail}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No learning outcomes provided.</p>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white shadow-md rounded-2xl p-6 mt-6">
            <p className="text-gray-600">No syllabus found for this subject.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentClassSyllabusPage;
