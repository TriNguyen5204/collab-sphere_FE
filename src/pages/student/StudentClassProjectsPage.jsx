import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';

const StudentClassProjectsPage = () => {
  const { classSlug } = useParams();
  const { state } = useLocation();
  const [details] = useState(state?.details || null);

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link to="/student/classes" className="text-blue-600 hover:underline">
          ← Back to classes
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-2">{details?.className || classSlug}</h1>
      <p className="text-gray-600 mb-4">
        Project Assignments ({details?.projectAssignments?.length ?? 0})
      </p>

      {details ? (
        details?.projectAssignments?.length ? (
          <ul className="space-y-2">
            {details.projectAssignments.map((p) => (
              <li key={p.projectAssignmentId} className="p-3 border rounded bg-white">
                <div className="font-medium">{p.projectName}</div>
                <div className="text-sm text-gray-600">
                  Assigned: {new Date(p.assignedDate).toLocaleDateString()}
                </div>
                {p.description && <p className="text-sm mt-1">{p.description}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No projects assigned.</p>
        )
      ) : (
        <p className="text-gray-600">No data available. Please open this page from the Class view.</p>
      )}
    </div>
  );
};

export default StudentClassProjectsPage;