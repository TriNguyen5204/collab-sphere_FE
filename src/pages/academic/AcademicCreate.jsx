import React from "react";
import AcademicForm from "../../components/ui/AcademicForm";
import { useNavigate } from "react-router-dom";

export default function AcademicCreate() {
  const nav = useNavigate();

  async function handleSubmit(values) {
    const id = `sub_${Date.now()}`;
    const subject = { SubjectId: id, ...values };
    nav(`/academic/${id}`, { state: { created: true, subject } });
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-3">Create Subject</h1>
      <AcademicForm onSubmit={handleSubmit} onCancel={() => nav("/academic")} />
    </div>
  );
}
