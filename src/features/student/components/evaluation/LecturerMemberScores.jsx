import React, { useEffect, useState } from 'react';
import { AlertTriangle, Award, User } from 'lucide-react';
import { getLecturerMemberScoresByTeamId } from '../../../../services/studentApi';
import { useSelector } from 'react-redux';

const LecturerMemberScores = ({ teamId }) => {
    const [loading, setLoading] = useState(false);
    const [memberScores, setMemberScores] = useState(null);
    const [error, setError] = useState(null);
    const { userId } = useSelector((s) => s.user);

    useEffect(() => {
        let mounted = true;
        const fetchMemberScores = async () => {
            if (!teamId) return;
            setLoading(true);
            setError(null);
            try {
                const response = await getLecturerMemberScoresByTeamId(teamId);
                if (mounted) {
                    const scores = response?.teamMemEvaluations?.memberScores ?? response?.memberScores ?? response?.data ?? response;
                    setMemberScores(scores);
                }
            } catch (err) {
                console.error('Failed to load lecturer member scores', err);
                if (mounted) setError(err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchMemberScores();
        return () => {
            mounted = false;
        };
    }, [teamId]);

    if (!teamId) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">No team selected.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="w-12 h-12 border-4 border-orangeFpt-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading member scores...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="text-orangeFpt-500" />
                    <div>
                        <p className="font-semibold text-gray-900">Failed to load member scores</p>
                        <p className="text-sm text-gray-600">Please try again later.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Parse member scores array
    const scores = Array.isArray(memberScores) ? memberScores : [];
    const currentUserScore = scores.find(
        (s) => String(s?.studentId ?? s?.userId ?? s?.memberId ?? s?.classMemberId) === String(userId)
    ) ?? scores[0]; // For preview, use first score if no match

    if (scores.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6 text-center">
                <AlertTriangle className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900">No Member Scores Available</h3>
                <p className="text-gray-600">Your lecturer hasn't assigned individual member scores yet.</p>
            </div>
        );
    }

    // If only current user's score exists (for student view)
    if (currentUserScore) {
        const score = currentUserScore?.score ?? null;
        const comment = currentUserScore?.comment ?? currentUserScore?.feedback ?? currentUserScore?.note ?? '';

        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Individual Score from Lecturer</h2>
                    <Award className="text-orangeFpt-500" size={32} />
                </div>

                <div className="bg-gradient-to-br from-orangeFpt-50 to-orangeFpt-100 rounded-xl p-8 text-center shadow-sm">
                    <p className="text-sm font-medium text-orangeFpt-600 uppercase tracking-wide mb-2">Your Score</p>
                    <div className="text-orangeFpt-500 font-extrabold text-7xl mb-2">
                        {score !== null && score !== undefined ? Number(score).toFixed(1) : '-'}
                    </div>
                    <p className="text-gray-600 text-sm">out of 10</p>
                </div>

                {comment && (
                    <div className="mt-6">
                        <p className="text-sm text-gray-500 mb-2 font-medium">Lecturer's Comment</p>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {comment}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Full team view (for lecturers or when all scores are visible)
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Individual Member Scores</h2>
                <Award className="text-orangeFpt-500" size={32} />
            </div>

            <div className="space-y-4">
                {scores.map((member, idx) => {
                    const memberId = member?.studentId ?? member?.userId ?? member?.memberId ?? member?.classMemberId ?? idx;
                    const memberName = member?.studentName ?? member?.name ?? member?.fullName ?? member?.memberName ?? `Member ${idx + 1}`;
                    const score = member?.score ?? member?.point ?? member?.rating ?? null;
                    const comment = member?.comment ?? member?.feedback ?? member?.note ?? '';
                    const isCurrentUser = String(memberId) === String(userId);

                    return (
                        <div
                            key={memberId}
                            className={`border rounded-lg p-5 transition-all duration-200 ${
                                isCurrentUser
                                    ? 'border-orangeFpt-300 bg-orangeFpt-50 shadow-md'
                                    : 'border-gray-200 hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orangeFpt-100 flex items-center justify-center">
                                        <User className="text-orangeFpt-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {memberName}
                                            {isCurrentUser && (
                                                <span className="ml-2 text-xs bg-orangeFpt-500 text-white px-2 py-0.5 rounded-full">
                                                    You
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-orangeFpt-500 font-bold text-2xl">
                                        {score !== null && score !== undefined ? Number(score).toFixed(1) : '-'}
                                    </span>
                                    <span className="text-gray-500 text-sm">/10</span>
                                </div>
                            </div>

                            {comment && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-sm text-gray-700 leading-relaxed">{comment}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LecturerMemberScores;
