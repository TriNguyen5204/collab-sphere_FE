import { useNavigate } from 'react-router-dom';
import { User, BookOpen, ArrowRight } from 'lucide-react';
import StaffDashboardLayout from '../../components/layout/StaffDashboardLayout';

const StaffPage = () => {
  const navigate = useNavigate();
  const cards = [
    {
      title: 'Manage Accounts',
      icon: User,
      description: 'Easily manage lecturer and student accounts',
      navigator: '/staff/lecturers',
      color: 'orangeFpt',
    },
    {
      title: 'Manage Classes',
      icon: BookOpen,
      description: 'Organize classes, schedules, and student groups',
      navigator: '/staff/classes',
      color: 'slate',
    },
  ];

  return (
    <StaffDashboardLayout>
      <div className='bg-gradient-to-br from-gray-50 to-gray-100 p-6 min-h-screen'>
        <div className='mx-auto space-y-6'>
          
          {/* Header Section */}
          <div className="relative overflow-hidden rounded-3xl border border-orangeFpt-50 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white shadow-md shadow-orangeFpt-100/60 backdrop-blur">
            <div className="relative z-10 px-6 py-8 lg:px-10">
              <div className="max-w-2xl space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 flex items-center gap-2">
                  Welcome
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                  Staff <span className="text-orangeFpt-500 font-bold">Dashboard</span>
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Manage lecturers and classes efficiently with powerful tools.
                </p>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {cards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(card.navigator)}
                  className='group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-orangeFpt-200 transition-all duration-300 text-left'
                >
                  <div className='flex flex-col gap-4'>
                    {/* Icon */}
                    <div className='w-14 h-14 bg-orangeFpt-50 rounded-xl flex items-center justify-center group-hover:bg-orangeFpt-100 transition-colors'>
                      <IconComponent className='w-7 h-7 text-orangeFpt-600' />
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className='text-xl font-bold text-slate-900 mb-2 group-hover:text-orangeFpt-600 transition-colors'>
                        {card.title}
                      </h3>
                      <p className='text-slate-500 text-sm leading-relaxed'>
                        {card.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className='flex items-center gap-2 text-orangeFpt-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity'>
                      <span>Go to {card.title.toLowerCase()}</span>
                      <ArrowRight className='w-4 h-4' />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  );
};

export default StaffPage;
