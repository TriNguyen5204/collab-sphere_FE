import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { useAvatar } from '../../hooks/useAvatar';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';

const StudentClassMembersPage = () => {
  const { classSlug } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
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
    const { initials, colorClass, shouldShowImage, setImageError } = useAvatar(name, src);
    return (
      <div className="relative" style={{ width: 96, aspectRatio: '3 / 4' }}>
        {shouldShowImage ? (
          <img
            src={src}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover rounded-md"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`absolute inset-0 rounded-md flex items-center justify-center text-sm font-semibold ${colorClass} text-white`}>
            {initials}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-orangeFpt-500 hover:underline inline-flex items-center gap-2 font-medium transition-colors"
        >
          <ArrowLeft size={18} />
          Back to classes
        </button>
      </div>
      <div className="bg-gradient-to-r from-[#fb8239] to-[#fcd8b6] rounded-3xl p-8 mb-8 shadow-xl border-2 border-orange-200 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white leading-tight">{details?.className || classSlug}</h1>
        <p className="text-white text-sm font-medium">Members ({details?.classMembers?.length ?? 0})</p>
      </div>

      {details ? (
        details?.classMembers?.length ? (
          <div className="max-w-6xl mx-auto bg-white border rounded-xl shadow-sm overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-4 py-2 font-semibold w-16 text-center">Index</th>
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
                      <td className="px-4 py-2 text-gray-700 text-center">{idx + 1}</td>
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
