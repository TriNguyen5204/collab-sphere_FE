import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, DEFAULT_FORM_VALUES } from './constants';

/**
 * Custom hook to manage AI Project form state with localStorage persistence
 * Automatically saves form data on change and restores on page load
 */
export const useAIProjectForm = () => {
  // Form Fields State
  const [topicDomain, setTopicDomain] = useState(DEFAULT_FORM_VALUES.topicDomain);
  const [customTopicDomain, setCustomTopicDomain] = useState(DEFAULT_FORM_VALUES.customTopicDomain);
  const [industryContext, setIndustryContext] = useState(DEFAULT_FORM_VALUES.industryContext);
  const [projectType, setProjectType] = useState(DEFAULT_FORM_VALUES.projectType);
  const [complexity, setComplexity] = useState(DEFAULT_FORM_VALUES.complexity);
  const [teamSize, setTeamSize] = useState(DEFAULT_FORM_VALUES.teamSize);
  const [durationWeeks, setDurationWeeks] = useState(DEFAULT_FORM_VALUES.durationWeeks);
  const [referenceUrls, setReferenceUrls] = useState(DEFAULT_FORM_VALUES.referenceUrls);
  const [requiredTechStack, setRequiredTechStack] = useState(DEFAULT_FORM_VALUES.requiredTechStack);
  const [optionalTechStack, setOptionalTechStack] = useState(DEFAULT_FORM_VALUES.optionalTechStack);
  const [selectedSubjectId, setSelectedSubjectId] = useState(DEFAULT_FORM_VALUES.selectedSubjectId);

  // Track if form has been initialized from localStorage
  const [isInitialized, setIsInitialized] = useState(false);

  // Computed: Get actual topic domain value
  const actualTopicDomain = topicDomain === 'Other' ? customTopicDomain : topicDomain;

  // Validation: Check mandatory fields
  const mandatoryValidation = {
    subject: !!selectedSubjectId,
    topicDomain: actualTopicDomain.trim().length > 0,
    teamSize: teamSize >= 3 && teamSize <= 8,
    duration: durationWeeks >= 4 && durationWeeks <= 20,
    requiredTech: requiredTechStack.length > 0,
    industryContext: industryContext.trim().length > 0,
    complexity: complexity >= 1 && complexity <= 5,
  };

  // Check if all mandatory fields are filled
  const isConfigReady = Object.values(mandatoryValidation).every(Boolean);

  // Load form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setTopicDomain(parsed.topicDomain || DEFAULT_FORM_VALUES.topicDomain);
        setCustomTopicDomain(parsed.customTopicDomain || DEFAULT_FORM_VALUES.customTopicDomain);
        setIndustryContext(parsed.industryContext || DEFAULT_FORM_VALUES.industryContext);
        setProjectType(parsed.projectType || DEFAULT_FORM_VALUES.projectType);
        setComplexity(parsed.complexity ?? DEFAULT_FORM_VALUES.complexity);
        setTeamSize(parsed.teamSize ?? DEFAULT_FORM_VALUES.teamSize);
        setDurationWeeks(parsed.durationWeeks ?? DEFAULT_FORM_VALUES.durationWeeks);
        setReferenceUrls(parsed.referenceUrls?.length > 0 ? parsed.referenceUrls : DEFAULT_FORM_VALUES.referenceUrls);
        setRequiredTechStack(parsed.requiredTechStack || DEFAULT_FORM_VALUES.requiredTechStack);
        setOptionalTechStack(parsed.optionalTechStack || DEFAULT_FORM_VALUES.optionalTechStack);
        setSelectedSubjectId(parsed.selectedSubjectId || DEFAULT_FORM_VALUES.selectedSubjectId);
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save form data to localStorage whenever any field changes (after initialization)
  useEffect(() => {
    if (!isInitialized) return;

    const formData = {
      topicDomain,
      customTopicDomain,
      industryContext,
      projectType,
      complexity,
      teamSize,
      durationWeeks,
      referenceUrls,
      requiredTechStack,
      optionalTechStack,
      selectedSubjectId,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData));
  }, [
    isInitialized,
    topicDomain,
    customTopicDomain,
    industryContext,
    projectType,
    complexity,
    teamSize,
    durationWeeks,
    referenceUrls,
    requiredTechStack,
    optionalTechStack,
    selectedSubjectId,
  ]);

  // Helper: Add new reference URL input
  const addReferenceUrl = useCallback(() => {
    if (referenceUrls.length < 5) {
      setReferenceUrls(prev => [...prev, '']);
    }
  }, [referenceUrls.length]);

  // Helper: Update a reference URL
  const updateReferenceUrl = useCallback((index, value) => {
    setReferenceUrls(prev => prev.map((url, i) => i === index ? value : url));
  }, []);

  // Helper: Remove a reference URL
  const removeReferenceUrl = useCallback((index) => {
    if (referenceUrls.length > 1) {
      setReferenceUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      setReferenceUrls(['']);
    }
  }, [referenceUrls.length]);

  // Clear all form data
  const clearFormData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
    setTopicDomain(DEFAULT_FORM_VALUES.topicDomain);
    setCustomTopicDomain(DEFAULT_FORM_VALUES.customTopicDomain);
    setIndustryContext(DEFAULT_FORM_VALUES.industryContext);
    setProjectType(DEFAULT_FORM_VALUES.projectType);
    setComplexity(DEFAULT_FORM_VALUES.complexity);
    setTeamSize(DEFAULT_FORM_VALUES.teamSize);
    setDurationWeeks(DEFAULT_FORM_VALUES.durationWeeks);
    setReferenceUrls(DEFAULT_FORM_VALUES.referenceUrls);
    setRequiredTechStack(DEFAULT_FORM_VALUES.requiredTechStack);
    setOptionalTechStack(DEFAULT_FORM_VALUES.optionalTechStack);
    setSelectedSubjectId(DEFAULT_FORM_VALUES.selectedSubjectId);
  }, []);

  // Build request payload for API
  const buildRequestPayload = useCallback((lecturerId) => {
    return {
      topic_domain: actualTopicDomain,
      industry_context: industryContext || null,
      project_type: projectType,
      complexity_level: complexity,
      team_member_count: teamSize,
      duration_weeks: durationWeeks,
      reference_urls: referenceUrls.filter(url => url.trim().length > 0),
      tech_stack_preference: {
        required: requiredTechStack,
        optional: optionalTechStack
      },
      lecturer_id: lecturerId,
      subject_id: parseInt(selectedSubjectId, 10),
    };
  }, [
    actualTopicDomain,
    industryContext,
    projectType,
    complexity,
    teamSize,
    durationWeeks,
    referenceUrls,
    requiredTechStack,
    optionalTechStack,
    selectedSubjectId,
  ]);

  return {
    // Form Fields
    topicDomain,
    setTopicDomain,
    customTopicDomain,
    setCustomTopicDomain,
    industryContext,
    setIndustryContext,
    projectType,
    setProjectType,
    complexity,
    setComplexity,
    teamSize,
    setTeamSize,
    durationWeeks,
    setDurationWeeks,
    referenceUrls,
    setReferenceUrls,
    requiredTechStack,
    setRequiredTechStack,
    optionalTechStack,
    setOptionalTechStack,
    selectedSubjectId,
    setSelectedSubjectId,

    // Computed Values
    actualTopicDomain,
    mandatoryValidation,
    isConfigReady,
    isInitialized,

    // Helper Functions
    addReferenceUrl,
    updateReferenceUrl,
    removeReferenceUrl,
    clearFormData,
    buildRequestPayload,
  };
};
