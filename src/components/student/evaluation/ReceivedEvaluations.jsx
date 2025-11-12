import React, { useEffect, useMemo, useState } from 'react';
import { getEvaluationMemberByTeamId } from '../../../services/studentApi';
import { Inbox, User, AlertTriangle } from 'lucide-react';
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

  // useEffect(() => {
  //   let mounted = true;
  //   async function run() {
  //     setLoading(true);
  //     try {
  //       const res = await getEvaluationMemberByTeamId(teamId);

  //       console.log('Received evaluations response:', res);
  //       const data = res?.data ?? res;
  //       if (data?.isSuccess) {
  //         if (mounted) setItems(data.otherEvaluations || []);
  //       } else if (Array.isArray(data?.errorList) && data.errorList.length) {
  //         toast.warning(data.errorList[0]?.message || 'Unable to load evaluations for you');
  //         if (mounted) setItems([]);
  //       } else {
  //         if (mounted) setItems([]);
  //       }
  //     } catch (e) {
  //       if (mounted) setItems([]);
  //     } finally {
  //       if (mounted) setLoading(false);
  //     }
  //   }
  //   if (teamId && userId) run();
  //   return () => {
  //     mounted = false;
  //   };
  // }, [teamId, userId]);


  // Call api to get received evaluations 
  const fetchReceivedEvaluations = async () => {
    setLoading(true);
    try {
      const data = await getEvaluationMemberByTeamId(teamId);
      console.log('Received evaluations response:', data);
      // New API returns an array of evaluation objects; keep backward compatibility
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">Loading evaluations...</div>
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
    <div className="space-y-4">
      {grouped.map((ev, idx) => (
        <div key={idx} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={ev.raterAvatar}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-black"
              />
              <div>
                <div className="font-semibold text-gray-900">{ev.raterName}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">{convertTeamRole(ev.raterTeamRole)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-bold text-gray-900">{totalFor(ev.scoreDetails)} / 15</div>
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
