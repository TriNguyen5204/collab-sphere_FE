import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ClipboardList,
  GitBranch,
  GraduationCap,
  Layers3,
  LineChart,
  Sparkles,
  Target,
  Users,
  Workflow,
} from 'lucide-react';
import logo from '../assets/logov1.png';
import classImage from '../assets/class.png';
import lecturerImage from '../assets/lecturer.png';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/userSlice';
import { getRoleLandingRoute } from '../constants/roleRoutes';

const heroHighlights = [
  'AI copilots transform module briefs into milestones, checkpoints, and evaluation rubrics in minutes.',
  'Role-aware dashboards surface accreditation status, risk alerts, and cohort health for every stakeholder.',
  'Tightly integrated submissions, lecturer feedback, and Git analytics keep programme evidence audit-ready.',
];

const statHighlights = [
  { label: 'Subjects orchestrated', value: '120+', sublabel: 'Outcome-aligned archives for rapid reuse' },
  { label: 'Live project teams', value: '310', sublabel: 'Auto-provisioned workspaces with Git sync' },
  { label: 'At-risk checkpoints resolved', value: '82%', sublabel: 'Interventions triggered from AI risk radar' },
];

const workspaceCards = [
  {
    icon: GraduationCap,
    title: 'Students',
    description: 'Personalised sprint plans, checkpoint submissions, and team analytics with Git-backed accountability.',
  },
  {
    icon: Users,
    title: 'Lecturers',
    description: 'Curate project templates, monitor cohort velocity, and approve AI-suggested refinements instantly.',
  },
  {
    icon: ClipboardList,
    title: 'Academic Services',
    description: 'Track enrolment, manage subject approvals, and automate compliance tasks across programmes.',
  },
  {
    icon: Building2,
    title: 'Heads of Department',
    description: 'Gain accreditation-ready insights on learning outcomes, workload balance, and programme health.',
  },
  {
    icon: Layers3,
    title: 'Administrators',
    description: 'Oversee platform governance, audit usage, and export evidence bundles for executive reporting.',
  },
];

const workflowPillars = [
  {
    title: 'Design & Approval',
    description:
      'Lecturers capture briefs, align outcomes, and route approval tasks through academic services in a guided builder.',
    icon: Workflow,
  },
  {
    title: 'Launch & Formation',
    description:
      'Auto-generated objectives, milestones, and team allocations spin up collaborative workspaces with Git integration.',
    icon: GitBranch,
  },
  {
    title: 'Execution & Monitoring',
    description:
      'Role-centric dashboards expose milestone progress, attendance trends, and evaluation readiness in real time.',
    icon: LineChart,
  },
  {
    title: 'Assessment & Accreditation',
    description:
      'Evidence bundles combine submissions, milestone feedback, and rubric scores for lightning-fast accreditation audits.',
    icon: BadgeCheck,
  },
];

const automationHighlights = [
  {
    title: 'Guided planning intelligence',
    description: 'Prompt-based objective creation and AI-authored checkpoint scaffolding keep teams sprint-ready.',
    icon: Sparkles,
  },
  {
    title: 'Predictive risk radar',
    description: 'Signals from attendance, commits, and milestone health trigger interventions before blockers escalate.',
    icon: Target,
  },
  {
    title: 'Evidence bundler',
    description: 'Single-click packages compile submissions and evaluations into accreditation-ready dossiers.',
    icon: BrainCircuit,
  },
];

