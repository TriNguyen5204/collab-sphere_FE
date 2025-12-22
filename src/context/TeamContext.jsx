/* @refresh reload */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getDetailOfTeamByTeamId } from '../services/studentApi';
import { TeamBoardService, EventHandlers } from '../services/teamBoardService';
import { getNotifications } from '../services/notifiactionApi';
import { isTokenExpired } from '../utils/tokenUtils';
import apiClient from '../services/apiClient';
import { STORAGE_KEYS } from '../utils/storageUtils';

const STORAGE_KEY = STORAGE_KEYS.TEAM_DETAIL;

const defaultContextValue = {
	teamId: null,
	team: null,
	isLoading: false,
	error: null,
	setTeam: () => {},
	updateTeam: async () => null,
	clearTeam: () => {},
	refetchTeam: () => Promise.resolve(null),
};

export const TeamContext = createContext(defaultContextValue);

const teamQueryKey = (teamId) => ['team-detail', Number(teamId)];

const normalizeTeamId = (value) => {
	if (value == null) return null;
	const numeric = Number(value);
	return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

const mergeTeamPayload = (prev, patch) => {
	if (!patch || typeof patch !== 'object') {
		return prev ?? null;
	}
	if (!prev) {
		return patch;
	}
	return {
		...prev,
		...patch,
		teamProgress:
			patch.teamProgress && prev.teamProgress
				? { ...prev.teamProgress, ...patch.teamProgress }
				: patch.teamProgress ?? prev.teamProgress,
		lecturerInfo:
			patch.lecturerInfo && prev.lecturerInfo
				? { ...prev.lecturerInfo, ...patch.lecturerInfo }
				: patch.lecturerInfo ?? prev.lecturerInfo,
		classInfo:
			patch.classInfo && prev.classInfo
				? { ...prev.classInfo, ...patch.classInfo }
				: patch.classInfo ?? prev.classInfo,
		projectInfo:
			patch.projectInfo && prev.projectInfo
				? { ...prev.projectInfo, ...patch.projectInfo }
				: patch.projectInfo ?? prev.projectInfo,
		memberInfo:
			patch.memberInfo && prev.memberInfo
				? {
					...prev.memberInfo,
					...patch.memberInfo,
					members: patch.memberInfo.members ?? prev.memberInfo.members,
				}
				: patch.memberInfo ?? prev.memberInfo,
	};
};

const readStoredTeamId = () => {
	if (typeof window === 'undefined') return null;
	const raw = window.localStorage.getItem(STORAGE_KEY);
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		if (typeof parsed === 'number' || typeof parsed === 'string') {
			return normalizeTeamId(parsed);
		}
		if (parsed && typeof parsed === 'object') {
			return normalizeTeamId(parsed.teamId ?? parsed.id);
		}
	} catch {
		const fallback = normalizeTeamId(raw);
		if (fallback != null) {
			return fallback;
		}
	}
	return null;
};

const writeStoredTeamId = (teamId) => {
	if (typeof window === 'undefined') return;
	try {
		if (teamId == null) {
			window.localStorage.removeItem(STORAGE_KEY);
		} else {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(teamId));
		}
	} catch {
		// Ignore storage write errors (private mode, quota, etc.)
	}
};

export function TeamProvider({ children, initialTeam = null }) {
	const queryClient = useQueryClient();
	const user = useSelector((state) => state.user);
	const isAuthenticated = Boolean(user?.accessToken && user?.userId);
	const initialId =
		normalizeTeamId(initialTeam?.teamId) ?? (isAuthenticated ? readStoredTeamId() : null);
	const [activeTeamId, setActiveTeamId] = useState(initialId);
	const [teamBoard, setTeamBoard] = useState(null);
	const [notifications, setNotifications] = useState([]);

	useEffect(() => {
		if (!isAuthenticated || !initialTeam?.teamId) return;
		const normalized = normalizeTeamId(initialTeam.teamId);
		if (normalized != null) {
			queryClient.setQueryData(teamQueryKey(normalized), initialTeam);
			setActiveTeamId((prev) => prev ?? normalized);
		}
	}, [initialTeam, isAuthenticated, queryClient]);

	useEffect(() => {
		if (!isAuthenticated) {
			writeStoredTeamId(null);
			return;
		}
		writeStoredTeamId(activeTeamId);
	}, [activeTeamId, isAuthenticated]);

	useEffect(() => {
		if (!isAuthenticated) {
			return undefined;
		}
		const handleStorage = (event) => {
			if (event.key !== STORAGE_KEY) return;
			setActiveTeamId(readStoredTeamId());
		};
		window.addEventListener('storage', handleStorage);
		return () => window.removeEventListener('storage', handleStorage);
	}, [isAuthenticated]);

	useEffect(() => {
		if (!isAuthenticated) {
			setActiveTeamId((prev) => {
				const normalizedPrev = normalizeTeamId(prev);
				if (normalizedPrev != null) {
					queryClient.removeQueries({ queryKey: teamQueryKey(normalizedPrev) });
				}
				return null;
			});
			return;
		}

		setActiveTeamId((prev) => {
			if (prev != null) {
				return prev;
			}
			const normalizedInitial = normalizeTeamId(initialTeam?.teamId);
			if (normalizedInitial != null) {
				return normalizedInitial;
			}
			return readStoredTeamId();
		});
	}, [initialTeam, isAuthenticated, queryClient]);

	const normalizedTeamId = isAuthenticated ? normalizeTeamId(activeTeamId) : null;
	const queryKey = normalizedTeamId ? teamQueryKey(normalizedTeamId) : ['team-detail', 'idle'];

	// Effect 1: Manage Connection (depends on auth only)
	useEffect(() => {
		const allowedRoles = ['student', 'lecturer'];
		const userRole = user?.roleName?.toLowerCase();

		if (!isAuthenticated || !user?.accessToken || !allowedRoles.includes(userRole)) {
			if (teamBoard) {
				teamBoard.disconnect();
				setTeamBoard(null);
				setNotifications([]);
			}
			return;
		}

		// Check if token is expired before trying to connect
		if (isTokenExpired(user.accessToken)) {
			console.warn("[TeamContext] Token expired. Waiting for refresh...");
			// Trigger a dummy request to force apiClient's interceptor to refresh the token.
			// When the token updates in Redux, this useEffect will re-run automatically.
			apiClient.get('/auth/refresh-token').catch((err) => {
				// Ignore errors, we just want to trigger the refresh interceptor
				console.log("Triggered token refresh check");
			});
			return; // EXIT here so we don't try to connect with a bad token
		}
		// --- FIX END ---

		const service = new TeamBoardService(user.accessToken);

		// Global Notification Handlers
		service.on(EventHandlers.NOTIFICATION, (notification) => {
			setNotifications((prev) => [notification, ...prev]);
		});

		service.on(EventHandlers.NOTIFICATION_HISTORY, (history) => {
			setNotifications(history || []);
		});

		// Fetch notifications via API to ensure consistency
		getNotifications()
			.then((data) => {
				if (Array.isArray(data)) {
					setNotifications(data);
				}
			})
			.catch((err) => console.error('Failed to fetch notifications via API:', err));

		service.joinServer();
		setTeamBoard(service);

		return () => {
			service.disconnect();
			setTeamBoard(null);
		};
	}, [isAuthenticated, user?.accessToken , user?.roleName]);

	// Effect 2: Manage Team Specific Listeners (depends on teamBoard and normalizedTeamId)
	useEffect(() => {
		if (!teamBoard) return;

		const handleMilestoneChange = (payload) => {
			const payloadTeamId = payload?.teamId;
			// If we are currently viewing a team, and the event is for that team
			if (normalizedTeamId && payloadTeamId === normalizedTeamId) {
				queryClient.invalidateQueries({ queryKey: ['milestones', normalizedTeamId] });
				queryClient.invalidateQueries({ queryKey: ['team-detail', normalizedTeamId] });
			}
		};

		teamBoard.on(EventHandlers.MILESTONE_CREATE, handleMilestoneChange);
		teamBoard.on(EventHandlers.MILESTONE_UPDATE, handleMilestoneChange);
		teamBoard.on(EventHandlers.MILESTONE_DELETE, handleMilestoneChange);
		teamBoard.on(EventHandlers.MILESTONE_CHECK_DONE, handleMilestoneChange);
		teamBoard.on(EventHandlers.MILESTONE_EVALUATE, handleMilestoneChange);

		return () => {
			teamBoard.off(EventHandlers.MILESTONE_CREATE, handleMilestoneChange);
			teamBoard.off(EventHandlers.MILESTONE_UPDATE, handleMilestoneChange);
			teamBoard.off(EventHandlers.MILESTONE_DELETE, handleMilestoneChange);
			teamBoard.off(EventHandlers.MILESTONE_CHECK_DONE, handleMilestoneChange);
			teamBoard.off(EventHandlers.MILESTONE_EVALUATE, handleMilestoneChange);
		};
	}, [teamBoard, normalizedTeamId, queryClient]);

	const teamQuery = useQuery({
		queryKey,
		queryFn: () => {
			if (!normalizedTeamId || !isAuthenticated) {
				return Promise.reject(new Error('No team selected'));
			}
			return getDetailOfTeamByTeamId(normalizedTeamId);
		},
		enabled: Boolean(isAuthenticated && normalizedTeamId),
		initialData: () => {
			if (!isAuthenticated || !normalizedTeamId) return undefined;
			const cached = queryClient.getQueryData(teamQueryKey(normalizedTeamId));
			if (cached) return cached;
			if (initialTeam?.teamId && normalizeTeamId(initialTeam.teamId) === normalizedTeamId) {
				return initialTeam;
			}
			return undefined;
		},
	});

	const clearTeam = useCallback(() => {
		setActiveTeamId((prev) => {
			const normalizedPrev = normalizeTeamId(prev);
			if (normalizedPrev != null) {
				queryClient.removeQueries({ queryKey: teamQueryKey(normalizedPrev) });
			}
			return null;
		});
	}, [queryClient]);

	const setTeam = useCallback(
		(next) => {
			if (!isAuthenticated) {
				console.warn('Attempted to set team while unauthenticated.');
				return;
			}
			if (next == null) {
				clearTeam();
				return;
			}

			if (typeof next === 'number' || typeof next === 'string') {
				const normalized = normalizeTeamId(next);
				if (normalized != null) {
					setActiveTeamId(normalized);
				} else {
					console.warn('Attempted to set team with an invalid identifier:', next);
				}
				return;
			}

			if (typeof next === 'object') {
				const targetId = normalizeTeamId(next.teamId ?? next.id);
				if (!targetId) {
					console.warn('Attempted to set team without a valid teamId.', next);
					return;
				}
				queryClient.setQueryData(teamQueryKey(targetId), next);
				setActiveTeamId(targetId);
				return;
			}

			console.warn('Unsupported value passed to setTeam:', next);
		},
		[clearTeam, isAuthenticated, queryClient]
	);

	const updateTeam = useCallback(
		async (partial, options = {}) => {
			if (!isAuthenticated) {
				return teamQuery.data ?? null;
			}
			const { refresh = true, teamId: overrideTeamId } = options;
			const targetId =
				normalizeTeamId(overrideTeamId) ??
				(typeof partial === 'object' ? normalizeTeamId(partial.teamId ?? partial.id) : null) ??
				normalizedTeamId;

			if (!targetId) {
				return teamQuery.data ?? null;
			}

			if (partial && typeof partial === 'object') {
				queryClient.setQueryData(teamQueryKey(targetId), (prev) => mergeTeamPayload(prev, partial));
			}

			if (!refresh) {
				return queryClient.getQueryData(teamQueryKey(targetId));
			}

			try {
				const refreshed = await queryClient.fetchQuery({
					queryKey: teamQueryKey(targetId),
					queryFn: () => getDetailOfTeamByTeamId(targetId),
					staleTime: 0,
				});
				return refreshed;
			} catch (error) {
				console.error(`Failed to refresh team details for team ID ${targetId}:`, error);
				return queryClient.getQueryData(teamQueryKey(targetId));
			}
		},
		[isAuthenticated, normalizedTeamId, queryClient, teamQuery.data]
	);

	const refetchTeam = useCallback(() => {
		if (!isAuthenticated || !normalizedTeamId) {
			return Promise.resolve(null);
		}
		return queryClient.invalidateQueries({ queryKey: teamQueryKey(normalizedTeamId) });
	}, [isAuthenticated, normalizedTeamId, queryClient]);

	const markNotificationAsRead = useCallback((notificationId) => {
		setNotifications((prev) =>
			prev.map((n) =>
				n.notificationId === notificationId ? { ...n, isRead: true } : n
			)
		);
	}, []);

	const value = useMemo(
		() => ({
			teamId: normalizedTeamId,
			team: teamQuery.data ?? null,
			teamBoard,
			notifications,
			isLoading: Boolean(normalizedTeamId) && (teamQuery.isPending || teamQuery.isFetching),
			error: teamQuery.error ?? null,
			setTeam,
			updateTeam,
			clearTeam,
			refetchTeam,
			markNotificationAsRead,
		}),
		[
			normalizedTeamId,
			teamQuery.data,
			teamBoard,
			notifications,
			teamQuery.isPending,
			teamQuery.isFetching,
			teamQuery.error,
			setTeam,
			updateTeam,
			clearTeam,
			refetchTeam,
			markNotificationAsRead,
		]
	);

	return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export default TeamProvider;

