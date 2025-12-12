import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  ChevronRight,
  FileText,
  Folder,
  Loader2,
  PlusCircle,
  Trash2,
  Upload,
  UploadCloud,
  Download,
  RefreshCw,
  X,
  AlertCircle,
  Search,
  BookOpen,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import {
  getLecturerClasses,
  getClassById,
  postClassFile,
  deleteClassFile,
  patchRefreshClassFileUrl
} from "../../services/classApi";
import useToastConfirmation from "../../hooks/useToastConfirmation";

const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";
const VIETNAM_UTC_OFFSET_MS = 7 * 60 * 60 * 1000;
const LINK_REFRESH_BUFFER_MS = 60 * 1000;
const timezoneRegex = /([zZ])|([+-]\d{2}:?\d{2})$/;

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes)) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes || 1) / Math.log(1024)));
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(value >= 10 || value === 0 ? 0 : 1)} ${units[index]}`;
};

const normalizeUtcString = (rawValue) => {
  if (typeof rawValue !== "string") return null;
  let value = rawValue.trim();
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00Z`;
  }
  if (value.includes(" ")) {
    value = value.replace(" ", "T");
  }
  if (!timezoneRegex.test(value)) {
    value = value.endsWith("Z") ? value : `${value}Z`;
  }
  return value;
};

const parseUtcDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "string") {
    const normalized = normalizeUtcString(value);
    if (!normalized) return null;
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
};

