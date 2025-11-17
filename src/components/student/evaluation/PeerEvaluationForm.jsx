import React, { useEffect, useMemo, useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import StarRating from './StarRating';
import { toast } from 'sonner';
import { postSubmitPeerEvaluation, getOwnEvaluationByTeamId } from '../../../services/studentApi';

const CRITERIA = [
  'Hard-working',
  'Good knowledge/Skills',
  'Teamworking',
];

const buildInitialRatings = (members) => {
  return members.reduce((acc, m) => {
    acc[m.id] = CRITERIA.reduce((cAcc, c) => ({ ...cAcc, [c]: 0 }), {});
    return acc;
  }, {});
};

const PeerEvaluationForm = ({ teamMembers = [], teamId, onSubmitted }) => {
  const { userId } = useSelector((s) => s.user);

  const evaluableMembers = useMemo(
    () =>
      teamMembers.filter(
        (m) => String(m.studentId ?? m.id ?? m.userId ?? m.memberId) !== String(userId) && !m.isCurrentUser
      ),
    [teamMembers, userId]
  );

  const members = useMemo(() => {
    return evaluableMembers.map((m, idx) => {
      const rawId = m.studentId ?? m.userId ?? m.id ?? m.memberId ?? m.accountId ?? m.receiverId ?? m.user?.id;
      const key = rawId != null && rawId !== '' ? String(rawId) : `idx_${idx}`;
      return { ...m, _memberKey: key };
    });
  }, [evaluableMembers]);

  const [ratings, setRatings] = useState(() => buildInitialRatings(members.map(m => ({ id: m._memberKey }))));
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    setRatings(buildInitialRatings(members.map(m => ({ id: m._memberKey }))));
  }, [members.length]);

  const setMemberCriterion = (memberKey, criterion, value) => {
    setRatings((prev) => ({
      ...prev,
      [memberKey]: {
        ...prev[memberKey],
        [criterion]: value,
      },
    }));
  };

  const totalForMember = (memberKey) => {
    const r = ratings[memberKey] ?? {};
    return CRITERIA.reduce((sum, c) => sum + (Number(r[c]) || 0), 0);
  };

  const validateAllFilled = () => {
    for (const m of members) {
      const r = ratings[m._memberKey] || {};
      for (const c of CRITERIA) {
        if (!r[c] || r[c] < 1) return false;
      }
    }
    return true;
  };

  const handleReset = () => {
    setRatings(buildInitialRatings(members.map(m => ({ id: m._memberKey }))));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (evaluableMembers.length === 0) return;

    if (!validateAllFilled()) {
      toast.warning('Please rate all three criteria for each teammate (1-5 stars).');
      return;
    }

    const payload = {
      evaluatorDetails: members.map((m) => ({
        receiverId: m.studentId ?? m.id ?? m.userId ?? m.memberId ?? m.accountId ?? m.receiverId ?? m.user?.id,
        scoreDetails: CRITERIA.map((c) => ({
          scoreDetailName: c,
          score: Number(ratings[m._memberKey]?.[c] || 0),
        })),
      })),
    };

    // Call api to submit peer evaluation
    try {
      setSubmitting(true);
      const res = await postSubmitPeerEvaluation(teamId, payload);
      console.log('Submit peer evaluation response:', res);
      const data = res?.data ?? res;

      if (data?.isSuccess) {
        toast.success(data?.message || 'Evaluate and give feedback successfully');
        onSubmitted?.();
      } else if (Array.isArray(data?.errorList) && data.errorList.length) {
        const first = data.errorList[0];
        toast.error(first?.message || 'Evaluation failed');
      } else {
        toast.error('Evaluation failed. Please try again.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Network error while submitting evaluation');
    } finally {
      setSubmitting(false);
    }
  };


  // Call api get own evaluation to prefill if exists
  const fetchOwnEvaluation = async () => {
    setLoading(true);
    try {
      const response = await getOwnEvaluationByTeamId(teamId);
      console.log('Own evaluation response:', response);
      const detailsArr = (
        response?.ownEvaluations ?? response?.data ?? []
      );

      if (Array.isArray(detailsArr) && detailsArr.length) {
        const map = new Map();
        for (const item of detailsArr) {
          const rid = String(
            item?.receiverId ?? item?.receiverUserId ?? item?.userId ?? item?.studentId ?? item?.accountId ?? ''
          );
          const sd = Array.isArray(item?.scoreDetails)
            ? item?.scoreDetails
            : Array.isArray(item?.details)
              ? item?.details
              : Array.isArray(item?.scores)
                ? item?.scores
                : [];

          const row = {};
          for (const d of sd) {
            const name = d?.scoreDetailName ?? d?.name ?? d?.criterion ?? '';
            const val = Number(d?.score ?? d?.value ?? 0);
            if (name) row[name] = val;
          }
          if (rid) map.set(rid, row);
        }

        setRatings((prev) => {
          const next = { ...prev };
          members.forEach((m, idx) => {
            const rawId = String(
              m.studentId ?? m.userId ?? m.id ?? m.memberId ?? m.accountId ?? m.receiverId ?? m.user?.id ?? ''
            );
            const existing = map.get(rawId) || {};
            const entry = { ...(next[m._memberKey] || {}) };
            CRITERIA.forEach((c) => {
              entry[c] = Number(existing[c] ?? entry[c] ?? 0);
            });
            next[m._memberKey] = entry;
          });
          return next;
        });
        setPrefilled(true);
      } else {
        setPrefilled(false);
      }
    } catch (error) {
      console.error('Error fetching own evaluation:', error);
      setPrefilled(false);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (teamId) {
      fetchOwnEvaluation();
    }
  }, [teamId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="w-12 h-12 border-4 border-orangeFpt-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading peer evaluations...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Evaluate Your Teammates</h2>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No teammates available to evaluate</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-3 py-2">Member</th>
                  {CRITERIA.map((c) => (
                    <th key={c} className="px-3 py-2 font-medium">{c}</th>
                  ))}
                  <th className="px-3 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m._memberKey} className="bg-gray-50 rounded-xl">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.avatar}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border-black"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{m.name}</div>
                          {m.role && <div className="text-xs text-gray-500">{m.role}</div>}
                        </div>
                      </div>
                    </td>
                    {CRITERIA.map((c) => (
                      <td key={c} className="px-3 py-3">
                        <StarRating
                          value={Number(ratings[m._memberKey]?.[c] || 0)}
                          onChange={(v) => setMemberCriterion(m._memberKey, c, v)}
                        />
                      </td>
                    ))}
                    <td className="flex items-baseline gap-1 px-3 py-3">
                      <span className="text-orangeFpt-500 font-bold text-xl">{totalForMember(m._memberKey)}</span>
                      <span className="text-gray-500 text-sm">/ 15</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <button
              type="button"
              onClick={handleReset}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Reset all
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-orangeFpt-500 text-white rounded-lg hover:bg-orangeFpt-600 disabled:opacity-50"
            >
              <Send size={18} />
              {submitting ? (prefilled ? 'Updating...' : 'Submitting...') : (prefilled ? 'Update Evaluation' : 'Submit Evaluation')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PeerEvaluationForm;