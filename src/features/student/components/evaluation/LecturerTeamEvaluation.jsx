import React, { useEffect, useState } from 'react';
import { AlertTriangle, User } from 'lucide-react';
import { getLecturerEvaluationByTeamId, getLecturerMemberScoresByTeamId } from '../../../../services/studentApi';
import { useSelector } from 'react-redux';

const LecturerTeamEvaluation = ({ teamId }) => {
    const [loading, setLoading] = useState(false);
    const [evaluation, setEvaluation] = useState(null);
    const [memberScore, setMemberScore] = useState(null);
    const [error, setError] = useState(null);
    const { userId } = useSelector((s) => s.user);

    useEffect(() => {
        let mounted = true;
        const fetchEvaluation = async () => {
            if (!teamId) return;
            setLoading(true);
            setError(null);
            try {
                const [evalResponse, scoreResponse] = await Promise.all([
                    getLecturerEvaluationByTeamId(teamId),
                    getLecturerMemberScoresByTeamId(teamId).catch(() => null)
                ]);
                
                if (mounted) {
                    setEvaluation(evalResponse.lecturerEvaluateTeam);
                    
                    // Extract member score (for student, only their own score)
                    const scores = scoreResponse?.teamMemEvaluations?.memberScores ?? [];
                    const currentUserScore = scores.find(
                        (s) => String(s?.studentId ?? s?.userId ?? s?.memberId ?? s?.classMemberId) === String(userId)
                    ) ?? scores[0];
                    setMemberScore(currentUserScore);
                }
            } catch (err) {
                console.error('Failed to load lecturer evaluation', err);
                if (mounted) setError(err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchEvaluation();
        return () => {
            mounted = false;
        };
    }, [teamId, userId]);

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
                <p className="text-gray-600">Loading lecturer evaluation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="text-orangeFpt-500" />
                    <div>
                        <p className="font-semibold text-gray-900">Failed to load evaluation</p>
                        <p className="text-sm text-gray-600">Please try again later.</p>
                    </div>
                </div>
            </div>
        );
    }

    const overall = evaluation?.finalGrade ?? evaluation?.overall ?? evaluation?.total ?? null;
    const teamComment = evaluation?.teamComment ?? evaluation?.comment ?? evaluation?.teamFeedback ?? '';
    const components = evaluation?.evaluateDetails ?? evaluation?.evaluateDetailsList ?? evaluation?.subjectGradeComponents ?? [];
    const hasComponents = Array.isArray(components) && components.length > 0;

    if (!evaluation || (!overall && !hasComponents && !teamComment)) {
        return (
            <div className="bg-white rounded-lg shadow p-6 text-center">
                <AlertTriangle className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900">No Lecturer Evaluation</h3>
                <p className="text-gray-600">There is no lecturer evaluation for this team yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Your Lecturer Evaluation</h2>
            </div>
            <div className="space-y-8">
                {/* Overall + Comment Section */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                    {/* Team Score */}
                    <div className="flex flex-col items-center justify-center text-center bg-orangeFpt-100 rounded-xl p-6 flex-shrink-0 w-full md:w-1/3 shadow-sm">
                        <p className="text-sm font-medium text-orangeFpt-500 uppercase tracking-wide">Team Score</p>
                        <div className="text-orangeFpt-500 font-extrabold text-6xl mt-3">
                            {overall !== null && overall !== undefined ? Number(overall).toFixed(1) : '-'}
                        </div>
                        <p className="text-gray-500 text-sm mt-1">out of 10</p>
                    </div>

                    {/* Individual Score */}
                    {memberScore && (
                        <div className="flex flex-col items-center justify-center text-center bg-blue-100 rounded-xl p-6 flex-shrink-0 w-full md:w-1/3 shadow-sm">
                            <p className="text-sm font-medium text-blue-600 uppercase tracking-wide flex items-center gap-1 justify-center">
                                <User size={16} />
                                Your Score
                            </p>
                            <div className="text-blue-600 font-extrabold text-6xl mt-3">
                                {memberScore?.score !== null && memberScore?.score !== undefined 
                                    ? Number(memberScore.score).toFixed(1) 
                                    : '-'}
                            </div>
                            <p className="text-gray-500 text-sm mt-1">out of 10</p>
                        </div>
                    )}

                    {/* Team Comment */}
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-2 font-medium">Team Comment</p>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {teamComment || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Detail Evaluations */}
                <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Detailed Evaluations</h4>
                    {!hasComponents ? (
                        <p className="text-gray-600">No grades available.</p>
                    ) : (
                        <div className="space-y-4">
                            {components.map((c, idx) => {
                                const name = c.subjectGradeComponentName ?? c.componentName ?? c.name ?? `Component ${idx + 1}`;
                                const score = c.score ?? c.point ?? c.rating ?? null;
                                const comment = c.detailComment ?? c.comment ?? c.note ?? c.lecturerComment ?? '';

                                return (
                                    <div
                                        key={c.subjectGradeComponentId ?? c.id ?? idx}
                                        className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-semibold text-gray-900">{name}</div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-orangeFpt-500 font-bold text-xl">{score ?? '-'}</span>
                                                <span className="text-gray-500 text-sm">/10</span>
                                            </div>
                                        </div>
                                        {comment ? (
                                            <p className="text-sm text-gray-700 leading-relaxed">{comment}</p>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No comment</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LecturerTeamEvaluation;