const vietnamFormatter =
  typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function"
    ? new Intl.DateTimeFormat("vi-VN", {
        timeZone: VIETNAM_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

const formatVietnamTimeLabel = (utcDate) => {
  if (!utcDate) return "";
  if (vietnamFormatter) {
    return vietnamFormatter.format(utcDate);
  }
  const fallback = new Date(utcDate.getTime() + VIETNAM_UTC_OFFSET_MS);
  return fallback.toLocaleString("vi-VN");
};

const buildExpireInfo = (rawExpireTime) => {
  const expireDateUtc = parseUtcDate(rawExpireTime);
  if (!expireDateUtc) {
    return {
      expireDateUtc: null,
      expireLabel: "",
      isExpired: false,
      shouldRefresh: true,
    };
  }
  const expireMs = expireDateUtc.getTime();
  const nowMs = Date.now();
  return {
    expireDateUtc,
    expireLabel: formatVietnamTimeLabel(expireDateUtc),
    isExpired: nowMs >= expireMs,
    shouldRefresh: nowMs + LINK_REFRESH_BUFFER_MS >= expireMs,
  };
};

const ensurePathPrefix = (rawValue) => {
  if (typeof rawValue !== "string") return "/";
  let value = rawValue.trim();
  if (!value || value === "/") return "/";
  value = value.replace(/^\/+/, "").replace(/\/+/g, "/");
  value = value.replace(/\/+$/, "");
  return value ? `${value}/` : "/";
};

const stripFolderInput = (pathPrefix) => {
  if (!pathPrefix || pathPrefix === "/") return "";
  return pathPrefix.replace(/^\/+/, "").replace(/\/+$/, "");
};

const formatFolderLabel = (pathPrefix) => (pathPrefix === "/" ? "General" : stripFolderInput(pathPrefix));

const enrichResource = (resource) => {
  const createdAtDate = parseUtcDate(resource?.createdAt ?? resource?.uploadedAt);
  return {
    ...resource,
    filePathPrefix: ensurePathPrefix(resource?.filePathPrefix ?? "/"),
    createdAtDate,
    createdAtLabel: formatVietnamTimeLabel(createdAtDate),
    expireInfo: buildExpireInfo(
      resource?.urlExpireTime ??
        resource?.urlExpireAt ??
        resource?.expireTime ??
        resource?.expiredAt ??
        resource?.linkExpiredAt
    ),
  };
};

const groupFilesByPath = (files) => {
  const grouping = {};
  if (Array.isArray(files)) {
    files.forEach(file => {
      const enriched = enrichResource(file);
      const path = enriched.filePathPrefix;
      if (!grouping[path]) grouping[path] = [];
      grouping[path].push(enriched);
    });
  }
  if (!grouping["/"]) {
    grouping["/"] = [];
  }
  return grouping;
};

// --- Class Dashboard Helpers ---

const REQUIRED_CLASS_FIELDS = {
  classId: 'Used as the unique key for cards and navigation into class detail.',
  className: 'Displayed as the card title so lecturers can identify the class.',
  subjectCode: 'Shown as the subject badge and used for filtering.',
  subjectName: 'Supports search and gives readable context beside the code.',
  memberCount: 'Feeds the student count metrics in the stat tiles and class cards.',
  teamCount: 'Required to surface how many teams exist for each class.',
  lecturerName: 'Clarifies the class owner when multiple lecturers collaborate.',
  createdDate: 'Supports chronological sorting and potential timeline displays.',
  isActive: 'Determines status badges and powers the active/inactive filter.'
};

const mapApiClassToViewModel = (apiClass = {}) => ({
  classId: apiClass.classId ?? apiClass.id ?? null,
  className: apiClass.className ?? apiClass.name ?? 'Untitled class',
  subjectCode: apiClass.subjectCode ?? apiClass.subject?.code ?? '—',
  subjectName: apiClass.subjectName ?? apiClass.subject?.name ?? '—',
  semesterName: apiClass.semesterName ?? apiClass.semester?.name ?? '—',
  memberCount:
    apiClass.memberCount ??
    apiClass.studentCount ??
    apiClass.numberOfStudents ??
    apiClass.totalStudents ??
    0,
  teamCount:
    apiClass.teamCount ??
    apiClass.numberOfTeams ??
    apiClass.totalTeams ??
    0,
  lecturerName:
    apiClass.lecturerName ??
    apiClass.lecturerFullName ??
    apiClass.lecturer?.fullName ??
    '—',
  createdDate: apiClass.createdDate ?? apiClass.createdAt ?? null,
  isActive: (() => {
    if (typeof apiClass.isActive === 'boolean') {
      return apiClass.isActive;
    }

    const statusValue = apiClass.status ?? apiClass.classStatus ?? apiClass.state;

    if (typeof statusValue === 'number') {
      return statusValue === 1 || statusValue === 2;
    }

    if (typeof statusValue === 'string') {
      const normalized = statusValue.toLowerCase();
      return ['active', 'in-delivery', 'in_delivery', 'in progress', 'in_progress'].includes(normalized);
    }

    return false;
  })()
});

const extractClassList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

const normaliseClassResponse = (payload) => {
  const rawClasses = extractClassList(payload);
  const normalisedClasses = rawClasses.map((rawClass) => mapApiClassToViewModel(rawClass));
  return { classes: normalisedClasses };
};

const subjectGradient = (subjectCode) => {
  if (!subjectCode) return 'from-slate-50 via-white to-slate-100';
  const baseHash = subjectCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palettes = [
    'from-sky-100 via-white to-cyan-50',
    'from-indigo-100 via-white to-purple-50',
    'from-emerald-100 via-white to-lime-50',
    'from-amber-100 via-white to-orange-50'
  ];
  return palettes[baseHash % palettes.length];
};

const ResourcesHub = () => {
  const { userId } = useSelector((state) => state.user);
  const location = useLocation();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [folderMap, setFolderMap] = useState({ "/": [] });
  const [currentFolder, setCurrentFolder] = useState("/");
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [menuError, setMenuError] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [pendingFolder, setPendingFolder] = useState("");
  const [uploadErrors, setUploadErrors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [, setRefreshingFileId] = useState(null);
  const [openingFileId, setOpeningFileId] = useState(null);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const autoRefreshQueueRef = useRef(new Set());
  const confirmWithToast = useToastConfirmation();
  const fileInputRef = useRef(null);

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      if (!userId) return;
      setIsLoadingClasses(true);
      try {
        const payload = await getLecturerClasses(userId);
        const { classes: normalizedClasses } = normaliseClassResponse(payload);
        setClasses(normalizedClasses);
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error("Failed to load classes");
      } finally {
        setIsLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [userId]);

  // Handle initial class selection from navigation state
  useEffect(() => {
    if (location.state?.classId && classes.length > 0 && !selectedClass) {
      const targetClass = classes.find(c => c.classId === location.state.classId || c.classId === Number(location.state.classId));
      if (targetClass) {
        setSelectedClass(targetClass);
      }
    }
  }, [classes, location.state, selectedClass]);

  const fetchResources = useCallback(
    async ({ showSpinner = true } = {}) => {
      if (!selectedClass) return;
      if (showSpinner) setIsLoadingResources(true);
      setMenuError(null);
      try {
        const classData = await getClassById(selectedClass.classId);
        const normalized = groupFilesByPath(classData.classFiles);
        setFolderMap(normalized);
        // Reset to root folder if current folder doesn't exist in new map, unless it's just empty
        if (!normalized[currentFolder] && currentFolder !== '/') {
            setCurrentFolder("/");
        }
      } catch (error) {
        console.error("Error loading class resources:", error);
        setMenuError("Unable to load class resources. Please try again.");
      } finally {
        if (showSpinner) setIsLoadingResources(false);
      }
    },
    [selectedClass, currentFolder]
  );

  useEffect(() => {
    if (selectedClass) {
      fetchResources();
    } else {
      setFolderMap({ "/": [] });
    }
  }, [selectedClass, fetchResources]); // Removed fetchResources from dependency to avoid loop if not careful, but useCallback handles it.

  const folderKeys = useMemo(() => {
    const keys = Object.keys(folderMap ?? {});
    const others = keys.filter((key) => key !== "/").sort((a, b) => a.localeCompare(b));
    return ["/", ...others];
  }, [folderMap]);

  const filesInFolder = folderMap?.[currentFolder] ?? [];
  const totalFiles = useMemo(
    () => folderKeys.reduce((sum, key) => sum + (folderMap?.[key]?.length ?? 0), 0),
    [folderKeys, folderMap]
  );

  const filteredClasses = useMemo(() => {
    if (!searchQuery) return classes;
    return classes.filter(c => 
      c.className.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.subjectCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [classes, searchQuery]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setPendingFiles((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  const handleRemovePendingFile = (index) => {
    setPendingFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpload = async () => {
    if (!selectedClass) {
      toast.error("Select a class before uploading resources.");
      return;
    }
    if (!pendingFiles.length) {
      toast.info("Select at least one file to upload.");
      return;
    }
    setIsUploading(true);
    setUploadErrors([]);
    const normalizedPath = ensurePathPrefix(pendingFolder);
    try {
      for (const file of pendingFiles) {
        const formData = new FormData();
        formData.append("pathPrefix", normalizedPath);
        formData.append("formFile", file);
        await postClassFile(selectedClass.classId, formData);
      }
      toast.success("Resources uploaded successfully.");
      setPendingFiles([]);
      // Navigate to the folder where files were uploaded
      setCurrentFolder(normalizedPath);
      await fetchResources({ showSpinner: false });
    } catch (error) {
      console.error("Failed to upload class resources:", error);
      
      let errors = [];
      if (error.response?.data?.errors) {
        // Handle validation errors object (e.g. { formFile: ["Required"] })
        const errorObj = error.response.data.errors;
        Object.keys(errorObj).forEach(key => {
          const messages = errorObj[key];
          if (Array.isArray(messages)) {
            errors.push(...messages);
          } else {
            errors.push(messages);
          }
        });
      } else if (error.response?.data?.errorList && Array.isArray(error.response.data.errorList)) {
        errors = error.response.data.errorList;
      }

      if (errors.length > 0) {
        setUploadErrors(errors);
        toast.error("Upload failed with errors.");
      } else {
        toast.error("Unable to upload files right now.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const ensureResourceLinkFresh = useCallback(
    async (resource, { skipToast = false } = {}) => {
      if (!resource || !selectedClass) return resource;
      if (!resource.expireInfo?.shouldRefresh) return resource;
      setRefreshingFileId(resource.fileId);
      try {
        const refreshed = await patchRefreshClassFileUrl(
          selectedClass.classId,
          resource.fileId
        );
        if (!skipToast) {
          toast.success("Link refreshed");
        }
        await fetchResources({ showSpinner: false });
        return { ...resource, ...refreshed };
      } catch (error) {
        console.error("Failed to refresh resource link:", error);
        if (!skipToast) {
          toast.error("Unable to refresh the link. Please try again.");
        }
        throw error;
      } finally {
        setRefreshingFileId(null);
      }
    },
    [selectedClass, fetchResources]
  );

  const handleOpenResource = async (resource) => {
    if (!resource) return;
    setOpeningFileId(resource.fileId);
    try {
      const ensured = await ensureResourceLinkFresh(resource, { skipToast: true });
      const url = ensured?.fileUrl ?? resource.fileUrl;
      if (!url) {
        toast.error("No download link available. Please refresh the link.");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Unable to open resource:", error);
    } finally {
      setOpeningFileId(null);
    }
  };

  useEffect(() => {
    if (!selectedClass) return;
    const folders = Object.values(folderMap ?? {});
    const expiredResources = folders
      .flat()
      .filter((resource) => resource?.expireInfo?.isExpired);
    expiredResources.forEach((resource) => {
      if (autoRefreshQueueRef.current.has(resource.fileId)) return;
      autoRefreshQueueRef.current.add(resource.fileId);
      ensureResourceLinkFresh(resource, { skipToast: true })
        .catch(() => {
        })
        .finally(() => {
          autoRefreshQueueRef.current.delete(resource.fileId);
        });
    });
  }, [folderMap, ensureResourceLinkFresh, selectedClass]);

  const handleDeleteResource = async (resource) => {
    if (!selectedClass || !resource?.fileId) return;
    const confirmed = await confirmWithToast({
      message: `Delete ${resource.fileName || 'this file'}? This action cannot be undone.`,
      confirmLabel: 'Delete file',
      variant: 'danger',
    });
    if (!confirmed) return;
    setDeletingFileId(resource.fileId);
    try {
      await deleteClassFile(selectedClass.classId, resource.fileId);
      toast.success("File deleted");
      await fetchResources({ showSpinner: false });
    } catch (error) {
      console.error("Failed to delete class resource:", error);
      toast.error("Unable to delete the file right now.");
    } finally {
      setDeletingFileId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-3xl">

        <div className="relative z-10 flex h-full gap-2 xl:gap-6 p-2">
          {/* Left Sidebar: Class List */}
          <div className="w-56 xl:w-64 flex-shrink-0 flex flex-col gap-4 xl:gap-5 rounded-2xl xl:rounded-3xl border border-white/40 backdrop-blur-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl text-orangeFpt-600 shadow-sm">
                <BookOpen size={18} />
              </div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">My Classes</h2>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-orangeFpt-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search classes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/50 pl-10 pr-4 py-2.5 text-sm text-slate-700 focus:border-orangeFpt-400 focus:bg-white/80 focus:ring-2 focus:ring-orangeFpt-100 focus:outline-none transition-all placeholder-slate-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 pt-1">
              {isLoadingClasses ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-slate-400" />
                </div>
              ) : filteredClasses.length > 0 ? (
                filteredClasses.map(cls => (
                  <button
                    key={cls.classId}
                    onClick={() => setSelectedClass(cls)}
                    className={`group relative w-full text-left p-4 rounded-2xl transition-all duration-500 ease-out border overflow-hidden ${
                      selectedClass?.classId === cls.classId
                        ? "border-orangeFpt-300/50 scale-[1.02]"
                        : "border-white/40 hover:border-white/40 hover:-translate-y-0.5"
                    }`}
                  >
                    {/* Aurora Background Effect */}
                    <div className={`absolute inset-0 transition-opacity duration-500 ${
                      selectedClass?.classId === cls.classId ? "opacity-100" : "opacity-40 group-hover:opacity-100"
                    }`}>
                      <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-400/30 rounded-full blur-3xl animate-pulse" />
                      <div className="absolute top-1/2 -left-12 w-40 h-40 bg-purple-400/30 rounded-full blur-3xl animate-pulse delay-75" />
                      <div className="absolute -bottom-12 right-0 w-40 h-40 bg-orange-400/30 rounded-full blur-3xl animate-pulse delay-150" />
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
                    </div>

                    {selectedClass?.classId === cls.classId && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orangeFpt-400 to-orangeFpt-600" />
                    )}
                    
                    <div className="relative z-10 pl-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm border transition-colors ${
                          selectedClass?.classId === cls.classId 
                            ? "bg-orangeFpt-50/80 text-orangeFpt-600 border-orangeFpt-100" 
                            : "bg-white/40 text-slate-500 border-white/30 group-hover:bg-white/60"
                        }`}>
                          {cls.subjectCode}
                        </span>
                        {cls.isActive && (
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-1 ring-white"></span>
                          </span>
                        )}
                      </div>
                      
                      <h3 className={`font-bold leading-tight mb-1.5 line-clamp-2 transition-colors ${
                        selectedClass?.classId === cls.classId ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
                      }`}>
                        {cls.className}
                      </h3>
                      
                      <p className="text-xs text-slate-500 line-clamp-1 mb-3 group-hover:text-slate-600 transition-colors">
                        {cls.subjectName}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
                        <span className="bg-white/40 px-2 py-1 rounded-lg border border-white/30 group-hover:bg-white/60 transition-colors">
                          {cls.semesterName}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <BookOpen size={32} className="mb-2 opacity-20" />
                  <p className="text-sm">No classes found</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content: Resource Manager */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            {selectedClass ? (
              <>
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 xl:gap-4 rounded-2xl xl:rounded-3xl border border-white/40 bg-white/60 p-4 xl:p-6 backdrop-blur-2xl flex-shrink-0 transition-all hover:bg-white/70">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg xl:text-2xl font-bold text-slate-800 flex items-center gap-2 xl:gap-3">
                      <div className="p-1.5 xl:p-2 rounded-lg xl:rounded-xl bg-orangeFpt-50 text-orangeFpt-500 flex-shrink-0">
                        <Folder className="w-5 h-5 xl:w-6 xl:h-6" />
                      </div>
                      <span className="truncate">{selectedClass.className}</span>
                    </h2>
                    <p className="text-xs xl:text-sm font-medium text-slate-500 mt-1 ml-9 xl:ml-14 truncate">
                      {selectedClass.subjectCode} • {selectedClass.subjectName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 xl:gap-4 bg-white/30 p-1.5 xl:p-2 rounded-xl xl:rounded-2xl border border-white/40 backdrop-blur-sm flex-shrink-0">
                    <Link
                      to={`/lecturer/classes/${selectedClass.classId}`}
                      className="flex items-center gap-1.5 xl:gap-2 p-2 xl:p-2.5 rounded-lg xl:rounded-xl bg-white/60 text-slate-600 hover:bg-white hover:text-blue-600 transition-all border border-white/50"
                      title="Go to Class Detail"
                    >
                      <ExternalLink className="w-4 h-4 xl:w-[18px] xl:h-[18px]" />
                      <span className="text-xs xl:text-sm font-bold hidden sm:inline">Go to Class Detail</span>
                    </Link>
                    <button
                      onClick={() => fetchResources()}
                      className="p-2 xl:p-2.5 rounded-lg xl:rounded-xl bg-white/60 text-slate-600 hover:bg-white hover:text-orangeFpt-600 transition-all border border-white/50 hover:-translate-y-0.5 active:scale-95"
                      title="Refresh list"
                    >
                      <RefreshCw className={`w-4 h-4 xl:w-[18px] xl:h-[18px] ${isLoadingResources ? "animate-spin" : ""}`} />
                    </button>
                    <div className="h-6 xl:h-8 w-px bg-slate-300/30"></div>
                    <div className="text-right px-1 xl:px-2">
                      <p className="text-xs xl:text-sm font-bold text-slate-700">{totalFiles} Files</p>
                      <p className="text-[9px] xl:text-[10px] font-medium text-slate-400 uppercase tracking-wide">{folderKeys.length} Folders</p>
                    </div>
                  </div>
                </div>

                {menuError && (
                  <div className="p-4 rounded-2xl bg-red-50/90 text-red-600 text-sm border border-red-100 backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} /> {menuError}
                  </div>
                )}

                <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-6 overflow-hidden">
                  {/* Left Column: Folders & Upload */}
                  <div className="space-y-4 xl:space-y-6 overflow-y-auto custom-scrollbar pr-2 pb-4">
                    {/* Folder Navigation */}
                    <div className="rounded-2xl xl:rounded-3xl border border-white/40 bg-white/60 p-4 xl:p-6 backdrop-blur-2xl transition-all hover:bg-white/70">
                      <div className="flex items-center justify-between mb-4 xl:mb-5">
                        <h3 className="text-xs xl:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <Folder className="w-4 h-4 text-slate-400" /> Folders
                        </h3>
                        <span className="text-[9px] xl:text-[10px] font-bold bg-white/50 px-2 py-1 rounded-full text-slate-500 border border-white/50">
                          {folderKeys.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {folderKeys.map((folderKey) => (
                          <button
                            key={folderKey}
                            onClick={() => {
                              setCurrentFolder(folderKey);
                              // Auto-fill folder name field if not "General" (root), otherwise clear it
                              if (folderKey !== "/") {
                                setPendingFolder(stripFolderInput(folderKey));
                              } else {
                                setPendingFolder("");
                              }
                            }}
                            className={`flex items-center gap-1.5 xl:gap-2 px-3 xl:px-4 py-1.5 xl:py-2 rounded-full text-xs xl:text-sm font-medium transition-all duration-300 border ${
                              currentFolder === folderKey
                                ? "bg-slate-800 text-white border-transparent scale-105"
                                : "bg-white/40 text-slate-600 border-white/50 hover:bg-white/80 hover:-translate-y-0.5"
                            }`}
                          >
                            <span className="truncate max-w-[80px] xl:max-w-[120px]">{formatFolderLabel(folderKey)}</span>
                            <span className={`ml-0.5 xl:ml-1 flex h-4 xl:h-5 min-w-[1rem] xl:min-w-[1.25rem] items-center justify-center rounded-full text-[8px] xl:text-[9px] px-1 xl:px-1.5 ${
                              currentFolder === folderKey ? "bg-white/20 text-white" : "bg-slate-200/50 text-slate-600"
                            }`}>
                              {folderMap?.[folderKey]?.length ?? 0}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Upload Section */}
                    <div className="rounded-2xl xl:rounded-3xl border border-white/40 bg-white/60 p-4 xl:p-6 backdrop-blur-2xl transition-all hover:bg-white/70">
                      <h3 className="text-xs xl:text-sm font-bold text-slate-800 mb-4 xl:mb-5 uppercase tracking-wider flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-slate-400" /> Upload Files
                      </h3>
                      <div className="space-y-4 xl:space-y-5">
                        <div>
                          <label className="text-xs font-bold text-slate-500 mb-2 block ml-1">TARGET FOLDER</label>
                          <div className="relative">
                            <Folder className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                              type="text"
                              value={pendingFolder}
                              onChange={(e) => setPendingFolder(e.target.value)}
                              placeholder="e.g., reports/week-1"
                              className="w-full rounded-xl border border-white/50 bg-white/40 pl-10 pr-4 py-2.5 text-sm focus:border-orangeFpt-400 focus:bg-white/80 focus:ring-2 focus:ring-orangeFpt-100 focus:outline-none transition-all placeholder-slate-400"
                            />
                          </div>
                        </div>

                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="group relative border-2 border-dashed border-slate-300/60 rounded-2xl xl:rounded-3xl p-5 xl:p-8 text-center cursor-pointer hover:border-orangeFpt-400/60 hover:bg-orangeFpt-50/30 transition-all duration-300 bg-white/20"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/40 rounded-2xl xl:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative z-10">
                            <div className="w-10 h-10 xl:w-14 xl:h-14 rounded-xl xl:rounded-2xl bg-white/80 text-slate-400 mx-auto flex items-center justify-center mb-2 xl:mb-3 group-hover:text-orangeFpt-500 group-hover:scale-110 transition-all duration-300">
                              <UploadCloud className="w-5 h-5 xl:w-7 xl:h-7" />
                            </div>
                            <p className="text-xs xl:text-sm font-bold text-slate-700 group-hover:text-orangeFpt-600 transition-colors">Click to browse</p>
                            <p className="text-[10px] xl:text-xs text-slate-400 mt-1">or drag and drop files here</p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            multiple
                            onChange={handleFileSelect}
                          />
                        </div>

                        {pendingFiles.length > 0 && (
                          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center justify-between px-1">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selected ({pendingFiles.length})</p>
                              <button onClick={() => setPendingFiles([])} className="text-[10px] text-red-500 hover:underline">Clear all</button>
                            </div>
                            
                            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                              {pendingFiles.map((file, idx) => (
                                <div key={`${file.name}-${idx}`} className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-white/60 text-xs backdrop-blur-sm group hover:bg-white/90 transition-colors">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-orangeFpt-50 text-orangeFpt-500 flex items-center justify-center flex-shrink-0">
                                      <FileText size={14} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate font-bold text-slate-700">{file.name}</p>
                                      <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleRemovePendingFile(idx)}
                                    className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            
                            <button
                              onClick={handleUpload}
                              disabled={isUploading}
                              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 backdrop-blur-sm"
                            >
                              {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                              {isUploading ? "Uploading..." : "Upload Files"}
                            </button>
                            
                            {uploadErrors.length > 0 && (
                              <div className="mt-3 p-4 rounded-2xl bg-red-50/90 border border-red-100 backdrop-blur-md">
                                <div className="flex items-center gap-2 text-red-600 font-bold text-xs mb-2">
                                  <AlertCircle size={14} />
                                  <span>Upload Failed</span>
                                </div>
                                <ul className="space-y-1.5">
                                  {uploadErrors.map((err, idx) => (
                                    <li key={idx} className="text-xs text-red-500 pl-5 relative before:content-['•'] before:absolute before:left-1 before:text-red-400 font-medium">
                                      {typeof err === 'string' ? err : `${err.field ? err.field + ': ' : ''}${err.message}`}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: File List */}
                  <div className="xl:col-span-2 overflow-y-auto custom-scrollbar pr-2 pb-4">
                    <div className="rounded-2xl xl:rounded-3xl border border-white/40 bg-white/60 p-4 xl:p-6 backdrop-blur-2xl min-h-[400px] xl:min-h-[600px] transition-all hover:bg-white/70">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 xl:mb-6 sticky top-0 bg-white/0 backdrop-blur-xl z-20 py-2 -my-2">
                        <h3 className="text-sm xl:text-lg font-bold text-slate-800 flex flex-wrap items-center gap-1.5 xl:gap-2">
                          <span className="text-slate-400 font-normal text-xs xl:text-sm uppercase tracking-wider">Current Folder:</span> 
                          <span className="text-orangeFpt-600 bg-orangeFpt-50/50 px-2 xl:px-3 py-0.5 xl:py-1 rounded-md xl:rounded-lg border border-orangeFpt-100/50 text-xs xl:text-base">
                            {formatFolderLabel(currentFolder)}
                          </span>
                        </h3>
                        {filesInFolder.length > 0 && (
                          <span className="text-[10px] xl:text-xs font-bold px-2 xl:px-3 py-1 xl:py-1.5 rounded-full bg-white/50 text-slate-600 border border-white/60 backdrop-blur-md self-start sm:self-auto">
                            {filesInFolder.length} items
                          </span>
                        )}
                      </div>

                      {isLoadingResources ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                          <Loader2 className="h-10 w-10 animate-spin mb-3 text-orangeFpt-400" />
                          <p className="text-sm font-medium">Loading files...</p>
                        </div>
                      ) : filesInFolder.length > 0 ? (
                        <div className="grid gap-2 xl:gap-3">
                          {filesInFolder.map((resource) => (
                            <div
                              key={resource.fileId}
                              className="group flex items-center gap-3 xl:gap-4 p-3 xl:p-4 rounded-xl xl:rounded-2xl border border-white/40 bg-white/40 hover:bg-white/80 hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                              onClick={() => handleOpenResource(resource)}
                            >
                              <div className="h-10 w-10 xl:h-12 xl:w-12 rounded-xl xl:rounded-2xl bg-gradient-to-br from-white to-slate-50 text-orangeFpt-500 flex items-center justify-center flex-shrink-0 border border-white/60 group-hover:scale-110 transition-all duration-300">
                                <FileText className="w-5 h-5 xl:w-6 xl:h-6" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-800 truncate group-hover:text-orangeFpt-600 transition-colors text-xs xl:text-sm mb-0.5 xl:mb-1">
                                  {resource.fileName}
                                </h4>
                                <div className="flex flex-wrap items-center gap-1.5 xl:gap-3 text-[10px] xl:text-xs text-slate-500">
                                  <span className="font-medium bg-white/50 px-1.5 xl:px-2 py-0.5 rounded text-slate-600 border border-white/50">
                                    {formatFileSize(resource.fileSize)}
                                  </span>
                                  <span className="text-slate-300 hidden sm:inline">•</span>
                                  <div className="hidden sm:flex items-center gap-1.5" title={`Uploaded by ${resource.userName}`}>
                                    {resource.avatarImg ? (
                                      <img 
                                        src={resource.avatarImg} 
                                        alt={resource.userName} 
                                        className="w-4 h-4 rounded-full object-cover border border-white/50"
                                      />
                                    ) : (
                                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500 border border-white/50">
                                        {(resource.userName || "?").charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <span className="truncate max-w-[80px] xl:max-w-[100px] font-medium">{resource.userName || "Unknown"}</span>
                                  </div>
                                  <span className="text-slate-300 hidden sm:inline">•</span>
                                  <span className="hidden sm:inline">{resource.createdAtLabel}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 xl:gap-2 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-all duration-300 xl:transform xl:translate-x-2 group-hover:translate-x-0 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleOpenResource(resource)}
                                  className="p-2 xl:p-2.5 rounded-lg xl:rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50/80 transition-all active:scale-95"
                                  title="Download / Open"
                                >
                                  {openingFileId === resource.fileId ? <Loader2 className="animate-spin w-4 h-4 xl:w-[18px] xl:h-[18px]" /> : <Download className="w-4 h-4 xl:w-[18px] xl:h-[18px]" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteResource(resource)}
                                  disabled={deletingFileId === resource.fileId}
                                  className="p-2 xl:p-2.5 rounded-lg xl:rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50/80 transition-all active:scale-95"
                                  title="Delete"
                                >
                                  {deletingFileId === resource.fileId ? <Loader2 className="animate-spin w-4 h-4 xl:w-[18px] xl:h-[18px]" /> : <Trash2 className="w-4 h-4 xl:w-[18px] xl:h-[18px]" />}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 xl:h-80 rounded-2xl xl:rounded-3xl border-2 border-dashed border-slate-200/60 bg-white/20 backdrop-blur-sm">
                          <div className="h-14 w-14 xl:h-20 xl:w-20 rounded-full bg-white/60 flex items-center justify-center mb-3 xl:mb-4 text-slate-300">
                            <Folder className="w-7 h-7 xl:w-10 xl:h-10" />
                          </div>
                          <p className="text-slate-600 font-bold text-sm xl:text-lg">No files in this folder</p>
                          <p className="text-xs xl:text-sm text-slate-400 mt-1">Upload files to share with your class</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center rounded-3xl border border-white/40 bg-white/60 backdrop-blur-2xl text-center p-8">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orangeFpt-50 to-white flex items-center justify-center mb-6">
                  <BookOpen size={48} className="text-orangeFpt-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Select a Class</h2>
                <p className="text-slate-500 max-w-md">
                  Choose a class from the sidebar to manage resources, upload files, and organize course materials.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResourcesHub;
