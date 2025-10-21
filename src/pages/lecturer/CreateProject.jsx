import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import styles from "./CreateProject.module.css";
import { createProject } from "../../services/projectApi";
import { getAllSubject } from "../../services/userService";

const PRIORITY_OPTIONS = [
  { label: "High impact", value: "HIGH" },
  { label: "Medium focus", value: "MEDIUM" },
  { label: "Foundational", value: "LOW" },
];

const UploadCloudIcon = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M24 8c-4.9 0-9.14 3.14-10.56 7.69A8.73 8.73 0 0 0 16.5 33.5h15.12a7.88 7.88 0 0 0 1.27-15.67C31.76 12.59 28.22 8 24 8Z"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 27.5V18"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.5 22.5 24 18l4.5 4.5"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.5 33.5H34"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const parseDateInput = (value) => {
  if (!value) {
    return null;
  }

  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  const [year, month, day] = parts;
  const parsed = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const generateId = () => Math.random().toString(36).slice(2, 10);

const createEmptyMilestone = () => ({
  id: generateId(),
  title: "",
  description: "",
  startDate: "",
  endDate: "",
});

const createEmptyObjective = () => ({
  id: generateId(),
  description: "",
  priority: "MEDIUM",
  milestones: [createEmptyMilestone()],
});

const normaliseSubjectList = (payload) => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

const CreateProject = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const lecturerId = useSelector((state) => state.user?.userId);

  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [subjectError, setSubjectError] = useState("");

  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [formState, setFormState] = useState({
    projectName: "",
    subjectId: "",
    description: "",
    objectives: [createEmptyObjective()],
  });

  const [formErrors, setFormErrors] = useState({});
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      setSubjectError("");

      try {
        const result = await getAllSubject();
        if (!isMounted) {
          return;
        }

        const list = normaliseSubjectList(result);
        setSubjects(list);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to load subjects for project creation.", error);
        setSubjects([]);
        setSubjectError("Unable to load subjects right now. Please try again.");
      } finally {
        if (isMounted) {
          setIsLoadingSubjects(false);
        }
      }
    };

    fetchSubjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
      }),
    []
  );

  // Used to compute the readiness score and checklist displayed in the sidebar.
  const readinessChecklist = useMemo(() => {
    const projectNameReady = Boolean(formState.projectName.trim());
    const subjectReady = Boolean(formState.subjectId);
    const descriptionReady = Boolean(formState.description.trim());

    const hasDescribedObjective = formState.objectives.some((objective) =>
      Boolean(objective.description.trim())
    );

    const milestonesValid = formState.objectives.every((objective) =>
      objective.milestones.length > 0 &&
      objective.milestones.every((milestone) => {
        if (!milestone.title.trim() || !milestone.startDate || !milestone.endDate) {
          return false;
        }

        return milestone.startDate <= milestone.endDate;
      })
    );

    return [
      { id: "projectName", label: "Project name added", complete: projectNameReady },
      { id: "subject", label: "Subject selected", complete: subjectReady },
      { id: "description", label: "Description drafted", complete: descriptionReady },
      {
        id: "objectives",
        label: "Learning objectives captured",
        complete: hasDescribedObjective,
      },
      {
        id: "milestones",
        label: "Milestones scheduled with dates",
        complete: milestonesValid,
      },
    ];
  }, [formState]);

  const readinessProgress = useMemo(() => {
    const total = readinessChecklist.length;
    if (!total) {
      return 0;
    }

    const completed = readinessChecklist.filter((item) => item.complete).length;
    return Math.round((completed / total) * 100);
  }, [readinessChecklist]);

  const readinessCounts = useMemo(() => {
    const total = readinessChecklist.length;
    const completed = readinessChecklist.filter((item) => item.complete).length;
    return { total, completed };
  }, [readinessChecklist]);

  const milestoneRange = useMemo(() => {
    const collected = formState.objectives
      .flatMap((objective) =>
        objective.milestones.map((milestone) => {
          const start = parseDateInput(milestone.startDate);
          const end = parseDateInput(milestone.endDate);

          if (!start || !end) {
            return null;
          }

          return { start, end };
        })
      )
      .filter(Boolean);

    if (!collected.length) {
      return null;
    }

    const initial = collected[0];
    return collected.reduce(
      (range, current) => ({
        start: current.start < range.start ? current.start : range.start,
        end: current.end > range.end ? current.end : range.end,
      }),
      { start: initial.start, end: initial.end }
    );
  }, [formState.objectives]);

  const milestoneRangeLabel = useMemo(() => {
    if (!milestoneRange) {
      return "";
    }

    const startYear = milestoneRange.start.getUTCFullYear();
    const endYear = milestoneRange.end.getUTCFullYear();
    const startLabel = dateFormatter.format(milestoneRange.start);
    const endLabel = dateFormatter.format(milestoneRange.end);

    if (milestoneRange.start.getTime() === milestoneRange.end.getTime()) {
      return `${startLabel} ${startYear}`;
    }

    if (startYear === endYear) {
      return `${startLabel} – ${endLabel} ${startYear}`;
    }

    return `${startLabel} ${startYear} – ${endLabel} ${endYear}`;
  }, [milestoneRange, dateFormatter]);

  // Surface contextual suggestions in the sidebar as the form is filled out.
  const dynamicInsights = useMemo(() => {
    const insights = [];

    if (!formState.projectName.trim()) {
      insights.push("Give your project a concise, action-oriented title to boost engagement.");
    }

    if (formState.description.trim().length && formState.description.trim().length < 120) {
      insights.push("Expand the description to include deliverables and assessment focus (aim for 2–3 sentences).");
    }

    if (!formState.description.trim()) {
      insights.push("Describe how this project supports the subject outcomes to help reviewers.");
    }

    const hasSupportingDocument = Boolean(uploadedFile);
    if (!hasSupportingDocument) {
      insights.push("Attach a supporting brief so AI assistance and reviewers have immediate context.");
    }

    const objectivesIncomplete = formState.objectives.some(
      (objective) => !objective.description.trim() || !objective.milestones.length
    );
    if (objectivesIncomplete) {
      insights.push("Ensure each objective includes a clear description and at least one milestone.");
    }

    const milestonesMissingDates = formState.objectives.some((objective) =>
      objective.milestones.some(
        (milestone) => !milestone.startDate || !milestone.endDate || milestone.startDate > milestone.endDate
      )
    );
    if (milestonesMissingDates) {
      insights.push("Set start and end dates to give students a tangible rhythm for delivery.");
    }

    if (milestoneRange && readinessProgress === 100) {
      insights.length = 0;
    }

    if (!insights.length) {
      return insights;
    }

    return insights.slice(0, 4);
  }, [formState, milestoneRange, readinessProgress, uploadedFile]);

  const totalMilestones = useMemo(
    () =>
      formState.objectives.reduce(
        (count, objective) => count + objective.milestones.length,
        0
      ),
    [formState.objectives]
  );

  const selectedSubject = useMemo(
    () =>
      subjects.find(
        (subject) => String(subject.subjectId) === String(formState.subjectId)
      ) ?? null,
    [subjects, formState.subjectId]
  );

  const hasMinimumData = useMemo(() => {
    if (!formState.projectName.trim() || !formState.description.trim() || !formState.subjectId) {
      return false;
    }

    return formState.objectives.every((objective) => {
      if (!objective.description.trim() || !objective.milestones.length) {
        return false;
      }

      return objective.milestones.every((milestone) => {
        if (!milestone.title.trim() || !milestone.startDate || !milestone.endDate) {
          return false;
        }

        return milestone.startDate <= milestone.endDate;
      });
    });
  }, [formState]);

  const handleBaseFieldChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleObjectiveChange = (objectiveId, key, value) => {
    setFormState((prev) => ({
      ...prev,
      objectives: prev.objectives.map((objective) =>
        objective.id === objectiveId ? { ...objective, [key]: value } : objective
      ),
    }));
  };

  const handleMilestoneChange = (objectiveId, milestoneId, key, value) => {
    setFormState((prev) => ({
      ...prev,
      objectives: prev.objectives.map((objective) => {
        if (objective.id !== objectiveId) {
          return objective;
        }

        return {
          ...objective,
          milestones: objective.milestones.map((milestone) =>
            milestone.id === milestoneId ? { ...milestone, [key]: value } : milestone
          ),
        };
      }),
    }));
  };

  const handleAddObjective = () => {
    setFormState((prev) => ({
      ...prev,
      objectives: [...prev.objectives, createEmptyObjective()],
    }));
  };

  const handleRemoveObjective = (objectiveId) => {
    setFormState((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((objective) => objective.id !== objectiveId),
    }));
  };

  const handleAddMilestone = (objectiveId) => {
    setFormState((prev) => ({
      ...prev,
      objectives: prev.objectives.map((objective) =>
        objective.id === objectiveId
          ? { ...objective, milestones: [...objective.milestones, createEmptyMilestone()] }
          : objective
      ),
    }));
  };

  const handleRemoveMilestone = (objectiveId, milestoneId) => {
    setFormState((prev) => ({
      ...prev,
      objectives: prev.objectives.map((objective) =>
        objective.id === objectiveId
          ? {
              ...objective,
              milestones: objective.milestones.filter(
                (milestone) => milestone.id !== milestoneId
              ),
            }
          : objective
      ),
    }));
  };

  const handleFileUpload = (file) => {
    if (!file) {
      return;
    }

    const allowed =
      file.type === "application/pdf" ||
      file.type.includes("document") ||
      file.type === "text/plain";

    if (!allowed) {
      alert("Please upload a PDF, Word document, or text file.");
      return;
    }

    setUploadedFile(file);
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];
    handleFileUpload(file);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files ?? []);
    handleFileUpload(files[0]);
  };

  const validateForm = () => {
    const errors = {};

    if (!formState.projectName.trim()) {
      errors.projectName = "Project name is required.";
    }

    if (!formState.description.trim()) {
      errors.description = "Please provide a project description.";
    }

    if (!formState.subjectId) {
      errors.subjectId = "Select a subject for this project.";
    } else if (Number.isNaN(Number(formState.subjectId))) {
      errors.subjectId = "Subject selection is invalid.";
    }

    const objectiveErrors = formState.objectives.reduce((accumulator, objective) => {
      const current = {};

      if (!objective.description.trim()) {
        current.description = "Objective description is required.";
      }

      if (!objective.milestones.length) {
        current.milestones = { general: "Add at least one milestone for this objective." };
      } else {
        const milestoneErrors = objective.milestones.reduce((milestoneAccumulator, milestone) => {
          const milestoneIssue = {};

          if (!milestone.title.trim()) {
            milestoneIssue.title = "Milestone title is required.";
          }
          if (!milestone.startDate) {
            milestoneIssue.startDate = "Provide a start date.";
          }
          if (!milestone.endDate) {
            milestoneIssue.endDate = "Provide an end date.";
          }
          if (milestone.startDate && milestone.endDate && milestone.startDate > milestone.endDate) {
            milestoneIssue.endDate = "End date must be on or after the start date.";
          }

          if (Object.keys(milestoneIssue).length > 0) {
            milestoneAccumulator[milestone.id] = milestoneIssue;
          }

          return milestoneAccumulator;
        }, {});

        if (Object.keys(milestoneErrors).length > 0) {
          current.milestones = milestoneErrors;
        }
      }

      if (Object.keys(current).length > 0) {
        accumulator[objective.id] = current;
      }

      return accumulator;
    }, {});

    if (Object.keys(objectiveErrors).length > 0) {
      errors.objectives = objectiveErrors;
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmissionError("");

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!lecturerId) {
      setSubmissionError("Your lecturer session has expired. Please sign in again.");
      return;
    }

    const lecturerIdentifier = Number.isNaN(Number(lecturerId)) ? lecturerId : Number(lecturerId);
    const subjectIdentifier = Number(formState.subjectId);

    if (Number.isNaN(subjectIdentifier)) {
      setSubmissionError("Subject selection is invalid.");
      return;
    }

    const payload = {
      projectName: formState.projectName.trim(),
      description: formState.description.trim(),
      lecturerId: lecturerIdentifier,
      subjectId: subjectIdentifier,
      objectives: formState.objectives.map((objective) => ({
        description: objective.description.trim(),
        priority: objective.priority,
        objectiveMilestones: objective.milestones.map((milestone) => ({
          title: milestone.title.trim(),
          description: milestone.description.trim(),
          startDate: milestone.startDate,
          endDate: milestone.endDate,
        })),
      })),
    };

    setIsSubmitting(true);

    try {
      await createProject(payload);
      alert("Project created successfully.");
      const nextRoute = classId
        ? `/lecturer/classes/${classId}/projects`
        : "/lecturer/projects";
      navigate(nextRoute);
    } catch (error) {
      console.error("Failed to create project.", error);
      const message =
        error?.response?.data?.message ?? "Unable to create the project. Please try again.";
      setSubmissionError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroNav}>
            {classId ? (
              <>
                <Link to="/lecturer/classes" className={styles.breadcrumbLink}>
                  Classes
                </Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <Link to={`/lecturer/classes/${classId}`} className={styles.breadcrumbLink}>
                  Class detail
                </Link>
                <span className={styles.breadcrumbSeparator}>/</span>
              </>
            ) : (
              <>
                <Link to="/lecturer/projects" className={styles.breadcrumbLink}>
                  Projects
                </Link>
                <span className={styles.breadcrumbSeparator}>/</span>
              </>
            )}
            <span className={styles.breadcrumbCurrent}>Create project</span>
          </div>

          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <p className={styles.eyebrow}>Lecturer workspace</p>
              <h1 className={styles.heroTitle}>Create a project manually</h1>
              <p className={styles.heroSubtitle}>
                Submit a project directly to the approval workflow. Uploading a supporting document is optional for now and
                will power AI assistance in a later update.
              </p>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.heroStatCard}>
                <span className={styles.heroStatLabel}>Objectives configured</span>
                <strong className={styles.heroStatValue}>{formState.objectives.length}</strong>
                <span className={styles.heroStatNote}>Each objective should capture a core learning goal.</span>
              </div>
              <div className={styles.heroStatCard}>
                <span className={styles.heroStatLabel}>Milestones planned</span>
                <strong className={styles.heroStatValue}>{totalMilestones}</strong>
                <span className={styles.heroStatNote}>Milestones become checkpoints for teams.</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <form className={styles.pageBody} onSubmit={handleSubmit} noValidate>
        <div className={styles.primaryColumn}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>1. Optional project brief</h2>
                <p className={styles.cardSubtitle}>
                  Attach a syllabus or requirements document if you have one. We will keep it ready for the upcoming AI
                  flow.
                </p>
              </div>
              {uploadedFile && (
                <button type="button" className={styles.cardAction} onClick={() => setUploadedFile(null)}>
                  Remove file
                </button>
              )}
            </div>

            <div
              className={`${styles.uploadDropzone} ${isDragOver ? styles.isDragOver : ""}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {uploadedFile ? (
                <div className={styles.fileSummary}>
                  <div className={styles.fileBadge}>Attached</div>
                  <div className={styles.fileMeta}>
                    <span className={styles.fileName}>{uploadedFile.name}</span>
                    <span className={styles.fileSize}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              ) : (
                <div className={styles.uploadVisual}>
                  <UploadCloudIcon className={styles.uploadIcon} />
                  <div className={styles.uploadText}>Drag & drop or browse to upload documentation</div>
                  <div className={styles.uploadHint}>Supported formats: PDF, DOCX, TXT</div>
                </div>
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className={styles.fileInput}
                onChange={handleFileInputChange}
              />
            </div>

            <p className={styles.uploadNotice}>Files will be linked to AI-assisted generation when it launches.</p>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>2. Project details</h2>
                <p className={styles.cardSubtitle}>These fields publish directly to the lecturer project workspace.</p>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="project-name">
                Project name
              </label>
              <input
                id="project-name"
                type="text"
                className={styles.input}
                placeholder="e.g. Collaborative AI research project"
                value={formState.projectName}
                onChange={(event) => handleBaseFieldChange("projectName", event.target.value)}
              />
              {formErrors.projectName && (
                <p className={styles.fieldError}>{formErrors.projectName}</p>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="subject-select">
                Subject
              </label>
              {isLoadingSubjects ? (
                <div className={styles.loadingMessage}>Loading subjects</div>
              ) : (
                <select
                  id="subject-select"
                  className={styles.select}
                  value={formState.subjectId}
                  onChange={(event) => handleBaseFieldChange("subjectId", event.target.value)}
                >
                  <option value="">Select subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.subjectId} value={subject.subjectId}>
                      {subject.subjectName}
                    </option>
                  ))}
                </select>
              )}
              {subjectError && <p className={styles.fieldError}>{subjectError}</p>}
              {formErrors.subjectId && (
                <p className={styles.fieldError}>{formErrors.subjectId}</p>
              )}
              {selectedSubject && !subjectError && (
                <div className={styles.subjectSummary}>
                  <div className={styles.subjectSummaryPrimary}>
                    <p className={styles.subjectSummaryName}>{selectedSubject.subjectName}</p>
                    <span className={styles.subjectSummaryCode}>
                      {selectedSubject.subjectCode ? `Code ${selectedSubject.subjectCode}` : 'Code unavailable'} · ID {selectedSubject.subjectId}
                    </span>
                  </div>
                  <div className={styles.subjectSummaryMeta}>
                    <span className={styles.subjectChip}>Subject ID {selectedSubject.subjectId}</span>
                    {selectedSubject.subjectCode && (
                      <span className={styles.subjectChip}>Code {selectedSubject.subjectCode}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="project-description">
                Description
              </label>
              <textarea
                id="project-description"
                className={styles.textarea}
                placeholder="Outline the project goals, deliverables, and expectations for students."
                rows={6}
                value={formState.description}
                onChange={(event) => handleBaseFieldChange("description", event.target.value)}
              />
              {formErrors.description && (
                <p className={styles.fieldError}>{formErrors.description}</p>
              )}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>3. Objectives and milestones</h2>
                <p className={styles.cardSubtitle}>
                  Define learning objectives and the milestones you expect teams to complete. These feed into class-level
                  planning.
                </p>
              </div>
            </div>

            <div className={styles.objectiveStack}>
              {formState.objectives.map((objective, index) => {
                const objectiveError = formErrors.objectives?.[objective.id] ?? {};
                const milestoneErrors = objectiveError.milestones ?? {};
                const milestoneBounds = objective.milestones.reduce(
                  (range, milestone) => {
                    const start = parseDateInput(milestone.startDate);
                    const end = parseDateInput(milestone.endDate);

                    if (!start || !end) {
                      return range;
                    }

                    return {
                      start: !range.start || start < range.start ? start : range.start,
                      end: !range.end || end > range.end ? end : range.end,
                    };
                  },
                  { start: null, end: null }
                );

                let milestoneWindowLabel = 'Add milestone dates';
                if (milestoneBounds.start && milestoneBounds.end) {
                  if (milestoneBounds.start.getTime() === milestoneBounds.end.getTime()) {
                    milestoneWindowLabel = dateFormatter.format(milestoneBounds.start);
                  } else {
                    milestoneWindowLabel = `${dateFormatter.format(milestoneBounds.start)} – ${dateFormatter.format(milestoneBounds.end)}`;
                  }
                }

                return (
                  <div key={objective.id} className={styles.objectiveSection}>
                    <div className={styles.objectiveHeader}>
                      <div>
                        <p className={styles.objectiveMeta}>Objective {index + 1}</p>
                        <h3 className={styles.objectiveTitle}>Learning objective</h3>
                      </div>
                      <button
                        type="button"
                        className={styles.secondaryAction}
                        onClick={() => handleRemoveObjective(objective.id)}
                        disabled={formState.objectives.length === 1}
                      >
                        Remove objective
                      </button>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor={`objective-description-${objective.id}`}>
                        Objective description
                      </label>
                      <textarea
                        id={`objective-description-${objective.id}`}
                        className={styles.textarea}
                        placeholder="Describe the outcome students should achieve."
                        rows={4}
                        value={objective.description}
                        onChange={(event) =>
                          handleObjectiveChange(objective.id, 'description', event.target.value)
                        }
                      />
                      {objectiveError.description && (
                        <p className={styles.fieldError}>{objectiveError.description}</p>
                      )}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor={`objective-priority-${objective.id}`}>
                        Priority
                      </label>
                      <select
                        id={`objective-priority-${objective.id}`}
                        className={styles.select}
                        value={objective.priority}
                        onChange={(event) =>
                          handleObjectiveChange(objective.id, 'priority', event.target.value)
                        }
                      >
                        {PRIORITY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.objectiveMetrics}>
                      <div className={styles.metricCard}>
                        <span className={styles.metricLabel}>Milestones configured</span>
                        <span className={styles.metricValue}>{objective.milestones.length}</span>
                      </div>
                      <div className={styles.metricCard}>
                        <span className={styles.metricLabel}>Timeline coverage</span>
                        <span className={styles.metricValue}>{milestoneWindowLabel}</span>
                      </div>
                    </div>

                    <div className={styles.milestoneTimeline}>
                      {objective.milestones.map((milestone, milestoneIndex) => {
                        const milestoneError = milestoneErrors[milestone.id] ?? {};

                        return (
                          <div key={milestone.id} className={styles.milestoneTimelineItem}>
                            <div className={styles.milestoneNode}>{milestoneIndex + 1}</div>
                            <div className={styles.milestoneCard}>
                              <div className={styles.milestoneHeader}>
                                <h4 className={styles.milestoneTitle}>Milestone {milestoneIndex + 1}</h4>
                                <button
                                  type="button"
                                  className={styles.secondaryAction}
                                  onClick={() => handleRemoveMilestone(objective.id, milestone.id)}
                                  disabled={objective.milestones.length === 1}
                                >
                                  Remove milestone
                                </button>
                              </div>

                              <div className={styles.fieldGroup}>
                                <label className={styles.label} htmlFor={`milestone-title-${milestone.id}`}>
                                  Milestone title
                                </label>
                                <input
                                  id={`milestone-title-${milestone.id}`}
                                  type="text"
                                  className={styles.input}
                                  placeholder="e.g. Draft requirements review"
                                  value={milestone.title}
                                  onChange={(event) =>
                                    handleMilestoneChange(
                                      objective.id,
                                      milestone.id,
                                      'title',
                                      event.target.value
                                    )
                                  }
                                />
                                {milestoneError.title && (
                                  <p className={styles.fieldError}>{milestoneError.title}</p>
                                )}
                              </div>

                              <div className={styles.fieldGroup}>
                                <label
                                  className={styles.label}
                                  htmlFor={`milestone-description-${milestone.id}`}
                                >
                                  Details (optional)
                                </label>
                                <textarea
                                  id={`milestone-description-${milestone.id}`}
                                  className={styles.textarea}
                                  placeholder="Add context or deliverables for this milestone."
                                  rows={3}
                                  value={milestone.description}
                                  onChange={(event) =>
                                    handleMilestoneChange(
                                      objective.id,
                                      milestone.id,
                                      'description',
                                      event.target.value
                                    )
                                  }
                                />
                              </div>

                              <div className={styles.milestoneDates}>
                                <div className={styles.fieldGroup}>
                                  <label className={styles.label} htmlFor={`milestone-start-${milestone.id}`}>
                                    Start date
                                  </label>
                                  <input
                                    id={`milestone-start-${milestone.id}`}
                                    type="date"
                                    className={styles.input}
                                    value={milestone.startDate}
                                    onChange={(event) =>
                                      handleMilestoneChange(
                                        objective.id,
                                        milestone.id,
                                        'startDate',
                                        event.target.value
                                      )
                                    }
                                  />
                                  {milestoneError.startDate && (
                                    <p className={styles.fieldError}>{milestoneError.startDate}</p>
                                  )}
                                </div>

                                <div className={styles.fieldGroup}>
                                  <label className={styles.label} htmlFor={`milestone-end-${milestone.id}`}>
                                    End date
                                  </label>
                                  <input
                                    id={`milestone-end-${milestone.id}`}
                                    type="date"
                                    className={styles.input}
                                    value={milestone.endDate}
                                    onChange={(event) =>
                                      handleMilestoneChange(
                                        objective.id,
                                        milestone.id,
                                        'endDate',
                                        event.target.value
                                      )
                                    }
                                  />
                                  {milestoneError.endDate && (
                                    <p className={styles.fieldError}>{milestoneError.endDate}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {objectiveError.milestones?.general && (
                      <p className={styles.fieldError}>{objectiveError.milestones.general}</p>
                    )}

                    <div className={styles.objectiveActions}>
                      <button
                        type="button"
                        className={styles.secondaryAction}
                        onClick={() => handleAddMilestone(objective.id)}
                      >
                        Add milestone
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.objectiveActions}>
              <button type="button" className={styles.secondaryAction} onClick={handleAddObjective}>
                Add another objective
              </button>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>4. Review and submit</h2>
              </div>
            </div>

            {submissionError && <div className={styles.formError}>{submissionError}</div>}

            <div className={styles.cardNote}>
              You can edit the project from the lecturer project library after submission if anything changes.
            </div>

            <div className={styles.reviewSummary}>
              <div className={styles.reviewSummaryItem}>
                <span className={styles.reviewSummaryLabel}>Subject</span>
                <span className={styles.reviewSummaryValue}>
                  {selectedSubject ? selectedSubject.subjectName : "Not selected"}
                </span>
              </div>
              <div className={styles.reviewSummaryItem}>
                <span className={styles.reviewSummaryLabel}>Objectives</span>
                <span className={styles.reviewSummaryValue}>{formState.objectives.length}</span>
              </div>
              <div className={styles.reviewSummaryItem}>
                <span className={styles.reviewSummaryLabel}>Milestones</span>
                <span className={styles.reviewSummaryValue}>{totalMilestones}</span>
              </div>
              <div className={styles.reviewSummaryItem}>
                <span className={styles.reviewSummaryLabel}>Readiness</span>
                <span className={styles.reviewSummaryValue}>{readinessProgress}%</span>
              </div>
            </div>

            {readinessProgress < 100 && (
              <div className={styles.reviewCallout}>
                <h4 className={styles.reviewCalloutTitle}>Almost there</h4>
                <p className={styles.reviewCalloutText}>
                  Complete the remaining {readinessCounts.total - readinessCounts.completed} checklist item
                  {readinessCounts.total - readinessCounts.completed !== 1 ? "s" : ""} to reach 100% before
                  submission.
                </p>
              </div>
            )}

            <div className={styles.submitRow}>
              <button type="submit" className={styles.primaryAction} disabled={isSubmitting || !hasMinimumData}>
                {isSubmitting ? "Creating project" : "Create project"}
              </button>
              <Link
                to={classId ? `/lecturer/classes/${classId}` : "/lecturer/projects"}
                className={styles.secondaryLink}
              >
                Cancel
              </Link>
            </div>
          </section>
        </div>

        <aside className={styles.secondaryColumn}>
          <section className={styles.panelCard}>
            <h3 className={styles.panelTitle}>Project snapshot</h3>
            <div className={styles.snapshotGrid}>
              <div className={styles.snapshotItem}>
                <span className={styles.snapshotLabel}>Subject</span>
                <span className={styles.snapshotValue}>
                  {selectedSubject ? selectedSubject.subjectName : "No subject selected"}
                </span>
              </div>
              <div className={styles.snapshotItem}>
                <span className={styles.snapshotLabel}>Objectives</span>
                <span className={styles.snapshotValue}>{formState.objectives.length}</span>
              </div>
              <div className={styles.snapshotItem}>
                <span className={styles.snapshotLabel}>Milestones</span>
                <span className={styles.snapshotValue}>{totalMilestones}</span>
              </div>
              <div className={styles.snapshotItem}>
                <span className={styles.snapshotLabel}>Linked file</span>
                <span className={styles.snapshotValue}>
                  {uploadedFile ? uploadedFile.name : "No file uploaded"}
                </span>
              </div>
              {classId && (
                <div className={styles.snapshotItem}>
                  <span className={styles.snapshotLabel}>Class context</span>
                  <span className={styles.snapshotValue}>Class ID {classId}</span>
                </div>
              )}
            </div>
          </section>

          <section className={styles.panelCard}>
            <div className={styles.progressHeader}>
              <h3 className={styles.panelTitle}>Submission readiness</h3>
              <span className={styles.progressValue}>{readinessProgress}%</span>
            </div>
            <span className={styles.progressMeta}>
              {readinessCounts.completed}/{readinessCounts.total} checks complete
            </span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${readinessProgress}%` }} />
            </div>
            <ul className={styles.checklist}>
              {readinessChecklist.map((item, index) => (
                <li
                  key={item.id}
                  className={`${styles.checkItem} ${item.complete ? styles.checkComplete : styles.checkPending}`}
                >
                  <span className={styles.checkIndicator}>{item.complete ? "✓" : index + 1}</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            {milestoneRange && milestoneRangeLabel && (
              <div className={styles.durationBadge}>
                <span>Timeline coverage</span>
                <strong>{milestoneRangeLabel}</strong>
              </div>
            )}
          </section>
        </aside>
      </form>
    </div>
  );
};

export default CreateProject;
