import React, { useEffect, useMemo, useState } from 'react';
import { getEvaluationMemberByTeamId } from '../../../../services/studentApi';
import { Inbox, User, AlertTriangle } from 'lucide-react';
import { useAvatar } from '../../../../hooks/useAvatar';
import StarRating from './StarRating';
import { toast } from 'sonner';

const CRITERIA = [
  'Hard-working',
  'Good knowledge/Skills',
  'Teamworking',
];

const ReceivedEvaluations = ({ teamId }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const totalFor = (scoreDetails) => {
    return (scoreDetails || []).reduce((sum, s) => sum + (Number(s.score) || 0), 0);
  };

  const grouped = useMemo(() => items, [items]);

  // Call api to get received evaluations 
  const fetchReceivedEvaluations = async () => {
    setLoading(true);
    try {
      const data = await getEvaluationMemberByTeamId(teamId);
      const list = Array.isArray(data)
        ? data
        : data?.otherEvaluations || data?.evaluations || data?.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching received evaluations:', error);
      toast.error('Failed to load received evaluations. Please try again later.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (teamId) {
      fetchReceivedEvaluations();
    }
  }, [teamId]);

  const MemberAvatar = ({ name, src, alt, className }) => {
    const { initials, colorClass, setImageError, shouldShowImage } = useAvatar(name, src);
    if (shouldShowImage) {
      return (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className={className}
        />
      );
    }
    return (
      <div className={`${className} flex items-center justify-center ${colorClass}`} aria-hidden>
        <span className="select-none">{initials}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="w-12 h-12 border-4 border-orangeFpt-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading received evaluations...</p>
      </div>
    );
  }

  if (!grouped.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Inbox className="mx-auto text-gray-300 mb-4" size={64} />
        <h3 className="text-xl font-medium text-gray-900 mb-2">No evaluations received yet</h3>
        <p className="text-gray-600">When your teammates rate you, they will appear here.</p>
      </div>
    );
  }

  const convertTeamRole = (teamRole) => {
    switch (teamRole) {
      case 1:
        return 'Leader';
      case 0:
        return 'Member';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Your Received Evaluations</h2>
      </div>
      {grouped.map((ev, idx) => (
        <div key={idx} className="bg-white rounded-lg shadow-md p-6 my-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
              <MemberAvatar
                name={ev.raterName}
                src={ev.raterAvatar}
                alt={ev.raterName}
                className="w-10 h-10 rounded-full object-cover border-black"
              />
              <div>
                <div className="font-semibold text-gray-900">{ev.raterName}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">{convertTeamRole(ev.raterTeamRole)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total</div>
              <div className='flex items-baseline gap-1'>
                <span className="text-orangeFpt-500 font-bold text-2xl">{totalFor(ev.scoreDetails)}</span>
                <span className="text-gray-500 text-xl">/ 15</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CRITERIA.map((c) => {
              const row = (ev.scoreDetails || ev.details || ev.scores || []).find((x) => x.scoreDetailName === c || x.name === c || x.criterion === c);
              const val = Number(row?.score || 0);
              return (
                <div key={c} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">{c}</div>
                  <StarRating value={val} readOnly />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReceivedEvaluations;
