import { DEFAULT_EVENT_COLOR } from './meetingConstants';

// ==================== MEETING HELPERS ====================

export const generateRoomId = () => Math.random().toString(36).substring(2, 10);

export const getBaseUrl = () => import.meta.env.VITE_FRONTEND_URL;

export const formatMeetingData = (meeting) => ({
  id: meeting.meetingId,
  title: meeting.title,
  start: meeting.scheduleTime,
  backgroundColor: DEFAULT_EVENT_COLOR,
  borderColor: DEFAULT_EVENT_COLOR,
  extendedProps: {
    description: meeting.description,
    meetingUrl: meeting.meetingUrl,
  },
});

export const buildDateTime = (dateStr, timeStr) => {
  const date = dateStr?.split('T')[0];
  return `${date}T${timeStr}`;
};

export const buildMeetingPayload = (teamId, form, dateTime) => {
  const roomId = generateRoomId();
  return {
    teamId: parseInt(teamId) || 2,
    title: form.title,
    description: form.description,
    meetingUrl: `${getBaseUrl()}/room/${roomId}`,
    scheduleTime: new Date(dateTime).toISOString(),
  };
};