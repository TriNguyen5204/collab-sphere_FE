import { Link, useLocation } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.45em] text-slate-500">Error 404</p>
        <h1 className="mt-6 text-4xl font-bold text-white">We could not find that page.</h1>
        <p className="mt-4 text-sm text-slate-400">
          The requested path <span className="font-mono text-slate-200">{location.pathname}</span> does not exist or has been moved.
          If you followed a link, it might be outdated.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
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

export default NotFound;
