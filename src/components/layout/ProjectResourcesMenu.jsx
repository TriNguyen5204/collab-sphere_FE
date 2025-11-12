import React, { useEffect, useMemo, useRef, useState } from "react";
import { FileText, PlusCircle } from "lucide-react";

const ProjectResourcesMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [resources, setResources] = useState([]);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const fileInputRef = useRef(null);

  const formatSize = useMemo(() => {
    return (bytes) => {
      if (!Number.isFinite(bytes)) return "0 B";
      const units = ["B", "KB", "MB", "GB"];
      const index = Math.min(units.length - 1, Math.floor(Math.log(bytes || 1) / Math.log(1024)));
      const value = bytes / Math.pow(1024, index);
      return `${value.toFixed(value >= 10 || value === 0 ? 0 : 1)} ${units[index]}`;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event) => {
      const menuEl = menuRef.current;
      const buttonEl = buttonRef.current;
      if (!menuEl || menuEl.contains(event.target)) return;
      if (buttonEl && buttonEl.contains(event.target)) return;
      setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const handleResourceUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setResources((prev) => ([
      ...prev,
      ...files.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
      })),
    ]));
    event.target.value = "";
  };

  const handleResourceRemove = (id) => {
    setResources((prev) => prev.filter((resource) => resource.id !== id));
  };

  const handleAddResourceClick = () => {
    fileInputRef.current?.click();
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
          className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl"
        >
          <div className="p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Manage team resources</h3>
            </div>
            <div className="max-h-64 overflow-y-auto pr-1">
              {resources.length ? (
                <ul className="space-y-3">
                  {resources.map((resource) => (
                    <li
                      key={resource.id}
                      className="flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{resource.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatSize(resource.size)} • {resource.uploadedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleResourceRemove(resource.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-md border border-dashed border-gray-200 p-4 text-sm text-gray-500 text-center">
                  No resources yet.
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <span className="text-xs text-gray-500">Total files: {resources.length}</span>
            <button
              type="button"
              onClick={handleAddResourceClick}
              className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              <PlusCircle className="h-4 w-4" />
              Add file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              onChange={handleResourceUpload}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectResourcesMenu;
