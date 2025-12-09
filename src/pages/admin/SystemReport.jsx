import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Mail,
  MailOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ExternalLink,
  Calendar,
  User,
  Search
} from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { getEmail, getEmailDetails, deleteEmail as apiDeleteEmail } from '../../services/adminApi';

// --- CONFIG ---
const BRAND_COLOR = {
  primary: 'text-orangeFpt-600',
  bg: 'bg-orangeFpt-50',
  border: 'border-orangeFpt-200',
  btn: 'bg-orangeFpt-600 hover:bg-orangeFpt-700',
  btnLight: 'bg-orangeFpt-50 text-orangeFpt-700 hover:bg-orangeFpt-100',
  icon: 'text-orangeFpt-500'
};

export default function SystemReport() {
  // --- STATE ---
  const [emailReports, setEmailReports] = useState([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);
  const [emailError, setEmailError] = useState(null);

  // Local pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmailDetail, setSelectedEmailDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // --- API HANDLERS ---
  const fetchEmails = async () => {
    setIsLoadingEmails(true);
    setEmailError(null);
    try {
      // Fetch newest 30 emails
      const response = await getEmail({
        pageNum: 1,
        pageSize: 30,
        count: 30,
      });

      // Flexible response handling
      const responseData = response?.paginatedEmails?.list ||
        response?.paginatedEmails?.items ||
        response?.paginatedEmails ||
        [];

      // We only care about the data we fetched for local pagination
      const emails = Array.isArray(responseData) ? responseData : [];
      setEmailReports(emails);
      // Reset to page 1 when new data is fetched
      setCurrentPage(1);

    } catch (err) {
      console.error('Fetch error:', err);
      setEmailError(err.message || 'Cannot connect to Server');
    } finally {
      setIsLoadingEmails(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []); // Only fetch on mount

  // --- ACTIONS ---
  const handlePageChange = (newPage) => {
    const totalPages = Math.ceil(emailReports.length / ITEMS_PER_PAGE) || 1;
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewDetail = async (id) => {
    setIsModalOpen(true);
    setIsLoadingDetail(true);
    setSelectedEmailDetail(null);

    try {
      const response = await getEmailDetails(id);
      const detail = response.emailDetail || response;

      setSelectedEmailDetail(detail);

      // Optimistic update for "Read" status
      setEmailReports(prev =>
        prev.map(e => (e.id === id ? { ...e, isRead: true } : e))
      );
    } catch (error) {
      console.error('Detail fetch error:', error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const onDeleteEmail = async (id) => {
    if (!window.confirm('Are you sure you want to delete this email permanently?')) return;

    try {
      await apiDeleteEmail(id);

      setEmailReports(prev => prev.filter(email => email.id !== id));
      if (selectedEmailDetail?.id === id) closeModal();

    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete email');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmailDetail(null);
  };

  // --- HELPERS ---
  const parseGmailDate = (dateString) => {
    if (!dateString) return { date: 'N/A', time: '' };
    try {
      const dateObj = new Date(dateString);
      return {
        date: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      };
    } catch {
      return { date: 'N/A', time: '' };
    }
  };

  const parseSender = (senderString) => {
    if (!senderString) return { name: 'Unknown', email: '' };
    const match = senderString.match(/^(.*?)\s*<(.+)>$/);
    if (match) {
      return {
        name: match[1].replace(/^"|"$/g, '').trim() || match[2],
        email: match[2]
      };
    }
    return { name: senderString, email: '' };
  };

  return (
    <div className='min-h-screen flex'>
      <aside className='fixed top-0 left-0 h-full overflow-y-auto bg-slate-50 border-r border-slate-200'>
        <AdminSidebar />
      </aside>

      <main className='flex-1 min-h-0 min-w-0 px-4 py-6 md:px-6 lg:px-8 ml-64 custom-scrollbar'>
        <div className=' bg-gradient-to-br from-gray-50 to-gray-100 p-6'>
          <div className=' mx-auto space-y-6'>
            
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl border border-orangeFpt-50 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white shadow-md shadow-orangeFpt-100/60 backdrop-blur">
              <div className="relative z-10 px-6 py-8 lg:px-10">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 flex items-center gap-2">
                      Admin Hub
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                      System <span className="text-orangeFpt-500 font-bold">Reports</span>
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                      Manage your application's email notifications and logs.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={fetchEmails}
                      disabled={isLoadingEmails}
                      className={`flex items-center gap-2 px-5 py-2.5 bg-white border border-orangeFpt-200 text-orangeFpt-600 rounded-xl hover:bg-orangeFpt-50 transition-all shadow-sm font-medium ${isLoadingEmails ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${isLoadingEmails ? 'animate-spin' : ''}`}
                      />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Card */}
            <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]'>

              {/* Data Table */}
              <div className='flex-1 overflow-x-auto relative'>
                {isLoadingEmails ? (
                  <div className='absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-3'>
                    <Loader2 className='w-10 h-10 animate-spin text-orangeFpt-500' />
                    <p className='font-medium text-sm'>Syncing with inbox...</p>
                  </div>
                ) : emailError ? (
                  <div className='h-full flex flex-col items-center justify-center text-red-500 gap-4'>
                    <div className='p-4 bg-red-50 rounded-full'>
                      <AlertCircle className='w-8 h-8' />
                    </div>
                    <div className='text-center'>
                      <p className='font-bold text-lg'>Connection Failed</p>
                      <p className='text-sm text-red-400 mt-1 max-w-xs mx-auto'>{emailError}</p>
                    </div>
                    <button onClick={fetchEmails} className='px-6 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm transition-colors'>
                      Try Again
                    </button>
                  </div>
                ) : (
                  <table className='w-full text-left border-collapse'>
                    <thead className='bg-slate-50/50 border-b border-slate-100'>
                      <tr>
                        <th className='px-6 py-5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[40%]'>Sender & Subject</th>
                        <th className='px-6 py-5 text-xs font-semibold text-slate-500 uppercase tracking-wider'>Status</th>
                        <th className='px-6 py-5 text-xs font-semibold text-slate-500 uppercase tracking-wider'>Date</th>
                        <th className='px-6 py-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right'>Actions</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-slate-50'>
                      {emailReports.length === 0 ? (
                        <tr>
                          <td colSpan='4' className='py-20 text-center'>
                            <div className='flex flex-col items-center justify-center text-gray-400'>
                              <MailOpen className='w-12 h-12 mb-3 text-gray-300' />
                              <p>No emails found in this category.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        emailReports
                          .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                          .map((email) => {
                            const { date, time } = parseGmailDate(email.date);
                            const sender = parseSender(email.from);
                            const isUnread = !email.isRead;

                            return (
                              <tr
                                key={email.id}
                                className={`group transition-all duration-200 hover:bg-orangeFpt-50/30 ${isUnread ? 'bg-orangeFpt-50/10' : ''}`}
                              >
                                {/* Subject & Sender */}
                                <td className='px-6 py-4 align-top'>
                                  <div className='flex gap-3'>
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${isUnread ? 'bg-orangeFpt-500' : 'bg-transparent'}`} />
                                    <div>
                                      <p className={`text-sm mb-1 line-clamp-1 ${isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                        {email.subject || '(No Subject)'}
                                      </p>
                                      <div className='flex items-center gap-2 text-xs text-slate-500'>
                                        <span className='font-semibold text-slate-600'>{sender.name}</span>
                                        {sender.email && <span className='text-slate-400 hidden sm:inline'>&lt;{sender.email}&gt;</span>}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Status */}
                                <td className='px-6 py-4 align-top'>
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${isUnread
                                      ? 'bg-orangeFpt-50 text-orangeFpt-700 border-orangeFpt-200'
                                      : 'bg-green-50 text-green-700 border-green-200'
                                    }`}>
                                    {isUnread ? <Mail className='w-3 h-3' /> : <CheckCircle2 className='w-3 h-3' />}
                                    {isUnread ? 'Unread' : 'Read'}
                                  </span>
                                </td>

                                {/* Date */}
                                <td className='px-6 py-4 align-top'>
                                  <div className='text-sm text-slate-600'>
                                    <span className='font-medium block'>{date}</span>
                                    <span className='text-xs text-slate-400'>{time}</span>
                                  </div>
                                </td>

                                {/* Actions */}
                                <td className='px-6 py-4 align-middle text-right'>
                                  <div className='flex items-center justify-end gap-2 '>
                                    <a
                                      href={`https://mail.google.com/mail/u/0/#inbox/${email.id}`}
                                      target='_blank'
                                      rel='noreferrer'
                                      className='p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                                      title='Open in Gmail'
                                    >
                                      <ExternalLink className='w-4 h-4' />
                                    </a>

                                    <button
                                      onClick={() => handleViewDetail(email.id)}
                                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${BRAND_COLOR.btnLight}`}
                                    >
                                      <Eye className='w-3.5 h-3.5' /> View
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination Footer */}
              <div className='px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between'>
                <p className='text-sm text-slate-500'>
                  Page <span className='font-bold text-slate-900'>{currentPage}</span> of <span className='font-bold text-slate-900'>{Math.ceil(emailReports.length / ITEMS_PER_PAGE) || 1}</span>
                </p>

                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoadingEmails}
                    className='p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-orangeFpt-300 hover:text-orangeFpt-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm'
                  >
                    <ChevronLeft className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= (Math.ceil(emailReports.length / ITEMS_PER_PAGE) || 1) || isLoadingEmails}
                    className='p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-orangeFpt-300 hover:text-orangeFpt-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm'
                  >
                    <ChevronRight className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- DETAIL MODAL --- */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6'>
          <div className='absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity' onClick={closeModal} />

          <div className='relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200'>
            {/* Modal Header */}
            <div className='px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50'>
              <h3 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                <FileText className='text-orangeFpt-500' />
                Email Details
              </h3>
              <button
                onClick={closeModal}
                className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Modal Content */}
            <div className='flex-1 overflow-y-auto'>
              {isLoadingDetail ? (
                <div className='h-96 flex flex-col items-center justify-center text-gray-400'>
                  <Loader2 className='w-8 h-8 animate-spin text-orangeFpt-500 mb-2' />
                  <p>Loading content...</p>
                </div>
              ) : selectedEmailDetail ? (
                <div className='p-8 space-y-8'>
                  {/* Subject */}
                  <h2 className='text-2xl font-bold text-gray-900 leading-snug'>
                    {selectedEmailDetail.subject || '(No Subject)'}
                  </h2>

                  {/* Metadata Card */}
                  <div className='flex flex-col sm:flex-row gap-6 p-5 bg-gray-50 rounded-xl border border-gray-100'>
                    <div className='flex items-start gap-4 flex-1'>
                      <div className='w-12 h-12 rounded-full bg-orangeFpt-100 flex items-center justify-center text-orangeFpt-600 font-bold text-xl border border-orangeFpt-200 shadow-sm'>
                        {selectedEmailDetail.from ? selectedEmailDetail.from.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className='space-y-1'>
                        <p className='font-bold text-gray-900 text-lg'>
                          {parseSender(selectedEmailDetail.from).name}
                        </p>
                        <p className='text-sm text-gray-500 flex items-center gap-1.5'>
                          <User className='w-3 h-3' />
                          {parseSender(selectedEmailDetail.from).email}
                        </p>
                      </div>
                    </div>

                    <div className='flex flex-row sm:flex-col justify-between sm:items-end text-sm text-gray-500 border-t sm:border-t-0 border-gray-200 pt-3 sm:pt-0'>
                      <div className='flex items-center gap-2'>
                        <Calendar className='w-4 h-4 text-gray-400' />
                        <span className='font-medium text-gray-700'>
                          {parseGmailDate(selectedEmailDetail.date).date}
                        </span>
                      </div>
                      <span className='text-xs text-gray-400'>
                        {parseGmailDate(selectedEmailDetail.date).time}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className='prose prose-orange max-w-none text-gray-800 leading-relaxed'>
                    {selectedEmailDetail.body ? (
                      <div
                        className='bg-white rounded border border-gray-100 p-2 overflow-hidden'
                        // DangerouslySetInnerHTML is risky. In production, use DOMPurify.sanitize() here.
                        dangerouslySetInnerHTML={{ __html: selectedEmailDetail.body }}
                      />
                    ) : (
                      <p className='whitespace-pre-wrap text-gray-600 font-normal'>
                        {selectedEmailDetail.snippet || 'No content available.'}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className='p-12 text-center text-gray-500'>No data available</div>
              )}
            </div>

            {/* Modal Footer */}
            <div className='px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center'>
              {selectedEmailDetail && (
                <button
                  onClick={() => onDeleteEmail(selectedEmailDetail.id)}
                  className='flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium'
                >
                  <Trash2 className='w-4 h-4' /> Delete
                </button>
              )}

              <button
                onClick={closeModal}
                className='px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}