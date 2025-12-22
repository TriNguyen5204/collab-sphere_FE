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
 * Elegant Card Component
 */
const ElegantCard = ({ children, className = '', title, icon: Icon, action }) => (
  <div className={`bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden ${className}`}>
    {(title || Icon) && (
      <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2.5 rounded-xl bg-[#fcd8b6]/30 text-[#e75710]">
              <Icon size={20} strokeWidth={2} />
            </div>
          )}
          {title && <h3 className="text-lg font-bold text-[#450b00]">{title}</h3>}
        </div>
        {action}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

/**
 * Stat Item Component
 */
const StatItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#fff8f3] border border-[#fcd8b6]/50 transition-transform hover:scale-[1.02]">
    <div className="p-3 rounded-xl bg-white text-[#e75710] shadow-sm">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-[#a51200]/70 mb-0.5">{label}</p>
      <p className="text-base font-bold text-[#450b00]">{value || '—'}</p>
    </div>
  </div>
);

/**
 * Assessment Item Component
 */
const AssessmentItem = ({ component, index }) => {
  const percentage = component.referencePercentage || 0;
  return (
    <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-[#fff8f3] transition-colors">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-[#fcd8b6] flex items-center justify-center text-sm font-bold text-[#e75710] shadow-sm group-hover:border-[#e75710] transition-colors">
        {percentage}%
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#450b00]">{component.componentName}</p>
        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#fb8239] to-[#e75710] rounded-full" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Timeline Milestone Component
 */
const TimelineMilestone = ({ milestone, index, isLast }) => (
  <div className="relative pl-8 pb-10 last:pb-0">
    {/* Line */}
    {!isLast && (
      <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-[#e75710]/20 to-transparent" />
    )}
    
    {/* Dot */}
    <div className="absolute left-0 top-1.5 h-8 w-8 rounded-full border-4 border-white bg-[#fb8239] shadow-md z-10 flex items-center justify-center group">
        <span className="text-[10px] font-bold text-white">{index + 1}</span>
    </div>

    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:shadow-[#fb8239]/10 transition-all ml-4 group">
       <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
          <div>
             <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#fcd8b6] text-[#a51200] mb-2">
                Week {milestone.startWeek}
             </span>
             <h4 className="text-base font-bold text-[#450b00] group-hover:text-[#e75710] transition-colors">{milestone.title}</h4>
          </div>
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
             <Clock size={12} /> {milestone.duration} {milestone.duration > 1 ? 'Weeks' : 'Week'}
          </span>
       </div>
       <p className="text-sm text-slate-600 leading-relaxed">{milestone.description}</p>
    </div>
  </div>
);

/**
 * Loading Skeleton
 */
const SyllabusSkeleton = () => (
  <div className="space-y-8 animate-pulse max-w-7xl mx-auto">
    <div className="h-48 rounded-3xl bg-slate-200/60" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-8">
        <div className="h-64 rounded-3xl bg-slate-200/60" />
        <div className="h-96 rounded-3xl bg-slate-200/60" />
      </div>
      <div className="lg:col-span-4 space-y-6">
        <div className="h-48 rounded-3xl bg-slate-200/60" />
        <div className="h-64 rounded-3xl bg-slate-200/60" />
      </div>
    </div>
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
  const milestones = syllabus?.syllabusMilestones || [];

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
        <div className="min-h-screen bg-[#fff8f3]/30 p-6 md:p-8">
          <LecturerBreadcrumbs items={breadcrumbItems} />
          <div className="mt-8">
            <SyllabusSkeleton />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#fff8f3]/30 p-6 md:p-8">
          <LecturerBreadcrumbs items={breadcrumbItems} />
          <div className="mt-8 max-w-2xl mx-auto text-center bg-white p-12 rounded-3xl border border-slate-100 shadow-xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-[#450b00] mb-2">Unable to Load Syllabus</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Link
              to={`/lecturer/classes/${classId}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#e75710] text-white font-bold hover:bg-[#a51200] transition-colors shadow-lg shadow-orange-200"
            >
              Back to Class
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="w-full space-y-8">
          <LecturerBreadcrumbs items={breadcrumbItems} />

          {/* Header Section */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-orangeFpt-100 p-8 shadow-2xl shadow-orangeFpt-100/50">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-orangeFpt-100 rounded-full filter blur-3xl opacity-60 animate-blob"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-orangeFpt-50 rounded-full filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-4 max-w-7xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orangeFpt-50 border border-orangeFpt-100 text-xs font-bold uppercase tracking-widest text-orangeFpt-600">
                  <BookOpen size={12} />
                  Course Syllabus
                </div>
                <h1 className="text-3xl font-bold leading-tight text-slate-900">
                  {syllabus?.syllabusName || classData?.subjectName || 'Subject Syllabus'}
                </h1>
                {syllabus?.description && (
                  <p className="text-md text-slate-500 leading-relaxed max-w-7xl">
                    {syllabus.description}
                  </p>
                )}
              </div>
              <div className={`
                flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 border
                ${syllabus?.isActive !== false
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  : 'bg-slate-50 border-slate-100 text-slate-500'}
              `}>
                <CheckCircle2 size={16} />
                {syllabus?.isActive !== false ? 'Active Syllabus' : 'Inactive'}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
            
            {/* Left Column: Outcomes & Schedule */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Learning Outcomes */}
              <ElegantCard title="Learning Outcomes" icon={Target}>
                {learningOutcomes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {learningOutcomes.map((outcome, index) => (
                      <div key={index} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-[#fff8f3] hover:border-[#fcd8b6] transition-colors group">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-400 group-hover:text-[#e75710] group-hover:border-[#fcd8b6] transition-colors shadow-sm">
                          {index + 1}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed group-hover:text-[#450b00] transition-colors">
                          {outcome.outcomeDetail}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Target size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No learning outcomes defined.</p>
                  </div>
                )}
              </ElegantCard>

              {/* Course Schedule */}
              <ElegantCard title="Course Schedule" icon={Calendar}>
                {milestones.length > 0 ? (
                  <div className="mt-4">
                    {milestones.sort((a, b) => a.startWeek - b.startWeek).map((milestone, index) => (
                      <TimelineMilestone
                        key={milestone.syllabusMilestoneId || index}
                        milestone={milestone}
                        index={index}
                        isLast={index === milestones.length - 1}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No milestones defined.</p>
                  </div>
                )}
              </ElegantCard>
            </div>

            {/* Right Column: Stats & Grading */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Key Information */}
              <ElegantCard title="Overview" icon={FileText}>
                <div className="space-y-3">
                  <StatItem 
                    label="Subject Code" 
                    value={syllabus?.subjectCode || classData?.subjectCode} 
                    icon={FileText} 
                  />
                  <StatItem 
                    label="Credits" 
                    value={syllabus?.noCredit ? `${syllabus.noCredit} Credits` : null} 
                    icon={GraduationCap} 
                  />
                  <StatItem 
                    label="Created" 
                    value={formatDate(syllabus?.createdDate)} 
                    icon={Calendar} 
                  />
                  <StatItem 
                    label="Last Updated" 
                    value={formatDate(syllabus?.modifiedDate || syllabus?.createdDate)} 
                    icon={Clock} 
                  />
                </div>
              </ElegantCard>

              {/* Grading Distribution */}
              <ElegantCard 
                title="Grading" 
                icon={Award}
                action={
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${totalPercentage === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    Total: {totalPercentage}%
                  </span>
                }
              >
                {gradeComponents.length > 0 ? (
                  <div className="space-y-2">
                    {gradeComponents.map((component, index) => (
                      <AssessmentItem
                        key={component.subjectGradeComponentId || index}
                        component={component}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-sm">No grade components defined.</p>
                  </div>
                )}
              </ElegantCard>

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassSyllabusPage;
