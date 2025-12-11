import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  BookOpen,
  GraduationCap,
  Calendar,
  Clock,
  Award,
  Target,
  ChevronRight,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';
import { getClassDetail, getSyllabusBySubjectId } from '../../services/userService';

/**
 * Glassmorphism Card Component
 * Frosted glass effect with translucent panels
 */
const GlassCard = ({ children, className = '', gradient = false }) => (
  <div
    className={`
      relative overflow-hidden rounded-2xl 
      border border-white/60 
      bg-white/70 backdrop-blur-xl
      shadow-xl shadow-slate-200/50
      ${gradient ? 'bg-gradient-to-br from-white/80 to-white/60' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

/**
 * Info Item Component - displays key-value pairs
 */
const InfoItem = ({ icon: Icon, label, value, highlight = false }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 border border-white/40 backdrop-blur-sm">
    <div className={`p-2 rounded-lg ${highlight ? 'bg-orangeFpt-100 text-orangeFpt-600' : 'bg-slate-100 text-slate-600'}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-orangeFpt-700' : 'text-slate-800'} mt-0.5`}>
        {value || '—'}
      </p>
    </div>
  </div>
);

/**
 * Grade Component Card
 */
const GradeComponentCard = ({ component, index }) => {
  const percentage = component.referencePercentage || 0;
  const getPercentageColor = (pct) => {
    if (pct >= 40) return 'from-orangeFpt-400 to-orangeFpt-500';
    if (pct >= 20) return 'from-blue-400 to-blue-500';
    return 'from-emerald-400 to-emerald-500';
  };

  return (
    <div className="group relative p-4 rounded-xl bg-white/60 border border-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:shadow-lg">
      {/* Progress indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl overflow-hidden bg-slate-100">
        <div
          className={`h-full bg-gradient-to-r ${getPercentageColor(percentage)} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm font-bold">
            {index + 1}
          </div>
          <span className="font-medium text-slate-700">{component.componentName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-orangeFpt-600">{percentage}</span>
          <span className="text-sm text-slate-500">%</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Learning Outcome Item
 */
const OutcomeItem = ({ outcome, index }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-white/50 border border-white/40 backdrop-blur-sm hover:bg-white/70 transition-all duration-200">
    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-200">
      {index + 1}
    </div>
    <div className="flex-1">
      <p className="text-slate-700 leading-relaxed">{outcome.outcomeDetail}</p>
    </div>
  </div>
);

/**
 * Loading Skeleton
 */
const SyllabusSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-48 rounded-2xl bg-slate-200/60" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-slate-200/60" />
      ))}
    </div>
    <div className="h-64 rounded-2xl bg-slate-200/60" />
    <div className="h-48 rounded-2xl bg-slate-200/60" />
  </div>
);

/**
 * Main Syllabus Page Component for Lecturer
 */
