import React, { useEffect, useState } from 'react';
import { getAllProject, getPendingProjects } from '../../services/userService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ClipboardList, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import HeadDepartmentSidebar from '../../components/layout/HeadDepartmentSidebar';

export default function Dashboard() {
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const approvedProjectCount = await getAllProject();
        if (approvedProjectCount) {
          setApprovedCount(approvedProjectCount?.itemCount || 0);
        }
        const pendingProjectCount = await getPendingProjects();
        if (pendingProjectCount) {
          setPendingCount(pendingProjectCount?.itemCount || 0);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalProjects = approvedCount + pendingCount;

  const chartData = [
    { name: 'Approved', value: approvedCount },
    { name: 'Pending', value: pendingCount },
  ];

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen text-gray-600'>
        Loading Dashboard...
      </div>
    );
  }

  return (
    <>
      <div className='flex min-h-screen bg-gray-50'>
        <HeadDepartmentSidebar />
        <div className='flex-1 p-8 relative'>
          <div className='min-h-screen bg-gray-50 p-8'>
            <h1 className='text-3xl font-bold text-gray-800 mb-8'>
              📊 Project Dashboard
            </h1>

            {/* Stats Overview */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
              <div className='bg-white shadow rounded-2xl p-6 flex items-center gap-4 border-t-4 border-blue-500'>
                <ClipboardList className='w-10 h-10 text-blue-500' />
                <div>
                  <p className='text-gray-500 text-sm'>Total Projects</p>
                  <p className='text-2xl font-semibold text-gray-800'>
                    {totalProjects}
                  </p>
                </div>
              </div>

              <div className='bg-white shadow rounded-2xl p-6 flex items-center gap-4 border-t-4 border-green-500'>
                <CheckCircle className='w-10 h-10 text-green-500' />
                <div>
                  <p className='text-gray-500 text-sm'>Approved Projects</p>
                  <p className='text-2xl font-semibold text-gray-800'>
                    {approvedCount}
                  </p>
                </div>
              </div>

              <div className='bg-white shadow rounded-2xl p-6 flex items-center gap-4 border-t-4 border-yellow-500'>
                <Clock className='w-10 h-10 text-yellow-500' />
                <div>
                  <p className='text-gray-500 text-sm'>Pending Projects</p>
                  <p className='text-2xl font-semibold text-gray-800'>
                    {pendingCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className='bg-white p-6 rounded-2xl shadow'>
              <h2 className='text-lg font-semibold text-gray-800 mb-4'>
                Approved vs Pending Projects
              </h2>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <XAxis dataKey='name' />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='value' fill='#3b82f6' radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
