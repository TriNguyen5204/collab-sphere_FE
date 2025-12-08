import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  getUserProfile,
} from '../../services/userService';
import {
  putUpdateUserProfile,
  postUploadUserAvatar,
} from '../../services/studentApi';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  GraduationCap,
  BookOpen,
  Building2,
  Save,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';
import StaffDashboardLayout from '../../components/layout/StaffDashboardLayout';

// --- Helper Components ---
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1 overflow-hidden">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900 truncate" title={value}>
        {value || 'Not provided'}
      </p>
    </div>
  </div>
);

const InputField = ({ label, name, value, onChange, icon: Icon, type = "text", disabled = false, error, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
        <Icon className="h-4 w-4" />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none transition-all
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
            : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 hover:border-slate-300'
          }
          ${disabled ? 'opacity-60 cursor-not-allowed text-slate-500' : 'text-slate-900'}
        `}
      />
    </div>
    {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
  </div>
);

export default function AccountDetail() {
  const { accountId } = useParams();
  const fileInputRef = useRef(null);
  
  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'settings'
  
  // Dữ liệu gốc từ API
  const [accountData, setAccountData] = useState(null);
  const [accountType, setAccountType] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    userId: accountId,
    email: '',
    fullName: '',
    address: '',
    phoneNumber: '',
    yob: '',
    school: '',
    code: '',
    major: '',
    isTeacher: false,
    isActive: true,
  });
  
  // Avatar State
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  // --- Fetch Data ---
  useEffect(() => {
    fetchAccountDetail();
  }, [accountId]);

  const fetchAccountDetail = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile(accountId);
      
      if (response && response.user) {
        const user = response.user;
        setAccountData(user);
        
        // Xác định loại tài khoản
        let type = 'Staff';
        let isTeacher = false;
        if (user.studentCode) {
           type = 'Student';
           isTeacher = false;
        } else if (user.lecturerCode) {
           type = 'Lecturer';
           isTeacher = true;
        }
        setAccountType(type);

        // --- FIXED: XỬ LÝ YOB ---
        let yearOfBirth = '';
        if (user.yob) {
            // Trường hợp 1: yob là số 4 chữ số (VD: 2004) -> Lấy luôn
            if (!isNaN(user.yob) && String(user.yob).length === 4) {
                 yearOfBirth = user.yob;
            } 
            // Trường hợp 2: yob là chuỗi ngày tháng (VD: "2004-01-01") -> Parse Date
            else {
                 const dateObj = new Date(user.yob);
                 if (!isNaN(dateObj.getTime())) {
                     yearOfBirth = dateObj.getFullYear();
                 } else {
                     yearOfBirth = user.yob; // Fallback
                 }
            }
        }

        // Map dữ liệu vào Form
        setFormData({
          userId: user.uId,
          email: user.email || '',
          fullName: user.fullname || '',
          address: user.address || '',
          phoneNumber: user.phoneNumber || '',
          yob: yearOfBirth, 
          school: user.school || 'FPT University',
          code: user.studentCode || user.lecturerCode || user.code || '',
          major: user.major || '',
          isTeacher: user.isTeacher || isTeacher,
          isActive: user.isActive !== undefined ? user.isActive : true,
        });

        // --- FIXED: XỬ LÝ AVATAR ---
        // Ưu tiên lấy user.avatarImg (URL đầy đủ từ API) trước
        if (user.avatarImg) {
            setAvatarPreview(user.avatarImg);
        } else if (user.avatarPublicId) {
            // Fallback nếu chỉ có publicId
            setAvatarPreview(`https://res.cloudinary.com/dn5xgbmqq/image/upload/v1/${user.avatarPublicId}`);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch account details');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Preview ảnh mới chọn ngay lập tức
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Upload Avatar nếu có file mới được chọn
      if (avatarFile) {
        const uploadForm = new FormData();
        uploadForm.append('imageFile', avatarFile);
        // Lưu ý: Key gửi lên phải khớp với API (userId hay id, isTeacher...)
        uploadForm.append('userId', accountId);
        uploadForm.append('isTeacher', formData.isTeacher);
        
        // Gọi API upload
        await postUploadUserAvatar(uploadForm);
      }

      // 2. Update Profile Info
      const updatePayload = {
        userId: accountId,
        email: formData.email,
        fullName: formData.fullName,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        yob: formData.yob, // Gửi số năm (2004)
        school: formData.school,
        code: formData.code,
        major: formData.major,
        isTeacher: formData.isTeacher,
        isActive: formData.isActive
      };

      const res = await putUpdateUserProfile(accountId, updatePayload);
      
      // Kiểm tra kết quả trả về từ API Update
      // Một số API trả về res.isSuccess, một số trả về data trực tiếp, bạn cần check log response nếu vẫn lỗi
      if (res && (res.isSuccess || res.status === 200 || res.data)) {
        toast.success('Profile updated successfully!');
        
        // Quan trọng: Reset file avatar tạm để lần sau không upload lại cái cũ
        setAvatarFile(null); 
        
        // Refresh data từ server để đảm bảo hiển thị cái mới nhất
        await fetchAccountDetail();
        setActiveTab('overview');
      } else {
        toast.error(res?.message || 'Update failed');
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <StaffDashboardLayout>
        <div className="flex h-[70vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </div>
      </StaffDashboardLayout>
    );
  }

  if (!accountData) return null;

  return (
    <StaffDashboardLayout>
      <div className="min-h-screen space-y-6 bg-slate-50/50 pb-10">
        
        {/* Breadcrumb & Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Account Details</h1>
            <p className="text-slate-500">Manage user profile and settings</p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
             accountData.isActive 
             ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
             : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
             {accountData.isActive ? 'Active Account' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* LEFT COLUMN: User Identity Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-100 text-center">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-orange-200 to-amber-100 opacity-90"></div>
                
                <div className="relative mt-8 mb-4">
                    <div className="relative mx-auto w-32 h-32">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-400 text-3xl font-bold uppercase">
                                    {formData.fullName?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        {activeTab === 'settings' && (
                            <button 
                                onClick={handleAvatarClick}
                                className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-lg border border-slate-100 text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-all"
                                title="Change Avatar"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        )}
                         <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*"
                        />
                    </div>
                </div>

                <h2 className="text-xl font-bold text-slate-800">{formData.fullName}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                   <span className="text-sm font-medium text-slate-500">{formData.email}</span>
                </div>

                <div className="mt-4 flex justify-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-bold uppercase tracking-wide">
                        {accountType}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold font-mono">
                        {formData.code || 'NO-CODE'}
                    </span>
                </div>
            </div>
            
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Stats</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-slate-600 text-sm">Join Date</span>
                        <span className="font-semibold text-slate-800 text-sm">
                            {/* Chú ý: API bạn gửi không thấy field createdDate, nên mình check để tránh lỗi */}
                            {accountData.createdDate ? new Date(accountData.createdDate).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                         <span className="text-slate-600 text-sm">Verification</span>
                         <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                         </div>
                    </div>
                </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Tabs & Content */}
          <div className="lg:col-span-2">
             <div className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
                
                {/* Tabs Header */}
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
                            activeTab === 'overview' 
                            ? 'text-orange-600' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <User className="w-4 h-4" /> Overview
                        </span>
                        {activeTab === 'overview' && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-t-full"></span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
                            activeTab === 'settings' 
                            ? 'text-orange-600' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                         <span className="flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Account Settings
                        </span>
                        {activeTab === 'settings' && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-t-full"></span>
                        )}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                    
                    {/* --- TAB 1: OVERVIEW --- */}
                    {activeTab === 'overview' && (
                         <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-orange-500" /> 
                                    Academic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoItem icon={Building2} label="School" value={formData.school} />
                                    <InfoItem icon={GraduationCap} label="Major" value={formData.major} />
                                    <InfoItem icon={Hash} label="Student/Lecturer Code" value={formData.code} />
                                    <InfoItem icon={Calendar} label="Year of Birth" value={formData.yob} />
                                </div>
                            </div>

                            <div className="h-px bg-slate-100"></div>

                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-orange-500" /> 
                                    Contact Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoItem icon={Mail} label="Email Address" value={formData.email} />
                                    <InfoItem icon={Phone} label="Phone Number" value={formData.phoneNumber} />
                                    <div className="md:col-span-2">
                                         <InfoItem icon={MapPin} label="Address" value={formData.address} />
                                    </div>
                                </div>
                            </div>
                         </div>
                    )}

                    {/* --- TAB 2: SETTINGS (EDIT FORM) --- */}
                    {activeTab === 'settings' && (
                        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 mb-6">
                                <p className="text-sm text-orange-800 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Update your personal information below. 
                                </p>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField 
                                    label="Full Name" 
                                    name="fullName" 
                                    value={formData.fullName} 
                                    onChange={handleInputChange} 
                                    icon={User} 
                                />
                                <InputField 
                                    label="Year of Birth" 
                                    name="yob" 
                                    type="number"
                                    placeholder="YYYY"
                                    value={formData.yob} 
                                    onChange={handleInputChange} 
                                    icon={Calendar} 
                                />
                                <InputField 
                                    label="Phone Number" 
                                    name="phoneNumber" 
                                    value={formData.phoneNumber} 
                                    onChange={handleInputChange} 
                                    icon={Phone} 
                                />
                                <InputField 
                                    label="Email (Read-only)" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={() => {}} 
                                    icon={Mail}
                                    disabled={true}
                                />
                                <InputField 
                                    label={accountType === 'Lecturer' ? 'Lecturer Code' : 'Student Code'}
                                    name="code" 
                                    value={formData.code} 
                                    onChange={handleInputChange} 
                                    icon={Hash}
                                    disabled={false}
                                />
                                <InputField 
                                    label="Major" 
                                    name="major" 
                                    value={formData.major} 
                                    onChange={handleInputChange} 
                                    icon={GraduationCap} 
                                />
                                <div className="md:col-span-2">
                                    <InputField 
                                        label="Address" 
                                        name="address" 
                                        value={formData.address} 
                                        onChange={handleInputChange} 
                                        icon={MapPin} 
                                    />
                                </div>
                             </div>

                             <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        fetchAccountDetail(); // Reset form
                                        setActiveTab('overview');
                                    }}
                                    className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-semibold shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" /> Save Changes
                                        </>
                                    )}
                                </button>
                             </div>
                        </form>
                    )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}