import React from 'react';
import { CheckCircle, Clock, AlertCircle, Lock, Flag } from 'lucide-react';

export const getStatusColor = (status) => {
  switch (status) {
    case "completed": return "text-green-600 bg-green-50 border-green-200";
    case "in-progress": return "text-blue-600 bg-blue-50 border-blue-200";
    case "pending": return "text-gray-600 bg-gray-50 border-gray-200";
    case "locked": return "text-gray-400 bg-gray-100 border-gray-200";
    default: return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case "completed": return "CheckCircle";
    case "in-progress": return "Clock";
    case "pending": return "AlertCircle";
    case "locked": return "Lock";
    default: return "Flag";
  }
};

export const getDaysRemaining = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};