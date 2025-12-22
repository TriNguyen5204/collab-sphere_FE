import { STORAGE_KEYS as GLOBAL_STORAGE_KEYS } from '../../../../utils/storageUtils';

// AI Project Generator Constants

export const AI_API_BASE_URL = 'https://u8ls7dz738.execute-api.ap-southeast-1.amazonaws.com/dev';

// Form version - increment when form structure changes to clear old localStorage data
export const FORM_VERSION = 2;

// LocalStorage Keys (obscured for privacy)
// Mapped from global storage utils to maintain backward compatibility with existing code
export const STORAGE_KEYS = {
  FORM_DATA: GLOBAL_STORAGE_KEYS.AI_FORM_DATA,
  IDEAS: GLOBAL_STORAGE_KEYS.AI_IDEAS,
  CONFIG: GLOBAL_STORAGE_KEYS.AI_CONFIG,
  PHASE: GLOBAL_STORAGE_KEYS.AI_PHASE,
  SELECTED_IDS: GLOBAL_STORAGE_KEYS.AI_SELECTED_IDS,
  // Job persistence keys (for resume polling after refresh)
  CURRENT_JOB_ID: GLOBAL_STORAGE_KEYS.AI_CURRENT_JOB_ID,
  JOB_STATUS: GLOBAL_STORAGE_KEYS.AI_JOB_STATUS,
  JOB_START_TIME: GLOBAL_STORAGE_KEYS.AI_JOB_START_TIME,
  // Rate limiting keys
  LAST_GEN_TIME: 'ai_last_gen_time',
  GEN_COUNT: 'ai_gen_count',
};

// Rate Limiting Constants
export const GENERATION_LIMITS = {
  COOLDOWN_MS: 60000, // 60 seconds cooldown between generations
  MAX_PER_SESSION: 5, // Maximum 5 generations per session (Initial + 4 Generate More)
};

// Topic Domain Options
export const TOPIC_DOMAIN_OPTIONS = [
  { value: 'E-commerce Platform', label: 'E-commerce Platform' },
  { value: 'Healthcare System', label: 'Healthcare System' },
  { value: 'Education & E-learning', label: 'Education & E-learning' },
  { value: 'Restaurant & F&B', label: 'Restaurant & F&B' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Logistics & Delivery', label: 'Logistics & Delivery' },
  { value: 'Finance & Banking', label: 'Finance & Banking' },
  { value: 'Travel & Booking', label: 'Travel & Booking' },
  { value: 'Fitness & Wellness', label: 'Fitness & Wellness' },
  { value: 'Other', label: 'Other (Custom)' },
];

// Project Type Options
export const PROJECT_TYPE_OPTIONS = [
  { value: 'Web Application', label: 'Web App', icon: '🌐' },
  { value: 'Mobile Application', label: 'Mobile', icon: '📱' },
  { value: 'Desktop Application', label: 'Desktop', icon: '🖥️' },
  { value: 'API/Backend Service', label: 'API/Backend', icon: '⚙️' },
  { value: 'Custom', label: 'Custom', icon: '✨' },
];

// Complexity Options
export const COMPLEXITY_OPTIONS = [
  { value: 1, label: 'Basic', color: 'bg-emerald-500', description: 'Simple CRUD' },
  { value: 2, label: 'Intermediate', color: 'bg-teal-500', description: 'Standard features' },
  { value: 3, label: 'Advanced', color: 'bg-amber-500', description: 'Complex logic' },
  { value: 4, label: 'Expert', color: 'bg-orange-500', description: 'Enterprise scale' },
  { value: 5, label: 'Research', color: 'bg-rose-500', description: 'Cutting-edge' },
];

// Duration Options (weeks)
export const DURATION_OPTIONS = [8, 9, 10, 11];

// Suggested Tech Stack
export const SUGGESTED_TECH = [
  'React', 'Vue.js', 'Angular', 'Next.js', 'Svelte',
  'Node.js', 'Express', 'ASP.NET Core', 'Spring Boot', 'Django', 'FastAPI',
  'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'SQL Server',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'Firebase', 'GCP',
  'TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'Go',
  'TailwindCSS', 'Bootstrap', 'Material UI', 'Chakra UI',
  'GraphQL', 'REST API', 'gRPC', 'WebSocket',
  'Jest', 'Cypress', 'Playwright', 'JUnit'
];

// Default Form Values
export const DEFAULT_FORM_VALUES = {
  topicDomain: '',
  customTopicDomain: '',
  industryContext: '',
  projectType: [],
  customProjectType: '',
  complexity: 2,
  teamSize: 4,
  durationWeeks: 10,
  referenceUrls: [''],
  requiredTechStack: [],
  optionalTechStack: [],
  selectedSubjectId: '',
};