const ClassSyllabusPage = () => {
  const { classId } = useParams();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [syllabusData, setSyllabusData] = useState(null);
  const [error, setError] = useState('');

  // Fetch class details first to get subjectId
  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      if (!classId) return;

      setLoading(true);
      setError('');

      try {
        // 1. Get class details to extract subjectId
        const classResponse = await getClassDetail(classId);
        if (ignore) return;

        const subjectId = classResponse?.subjectId || classResponse?.subject?.subjectId;
        setClassData(classResponse);

        if (!subjectId) {
          setError('No subject associated with this class.');
          return;
        }

        // 2. Get syllabus data using subjectId
        const syllabusResponse = await getSyllabusBySubjectId(subjectId);
        if (ignore) return;

        setSyllabusData(syllabusResponse);
      } catch (err) {
        if (!ignore) {
          console.error('Failed to load syllabus:', err);
          setError('Unable to load syllabus information.');
          toast.error('Failed to load syllabus');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchData();
    return () => { ignore = true; };
  }, [classId]);

  // Extract syllabus details
  const syllabus = syllabusData?.subjectSyllabus || syllabusData;
  const gradeComponents = syllabus?.subjectGradeComponents || [];
  const learningOutcomes = syllabus?.subjectOutcomes || [];

  // Calculate total percentage
  const totalPercentage = useMemo(() =>
    gradeComponents.reduce((sum, c) => sum + (c.referencePercentage || 0), 0),
    [gradeComponents]
  );

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: 'Classes', href: '/lecturer/classes' },
    { label: classData?.className || 'Class', href: `/lecturer/classes/${classId}` },
    { label: 'Syllabus' },
  ], [classId, classData?.className]);

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen space-y-8 bg-slate-50/50">
          <LecturerBreadcrumbs items={breadcrumbItems} />
          <SyllabusSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen space-y-8 bg-slate-50/50">
          <LecturerBreadcrumbs items={breadcrumbItems} />
          <GlassCard className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Unable to Load Syllabus</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <Link
              to={`/lecturer/classes/${classId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orangeFpt-500 text-white font-medium hover:bg-orangeFpt-600 transition-colors"
            >
              Back to Class
            </Link>
          </GlassCard>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen space-y-6 bg-slate-50/50">
        <LecturerBreadcrumbs items={breadcrumbItems} />

        {/* Hero Section with Glassmorphism */}
        <GlassCard gradient className="relative p-8">
          {/* Decorative blurs */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-blue-100/40 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orangeFpt-400 to-orangeFpt-500 text-white shadow-lg shadow-orangeFpt-200">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Course Syllabus
                    </p>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                      {syllabus?.syllabusName || classData?.subjectName || 'Subject Syllabus'}
                    </h1>
                  </div>
                </div>

                {syllabus?.description && (
                  <p className="text-slate-600 mt-4 max-w-2xl leading-relaxed">
                    {syllabus.description}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <div className={`
                px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2
                ${syllabus?.isActive !== false
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'}
              `}>
                <CheckCircle2 className="w-4 h-4" />
                {syllabus?.isActive !== false ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoItem
            icon={FileText}
            label="Subject Code"
            value={syllabus?.subjectCode || classData?.subjectCode}
            highlight
          />
          <InfoItem
            icon={GraduationCap}
            label="Credits"
            value={syllabus?.noCredit ? `${syllabus.noCredit} Credits` : null}
          />
          <InfoItem
            icon={Calendar}
            label="Created Date"
            value={formatDate(syllabus?.createdDate)}
          />
          <InfoItem
            icon={Clock}
            label="Last Updated"
            value={formatDate(syllabus?.modifiedDate || syllabus?.createdDate)}
          />
        </div>

        {/* Grade Components Section */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orangeFpt-100 text-orangeFpt-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Grade Components</h2>
                <p className="text-sm text-slate-500">Assessment structure and weight distribution</p>
              </div>
            </div>
            <div className={`
              px-4 py-2 rounded-lg text-sm font-semibold
              ${totalPercentage === 100
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'}
            `}>
              Total: {totalPercentage}%
            </div>
          </div>

          {gradeComponents.length > 0 ? (
            <div className="grid gap-3">
              {gradeComponents.map((component, index) => (
                <GradeComponentCard
                  key={component.subjectGradeComponentId || index}
                  component={component}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No grade components defined for this syllabus.</p>
            </div>
          )}
        </GlassCard>

        {/* Learning Outcomes Section */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Learning Outcomes</h2>
              <p className="text-sm text-slate-500">What students will achieve in this course</p>
            </div>
          </div>

          {learningOutcomes.length > 0 ? (
            <div className="space-y-3">
              {learningOutcomes.map((outcome, index) => (
                <OutcomeItem
                  key={outcome.subjectOutcomeId || index}
                  outcome={outcome}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No learning outcomes defined for this syllabus.</p>
            </div>
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  );
};

export default ClassSyllabusPage;
