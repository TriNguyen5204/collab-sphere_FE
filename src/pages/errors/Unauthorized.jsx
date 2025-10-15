import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getRoleLandingRoute } from '../../constants/roleRoutes';

const Unauthorized = () => {
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const fallbackRoute = location.state?.fallbackRoute || getRoleLandingRoute(user?.roleName);
  const attemptedPath = location.state?.from || location.pathname;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
      <div className="max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-amber-400/80">Access restricted</p>
        <h1 className="mt-6 text-4xl font-bold text-white">You do not have permission to view this page.</h1>
        <p className="mt-4 text-sm text-slate-400">
          The route <span className="font-mono text-slate-200">{attemptedPath}</span> is limited to other roles.
          If you believe this is a mistake please contact the system administrator.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to={fallbackRoute}
            className="rounded-full bg-primary-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-[0_15px_35px_-25px_rgba(37,99,235,0.7)] transition hover:bg-primary-400"
          >
            Return to my workspace
          </Link>
          <Link
            to="/"
            className="rounded-full border border-slate-700 px-5 py-2 text-sm font-medium text-slate-100 transition hover:border-primary-400 hover:text-white"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
