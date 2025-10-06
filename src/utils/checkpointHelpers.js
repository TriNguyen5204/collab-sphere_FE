import React from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Archive, 
  File,
  CheckCircle,
  Clock,
  AlertCircle,
  CheckSquare
} from 'lucide-react';

export const getStatusColor = (status) => {
  switch (status) {
    case "completed": return "text-green-600 bg-green-50 border-green-200";
    case "in-progress": return "text-blue-600 bg-blue-50 border-blue-200";
    case "pending": return "text-gray-600 bg-gray-50 border-gray-200";
    case "overdue": return "text-red-600 bg-red-50 border-red-200";
    default: return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case "completed": return "CheckCircle";
    case "in-progress": return "Clock";
    case "pending": return "AlertCircle";
    case "overdue": return "AlertCircle";
    default: return "CheckSquare";
  }
};

export const getFileIcon = (fileType) => {
  const type = fileType.toLowerCase();
  if (type.match(/pdf/)) return { name: "FileText", color: "text-red-500" };
  if (type.match(/doc|docx/)) return { name: "FileText", color: "text-blue-500" };
  if (type.match(/xls|xlsx/)) return { name: "FileText", color: "text-green-500" };
  if (type.match(/png|jpg|jpeg|gif/)) return { name: "Image", color: "text-purple-500" };
  if (type.match(/mp4|avi|mov/)) return { name: "Video", color: "text-orange-500" };
  if (type.match(/zip|rar/)) return { name: "Archive", color: "text-yellow-500" };
  return { name: "File", color: "text-gray-500" };
};

export const getDaysRemaining = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};