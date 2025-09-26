import React, { useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './CreateProject.module.css';

const CreateProject = () => {
  const { classId } = useParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAIResults, setShowAIResults] = useState(false);
  
  // Form state
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

  // AI Processing results
  const [aiResults, setAiResults] = useState({
    extractedRequirements: [],
    learningOutcomes: [],
    milestones: [],
    estimatedDuration: ''
  });

  // Sample data
  const subjects = [
    'Software Engineering',
    'Computer Science',
    'Information Technology',
    'Data Science',
    'Cybersecurity',
    'Web Development',
    'Mobile Development',
    'Machine Learning'
  ];

  const classes = [
    { id: 1, name: 'SE301 - Advanced Software Engineering', students: 45 },
    { id: 2, name: 'CS401 - Algorithms and Data Structures', students: 38 },
    { id: 3, name: 'IT302 - Database Systems', students: 42 },
    { id: 4, name: 'DS201 - Introduction to Data Science', students: 35 }
  ];

  const techStackOptions = [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'MongoDB', 
    'PostgreSQL', 'MySQL', 'Python', 'Django', 'Flask', 'Java', 
    'Spring Boot', 'C#', '.NET', 'PHP', 'Laravel', 'TypeScript', 
    'JavaScript', 'HTML5', 'CSS3', 'Bootstrap', 'Tailwind CSS'
  ];

  const processingSteps = [
    'Document Analysis',
    'Milestone Creation', 
    'Checkpoint Generation'
  ];

  const processingMessages = [
    'Analyzing requirements...',
    'Extracting learning objectives...',
    'Identifying key deliverables...',
    'Creating milestone structure...',
    'Generating checkpoints...',
    'Estimating time requirements...',
    'Finalizing project structure...'
  ];

  // File upload handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = (file) => {
    if (file && (file.type === 'application/pdf' || file.type.includes('document') || file.type === 'text/plain')) {
      setUploadedFile(file);
    } else {
      alert('Please upload a PDF, Word document, or text file');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTechStackToggle = (tech) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech) 
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  // AI Processing simulation
  const generateProjectStructure = async () => {
    setIsProcessing(true);
    setProcessingStep(0);
    setShowAIResults(false);

    // Simulate AI processing with realistic delays
    for (let i = 0; i < processingMessages.length; i++) {
      setProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Simulate AI results
    const mockResults = {
      extractedRequirements: [
        'User authentication and authorization system',
        'RESTful API development with proper endpoints',
        'Responsive frontend interface',
        'Database design and implementation',
        'Testing and validation procedures',
        'Documentation and deployment'
      ],
      learningOutcomes: [
        'Understand full-stack development principles',
        'Implement secure user authentication',
        'Design and develop RESTful APIs',
        'Create responsive user interfaces',
        'Apply database design principles',
        'Practice collaborative development workflows'
      ],
      milestones: [
        {
          id: 1,
          title: 'Project Setup & Planning',
          duration: '1 week',
          checkpoints: [
            'Repository setup and team organization',
            'Requirements analysis and documentation',
            'Technology stack finalization',
            'Project timeline creation'
          ]
        },
        {
          id: 2,
          title: 'Backend Development',
          duration: '3 weeks',
          checkpoints: [
            'Database schema design and implementation',
            'User authentication system',
            'Core API endpoints development',
            'API testing and documentation'
          ]
        },
        {
          id: 3,
          title: 'Frontend Development',
          duration: '3 weeks',
          checkpoints: [
            'UI/UX design and wireframing',
            'Component development',
            'API integration',
            'Responsive design implementation'
          ]
        },
        {
          id: 4,
          title: 'Testing & Deployment',
          duration: '1 week',
          checkpoints: [
            'Unit and integration testing',
            'User acceptance testing',
            'Performance optimization',
            'Production deployment'
          ]
        }
      ],
      estimatedDuration: '8 weeks'
    };

    setAiResults(mockResults);
    setIsProcessing(false);
    setShowAIResults(true);
  };

  const regenerateStructure = () => {
    generateProjectStructure();
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link to="/lecturer/classes" className={styles.breadcrumbLink}>Classes</Link>
          <span className={styles.breadcrumbSeparator}>→</span>
          {classId && (
            <>
              <Link to={`/lecturer/classes/${classId}`} className={styles.breadcrumbLink}>Class Details</Link>
              <span className={styles.breadcrumbSeparator}>→</span>
            </>
          )}
          <span className={styles.breadcrumbCurrent}>Create New Project</span>
        </div>
        
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Create New Project</h1>
          <p className={styles.subtitle}>
            Upload project requirements or manually create a new collaborative project for your students
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.mainContent}>
          {/* File Upload Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Project Requirements Document</h2>
            <div 
              className={`${styles.uploadArea} ${isDragOver ? styles.dragOver : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {uploadedFile ? (
                <div className={styles.uploadedFile}>
                  <div className={styles.fileIcon}>📄</div>
                  <div className={styles.fileInfo}>
                    <div className={styles.fileName}>{uploadedFile.name}</div>
                    <div className={styles.fileSize}>
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <button 
                    className={styles.removeFile}
                    onClick={() => setUploadedFile(null)}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.uploadIcon}>📁</div>
                  <div className={styles.uploadText}>
                    <p>Drag and drop your project requirements document here</p>
                    <p className={styles.uploadSubtext}>
                      Supports PDF, Word documents, and text files
                    </p>
                  </div>
                  <input
                    type="file"
                    className={styles.fileInput}
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                  />
                  <button className={styles.uploadButton}>
                    Choose File
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Manual Input Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Project Details</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Project Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter project name..."
                  value={formData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Subject/Course</label>
                <select
                  className={styles.select}
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                >
                  <option value="">Select subject...</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Assign to Class</label>
                <select
                  className={styles.select}
                  value={formData.selectedClass}
                  onChange={(e) => handleInputChange('selectedClass', e.target.value)}
                >
                  <option value="">Select class...</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.students} students)
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Difficulty Level</label>
                <div className={styles.difficultySelector}>
                  {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                    <button
                      key={level}
                      className={`${styles.difficultyButton} ${
                        formData.difficulty === level ? styles.active : ''
                      }`}
                      onClick={() => handleInputChange('difficulty', level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Project Description</label>
              <textarea
                className={styles.textarea}
                placeholder="Describe the project objectives, requirements, and expected outcomes..."
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>

          {/* Configuration Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Project Configuration</h2>
            <div className={styles.configGrid}>
              <div className={styles.configGroup}>
                <label className={styles.label}>Estimated Duration</label>
                <div className={styles.durationSelector}>
                  <input
                    type="number"
                    className={styles.durationInput}
                    min="1"
                    max="52"
                    value={formData.duration.value}
                    onChange={(e) => handleInputChange('duration', {
                      ...formData.duration,
                      value: parseInt(e.target.value) || 1
                    })}
                  />
                  <select
                    className={styles.durationUnit}
                    value={formData.duration.unit}
                    onChange={(e) => handleInputChange('duration', {
                      ...formData.duration,
                      unit: e.target.value
                    })}
                  >
                    <option value="weeks">weeks</option>
                    <option value="months">months</option>
                  </select>
                </div>
              </div>

              <div className={styles.configGroup}>
                <label className={styles.label}>Team Size</label>
                <div className={styles.teamSizeSelector}>
                  <div className={styles.teamSizeInput}>
                    <label>Min</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.teamSize.min}
                      onChange={(e) => handleInputChange('teamSize', {
                        ...formData.teamSize,
                        min: parseInt(e.target.value) || 1
                      })}
                    />
                  </div>
                  <div className={styles.teamSizeInput}>
                    <label>Max</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.teamSize.max}
                      onChange={(e) => handleInputChange('teamSize', {
                        ...formData.teamSize,
                        max: parseInt(e.target.value) || 1
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Stack Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Technology Stack Preferences</h2>
            <div className={styles.techStackGrid}>
              {techStackOptions.map(tech => (
                <button
                  key={tech}
                  className={`${styles.techButton} ${
                    formData.techStack.includes(tech) ? styles.selected : ''
                  }`}
                  onClick={() => handleTechStackToggle(tech)}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className={styles.generateSection}>
            <button
              className={`${styles.generateButton} ${isProcessing ? styles.processing : ''}`}
              onClick={generateProjectStructure}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className={styles.spinner} />
                  Processing...
                </>
              ) : (
                <>
                  🚀 Generate Project Structure
                </>
              )}
            </button>
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className={styles.processingSection}>
              <div className={styles.progressSteps}>
                {processingSteps.map((step, index) => (
                  <div
                    key={step}
                    className={`${styles.progressStep} ${
                      index <= Math.floor(processingStep / 2) ? styles.completed : ''
                    } ${
                      index === Math.floor(processingStep / 2) ? styles.active : ''
                    }`}
                  >
                    <div className={styles.stepIndicator}>
                      {index < Math.floor(processingStep / 2) ? '✓' : index + 1}
                    </div>
                    <span className={styles.stepLabel}>{step}</span>
                  </div>
                ))}
              </div>
              
              <div className={styles.processingFeedback}>
                <div className={styles.processingMessage}>
                  {processingMessages[processingStep] || 'Processing...'}
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${((processingStep + 1) / processingMessages.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* AI Results */}
          {showAIResults && (
            <div className={styles.resultsSection}>
              <div className={styles.resultsHeader}>
                <h2 className={styles.sectionTitle}>Generated Project Structure</h2>
                <button className={styles.regenerateButton} onClick={regenerateStructure}>
                  🔄 Regenerate Structure
                </button>
              </div>

              <div className={styles.milestonesGrid}>
                {aiResults.milestones.map((milestone, index) => (
                  <div key={milestone.id} className={styles.milestoneCard}>
                    <div className={styles.milestoneHeader}>
                      <div className={styles.milestoneNumber}>{index + 1}</div>
                      <div className={styles.milestoneInfo}>
                        <h3 className={styles.milestoneTitle}>{milestone.title}</h3>
                        <div className={styles.milestoneDuration}>
                          ⏱️ {milestone.duration}
                        </div>
                      </div>
                    </div>
                    <div className={styles.checkpointsList}>
                      {milestone.checkpoints.map((checkpoint, checkIndex) => (
                        <div key={checkIndex} className={styles.checkpoint}>
                          <div className={styles.checkpointBullet}>•</div>
                          <span className={styles.checkpointText}>{checkpoint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.projectActions}>
                <button className={styles.createProjectButton}>
                  ✨ Create Project
                </button>
                <button className={styles.saveTemplateButton}>
                  💾 Save as Template
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        {showAIResults && (
          <div className={styles.sidePanel}>
            <div className={styles.sidePanelContent}>
              <h3 className={styles.sidePanelTitle}>Extracted Requirements</h3>
              <div className={styles.requirementsList}>
                {aiResults.extractedRequirements.map((req, index) => (
                  <div key={index} className={styles.requirement}>
                    <div className={styles.requirementBullet}>✓</div>
                    <span>{req}</span>
                  </div>
                ))}
              </div>

              <h3 className={styles.sidePanelTitle}>Learning Outcomes</h3>
              <div className={styles.outcomesList}>
                {aiResults.learningOutcomes.map((outcome, index) => (
                  <div key={index} className={styles.outcome}>
                    <div className={styles.outcomeBullet}>🎯</div>
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>

              <div className={styles.estimationBadge}>
                <span className={styles.estimationLabel}>Total Duration</span>
                <span className={styles.estimationValue}>{aiResults.estimatedDuration}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProject;