import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  FileText,
  Folder,
  Loader2,
  PlusCircle,
  Trash2,
  Upload,
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
import useToastConfirmation from "../../hooks/useToastConfirmation.jsx";

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

const FOLDER_CONTAINER_MAX_HEIGHT_REM = 7.5;
const FOLDER_CONTAINER_MAX_HEIGHT = `${FOLDER_CONTAINER_MAX_HEIGHT_REM}rem`;
const MAX_FOLDER_ROWS = 3;

const ProjectResourcesMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [folderMap, setFolderMap] = useState({ "/": [] });
  const [currentFolder, setCurrentFolder] = useState("/");
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [menuError, setMenuError] = useState(null);
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
  const autoRefreshQueueRef = useRef(new Set());
  const { team } = useTeam();
  const teamId = team?.teamId ?? team?.id;
  const confirmWithToast = useToastConfirmation();

  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const fileInputRef = useRef(null);
  const folderContainerRef = useRef(null);
  const folderMeasureRef = useRef(null);
  const ellipsisMeasureRef = useRef(null);
  const folderRefs = useRef({});
  const overflowMenuRef = useRef(null);
  const overflowButtonRef = useRef(null);
  const [visibleFolderKeys, setVisibleFolderKeys] = useState([]);
  const [overflowFolderKeys, setOverflowFolderKeys] = useState([]);
  const [hasFolderOverflow, setHasFolderOverflow] = useState(false);
  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState(false);

  const folderKeys = useMemo(() => {
    const keys = Object.keys(folderMap ?? {});
    const others = keys.filter((key) => key !== "/").sort((a, b) => a.localeCompare(b));
    return ["/", ...others];
  }, [folderMap]);

  useEffect(() => {
    setVisibleFolderKeys(folderKeys);
  }, [folderKeys]);

  const filesInFolder = folderMap?.[currentFolder] ?? [];
  const totalFiles = useMemo(
    () => folderKeys.reduce((sum, key) => sum + (folderMap?.[key]?.length ?? 0), 0),
    [folderKeys, folderMap]
  );

  const closeMenuOnOutsideClick = useCallback(
    (event) => {
      const menuEl = menuRef.current;
      const buttonEl = buttonRef.current;
      if (!menuEl || menuEl.contains(event.target)) return;
      if (buttonEl && buttonEl.contains(event.target)) return;
      setIsOpen(false);
    },
    []
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    document.addEventListener("pointerdown", closeMenuOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeMenuOnOutsideClick);
  }, [isOpen, closeMenuOnOutsideClick]);

  const fetchResources = useCallback(
    async ({ showSpinner = true } = {}) => {
      if (!teamId) return;
      if (showSpinner) setIsLoadingResources(true);
      setMenuError(null);
      try {
        const response = await getTeamResourcesByTeamId(teamId);
        const normalized = normalizeGroupingResponse(response?.grouping);
        console.log("Normalized resources:", normalized);
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
    if (!isOpen || !teamId) return;
    fetchResources();
  }, [isOpen, teamId, fetchResources]);

  useEffect(() => {
    setFolderMap({ "/": [] });
    setCurrentFolder("/");
  }, [teamId]);

  const recalcFolderOverflow = useCallback(() => {
    const measureContainer = folderMeasureRef.current;
    if (!measureContainer) {
      setHasFolderOverflow(false);
      setOverflowFolderKeys([]);
      setVisibleFolderKeys(folderKeys);
      return;
    }

    const containerWidth = measureContainer.clientWidth;
    if (!containerWidth) {
      setHasFolderOverflow(false);
      setOverflowFolderKeys([]);
      setVisibleFolderKeys(folderKeys);
      return;
    }

    const computedStyle = typeof window !== "undefined" ? window.getComputedStyle(measureContainer) : null;
    const gapValue = computedStyle
      ? parseFloat(computedStyle.columnGap || computedStyle.gap || "8")
      : 8;

    const chipWidthMap = new Map();
    folderKeys.forEach((key) => {
      const el = folderRefs.current[key];
      if (el) {
        chipWidthMap.set(key, el.offsetWidth);
      }
    });

    const rows = [{ keys: [], width: 0 }];
    folderKeys.forEach((key) => {
      const width = chipWidthMap.get(key) ?? 0;
      let row = rows[rows.length - 1];
      const addition = row.keys.length ? width + gapValue : width;
      if (row.width + addition <= containerWidth || row.keys.length === 0) {
        row.keys.push(key);
        row.width += addition;
      } else {
        const newRow = { keys: [key], width };
        rows.push(newRow);
      }
    });

    const limit = Math.min(rows.length, MAX_FOLDER_ROWS);
    const visibleRows = rows.slice(0, limit).map((row) => ({ keys: [...row.keys], width: row.width }));
    let overflowKeys = rows.slice(limit).flatMap((row) => row.keys);

    if (rows.length <= MAX_FOLDER_ROWS) {
      setHasFolderOverflow(false);
      setOverflowFolderKeys([]);
      setVisibleFolderKeys(folderKeys);
      return;
    }

    const ellipsisWidth = ellipsisMeasureRef.current?.offsetWidth ?? 48;
    const lastRowIndex = visibleRows.length ? visibleRows.length - 1 : 0;
    const lastRow = visibleRows[lastRowIndex] ?? { keys: [], width: 0 };

    const recomputeRowWidth = () =>
      lastRow.keys.reduce(
        (total, key, idx) => total + (chipWidthMap.get(key) ?? 0) + (idx > 0 ? gapValue : 0),
        0
      );

    lastRow.width = recomputeRowWidth();
    const ellipsisAddition = lastRow.keys.length ? ellipsisWidth + gapValue : ellipsisWidth;

    while (lastRow.keys.length && lastRow.width + ellipsisAddition > containerWidth) {
      const removedKey = lastRow.keys.pop();
      if (removedKey) {
        overflowKeys.unshift(removedKey);
      }
      lastRow.width = recomputeRowWidth();
    }

    setHasFolderOverflow(true);
    setVisibleFolderKeys(visibleRows.flatMap((row) => row.keys));
    setOverflowFolderKeys(overflowKeys);
  }, [folderKeys]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    recalcFolderOverflow();
  }, [folderKeys, folderMap, isOpen, recalcFolderOverflow]);

  useEffect(() => {
    if (!isOpen || typeof ResizeObserver === "undefined") return undefined;
    const container = folderContainerRef.current;
    if (!container) return undefined;
    const observer = new ResizeObserver(() => recalcFolderOverflow());
    observer.observe(container);
    return () => observer.disconnect();
  }, [isOpen, recalcFolderOverflow]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleResize = () => recalcFolderOverflow();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, recalcFolderOverflow]);

  useEffect(() => {
    if (!isOpen) {
      setIsOverflowMenuOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!hasFolderOverflow) {
      setIsOverflowMenuOpen(false);
    }
  }, [hasFolderOverflow]);

  useEffect(() => {
    if (!isOverflowMenuOpen) return undefined;
    const handlePointerDown = (event) => {
      if (
        (overflowMenuRef.current && overflowMenuRef.current.contains(event.target)) ||
        (overflowButtonRef.current && overflowButtonRef.current.contains(event.target))
      ) {
        return;
      }
      setIsOverflowMenuOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOverflowMenuOpen]);

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
      toast.error("Unable to upload files right now.");
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
    if (!isOpen || !teamId) return;
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
  }, [folderMap, ensureResourceLinkFresh, isOpen, teamId]);

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

  const handleOverflowButtonDragOver = (event) => {
    if (!draggedResource) return;
    event.preventDefault();
    if (!isOverflowMenuOpen) {
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
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Project resources"
      >
        <FileText size={20} />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-[28rem] rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl"
        >
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Manage team resources</h3>
                <p className="text-xs text-gray-500">Files are organized by folder path.</p>
              </div>
            </div>
            {menuError && <p className="mt-2 text-xs text-red-600">{menuError}</p>}
            {!teamId && (
              <p className="mt-2 text-xs text-orangeFpt-500">
                You need an active team to access shared resources.
              </p>
            )}
            <div className="mt-3">
              <div className="relative">
                <div
                  ref={folderContainerRef}
                  className="flex flex-wrap gap-2 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 px-2 py-2"
                  style={{ maxHeight: FOLDER_CONTAINER_MAX_HEIGHT }}
                >
                  {visibleFolderKeys.map((folderKey) => (
                    <button
                      key={folderKey}
                      type="button"
                      onClick={() => {
                        setCurrentFolder(folderKey);
                        setIsOverflowMenuOpen(false);
                      }}
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
                      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition ${
                        currentFolder === folderKey
                          ? "border-orangeFpt-300 bg-orangeFpt-50 text-orangeFpt-600"
                          : dragOverFolder === folderKey
                            ? "border-orangeFpt-300 bg-orangeFpt-50 text-orangeFpt-600"
                            : "border-gray-200 text-gray-600 hover:border-orangeFpt-300"
                      }`}
                    >
                      <Folder className="h-3.5 w-3.5" />
                      <span>{formatFolderLabel(folderKey)}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
                        {folderMap?.[folderKey]?.length ?? 0}
                      </span>
                    </button>
                  ))}

                  {hasFolderOverflow && (
                    <button
                      type="button"
                      ref={overflowButtonRef}
                      onClick={() => setIsOverflowMenuOpen((prev) => !prev)}
                      onDragOver={handleOverflowButtonDragOver}
                      onDragEnter={handleOverflowButtonDragOver}
                      className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium transition ${
                        isOverflowMenuOpen
                          ? "border-orangeFpt-300 bg-orangeFpt-50 text-orangeFpt-600"
                          : "border-gray-200 text-gray-600 hover:border-orangeFpt-300"
                      }`}
                      aria-haspopup="menu"
                      aria-expanded={isOverflowMenuOpen}
                      aria-label="Show more folders"
                    >
                      <span className="text-base leading-none">&hellip;</span>
                    </button>
                  )}
                </div>

                <div
                  ref={folderMeasureRef}
                  className="pointer-events-none absolute left-0 top-0 -z-10 flex w-full flex-wrap gap-2 rounded-2xl border border-transparent px-2 py-2 opacity-0"
                  aria-hidden="true"
                >
                  {folderKeys.map((folderKey) => (
                    <div
                      key={`measure-${folderKey}`}
                      ref={(el) => {
                        if (el) {
                          folderRefs.current[folderKey] = el;
                        } else {
                          delete folderRefs.current[folderKey];
                        }
                      }}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                        currentFolder === folderKey
                          ? "border-orangeFpt-300 bg-orangeFpt-50 text-orangeFpt-600"
                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      <Folder className="h-3.5 w-3.5" />
                      <span>{formatFolderLabel(folderKey)}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
                        {folderMap?.[folderKey]?.length ?? 0}
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    ref={ellipsisMeasureRef}
                    className="pointer-events-none inline-flex items-center justify-center rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                    tabIndex={-1}
                  >
                    <span className="text-base leading-none">&hellip;</span>
                  </button>
                </div>

                {isOverflowMenuOpen && overflowFolderKeys.length > 0 && (
                  <div
                    ref={overflowMenuRef}
                    className="absolute right-0 top-full z-30 mt-3 w-64 rounded-2xl border border-gray-200 bg-white shadow-2xl"
                  >
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-xs font-semibold text-gray-900">More folders</p>
                      <p className="text-[11px] text-gray-500">Select any hidden folder to jump to it.</p>
                    </div>
                    <div className="max-h-72 overflow-y-auto py-2">
                      {overflowFolderKeys.map((folderKey) => (
                        <button
                          key={`overflow-${folderKey}`}
                          type="button"
                          onClick={() => {
                            setCurrentFolder(folderKey);
                            setIsOverflowMenuOpen(false);
                          }}
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
                          className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition ${
                            dragOverFolder === folderKey
                              ? "bg-orangeFpt-50 text-orangeFpt-600"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span className="truncate pr-3">{formatFolderLabel(folderKey)}</span>
                          <span className="text-xs text-gray-500">{folderMap?.[folderKey]?.length ?? 0} files</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto px-4 py-4">
            {isLoadingResources ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-900">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading resources...
              </div>
            ) : filesInFolder.length ? (
              <ul className="space-y-3">
                {filesInFolder.map((resource) => (
                  <li
                    key={resource.fileId}
                    draggable
                    onDragStart={() => handleDragStart(resource)}
                    onDragEnd={handleDragEnd}
                    className={`flex gap-3 rounded-xl border border-gray-200 bg-white hover:bg-orangeFpt-100 p-3 shadow-sm transition-opacity ${
                      draggedFileId === resource.fileId ? "opacity-70" : "opacity-100"
                    } ${movingFileId === resource.fileId ? "ring-2 ring-orange-300" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenResource(resource)}
                      className="flex flex-1 items-start gap-3 text-left"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orangeFpt-100 text-orangeFpt-500">
                        {openingFileId === resource.fileId ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-orangeFpt-500 max-w-[13rem]">
                            {resource.fileName}
                          </p>
                          <ChevronRight className="h-3 w-3 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500">
                            {formatFileSize(resource.fileSize)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Uploaded by {resource.userName ?? "Unknown"}
                          {resource.createdAtLabel ? ` • ${resource.createdAtLabel}` : ""}
                        </p>
                        {refreshingFileId === resource.fileId && (
                          <div className="inline-flex items-center gap-1 text-[11px] text-orangeFpt-300">
                            <Loader2 className="h-3 w-3 animate-spin" /> Refreshing link...
                          </div>
                        )}
                      </div>
                    </button>
                    <div className="flex flex-col justify-between">
                      <button
                        type="button"
                        onClick={() => handleDeleteResource(resource)}
                        disabled={deletingFileId === resource.fileId}
                        className="inline-flex items-center justify-center rounded-full border border-gray-200 p-2 text-red-400 hover:text-red-600 hover:border-red-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Delete file"
                      >
                        {deletingFileId === resource.fileId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-6 text-center text-sm text-gray-700">
                No files in this folder yet. Upload a file to get started.
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="space-y-3">
              <div>
                <label htmlFor="resource-folder" className="text-xs font-semibold text-gray-900">
                  Folder path (optional)
                </label>
                <input
                  id="resource-folder"
                  type="text"
                  value={pendingFolder}
                  onChange={(e) => setPendingFolder(e.target.value)}
                  placeholder="reports/week-1"
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-orangeFpt-400 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Leave empty for the general folder.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full border border-dashed border-orangeFpt-300 px-4 py-2 text-sm font-semibold text-orangeFpt-300 hover:bg-orangeFpt-100"
                >
                  <PlusCircle className="h-4 w-4" /> Select files
                </button>
                <span className="text-xs text-gray-300">{pendingFiles.length} file(s) selected</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileSelect}
                />
              </div>

              {pendingFiles.length > 0 && (
                <ul className="space-y-2 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700">
                  {pendingFiles.map((file, idx) => (
                    <li key={`${file.name}-${idx}`} className="flex items-center justify-between gap-2">
                      <span className="truncate max-w-[14rem]" title={file.name}>
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePendingFile(idx)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">Total files: {totalFiles}</span>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading || !pendingFiles.length}
                  className="inline-flex items-center gap-2 rounded-full bg-orangeFpt-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orangeFpt-600 disabled:cursor-not-allowed disabled:bg-orangeFpt-300"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {isUploading ? "Uploading..." : `Upload (${pendingFiles.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectResourcesMenu;
