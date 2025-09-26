import Header from '../../components/layout/Header';
import lecturerIcon from '../../assets/lecturer.png';
import classIcon from '../../assets/class.png';
import { useNavigate } from 'react-router-dom';

const StaffPage = () => {
  const navigate = useNavigate();
  const cards = [
    {
      title: 'Manage lecturer',
      icon: lecturerIcon,
      description: 'Easily manage lecturer profiles and assignments',
      navigator: '/staff/lecturers',
    },
    {
      title: 'Manage class',
      icon: classIcon,
      description: 'Organize classes, schedules, and student groups',
      navigator: '/staff/classes',
    },
  ];

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-10'>
        <div className='max-w-5xl mx-auto'>
          {/* Heading */}
          <div className='text-center mb-14'>
            <h1 className='text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
              Staff Dashboard
            </h1>
            <p className='text-gray-300 text-lg'>
              Manage lecturers and classes efficiently with powerful tools
            </p>
          </div>

          {/* Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
            {cards.map((card, index) => (
              <div
                key={index}
                onClick={() => navigate(card.navigator)}
                className='group relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer overflow-hidden'
              >
                {/* Hover overlay */}
                <div className='absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl'></div>

                {/* Content */}
                <div className='relative z-10 flex flex-col items-center text-center'>
                  {/* Icon */}
                  <div className='w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300'>
                    <img
                      src={card.icon}
                      alt={card.title}
                      className='w-12 h-12'
                    />
                  </div>

                  {/* Title */}
                  <h3 className='text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300'>
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className='text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300'>
                    {card.description}
                  </p>

                  {/* Arrow */}
                  <div className='mt-5 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300'>
                    <svg
                      className='w-6 h-6 text-blue-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17 8l4 4m0 0l-4 4m4-4H3'
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffPage;
