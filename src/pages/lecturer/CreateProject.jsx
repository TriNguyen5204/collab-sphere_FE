import React, { useState, useMemo, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './CreateProject.module.css';

const SUBJECT_OPTIONS = [
  'Software Engineering',
  'Computer Science',
  'Information Technology',
  'Data Science',
  'Cybersecurity',
  'Web Development',
  'Mobile Development',
  'Machine Learning'
];

const CLASS_OPTIONS = [
  { id: 1, name: 'SE301 - Advanced Software Engineering', students: 45 },
  { id: 2, name: 'CS401 - Algorithms and Data Structures', students: 38 },
  { id: 3, name: 'IT302 - Database Systems', students: 42 },
  { id: 4, name: 'DS201 - Introduction to Data Science', students: 35 }
];

const TECH_STACK_OPTIONS = [
  'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'MongoDB',
  'PostgreSQL', 'MySQL', 'Python', 'Django', 'Flask', 'Java',
  'Spring Boot', 'C#', '.NET', 'PHP', 'Laravel', 'TypeScript',
  'JavaScript', 'HTML5', 'CSS3', 'Bootstrap', 'Tailwind CSS'
];

const PROCESSING_STEPS = [
  'Document analysis',
  'Milestone design',
  'Checkpoint mapping'
];

const PROCESSING_MESSAGES = [
  'Scanning requirements document...',
  'Extracting primary objectives...',
  'Mapping deliverables and constraints...',
  'Designing milestone structure...',
  'Drafting checkpoint backlog...',
  'Estimating timeline and workload...',
  'Polishing the AI blueprint...'
];

const CreateProject = () => {
  const { classId } = useParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAIResults, setShowAIResults] = useState(false);
  const [learningObjectiveInput, setLearningObjectiveInput] = useState('');

  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    subject: '',
    selectedClass: classId || '',
    difficulty: 'Intermediate',
    duration: { value: 8, unit: 'weeks' },
    teamSize: { min: 3, max: 5 },
    techStack: [],
    learningObjectives: []
  });

  const [aiResults, setAiResults] = useState({
    extractedRequirements: [],
    learningOutcomes: [],
    milestones: [],
    estimatedDuration: ''
  });

  const selectedClassMeta = useMemo(() => {
    if (!formData.selectedClass) {
      return null;
    }
    return CLASS_OPTIONS.find((cls) => String(cls.id) === String(formData.selectedClass)) || null;
  }, [formData.selectedClass]);

  const readinessScore = useMemo(() => {
    let score = 20;
    if (uploadedFile) {
      score += 25;
    }
    if (formData.description.trim().length > 120) {
      score += 20;
    }
    score += Math.min(20, formData.learningObjectives.length * 5);
    score += Math.min(15, formData.techStack.length * 3);
    if (formData.subject && formData.selectedClass) {
      score += 10;
    }
    return Math.min(100, score);
  }, [uploadedFile, formData.description, formData.learningObjectives.length, formData.techStack.length, formData.subject, formData.selectedClass]);

  const canGenerateStructure = useMemo(() => {
    const hasName = formData.projectName.trim().length >= 3;
    const hasContext = Boolean(uploadedFile) || formData.description.trim().length >= 60;
    return hasName && hasContext;
  }, [formData.projectName, formData.description, uploadedFile]);

  const processingStageIndex = useMemo(() => {
    if (!isProcessing) {
      return -1;
    }
    return Math.min(PROCESSING_STEPS.length - 1, Math.floor(processingStep / 2));
  }, [isProcessing, processingStep]);

  const checklistItems = useMemo(() => ([
    {
      label: 'Requirement document uploaded',
      complete: Boolean(uploadedFile)
    },
    {
      label: 'Project name defined',
      complete: formData.projectName.trim().length >= 3
    },
    {
      label: 'Subject and class selected',
      complete: Boolean(formData.subject && formData.selectedClass)
    },
    {
      label: 'Project description drafted',
      complete: formData.description.trim().length >= 60
    },
    {
      label: 'Preferred tech stack identified',
      complete: formData.techStack.length > 0
    }
  ]), [uploadedFile, formData.projectName, formData.subject, formData.selectedClass, formData.description, formData.techStack.length]);

  const handleDragEnter = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = useCallback((file) => {
    if (file && (file.type === 'application/pdf' || file.type.includes('document') || file.type === 'text/plain')) {
      setUploadedFile(file);
      return;
    }
    alert('Please upload a PDF, Word document, or text file');
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleTechStackToggle = useCallback((tech) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter((item) => item !== tech)
        : [...prev.techStack, tech]
    }));
  }, []);

  const handleLearningObjectiveAdd = useCallback(() => {
    const value = learningObjectiveInput.trim();
    if (!value) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, value]
    }));
    setLearningObjectiveInput('');
  }, [learningObjectiveInput]);

  const handleLearningObjectiveRemove = useCallback((objective) => {
    setFormData((prev) => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((item) => item !== objective)
    }));
  }, []);

  const handleLearningObjectiveKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleLearningObjectiveAdd();
    }
  }, [handleLearningObjectiveAdd]);

  const generateProjectStructure = useCallback(async () => {
    if (!canGenerateStructure || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setProcessingStep(0);
    setShowAIResults(false);

    for (let index = 0; index < PROCESSING_MESSAGES.length; index += 1) {
      setProcessingStep(index);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    const mockResults = {
      extractedRequirements: [
        'Build an authenticated collaboration workspace with role-based access',
        'Expose RESTful APIs for milestone, checkpoint, and submission management',
        'Design a responsive UI with analytics for lecturers and students',
        'Implement database schemas to track teams, submissions, and evaluations',
        'Automate status notifications and progress reminders',
        'Prepare deployment-ready documentation and CI/CD workflow'
      ],
      learningOutcomes: [
        'Plan a full-stack project that aligns with academic outcomes',
        'Apply secure authentication and authorization strategies',
        'Coordinate team collaboration and workload distribution',
        'Translate requirements into milestones and checkpoints',
        'Evaluate project progress using analytics and reporting'
      ],
      milestones: [
        {
          id: 1,
          title: 'Discovery & Project Blueprint',
          duration: 'Week 1',
          checkpoints: [
            'Kick-off meeting and requirement clarification',
            'Define success metrics and deliverable scope',
            'Confirm technology stack and integration constraints',
            'Publish project timeline to the class workspace'
          ]
        },
        {
          id: 2,
          title: 'Core Platform Architecture',
          duration: 'Weeks 2-4',
          checkpoints: [
            'Finalize database schema and seed initial data',
            'Implement authentication and lecturer dashboards',
            'Develop project management APIs and testing harness',
            'Ship walkthrough documentation for student onboarding'
          ]
        },
        {
          id: 3,
          title: 'Collaboration & Analytics Layer',
          duration: 'Weeks 5-6',
          checkpoints: [
            'Build chat, notification, and file-sharing workflows',
            'Introduce analytics dashboards for lecturers',
            'Connect AI milestone recommendations to checkpoints',
            'Conduct mid-project usability review with stakeholders'
          ]
        },
        {
          id: 4,
          title: 'Testing, Evaluation & Launch',
          duration: 'Weeks 7-8',
          checkpoints: [
            'Run quality assurance and accessibility passes',
            'Collect peer and lecturer evaluation feedback',
            'Optimize performance for real-time collaboration',
            'Publish release notes and deployment package'
          ]
        }
      ],
      estimatedDuration: '8 weeks'
    };

    setAiResults(mockResults);
    setIsProcessing(false);
    setShowAIResults(true);
  }, [canGenerateStructure, isProcessing]);

  const regenerateStructure = useCallback(() => {
    generateProjectStructure();
  }, [generateProjectStructure]);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroNav}>
            <Link to="/lecturer/classes" className={styles.breadcrumbLink}>
              Classes
            </Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            {classId && (
              <>
                <Link to={`/lecturer/classes/${classId}`} className={styles.breadcrumbLink}>
                  Class detail
                </Link>
                <span className={styles.breadcrumbSeparator}>/</span>
              </>
            )}
            <span className={styles.breadcrumbCurrent}>Create project</span>
          </div>

          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <p className={styles.eyebrow}>Lecturer workspace</p>
              <h1 className={styles.heroTitle}>Launch a collaborative project experience</h1>
              <p className={styles.heroSubtitle}>
                Combine your curated brief with AI assistance to publish a ready-to-run project for your class. We
                surface key requirements, learning outcomes, and milestone plans in a single flow.
              </p>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.heroStatCard}>
                <span className={styles.heroStatLabel}>AI assistant</span>
                <strong className={styles.heroStatValue}>
                  {showAIResults ? 'Blueprint ready' : isProcessing ? 'Analyzing…' : 'Standing by'}
                </strong>
                <span className={styles.heroStatNote}>Structure generates once inputs are complete</span>
              </div>
              <div className={styles.heroStatCard}>
                <span className={styles.heroStatLabel}>Readiness score</span>
                <strong className={styles.heroStatValue}>{readinessScore}%</strong>
                <span className={styles.heroStatNote}>Auto-updates as you enrich project details</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.pageBody}>
        <div className={styles.primaryColumn}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>1. Upload project requirements</h2>
                <p className={styles.cardSubtitle}>
                  Drop a syllabus, requirement brief, or project charter to give the AI a head start.
                </p>
              </div>
              {uploadedFile && (
                <button type="button" className={styles.cardAction} onClick={() => setUploadedFile(null)}>
                  Remove file
                </button>
              )}
            </div>

            <div
              className={`${styles.uploadDropzone} ${isDragOver ? styles.isDragOver : ''}`}
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
                  <div className={styles.uploadIcon}>📄</div>
                  <div className={styles.uploadText}>Drag &amp; drop or browse to upload project documentation</div>
                  <div className={styles.uploadHint}>Supported formats: PDF, DOCX, TXT</div>
                </div>
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className={styles.fileInput}
                onChange={(event) => handleFileUpload(event.target.files?.[0])}
              />
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>2. Outline the project essentials</h2>
                <p className={styles.cardSubtitle}>
                  These details personalise the project blueprint for your chosen cohort.
                </p>
              </div>
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="project-name">Project name</label>
                <input
                  id="project-name"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. AI-augmented project management suite"
                  value={formData.projectName}
                  onChange={(event) => handleInputChange('projectName', event.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="subject-select">Subject or course</label>
                <select
                  id="subject-select"
                  className={styles.select}
                  value={formData.subject}
                  onChange={(event) => handleInputChange('subject', event.target.value)}
                >
                  <option value="">Select subject…</option>
                  {SUBJECT_OPTIONS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="class-select">Assign to class</label>
                <select
                  id="class-select"
                  className={styles.select}
                  value={formData.selectedClass}
                  onChange={(event) => handleInputChange('selectedClass', event.target.value)}
                >
                  <option value="">Select class…</option>
                  {CLASS_OPTIONS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.students} students)
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.label}>Difficulty level</span>
                <div className={styles.difficultyPills}>
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`${styles.pill} ${formData.difficulty === level ? styles.pillActive : ''}`}
                      onClick={() => handleInputChange('difficulty', level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="project-description">Project description</label>
              <textarea
                id="project-description"
                className={styles.textarea}
                placeholder="Describe the narrative, deliverables, and expectations students should meet. Include any contextual notes for the AI assistant."
                rows={6}
                value={formData.description}
                onChange={(event) => handleInputChange('description', event.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="learning-objectives">Learning objectives</label>
              <div className={styles.objectiveInputRow}>
                <input
                  id="learning-objectives"
                  type="text"
                  className={styles.objectiveInput}
                  placeholder="Press Enter to add objectives (e.g. Collaborate using agile rituals)"
                  value={learningObjectiveInput}
                  onChange={(event) => setLearningObjectiveInput(event.target.value)}
                  onKeyDown={handleLearningObjectiveKeyDown}
                />
                <button
                  type="button"
                  className={styles.secondaryAction}
                  onClick={handleLearningObjectiveAdd}
                  disabled={!learningObjectiveInput.trim()}
                >
                  Add
                </button>
              </div>
              {formData.learningObjectives.length > 0 && (
                <div className={styles.objectiveTags}>
                  {formData.learningObjectives.map((objective) => (
                    <span key={objective} className={styles.objectiveTag}>
                      {objective}
                      <button
                        type="button"
                        className={styles.tagRemove}
                        onClick={() => handleLearningObjectiveRemove(objective)}
                        aria-label="Remove objective"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>3. Configure cohort delivery</h2>
                <p className={styles.cardSubtitle}>
                  Fine-tune the timeline and team composition that the AI uses in its recommendations.
                </p>
              </div>
            </div>

            <div className={styles.configGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="duration-value">Estimated duration</label>
                <div className={styles.durationRow}>
                  <input
                    id="duration-value"
                    type="number"
                    min="1"
                    max="52"
                    className={styles.numberInput}
                    value={formData.duration.value}
                    onChange={(event) => handleInputChange('duration', {
                      ...formData.duration,
                      value: Number(event.target.value) || 1
                    })}
                  />
                  <select
                    className={styles.select}
                    value={formData.duration.unit}
                    onChange={(event) => handleInputChange('duration', {
                      ...formData.duration,
                      unit: event.target.value
                    })}
                  >
                    <option value="weeks">weeks</option>
                    <option value="months">months</option>
                  </select>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Team size range</label>
                <div className={styles.teamSizeRow}>
                  <div className={styles.teamSizeField}>
                    <span className={styles.teamSizeLabel}>Min</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className={styles.numberInput}
                      value={formData.teamSize.min}
                      onChange={(event) => handleInputChange('teamSize', {
                        ...formData.teamSize,
                        min: Number(event.target.value) || 1
                      })}
                    />
                  </div>
                  <div className={styles.teamSizeField}>
                    <span className={styles.teamSizeLabel}>Max</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className={styles.numberInput}
                      value={formData.teamSize.max}
                      onChange={(event) => handleInputChange('teamSize', {
                        ...formData.teamSize,
                        max: Number(event.target.value) || 1
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>4. Preferred technology stack</h2>
                <p className={styles.cardSubtitle}>
                  Highlight tools you expect teams to use. The AI includes them in learning outcomes and checkpoints.
                </p>
              </div>
              {formData.techStack.length > 0 && (
                <span className={styles.techCount}>{formData.techStack.length} selected</span>
              )}
            </div>
            <div className={styles.techGrid}>
              {TECH_STACK_OPTIONS.map((tech) => {
                const active = formData.techStack.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    className={`${styles.techChip} ${active ? styles.techChipActive : ''}`}
                    onClick={() => handleTechStackToggle(tech)}
                  >
                    {tech}
                  </button>
                );
              })}
            </div>
          </section>

          <section className={`${styles.card} ${styles.accentCard}`}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Generate AI blueprint</h2>
                <p className={styles.cardSubtitle}>
                  We will translate the uploaded brief and manual inputs into milestones, checkpoints, and learning outcomes.
                </p>
              </div>
            </div>
            <div className={styles.accentBody}>
              <div className={styles.cardNote}>
                {canGenerateStructure
                  ? 'All set. Launch the generator whenever you are ready.'
                  : 'Add a project name and either upload a document or provide a detailed description to activate the generator.'}
              </div>
              <button
                type="button"
                className={styles.primaryAction}
                onClick={generateProjectStructure}
                disabled={!canGenerateStructure || isProcessing}
              >
                {isProcessing ? 'Processing AI blueprint…' : 'Generate project structure'}
              </button>
            </div>
          </section>

          {isProcessing && (
            <section className={`${styles.card} ${styles.processingCard}`}>
              <div className={styles.processingHeader}>
                <div>
                  <h2 className={styles.cardTitle}>AI is analysing your inputs</h2>
                  <p className={styles.cardSubtitle}>We are combining the requirement document and manual details.</p>
                </div>
                <span className={styles.processingStatus}>Step {processingStep + 1} of {PROCESSING_MESSAGES.length}</span>
              </div>

              <div className={styles.processingSteps}>
                {PROCESSING_STEPS.map((step, index) => {
                  const isActive = index === processingStageIndex;
                  const isComplete = index < processingStageIndex;
                  return (
                    <div
                      key={step}
                      className={`${styles.processingStep} ${isActive ? styles.stageActive : ''} ${isComplete ? styles.stageComplete : ''}`}
                    >
                      <span className={styles.stageNumber}>{isComplete ? '✓' : index + 1}</span>
                      <span className={styles.stageLabel}>{step}</span>
                    </div>
                  );
                })}
              </div>

              <div className={styles.progressMessage}>{PROCESSING_MESSAGES[processingStep] || 'Processing…'}</div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${((processingStep + 1) / PROCESSING_MESSAGES.length) * 100}%` }}
                />
              </div>
            </section>
          )}

          {showAIResults && (
            <section className={`${styles.card} ${styles.aiCard}`}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>AI-generated milestone plan</h2>
                  <p className={styles.cardSubtitle}>
                    Review the structure, tweak as needed, then publish to your class workspace.
                  </p>
                </div>
                <button type="button" className={styles.secondaryAction} onClick={regenerateStructure}>
                  Regenerate
                </button>
              </div>

              <div className={styles.milestones}>
                {aiResults.milestones.map((milestone, index) => (
                  <article key={milestone.id} className={styles.milestone}>
                    <div className={styles.milestoneHeader}>
                      <span className={styles.milestoneIndex}>{index + 1}</span>
                      <div>
                        <h3 className={styles.milestoneTitle}>{milestone.title}</h3>
                        <span className={styles.milestoneDuration}>{milestone.duration}</span>
                      </div>
                    </div>
                    <ul className={styles.checkpointList}>
                      {milestone.checkpoints.map((checkpoint) => (
                        <li key={checkpoint} className={styles.checkpointItem}>
                          {checkpoint}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>

              <div className={styles.actionRow}>
                <button type="button" className={styles.primaryAction}>
                  Create project
                </button>
                <button type="button" className={styles.secondaryAction}>
                  Save as template
                </button>
              </div>
            </section>
          )}
        </div>

        <aside className={styles.secondaryColumn}>
          <section className={styles.panelCard}>
            <h3 className={styles.panelTitle}>Project snapshot</h3>
            <div className={styles.snapshotGrid}>
              <div className={styles.snapshotItem}>
                <span className={styles.snapshotLabel}>Subject</span>
                <span className={styles.snapshotValue}>{formData.subject || 'Not selected yet'}</span>
              </div>
              <div className={styles.snapshotItem}>
                <span className={styles.snapshotLabel}>Assigned class</span>
                <span className={styles.snapshotValue}>
                  {selectedClassMeta ? `${selectedClassMeta.name}` : 'Not assigned yet'}
                </span>
              </div>
              <div className={styles.snapshotItem}>
                <span className={styles.snapshotLabel}>Team size</span>
                <span className={styles.snapshotValue}>
                  {formData.teamSize.min} - {formData.teamSize.max} members
                </span>
              </div>
              <div className={styles.snapshotItem}>
                <span className={styles.snapshotLabel}>Difficulty</span>
                <span className={styles.snapshotValue}>{formData.difficulty}</span>
              </div>
              <div className={styles.snapshotItem}>
                <span className={styles.snapshotLabel}>Duration</span>
                <span className={styles.snapshotValue}>
                  {showAIResults ? aiResults.estimatedDuration : `${formData.duration.value} ${formData.duration.unit}`}
                </span>
              </div>
              <div className={styles.snapshotItem}>
                <span className={styles.snapshotLabel}>Tech preferences</span>
                <span className={styles.snapshotValue}>
                  {formData.techStack.length > 0 ? formData.techStack.join(', ') : 'None selected'}
                </span>
              </div>
            </div>
          </section>

          <section className={styles.panelCard}>
            <h3 className={styles.panelTitle}>Submission checklist</h3>
            <ul className={styles.checklist}>
              {checklistItems.map((item) => (
                <li key={item.label} className={`${styles.checkItem} ${item.complete ? styles.checkComplete : styles.checkPending}`}>
                  <span className={styles.checkIndicator}>{item.complete ? '✓' : '•'}</span>
                  {item.label}
                </li>
              ))}
            </ul>
          </section>

          {showAIResults ? (
            <section className={styles.panelCard}>
              <h3 className={styles.panelTitle}>AI insights</h3>
              <div className={styles.insightsSection}>
                <span className={styles.insightsTitle}>Extracted requirements</span>
                <ul className={styles.insightsList}>
                  {aiResults.extractedRequirements.map((item) => (
                    <li key={item} className={styles.insightItem}>
                      <span className={styles.insightBullet}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.insightsSection}>
                <span className={styles.insightsTitle}>Learning outcomes</span>
                <ul className={styles.insightsList}>
                  {aiResults.learningOutcomes.map((item) => (
                    <li key={item} className={styles.insightItem}>
                      <span className={styles.insightBullet}>🎯</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.durationBadge}>
                <span>Total duration</span>
                <strong>{aiResults.estimatedDuration}</strong>
              </div>
            </section>
          ) : (
            <section className={styles.panelCard}>
              <h3 className={styles.panelTitle}>Tips for stronger AI output</h3>
              <div className={styles.emptyState}>
                <h4 className={styles.emptyTitle}>Help the AI understand your intent</h4>
                <p className={styles.emptyText}>
                  Attach a requirement document and include at least three learning objectives. The assistant will
                  generate richer milestones and checkpoint descriptions tailored to your class.
                </p>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

export default CreateProject;