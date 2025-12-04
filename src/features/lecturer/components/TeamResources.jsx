import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteTeamResourceFileByTeamIdAndFileId,
  getTeamResourcesByTeamId,
  patchChangeTeamResourceFilePathByTeamIdAndFileId,
  patchGenerateNewTeamResourceFileLinkByTeamIdAndFileId,
  postTeamResourceFilebyTeamId,
} from "../../../services/studentApi";
import useToastConfirmation from "../../../hooks/useToastConfirmation";

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

const normalizeGroupingResponse = (grouping) => {
  const normalized = {};
  if (grouping && typeof grouping === "object") {
    Object.entries(grouping).forEach(([pathKey, files]) => {
      const normalizedKey = ensurePathPrefix(pathKey ?? "/");
      normalized[normalizedKey] = Array.isArray(files) ? files.map(enrichResource) : [];
    });
  }
  if (!normalized["/"]) {
    normalized["/"] = [];
  }
  return normalized;
};

const TeamResources = ({ teamId }) => {
  const [folderMap, setFolderMap] = useState({ "/": [] });
  const [currentFolder, setCurrentFolder] = useState("/");
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [menuError, setMenuError] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [pendingFolder, setPendingFolder] = useState("");
  const [uploadErrors, setUploadErrors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshingFileId, setRefreshingFileId] = useState(null);
  const [openingFileId, setOpeningFileId] = useState(null);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [movingFileId, setMovingFileId] = useState(null);
  const [draggedResource, setDraggedResource] = useState(null);
  const [draggedFileId, setDraggedFileId] = useState(null);
  const [dragOverFolder, setDragOverFolder] = useState(null);
  const autoRefreshQueueRef = useRef(new Set());
  const confirmWithToast = useToastConfirmation();
  const fileInputRef = useRef(null);

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

  const fetchResources = useCallback(
    async ({ showSpinner = true } = {}) => {
      if (!teamId) return;
      if (showSpinner) setIsLoadingResources(true);
      setMenuError(null);
      try {
        const response = await getTeamResourcesByTeamId(teamId);
        const normalized = normalizeGroupingResponse(response?.grouping);
        setFolderMap(normalized);
        setCurrentFolder((prev) => (normalized[prev] ? prev : Object.keys(normalized)[0] ?? "/"));
      } catch (error) {
        console.error("Error loading team resources:", error);
        setMenuError("Unable to load team resources. Please try again.");
      } finally {
        if (showSpinner) setIsLoadingResources(false);
      }
    },
    [teamId]
  );

  useEffect(() => {
    if (!teamId) return;
    fetchResources();
  }, [teamId, fetchResources]);

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
    if (!teamId) {
      toast.error("Join a team before uploading resources.");
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
        formData.append("file", file);
        await postTeamResourceFilebyTeamId(teamId, formData);
      }
      toast.success("Resources uploaded successfully.");
      setPendingFiles([]);
      setPendingFolder("");
      await fetchResources({ showSpinner: false });
    } catch (error) {
      console.error("Failed to upload team resources:", error);
      if (error.response?.data?.errorList && Array.isArray(error.response.data.errorList)) {
        setUploadErrors(error.response.data.errorList);
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
      if (!resource || !teamId) return resource;
      if (!resource.expireInfo?.shouldRefresh) return resource;
      setRefreshingFileId(resource.fileId);
      try {
        const refreshed = await patchGenerateNewTeamResourceFileLinkByTeamIdAndFileId(
          teamId,
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
    [teamId, fetchResources]
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
    if (!teamId) return;
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
  }, [folderMap, ensureResourceLinkFresh, teamId]);

  const handleDeleteResource = async (resource) => {
    if (!teamId || !resource?.fileId) return;
    const confirmed = await confirmWithToast({
      message: `Delete ${resource.fileName || 'this file'}? This action cannot be undone.`,
      confirmLabel: 'Delete file',
      variant: 'danger',
    });
    if (!confirmed) return;
    setDeletingFileId(resource.fileId);
    try {
      await deleteTeamResourceFileByTeamIdAndFileId(teamId, resource.fileId);
      toast.success("File deleted");
      await fetchResources({ showSpinner: false });
    } catch (error) {
      console.error("Failed to delete team resource:", error);
      toast.error("Unable to delete the file right now.");
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleDragStart = (resource) => {
    setDraggedResource(resource);
    setDraggedFileId(resource.fileId);
  };

  const handleDragEnd = () => {
    setDraggedResource(null);
    setDraggedFileId(null);
    setDragOverFolder(null);
  };

  const handleDropOnFolder = async (targetFolderKey) => {
    if (!teamId || !draggedResource) {
      handleDragEnd();
      return;
    }
    if (draggedResource.filePathPrefix === targetFolderKey) {
      handleDragEnd();
      return;
    }
    setMovingFileId(draggedResource.fileId);
    try {
      const response = await patchChangeTeamResourceFilePathByTeamIdAndFileId(
        teamId,
        draggedResource.fileId,
        targetFolderKey
      );
      toast.success(response?.message || `Moved to ${formatFolderLabel(targetFolderKey)}`);
      await fetchResources({ showSpinner: false });
    } catch (error) {
      console.error("Failed to move resource via drag-and-drop:", error);
      toast.error(error?.message || "Unable to move file to the selected folder.");
    } finally {
      setMovingFileId(null);
      handleDragEnd();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Folder className="text-orangeFpt-500" /> Team Resources
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage and share files with your team members.</p>
        </div>
        <div className="flex items-center gap-3">
           <button
             onClick={() => fetchResources()}
             className="p-2 rounded-full bg-white/50 text-slate-600 hover:bg-white hover:text-orangeFpt-600 transition-all shadow-sm border border-white/50"
             title="Refresh list"
           >
             <RefreshCw size={18} className={isLoadingResources ? "animate-spin" : ""} />
           </button>
           <div className="h-8 w-px bg-slate-200/50 mx-1"></div>
           <div className="text-right">
             <p className="text-xs font-bold text-slate-700">{totalFiles} Files</p>
             <p className="text-[10px] text-slate-400">{folderKeys.length} Folders</p>
           </div>
        </div>
      </div>

      {menuError && (
        <div className="p-4 rounded-2xl bg-red-50/80 text-red-600 text-sm border border-red-100 backdrop-blur-sm flex items-center gap-2">
          <AlertCircle size={16} /> {menuError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Folders & Upload */}
        <div className="space-y-6">
          {/* Folder Navigation */}
          <div className="rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-xl">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Folders</h3>
            <div className="flex flex-wrap gap-2">
              {folderKeys.map((folderKey) => (
                <button
                  key={folderKey}
                  onClick={() => setCurrentFolder(folderKey)}
                  onDragOver={(event) => {
                    if (!draggedResource) return;
                    event.preventDefault();
                    setDragOverFolder(folderKey);
                  }}
                  onDragLeave={(event) => {
                    if (!draggedResource) return;
                    const nextTarget = event.relatedTarget;
                    if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
                      setDragOverFolder((prev) => (prev === folderKey ? null : prev));
                    }
                  }}
                  onDrop={(event) => {
                    if (!draggedResource) return;
                    event.preventDefault();
                    setDragOverFolder(null);
                    handleDropOnFolder(folderKey);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 border ${
                    currentFolder === folderKey
                      ? "bg-orangeFpt-500/90 text-white shadow-lg shadow-orangeFpt-500/30 border-transparent backdrop-blur-md"
                      : dragOverFolder === folderKey
                        ? "bg-orangeFpt-100/80 text-orangeFpt-600 border-orangeFpt-300"
                        : "bg-white/40 text-slate-600 border-white/50 hover:bg-white/80 hover:shadow-sm"
                  }`}
                >
                  <Folder size={16} className={currentFolder === folderKey ? "text-white" : "text-orangeFpt-400"} />
                  <span>{formatFolderLabel(folderKey)}</span>
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                    currentFolder === folderKey ? "bg-white/20 text-white" : "bg-slate-200/50 text-slate-600"
                  }`}>
                    {folderMap?.[folderKey]?.length ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          <div className="rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-xl">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Upload Files</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Target Folder (Optional)</label>
                <input
                  type="text"
                  value={pendingFolder}
                  onChange={(e) => setPendingFolder(e.target.value)}
                  placeholder="e.g., reports/week-1"
                  className="w-full rounded-xl border border-white/50 bg-white/50 px-4 py-2 text-sm focus:border-orangeFpt-500 focus:outline-none transition-colors placeholder-slate-400"
                />
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300/50 rounded-2xl p-6 text-center cursor-pointer hover:border-orangeFpt-400/50 hover:bg-orangeFpt-50/30 transition-all group bg-white/30"
              >
                <div className="w-12 h-12 rounded-full bg-white/80 text-slate-400 mx-auto flex items-center justify-center mb-3 group-hover:text-orangeFpt-500 group-hover:shadow-md transition-all">
                  <UploadCloud size={24} />
                </div>
                <p className="text-sm font-medium text-slate-700">Click to select files</p>
                <p className="text-xs text-slate-400 mt-1">or drag and drop here</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileSelect}
                />
              </div>

              {pendingFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">Selected Files ({pendingFiles.length})</p>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {pendingFiles.map((file, idx) => (
                      <div key={`${file.name}-${idx}`} className="flex items-center justify-between p-2 rounded-lg bg-white/50 border border-white/60 text-xs backdrop-blur-sm">
                        <span className="truncate font-medium text-slate-700 max-w-[70%]">{file.name}</span>
                        <button
                          onClick={() => handleRemovePendingFile(idx)}
                          className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full py-2.5 rounded-xl bg-orangeFpt-500 text-white font-bold text-sm shadow-lg shadow-orangeFpt-500/30 hover:bg-orangeFpt-600 hover:shadow-orangeFpt-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 backdrop-blur-sm"
                  >
                    {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                    {isUploading ? "Uploading..." : "Start Upload"}
                  </button>
                  
                  {uploadErrors.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-red-50/80 border border-red-100 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-red-600 font-bold text-xs mb-2">
                        <AlertCircle size={14} />
                        <span>Upload Failed</span>
                      </div>
                      <ul className="space-y-1">
                        {uploadErrors.map((err, idx) => (
                          <li key={idx} className="text-xs text-red-500 pl-5 relative before:content-['•'] before:absolute before:left-1 before:text-red-400">
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
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-xl min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="text-slate-400 font-normal">Folder:</span> 
                <span className="text-orangeFpt-600">{formatFolderLabel(currentFolder)}</span>
              </h3>
              {filesInFolder.length > 0 && (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/50 text-slate-600 border border-white/60 shadow-sm">
                  {filesInFolder.length} items
                </span>
              )}
            </div>

            {isLoadingResources ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-sm">Loading files...</p>
              </div>
            ) : filesInFolder.length > 0 ? (
              <div className="grid gap-3">
                {filesInFolder.map((resource) => (
                  <div
                    key={resource.fileId}
                    draggable
                    onDragStart={() => handleDragStart(resource)}
                    onDragEnd={handleDragEnd}
                    className={`group flex items-center gap-4 p-4 rounded-2xl border border-white/60 bg-white/40 hover:bg-white/80 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 backdrop-blur-sm ${
                      draggedFileId === resource.fileId ? "opacity-50 border-dashed border-slate-300" : ""
                    } ${movingFileId === resource.fileId ? "ring-2 ring-orangeFpt-300" : ""}`}
                  >
                    <div className="h-12 w-12 rounded-2xl bg-white text-orangeFpt-500 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <FileText size={24} />
                    </div>
                    
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleOpenResource(resource)}>
                      <h4 className="font-bold text-slate-800 truncate group-hover:text-orangeFpt-600 transition-colors">
                        {resource.fileName}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="font-medium bg-white/50 px-2 py-0.5 rounded text-slate-600 border border-white/50">
                          {formatFileSize(resource.fileSize)}
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1.5" title={`Uploaded by ${resource.userName}`}>
                           {resource.avatarImg ? (
                            <img 
                              src={resource.avatarImg} 
                              alt={resource.userName} 
                              className="w-4 h-4 rounded-full object-cover border border-white/50"
                            />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500">
                              {(resource.userName || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="truncate max-w-[100px]">{resource.userName || "Unknown"}</span>
                        </div>
                        <span>•</span>
                        <span>{resource.createdAtLabel}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => handleOpenResource(resource)}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50/80 transition-colors"
                        title="Download / Open"
                      >
                        {openingFileId === resource.fileId ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                      </button>
                      <button
                        onClick={() => handleDeleteResource(resource)}
                        disabled={deletingFileId === resource.fileId}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50/80 transition-colors"
                        title="Delete"
                      >
                        {deletingFileId === resource.fileId ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-slate-200/60 bg-white/20 backdrop-blur-sm">
                <div className="h-16 w-16 rounded-full bg-white/60 flex items-center justify-center mb-4 text-slate-300 shadow-sm">
                  <Folder size={32} />
                </div>
                <p className="text-slate-500 font-medium">No files in this folder</p>
                <p className="text-xs text-slate-400 mt-1">Upload files to share with your team</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamResources;
