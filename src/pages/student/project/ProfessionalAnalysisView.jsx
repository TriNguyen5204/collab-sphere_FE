import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getPRAnalysisById } from '../../../services/prAnalysisApi';
import ConversationThread from './components/ConversationThread';
import MetadataSidebar from './components/MetadataSidebar';

const mapFeedback = feedbackJson => {
  if (!feedbackJson) return [];
  try {
    const parsed = JSON.parse(feedbackJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse feedback JSON', error);
    return [];
  }
};

const buildFiles = annotations => {
  const groups = annotations.reduce((acc, annotation) => {
    const path = annotation.path || 'Unknown file';
    if (!acc[path]) acc[path] = [];
    acc[path].push(annotation);
    return acc;
  }, {});

  return Object.entries(groups)
    .map(([filePath, items]) => ({ filePath, annotations: items }))
    .sort((a, b) => a.filePath.localeCompare(b.filePath));
};

const ProfessionalAnalysisView = () => {
  const { analysisId, projectId, projectName, teamId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await getPRAnalysisById(analysisId);
        if (!response?.isSuccess || !response.analysis) {
          throw new Error('Analysis not found');
        }
        setAnalysis(response.analysis);
        setAnnotations(mapFeedback(response.analysis.aiDetailedFeedback));
      } catch (err) {
        setError(err.message || 'Unable to fetch analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [analysisId]);

  const files = useMemo(() => buildFiles(annotations), [annotations]);
  const totalIssues = annotations.length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8]">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-[#f7f7f8] px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={() => {
              navigate(`/student/project/team-workspace?tab=ai-review`);
            }}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600"
          >
            <ArrowLeft className="h-4 w-4" /> Back to AI reviews
          </button>
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-red-700">
            <h2 className="text-xl font-semibold">Unable to load analysis</h2>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => {
            navigate(`/student/project/team-workspace?tab=ai-review`);
          }}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to workspace
        </button>

        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="lg:w-2/3">
            <ConversationThread
              aiSummary={analysis.aiSummary}
              files={files}
              totalIssues={totalIssues}
            />
          </div>
          <div className="lg:w-1/3 lg:self-start">
            <div className="sticky top-10">
              <MetadataSidebar
                analysis={analysis}
                annotations={annotations}
                totalIssues={totalIssues}
                filesWithIssues={files.length}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalAnalysisView;
