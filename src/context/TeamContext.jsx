/* @refresh reload */
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getDetailOfTeamByTeamId } from '../services/studentApi';


const STORAGE_KEY = 'teamDetail';

export const TeamContext = createContext({
	team: null,
	isLoading: false,
	setTeam: () => {},
	updateTeam: async () => {},
	clearTeam: () => {},
});

function readFromStorage() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function writeToStorage(value) {
	try {
		if (value == null) {
			localStorage.removeItem(STORAGE_KEY);
		} else {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
		}
	} catch {
		// Ignore storage write errors (private mode, quota, etc.)
	}
}

export function TeamProvider({ children, initialTeam = null }) {
	const [team, setTeamState] = useState(() => initialTeam ?? readFromStorage());
	const [isLoading, setIsLoading] = useState(false);
	const isMountedRef = useRef(false);

	// Persist changes
	useEffect(() => {
		if (!isMountedRef.current) return; // skip first render hydration
		writeToStorage(team);
	}, [team]);

	// Hydrate from storage on mount (one-time)
	useEffect(() => {
		if (isMountedRef.current) return;
		isMountedRef.current = true;
		if (team == null) {
			const stored = readFromStorage();
			if (stored) setTeamState(stored);
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// Cross-tab sync
	useEffect(() => {
		function onStorage(e) {
			if (e.key !== STORAGE_KEY) return;
			try {
				const next = e.newValue ? JSON.parse(e.newValue) : null;
				setTeamState(next);
			} catch {
				// ignore
			}
		}
		window.addEventListener('storage', onStorage);
		return () => window.removeEventListener('storage', onStorage);
	}, []);

	const setTeam = useCallback((next) => {
		setTeamState(next);
	}, []);

	const updateTeam = useCallback(
		async (partial, options = {}) => {
			const { refresh = true, teamId: overrideTeamId } = options;
			let nextTeamSnapshot = partial;
			setTeamState((prev) => {
				if (prev == null) {
					nextTeamSnapshot = partial;
					return partial;
				}
				const merged = {
					...prev,
					...(typeof partial === 'object' ? partial : {}),
					teamProgress:
						partial?.teamProgress && prev.teamProgress
							? { ...prev.teamProgress, ...partial.teamProgress }
						: partial?.teamProgress ?? prev.teamProgress,
					lecturerInfo:
						partial?.lecturerInfo && prev.lecturerInfo
							? { ...prev.lecturerInfo, ...partial.lecturerInfo }
						: partial?.lecturerInfo ?? prev.lecturerInfo,
					classInfo:
						partial?.classInfo && prev.classInfo
							? { ...prev.classInfo, ...partial.classInfo }
						: partial?.classInfo ?? prev.classInfo,
					projectInfo:
						partial?.projectInfo && prev.projectInfo
							? { ...prev.projectInfo, ...partial.projectInfo }
						: partial?.projectInfo ?? prev.projectInfo,
					memberInfo:
						partial?.memberInfo && prev.memberInfo
							? {
								...prev.memberInfo,
								...partial.memberInfo,
								members: partial.memberInfo.members ?? prev.memberInfo?.members,
							}
						: partial?.memberInfo ?? prev.memberInfo,
				};
				nextTeamSnapshot = merged;
				return merged;
			});

			if (!refresh) {
				return nextTeamSnapshot;
			}

			const targetTeamId =
				overrideTeamId ??
					(typeof partial === 'object' ? partial?.teamId : undefined) ??
					nextTeamSnapshot?.teamId;

			if (!targetTeamId) {
				return nextTeamSnapshot;
			}

			setIsLoading(true);
			try {
				const refreshed = await getDetailOfTeamByTeamId(targetTeamId);
				if (refreshed) {
					setTeamState(refreshed);
					nextTeamSnapshot = refreshed;
				}
			} catch (error) {
				console.error(`Failed to refresh team details for team ID ${targetTeamId}:`, error);
			} finally {
				setIsLoading(false);
			}

			return nextTeamSnapshot;
		},
		[]
	);

	const clearTeam = useCallback(() => {
		setTeamState(null);
	}, []);

	const value = useMemo(
		() => ({ team, isLoading, setTeam, updateTeam, clearTeam }),
		[team, isLoading, setTeam, updateTeam, clearTeam]
	);

	return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export default TeamProvider;

