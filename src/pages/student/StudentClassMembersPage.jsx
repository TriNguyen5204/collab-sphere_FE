import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';

const StudentClassMembersPage = () => {
  const { classSlug } = useParams();
  const { state } = useLocation();
  const [details] = useState(state?.details || null);

  const getInitials = (name = '') => {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'NA';
    const letters = (parts[0][0] || '') + (parts[parts.length - 1]?.[0] || '');
    return letters.toUpperCase();
  };

  // Split full name into surname (family), middle, given (first)
  const splitName = (full = '') => {
    const parts = String(full).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { surname: '', middle: '', given: '' };
    if (parts.length === 1) return { surname: '', middle: '', given: parts[0] };
    if (parts.length === 2) return { surname: parts[0], middle: '', given: parts[1] };
    return {
      surname: parts[0],
      middle: parts.slice(1, -1).join(' '),
      given: parts[parts.length - 1],
    };
  };

  const Avatar = ({ name, src }) => {
    const initials = getInitials(name);
    const [failed, setFailed] = useState(false);
    const showImage = src && !failed;

    return (
      <div className="relative" style={{ width: 96, aspectRatio: '3 / 4' }}>
        {showImage ? (
          <img
            src={src}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover rounded-md"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 rounded-md bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link to="/student/classes" className="text-orangeFpt-500 hover:underline">
          ← Back to classes
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-2">{details?.className || classSlug}</h1>
      <p className="text-gray-600 mb-4">Members ({details?.classMembers?.length ?? 0})</p>

      {details ? (
        details?.classMembers?.length ? (
          <div className="overflow-x-auto bg-white border rounded">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-4 py-2 font-semibold w-16">Index</th>
                  <th className="px-4 py-2 font-semibold w-36">Image</th>
                  <th className="px-4 py-2 font-semibold">Code</th>
                  <th className="px-4 py-2 font-semibold">Surname</th>
                  <th className="px-4 py-2 font-semibold">Middle name</th>
                  <th className="px-4 py-2 font-semibold">Given name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {details.classMembers.map((m, idx) => {
                  const name = m.fullname?.trim() || 'Unknown member';
                  const code = m.studentCode?.trim() || 'N/A';
                  const avatarSrc = m.avatarImg && String(m.avatarImg).trim();
                  const { surname, middle, given } = splitName(name);
                  return (
                    <tr key={m.classMemberId || idx} className="text-sm">
                      <td className="px-4 py-2 text-gray-700">{idx + 1}</td>
                      <td className="px-4 py-2">
                        <Avatar name={name} src={avatarSrc} />
                      </td>
                      <td className="px-4 py-2 text-gray-800">{code}</td>
                      <td className="px-4 py-2 text-gray-800">{surname || '-'}</td>
                      <td className="px-4 py-2 text-gray-800">{middle || '-'}</td>
                      <td className="px-4 py-2 text-gray-800">{given || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No members.</p>
        )
      ) : (
        <p className="text-gray-600">No data available. Please open this page from the Class view.</p>
      )}
    </div>
  );
};

export default StudentClassMembersPage;