const insightPills = [
  {
    title: 'Live submissions',
    description: 'Checkpoint status syncs with ClassMember profiles to visualise individual contribution patterns.',
  },
  {
    title: 'Milestone review loops',
    description: 'Lecturer insights map directly into MemberEvaluation records for balanced grading.',
  },
  {
    title: 'Curriculum fidelity',
    description: 'SubjectOutcome coverage maps ensure every sprint reinforces accredited competencies.',
  },
];

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.user);
  const isAuthenticated = Boolean(user?.accessToken);
  const roleLandingRoute = getRoleLandingRoute(user?.roleName);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <header className="relative z-10 border-b border-white/5 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-primary-400/40 blur" aria-hidden="true" />
              <img src={logo} alt="CollabSphere logo" className="relative h-12 w-12 rounded-2xl border border-white/10 bg-white/10 p-2" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">CollabSphere</p>
              <p className="text-xs text-slate-400">Programme-wide project-based learning control centre</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
            <a href="#workspaces" className="transition hover:text-white">
              Workspaces
            </a>
            <a href="#lifecycle" className="transition hover:text-white">
              Lifecycle
            </a>
            <a href="#automation" className="transition hover:text-white">
              AI copilots
            </a>
            <a href="#evidence" className="transition hover:text-white">
              Evidence
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={roleLandingRoute}
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-primary-400 hover:text-white"
                >
                  Open dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-primary-500/30 transition hover:bg-primary-400"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-primary-400 hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-primary-500/30 transition hover:bg-primary-400"
                >
                  Create account
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-col gap-20 overflow-hidden pb-20">
        <div className="pointer-events-none absolute inset-0 mx-auto h-[720px] max-w-6xl rounded-[40px] bg-primary-500/10 blur-3xl" aria-hidden="true" />

        <section className="mx-auto mt-12 grid w-full max-w-6xl gap-12 px-6 lg:grid-cols-[3fr,2fr]">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-400/40 bg-primary-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary-200">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Project-based learning, orchestrated
            </span>
            <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
              One operating system for students, lecturers, and academic leadership to run AI-assisted project programmes.
            </h1>
            <p className="max-w-2xl text-base text-slate-300 md:text-lg">
              CollabSphere threads user management, academic structure, and assessment workflows into a single source of truth. From approved project briefs to milestone reviews, every artefact stays connected and accreditation-ready.
            </p>
            <ul className="space-y-4 text-sm text-slate-300">
              {heroHighlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary-300" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Start free pilot
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/test/kanban"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-primary-400 hover:text-primary-100"
              >
                Preview student board
              </Link>
            </div>
          </div>

          <div className="relative flex flex-col gap-6">
            <div className="absolute inset-x-6 top-6 -z-10 h-72 rounded-[32px] bg-primary-500/20 blur-3xl" aria-hidden="true" />
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_-30px_rgba(15,15,35,0.65)] backdrop-blur">
              <header className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-primary-200">
                <span>Live programme snapshot</span>
                <span>Autumn cohort · Week 6</span>
              </header>
              <dl className="mt-6 space-y-5">
                {statHighlights.map(({ label, value, sublabel }) => (
                  <div key={label} className="flex items-start justify-between gap-4 rounded-2xl border border-white/5 bg-slate-900/60 p-4">
                    <div>
                      <dt className="text-sm font-semibold text-white">{label}</dt>
                      <dd className="mt-1 text-xs text-slate-400">{sublabel}</dd>
                    </div>
                    <span className="rounded-full bg-primary-500/20 px-3 py-1 text-sm font-semibold text-primary-100">{value}</span>
                  </div>
                ))}
              </dl>
              <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-slate-950/70 p-5 text-sm text-slate-300">
                <h3 className="text-sm font-semibold text-white">Next best actions</h3>
                <ul className="mt-3 space-y-2">
                  <li>▶ Approve AI-refined milestones for SE301 sprint planning.</li>
                  <li>▶ Review pending SubjectOutcome updates from Head Department.</li>
                  <li>▶ Notify teams about new Git branching guardrails.</li>
                </ul>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <figure className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <img src={classImage} alt="Students collaborating in CollabSphere" className="h-36 w-full rounded-2xl object-cover" />
                <figcaption className="mt-3 text-xs text-slate-300">Every class syncs team milestones with lecturer dashboards.</figcaption>
              </figure>
              <figure className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <img src={lecturerImage} alt="Lecturer overview dashboard" className="h-36 w-full rounded-2xl object-cover" />
                <figcaption className="mt-3 text-xs text-slate-300">Lecturers oversee risk, attendance, and evaluation readiness in real time.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section id="workspaces" className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl font-bold text-white">Workspaces tailored to every academic role.</h2>
            <p className="text-base text-slate-300">
              CollabSphere honours the responsibilities encoded in the university schema—connecting Users, ClassMember enrolments, and evaluation workflows so each persona acts with clarity.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workspaceCards.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="group relative flex h-full flex-col rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_10px_35px_-20px_rgba(15,15,35,0.8)] transition hover:-translate-y-1 hover:border-primary-400/60 hover:bg-primary-400/10"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-200">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 flex-1 text-sm text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="lifecycle" className="mx-auto w-full max-w-6xl px-6">
          <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/80 p-10 shadow-[0_20px_60px_-40px_rgba(15,15,35,0.9)]">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl space-y-4">
                <h2 className="text-3xl font-bold text-white">The CollabSphere lifecycle keeps every cohort in sync.</h2>
                <p className="text-base text-slate-300">
                  From Subject inception to Checkpoint evaluation, CollabSphere automates cross-entity updates—ensuring Project, Team, and Evaluation records stay consistent and auditable.
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {insightPills.map(({ title, description }) => (
                    <div key={title} className="rounded-2xl border border-white/5 bg-white/5 p-4 text-xs text-slate-300">
                      <h3 className="text-sm font-semibold text-white">{title}</h3>
                      <p className="mt-2 leading-relaxed">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-6 lg:max-w-xl">
                {workflowPillars.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                    <span className="mt-1 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-100">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="automation" className="mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-col gap-8">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-3xl font-bold text-white">AI copilots embedded in every stage.</h2>
              <p className="text-base text-slate-300">
                CollabSphere learns from milestones, submissions, and evaluation feedback to orchestrate smarter planning and interventions across TeamMilestone and Checkpoint data.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {automationHighlights.map(({ title, description, icon: Icon }) => (
                <div key={title} className="rounded-3xl border border-primary-400/30 bg-primary-400/10 p-6 shadow-[0_12px_45px_-30px_rgba(56,189,248,0.75)]">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-primary-100">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm text-slate-100/80">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="evidence" className="mx-auto w-full max-w-6xl px-6">
          <div className="rounded-[36px] border border-white/10 bg-white/5 p-10 shadow-[0_18px_55px_-45px_rgba(15,15,35,0.85)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl space-y-4">
                <h2 className="text-3xl font-bold text-white">Assessment evidence without the scramble.</h2>
                <p className="text-base text-slate-300">
                  CollabSphere connects CheckpointSubmit artefacts to CheckpointEvaluation and MemberEvaluation data, so grades reflect actual collaboration and competency coverage.
                </p>
                <ul className="space-y-3 text-sm text-slate-200">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary-300" aria-hidden="true" />
                    Automated audit trails covering submissions, feedback, and approval status changes across every module.
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary-300" aria-hidden="true" />
                    Exportable competency matrices align SubjectOutcome objectives with actual project delivery evidence.
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary-300" aria-hidden="true" />
                    Lecturer insights and milestone analytics combine for a balanced lens on individual contribution and skills development.
                  </li>
                </ul>
              </div>
              <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-sm text-slate-200">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary-200">Evidence bundle preview</p>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">AI Ethics Capstone</p>
                      <p className="text-xs text-slate-400">Team EVA · SE402 · Autumn cohort</p>
                    </div>
                    <span className="rounded-full bg-primary-500/20 px-3 py-1 text-xs font-semibold text-primary-100">100% coverage</span>
                  </div>
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Checkpoint submissions</span>
                      <span>18 artefacts</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Milestone feedback</span>
                      <span>96 responses</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Lecturer feedback</span>
                      <span>12 annotations</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-400"
                  >
                    Export accreditation pack
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6">
          <div className="rounded-[32px] border border-primary-400/30 bg-primary-400/10 p-10 text-center shadow-[0_16px_45px_-35px_rgba(56,189,248,0.9)]">
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              <h2 className="text-3xl font-bold text-white">Ready to pilot CollabSphere with your next cohort?</h2>
              <p className="text-base text-slate-100/80">
                Spin up your first subject, import existing project briefs, and let the AI copilots blueprint milestones in under ten minutes.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  Book onboarding session
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
                >
                  Sign in to existing campus
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/80 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} CollabSphere · Purpose-built for integrated project-based learning.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/login" className="transition hover:text-white">
              Sign in
            </Link>
            <Link to="/register" className="transition hover:text-white">
              Create account
            </Link>
            <a href="#workspaces" className="transition hover:text-white">
              Explore workspaces
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;
