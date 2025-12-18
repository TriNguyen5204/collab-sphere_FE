import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  FileText,
  Folder,
  Loader2,
  PlusCircle,
  Trash2,
  Upload,
  Users,
  GraduationCap,
  Lock,
  MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import useTeam from "../../context/useTeam";
import {
  deleteTeamResourceFileByTeamIdAndFileId,
  getTeamResourcesByTeamId,
  patchChangeTeamResourceFilePathByTeamIdAndFileId,
  patchGenerateNewTeamResourceFileLinkByTeamIdAndFileId,
  postTeamResourceFilebyTeamId,
} from "../../services/studentApi";
import { getClassFiles, patchGenerateNewClassFileUrl } from "../../services/classApi.js";
import useToastConfirmation from "../../hooks/useToastConfirmation.jsx";

// --- Helpers ---
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
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00:00Z`;
  if (value.includes(" ")) value = value.replace(" ", "T");
  if (!timezoneRegex.test(value)) value = value.endsWith("Z") ? value : `${value}Z`;
  return value;
};

const parseUtcDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
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
        year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
      })
    : null;

const formatVietnamTimeLabel = (utcDate) => {
  if (!utcDate) return "";
  if (vietnamFormatter) return vietnamFormatter.format(utcDate);
  const fallback = new Date(utcDate.getTime() + VIETNAM_UTC_OFFSET_MS);
  return fallback.toLocaleString("vi-VN");
};

const buildExpireInfo = (rawExpireTime) => {
  const expireDateUtc = parseUtcDate(rawExpireTime);
  if (!expireDateUtc) return { expireDateUtc: null, expireLabel: "", isExpired: false, shouldRefresh: true };
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
  value = value.replace(/^\/+/, "").replace(/\/+$/, "");
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
      resource?.urlExpireTime ?? resource?.urlExpireAt ?? resource?.expireTime ?? resource?.expiredAt ?? resource?.linkExpiredAt
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
  if (!normalized["/"]) normalized["/"] = [];
  return normalized;
};

// --- CONSTANTS ---
const MAX_FOLDER_ROWS = 3;

const ProjectResourcesMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("team"); 

  // Data
  const [teamFolderMap, setTeamFolderMap] = useState({ "/": [] });
  const [classFolderMap, setClassFolderMap] = useState({ "/": [] });
  
  const [currentFolder, setCurrentFolder] = useState("/");
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [menuError, setMenuError] = useState(null);
  
  // Upload & Action States
  const [pendingFiles, setPendingFiles] = useState([]);
  const [pendingFolder, setPendingFolder] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [refreshingFileId, setRefreshingFileId] = useState(null);
  const [openingFileId, setOpeningFileId] = useState(null);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [movingFileId, setMovingFileId] = useState(null);
  const [draggedResource, setDraggedResource] = useState(null);
  const [draggedFileId, setDraggedFileId] = useState(null);
  const [dragOverFolder, setDragOverFolder] = useState(null);
  
  const { team } = useTeam();
  const teamId = team?.teamId ?? team?.id;
  const classId = team?.classInfo?.classId;
  const confirmWithToast = useToastConfirmation();

  // Extract lecturerId (check both id and accountId)
  const lecturerId = team?.lecturerInfo?.lecturerId;

  // Refs
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const fileInputRef = useRef(null);
  const folderContainerRef = useRef(null);
  const folderMeasureRef = useRef(null);
  const ellipsisMeasureRef = useRef(null);
  const folderRefs = useRef({});
  const overflowMenuRef = useRef(null);
  const overflowButtonRef = useRef(null);
  
  // Overflow Logic States
  const [visibleFolderKeys, setVisibleFolderKeys] = useState([]);
  const [overflowFolderKeys, setOverflowFolderKeys] = useState([]);
  const [hasFolderOverflow, setHasFolderOverflow] = useState(false);
  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState(false);

  // Derived
  const isReadOnly = activeTab === "class";
  const activeFolderMap = activeTab === "team" ? teamFolderMap : classFolderMap;

  const folderKeys = useMemo(() => {
    const keys = Object.keys(activeFolderMap ?? {});
    const others = keys.filter((key) => key !== "/").sort((a, b) => a.localeCompare(b));
    return ["/", ...others];
  }, [activeFolderMap]);

  // Initial load safe-guard
  useEffect(() => {
    setVisibleFolderKeys(folderKeys);
  }, [folderKeys]);

  const filesInFolder = activeFolderMap?.[currentFolder] ?? [];
  const totalFiles = useMemo(
    () => folderKeys.reduce((sum, key) => sum + (activeFolderMap?.[key]?.length ?? 0), 0),
    [folderKeys, activeFolderMap]
  );

  // Sync pending folder input
  useEffect(() => {
    console.log(lecturerId, 'lecturerId in ProjectResourcesMenu');
    if (activeTab === 'team') {
        const folderName = currentFolder === "/" ? "" : stripFolderInput(currentFolder);
        setPendingFolder(folderName);
    }
  }, [currentFolder, activeTab]);

  // --- UPDATED: CLICK HANDLER ---
  const closeMenuOnOutsideClick = useCallback((event) => {
    // 1. Existing checks for menu elements
    if (overflowMenuRef.current?.contains(event.target)) return;
    if (overflowButtonRef.current?.contains(event.target)) return;
    if (menuRef.current?.contains(event.target)) return;
    if (buttonRef.current?.contains(event.target)) return;

    // 2. NEW CHECK: Detect interactions with Sonner Toasts
    // This looks for the toast container or individual toast elements in the DOM
    if (event.target.closest('[data-sonner-toaster]')) return;
    if (event.target.closest('[data-sonner-toast]')) return;

    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("pointerdown", closeMenuOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeMenuOnOutsideClick);
  }, [isOpen, closeMenuOnOutsideClick]);

  const fetchResources = useCallback(async ({ showSpinner = true } = {}) => {
    if (showSpinner) setIsLoadingResources(true);
    setMenuError(null);
    try {
      if (teamId) {
        const teamResponse = await getTeamResourcesByTeamId(teamId);
        const teamNormalized = normalizeGroupingResponse(teamResponse?.grouping);
        setTeamFolderMap(teamNormalized);
      }
      if (classId) {
         const classResponse = await getClassFiles(classId);
         const classNormalized = normalizeGroupingResponse(classResponse?.grouping || classResponse); 
         setClassFolderMap(classNormalized);
      }
    } catch (error) {
      console.error("Error loading resources:", error);
      setMenuError("Unable to load resources.");
    } finally {
      if (showSpinner) setIsLoadingResources(false);
    }
  }, [teamId, classId]);

  useEffect(() => {
    if (!isOpen) return;
    fetchResources();
  }, [isOpen, fetchResources]);

  useEffect(() => {
    setCurrentFolder("/");
  }, [activeTab]);

  // --- IMPROVED OVERFLOW LOGIC (OffsetTop Detection) ---
  const recalcFolderOverflow = useCallback(() => {
    const measureContainer = folderMeasureRef.current;
    if (!measureContainer || measureContainer.clientWidth < 50) {
      return;
    }

    const containerWidth = measureContainer.clientWidth;
    const computedStyle = typeof window !== "undefined" ? window.getComputedStyle(measureContainer) : null;
    const gapValue = computedStyle ? parseFloat(computedStyle.columnGap || computedStyle.gap || "8") : 8;
    const ellipsisWidth = ellipsisMeasureRef.current?.offsetWidth || 34;

    const rows = [];
    let currentTop = -1;
    let currentRow = [];

    folderKeys.forEach((key) => {
        const el = folderRefs.current[key];
        if (!el) return;
        
        if (currentTop === -1) {
            currentTop = el.offsetTop;
            currentRow.push(key);
        } else if (Math.abs(el.offsetTop - currentTop) > 5) {
            rows.push(currentRow);
            currentRow = [key];
            currentTop = el.offsetTop;
        } else {
            currentRow.push(key);
        }
    });
    if (currentRow.length > 0) rows.push(currentRow);

    if (rows.length <= MAX_FOLDER_ROWS) {
        setHasFolderOverflow(false);
        setOverflowFolderKeys([]);
        setVisibleFolderKeys(folderKeys);
        return;
    }

    const safeRows = rows.slice(0, MAX_FOLDER_ROWS - 1);
    const visibleKeys = safeRows.flat();
    
    let candidateRowKeys = [...rows[MAX_FOLDER_ROWS - 1]]; 
    let overflowKeys = rows.slice(MAX_FOLDER_ROWS).flat();

    const getRowWidth = (keys) => {
        let w = 0;
        keys.forEach((k, i) => {
            const el = folderRefs.current[k];
            if (el) w += el.offsetWidth;
            if (i > 0) w += gapValue;
        });
        return w;
    };

    while (candidateRowKeys.length > 0) {
        const currentW = getRowWidth(candidateRowKeys);
        const gapForEllipsis = candidateRowKeys.length > 0 ? gapValue : 0;
        
        if (currentW + gapForEllipsis + ellipsisWidth <= containerWidth) {
            break; 
        }
        
        const popped = candidateRowKeys.pop();
        if (popped) overflowKeys.unshift(popped);
    }

    setHasFolderOverflow(true);
    setVisibleFolderKeys([...visibleKeys, ...candidateRowKeys]);
    setOverflowFolderKeys(overflowKeys);

  }, [folderKeys, isOpen]); 

  useLayoutEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => recalcFolderOverflow(), 0); 
    return () => clearTimeout(timer);
  }, [isOpen, recalcFolderOverflow]);

  useEffect(() => {
    if (!isOpen || !folderMeasureRef.current) return;
    const ro = new ResizeObserver(() => recalcFolderOverflow());
    ro.observe(folderMeasureRef.current);
    return () => ro.disconnect();
  }, [isOpen, recalcFolderOverflow]);

  useEffect(() => {
    if (!isOpen) setIsOverflowMenuOpen(false);
  }, [isOpen]);

  const handleOverflowButtonClick = (e) => {
    e.stopPropagation();
    setIsOverflowMenuOpen((prev) => !prev);
  };

  // --- Handlers ---
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
    if (isReadOnly || !teamId) return;
    if (!pendingFiles.length) {
      toast.info("Select files to upload.");
      return;
    }
    setIsUploading(true);
    const normalizedPath = ensurePathPrefix(pendingFolder);
    const remainingFiles = [...pendingFiles];
    let uploadedCount = 0;
    try {
      for (const file of pendingFiles) {
        const formData = new FormData();
        formData.append("pathPrefix", normalizedPath);
        formData.append("file", file, file.name);
        try {
          await postTeamResourceFilebyTeamId(teamId, formData);
          uploadedCount += 1;
          const removalIndex = remainingFiles.findIndex((item) => item === file);
          if (removalIndex > -1) remainingFiles.splice(removalIndex, 1);
        } catch (error) {
          console.error("Failed to upload resource", file.name, error);
          toast.error(error?.response?.data?.errorList?.[0]?.message || "Upload failed.");
        }
      }

      if (uploadedCount > 0) {
        toast.success(`Uploaded ${uploadedCount} file${uploadedCount > 1 ? "s" : ""}.`);
        await fetchResources({ showSpinner: false });
      }
    } catch (error) {
      console.error("Unexpected error while uploading files", error);
      toast.error(error?.response?.data?.errorList?.[0]?.message || "Upload failed.");
    } finally {
      setPendingFiles(remainingFiles);
      setIsUploading(false);
    }
  };

  const ensureResourceLinkFresh = useCallback(async (resource, { skipToast = false } = {}) => {
    if (!resource || !resource.expireInfo?.shouldRefresh) return resource;
    setRefreshingFileId(resource.fileId);
    try {
      let refreshed;
      if (activeTab === 'class' && classId) {
         refreshed = await patchGenerateNewClassFileUrl(classId, resource.fileId);
      } else if (teamId) {
         refreshed = await patchGenerateNewTeamResourceFileLinkByTeamIdAndFileId(teamId, resource.fileId);
      }
      if (!skipToast) toast.success("Link refreshed");
      await fetchResources({ showSpinner: false });
      return { ...resource, ...refreshed };
    } catch (error) {
      if (!skipToast) toast.error("Refresh failed.");
      throw error;
    } finally {
      setRefreshingFileId(null);
    }
  }, [teamId, classId, activeTab, fetchResources]);

  const handleOpenResource = async (resource) => {
    if (!resource) return;
    setOpeningFileId(resource.fileId);
    try {
      const ensured = await ensureResourceLinkFresh(resource, { skipToast: true });
      const url = ensured?.fileUrl ?? resource.fileUrl;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else toast.error("No link available.");
    } catch (e) { /* handled */ } 
    finally { setOpeningFileId(null); }
  };

  const handleDeleteResource = async (resource) => {
    if (isReadOnly || !teamId) return;
    const confirmed = await confirmWithToast({ message: "Delete this file?", confirmLabel: "Delete", variant: "danger" });
    if (!confirmed) return;
    setDeletingFileId(resource.fileId);
    try {
      await deleteTeamResourceFileByTeamIdAndFileId(teamId, resource.fileId);
      toast.success("Deleted.");
      await fetchResources({ showSpinner: false });
    } catch (e) { toast.error("Delete failed."); }
    finally { setDeletingFileId(null); }
  };

  const handleDragStart = (resource) => { if (!isReadOnly) { setDraggedResource(resource); setDraggedFileId(resource.fileId); } };
  const handleDragEnd = () => { setDraggedResource(null); setDraggedFileId(null); setDragOverFolder(null); };
  
  const handleDropOnFolder = async (targetFolderKey) => {
    if (isReadOnly || !draggedResource || draggedResource.filePathPrefix === targetFolderKey) { handleDragEnd(); return; }
    setMovingFileId(draggedResource.fileId);
    try {
      await patchChangeTeamResourceFilePathByTeamIdAndFileId(teamId, draggedResource.fileId, targetFolderKey);
      toast.success("Moved.");
      await fetchResources({ showSpinner: false });
    } catch (e) { toast.error("Move failed."); }
    finally { setMovingFileId(null); handleDragEnd(); }
  };

  const handleOverflowDragOver = (e) => {
    if (!isReadOnly && draggedResource) {
        e.preventDefault();
        e.stopPropagation();
        setIsOverflowMenuOpen(true);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <FileText size={20} />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-[28rem] rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl z-50"
        >
          {/* HEADER & TABS */}
          <div className="border-b border-gray-100 p-4 pb-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Resources</h3>
              <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                <button
                  onClick={() => setActiveTab('team')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'team' ? "bg-white text-orangeFpt-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Users size={14} /> Team
                </button>
                <button
                   onClick={() => setActiveTab('class')}
                   className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'class' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <GraduationCap size={14} /> Class
                </button>
              </div>
            </div>

            {menuError && <p className="mb-2 text-xs text-red-600">{menuError}</p>}
            
            {/* FOLDER CHIPS - Visible */}
            <div className="relative">
              <div
                ref={folderContainerRef}
                className="flex flex-wrap gap-2 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 px-2 py-2"
                style={{ minHeight: '3rem' }} 
              >
                {visibleFolderKeys.map((folderKey) => (
                  <button
                    key={folderKey}
                    type="button"
                    onClick={() => setCurrentFolder(folderKey)}
                    onDragOver={!isReadOnly ? (e) => { if(draggedResource) { e.preventDefault(); setDragOverFolder(folderKey); } } : undefined}
                    onDrop={!isReadOnly ? (e) => { if(draggedResource) { e.preventDefault(); setDragOverFolder(null); handleDropOnFolder(folderKey); } } : undefined}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition ${
                      currentFolder === folderKey
                        ? isReadOnly ? "border-blue-300 bg-blue-50 text-blue-600" : "border-orangeFpt-300 bg-orangeFpt-50 text-orangeFpt-600"
                        : dragOverFolder === folderKey
                          ? "border-orangeFpt-300 bg-orangeFpt-50 text-orangeFpt-600"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Folder className="h-3.5 w-3.5" />
                    <span>{formatFolderLabel(folderKey)}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
                      {activeFolderMap?.[folderKey]?.length ?? 0}
                    </span>
                  </button>
                ))}

                {/* OVERFLOW BUTTON */}
                {hasFolderOverflow && (
                  <button
                    type="button"
                    ref={overflowButtonRef}
                    onClick={handleOverflowButtonClick}
                    onMouseEnter={() => setIsOverflowMenuOpen(true)}
                    onDragEnter={handleOverflowDragOver}
                    onDragOver={handleOverflowDragOver}
                    className={`inline-flex items-center justify-center rounded-full border px-2 py-1 text-xs font-medium transition ${
                      isOverflowMenuOpen
                        ? "border-orangeFpt-300 bg-orangeFpt-50 text-orangeFpt-600"
                        : "border-gray-200 text-gray-600 hover:border-orangeFpt-300"
                    }`}
                  >
                     <MoreHorizontal size={14} />
                  </button>
                )}
              </div>

              {/* OVERFLOW POPUP */}
              {isOverflowMenuOpen && overflowFolderKeys.length > 0 && (
                <div
                  ref={overflowMenuRef}
                  onMouseLeave={() => setIsOverflowMenuOpen(false)}
                  className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-gray-200 bg-white shadow-xl"
                >
                  <div className="max-h-48 overflow-y-auto py-1">
                    {overflowFolderKeys.map((folderKey) => (
                       <button
                          key={`overflow-${folderKey}`}
                          onClick={() => { setCurrentFolder(folderKey); setIsOverflowMenuOpen(false); }}
                          onDragOver={!isReadOnly ? (e) => { if(draggedResource) { e.preventDefault(); setDragOverFolder(folderKey); } } : undefined}
                          onDrop={!isReadOnly ? (e) => { if(draggedResource) { e.preventDefault(); setDragOverFolder(null); handleDropOnFolder(folderKey); } } : undefined}
                          className={`flex w-full items-center justify-between px-4 py-2 text-left text-xs transition ${
                             dragOverFolder === folderKey ? "bg-orangeFpt-50 text-orangeFpt-600" : "text-gray-700 hover:bg-gray-50"
                          }`}
                       >
                         <span className="truncate pr-2">{formatFolderLabel(folderKey)}</span>
                         <span className="text-gray-400">{activeFolderMap?.[folderKey]?.length ?? 0}</span>
                       </button>
                    ))}
                  </div>
                </div>
              )}

              {/* --- MEASUREMENT CONTAINER (Invisible Clone) --- */}
              <div 
                  ref={folderMeasureRef} 
                  className="absolute top-0 left-0 w-full flex flex-wrap gap-2 px-2 py-2 invisible pointer-events-none -z-10"
                  aria-hidden="true"
              >
                 {folderKeys.map((k) => (
                    <div 
                        key={`m-${k}`} 
                        ref={(el) => (folderRefs.current[k] = el)} 
                        className="border px-3 py-1 text-xs font-medium inline-flex items-center gap-2"
                    >
                       <Folder className="h-3.5 w-3.5" />
                       <span>{formatFolderLabel(k)}</span>
                       <span className="px-2">{activeFolderMap?.[k]?.length ?? 0}</span>
                    </div>
                 ))}
                 {/* Measure Ellipsis Button */}
                 <button ref={ellipsisMeasureRef} className="border px-2 py-1 text-xs font-medium inline-flex"><MoreHorizontal size={14}/></button>
              </div>
            </div>
          </div>

          {/* FILE LIST */}
          <div className="max-h-80 overflow-y-auto px-4 py-4 min-h-[150px]">
            {isLoadingResources ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : filesInFolder.length ? (
              <ul className="space-y-3">
                {filesInFolder.map((resource) => {
                  // Check if file belongs to lecturer
                  const isLecturerFile = resource.userId === lecturerId;
                  return (
                    <li
                      key={resource.fileId}
                      draggable={!isReadOnly}
                      onDragStart={!isReadOnly ? () => handleDragStart(resource) : undefined}
                      onDragEnd={!isReadOnly ? handleDragEnd : undefined}
                      className={`flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-opacity ${
                        !isReadOnly ? "hover:bg-orangeFpt-50" : "hover:bg-gray-50"
                      } ${draggedFileId === resource.fileId ? "opacity-70" : "opacity-100"} ${movingFileId === resource.fileId ? "ring-2 ring-orange-300" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenResource(resource)}
                        className="flex flex-1 items-start gap-3 text-left"
                      >
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                          isReadOnly ? "bg-blue-100 text-blue-500" : "bg-orangeFpt-100 text-orangeFpt-500"
                        }`}>
                          {openingFileId === resource.fileId ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className={`truncate text-sm font-semibold max-w-[13rem] ${isReadOnly ? "text-blue-700" : "text-orangeFpt-500"}`}>{resource.fileName}</p>
                            <span className="text-xs font-medium text-gray-400">{formatFileSize(resource.fileSize)}</span>
                          </div>
                          <p className="text-xs text-gray-500">{isReadOnly ? "Lecturer" : (resource.userName ?? "Unknown")} • {resource.createdAtLabel}</p>
                        </div>
                      </button>
                      {!isReadOnly ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteResource(resource)}
                          disabled={deletingFileId === resource.fileId || isLecturerFile}
                          className={`rounded-full p-2 transition-colors ${
                            isLecturerFile
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-red-400 hover:bg-red-100 hover:text-red-600"
                          }`}
                          title={isLecturerFile ? "Cannot delete lecturer's file" : "Delete file"}
                        >
                          {deletingFileId === resource.fileId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <div className="p-2 text-gray-300"><Lock className="h-4 w-4" /></div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="py-8 text-center text-sm text-gray-400">
                {isReadOnly ? "No class materials." : "No files yet."}
              </div>
            )}
          </div>

          {/* UPLOAD FOOTER */}
          {!isReadOnly && (
            <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={pendingFolder}
                    onChange={(e) => setPendingFolder(e.target.value)}
                    placeholder="Folder name"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orangeFpt-400 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                        <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-dashed border-orangeFpt-300 px-3 py-2 text-xs font-semibold text-orangeFpt-500 hover:bg-orangeFpt-50">
                            <PlusCircle className="h-3 w-3" /> Add Files
                        </button>
                        <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFileSelect} />
                        {pendingFiles.length > 0 && <span className="text-xs text-gray-500">{pendingFiles.length} selected</span>}
                    </div>
                   <button onClick={handleUpload} disabled={isUploading || !pendingFiles.length} className="inline-flex items-center gap-2 rounded-full bg-orangeFpt-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orangeFpt-600 disabled:opacity-50">
                     {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />} Upload
                   </button>
                </div>
                {pendingFiles.length > 0 && (
                  <div className="max-h-32 overflow-y-auto rounded-lg border border-dashed border-orangeFpt-200 bg-white px-3 py-2">
                    <ul className="space-y-2 text-xs text-gray-600">
                      {pendingFiles.map((file, index) => (
                        <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-800">{file.name}</p>
                            <p className="text-[11px] text-gray-400">{formatFileSize(file.size)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePendingFile(index)}
                            className="text-xs font-semibold text-red-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectResourcesMenu;