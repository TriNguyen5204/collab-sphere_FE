/* @refresh reload */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDetailOfTeamByTeamId } from '../services/studentApi';

const STORAGE_KEY = 'teamDetail';

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
	const initialId = normalizeTeamId(initialTeam?.teamId) ?? readStoredTeamId();
	const [activeTeamId, setActiveTeamId] = useState(initialId);

	useEffect(() => {
		if (initialTeam?.teamId) {
			const normalized = normalizeTeamId(initialTeam.teamId);
			if (normalized != null) {
				queryClient.setQueryData(teamQueryKey(normalized), initialTeam);
				setActiveTeamId((prev) => prev ?? normalized);
			}
		}
	}, [initialTeam, queryClient]);

	useEffect(() => {
		writeStoredTeamId(activeTeamId);
	}, [activeTeamId]);

	useEffect(() => {
		const handleStorage = (event) => {
			if (event.key !== STORAGE_KEY) return;
			setActiveTeamId(readStoredTeamId());
		};
		window.addEventListener('storage', handleStorage);
		return () => window.removeEventListener('storage', handleStorage);
	}, []);

	const normalizedTeamId = normalizeTeamId(activeTeamId);
	const queryKey = normalizedTeamId ? teamQueryKey(normalizedTeamId) : ['team-detail', 'idle'];

	const teamQuery = useQuery({
		queryKey,
		queryFn: () => {
			if (!normalizedTeamId) {
				return Promise.reject(new Error('No team selected'));
			}
			return getDetailOfTeamByTeamId(normalizedTeamId);
		},
		enabled: Boolean(normalizedTeamId),
		initialData: () => {
			if (!normalizedTeamId) return undefined;
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
		[clearTeam, queryClient]
	);

	const updateTeam = useCallback(
		async (partial, options = {}) => {
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
		[normalizedTeamId, queryClient, teamQuery.data]
	);

	const refetchTeam = useCallback(() => {
		if (!normalizedTeamId) {
			return Promise.resolve(null);
		}
		return queryClient.invalidateQueries({ queryKey: teamQueryKey(normalizedTeamId) });
	}, [normalizedTeamId, queryClient]);

	const value = useMemo(
		() => ({
			teamId: normalizedTeamId,
			team: teamQuery.data ?? null,
			isLoading: Boolean(normalizedTeamId) && (teamQuery.isPending || teamQuery.isFetching),
			error: teamQuery.error ?? null,
			setTeam,
			updateTeam,
			clearTeam,
			refetchTeam,
		}),
		[
			normalizedTeamId,
			teamQuery.data,
			teamQuery.isPending,
			teamQuery.isFetching,
			teamQuery.error,
			setTeam,
			updateTeam,
			clearTeam,
			refetchTeam,
		]
	);

	return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export default TeamProvider;

