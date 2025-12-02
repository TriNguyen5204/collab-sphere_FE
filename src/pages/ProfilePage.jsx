import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { User, Settings } from "lucide-react";
import StudentLayout from "../components/layout/StudentLayout";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProfileInformation from "../features/student/components/ProfileInformation";
import AccountSettings from "../features/student/components/AccountSettings";
import {
	getUserProfile,
	getAvatarByPublicId,
	postUploadUserAvatar,
	putUpdateUserProfile,
} from "../services/studentApi";
import { toast } from "sonner";

const layoutByRole = {
	STUDENT: StudentLayout,
	LECTURER: DashboardLayout,
};

const ProfilePage = () => {
	const { userId: routeUserId } = useParams();
	const { userId: authUserId, roleName } = useSelector((state) => state.user);
	const [activeTab, setActiveTab] = useState("profile");
	const [userProfile, setUserProfile] = useState(null);
	const [loading, setLoading] = useState(false);
	const [publicId, setPublicId] = useState(null);
	const [avatar, setAvatar] = useState(null);
	const [isSavingProfile, setIsSavingProfile] = useState(false);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [isSavingPassword, setIsSavingPassword] = useState(false);

	const effectiveUserId = routeUserId ?? (authUserId ? String(authUserId) : undefined);
	const isOwnProfile = Boolean(
		authUserId && effectiveUserId && String(authUserId) === String(effectiveUserId)
	);

	const fetchUserProfile = useCallback(
		async (targetUserId, { withLoader = true } = {}) => {
			if (!targetUserId) return;
			try {
				if (withLoader) {
					setLoading(true);
				}
				const profileData = await getUserProfile(targetUserId);
				const nextUser = profileData?.user ?? null;
				setUserProfile(nextUser);
				const avatarImgId = nextUser?.avatarImg || null;
				setPublicId(avatarImgId);
				if (!avatarImgId) {
					setAvatar(nextUser?.avatarUrl || null);
				}
			} catch (error) {
				console.error("Failed to fetch user profile:", error);
				toast.error(
					error?.response?.data?.message ||
						error?.message ||
						"Unable to load the requested profile."
				);
			} finally {
				if (withLoader) {
					setLoading(false);
				}
			}
		},
		[]
	);

	useEffect(() => {
		if (effectiveUserId) {
			fetchUserProfile(effectiveUserId);
		}
	}, [effectiveUserId, fetchUserProfile]);

	const fetchAvatar = useCallback(async (publicIdValue) => {
		if (!publicIdValue) return;
		try {
			const avatarData = await getAvatarByPublicId(publicIdValue);
			setAvatar(avatarData?.data ?? null);
		} catch (error) {
			console.error("Failed to fetch avatar:", error);
		}
	}, []);

	useEffect(() => {
		if (publicId) {
			fetchAvatar(publicId);
		} else if (userProfile?.avatarUrl) {
			setAvatar(userProfile.avatarUrl);
		}
	}, [publicId, userProfile?.avatarUrl, fetchAvatar]);

	const refreshProfile = useCallback(async () => {
		if (!effectiveUserId) return;
		await fetchUserProfile(effectiveUserId, { withLoader: false });
	}, [effectiveUserId, fetchUserProfile]);

	const buildProfilePayload = useCallback(
		(overrides = {}) => {
			const base = userProfile || {};
			const resolvedFullName =
				overrides.fullName ??
				base.fullName ??
				base.fullname ??
				base.full_name ??
				"";

			const payload = {
				userId: Number(overrides.userId ?? base.userId ?? authUserId ?? effectiveUserId ?? 0),
				isTeacher:
					overrides.isTeacher ??
					(base.isTeacher !== undefined ? base.isTeacher : false),
				fullName: resolvedFullName,
				address: overrides.address ?? base.address ?? "",
				phoneNumber: overrides.phoneNumber ?? base.phoneNumber ?? "",
				yob: Number(overrides.yob ?? base.yob ?? 0),
				school: overrides.school ?? base.school ?? "",
				code: overrides.code ?? base.code ?? "",
				major: overrides.major ?? base.major ?? "",
				isActive:
					overrides.isActive ??
					(base.isActive !== undefined ? base.isActive : true),
			};

			const emailValue = overrides.email ?? base.email;
			if (emailValue !== undefined) {
				payload.email = emailValue;
			}

			Object.entries(overrides).forEach(([key, value]) => {
				if (value !== undefined) {
					payload[key] = value;
				}
			});

			payload.fullname = payload.fullName ?? payload.fullname;

			return payload;
		},
		[authUserId, effectiveUserId, userProfile]
	);

	const handleProfileUpdate = useCallback(
		async (updates) => {
			if (!isOwnProfile || !effectiveUserId) return;
			try {
				setIsSavingProfile(true);
				const payload = buildProfilePayload({
					address: updates.address,
					phoneNumber: updates.phoneNumber,
				});
				const response = await putUpdateUserProfile(effectiveUserId, payload);
				toast.success(response?.message || "Profile updated successfully.");
				await refreshProfile();
			} catch (error) {
				const message =
					error?.response?.data?.message ||
					error?.message ||
					"Failed to update profile.";
				toast.error(message);
				throw error;
			} finally {
				setIsSavingProfile(false);
			}
		},
		[buildProfilePayload, effectiveUserId, isOwnProfile, refreshProfile]
	);

	const handleAvatarUpload = useCallback(
		async (file) => {
			if (!file || !isOwnProfile || !effectiveUserId) return;
			const formData = new FormData();
			formData.append("imageFile", file);
			formData.append("File", file);
			formData.append("file", file);
			formData.append("userId", String(effectiveUserId));
			try {
				setIsUploadingAvatar(true);
				const response = await postUploadUserAvatar(formData);
				toast.success(response?.message || "Avatar updated successfully.");
				await refreshProfile();
			} catch (error) {
				const message =
					error?.response?.data?.message ||
					error?.message ||
					"Failed to upload avatar.";
				toast.error(message);
			} finally {
				setIsUploadingAvatar(false);
			}
		},
		[effectiveUserId, isOwnProfile, refreshProfile]
	);

	const handlePasswordChange = useCallback(
		async (payload) => {
			if (!isOwnProfile || !effectiveUserId) return;
			try {
				setIsSavingPassword(true);
				const requestPayload = buildProfilePayload({
					oldPassword: payload.oldPassword,
					newPassword: payload.newPassword,
					confirmNewPassword: payload.confirmNewPassword,
				});
				const response = await putUpdateUserProfile(effectiveUserId, requestPayload);
				toast.success(response?.message || "Password updated successfully.");
				await refreshProfile();
			} catch (error) {
				const message =
					error?.response?.data?.message ||
					error?.message ||
					"Failed to update password.";
				toast.error(message);
				throw error;
			} finally {
				setIsSavingPassword(false);
			}
		},
		[buildProfilePayload, effectiveUserId, isOwnProfile, refreshProfile]
	);

	const tabs = useMemo(() => {
		const base = [{ id: "profile", label: "Profile Information", icon: User }];
		if (isOwnProfile) {
			base.push({ id: "settings", label: "Account Settings", icon: Settings });
		}
		return base;
	}, [isOwnProfile]);

	useEffect(() => {
		if (!isOwnProfile && activeTab !== "profile") {
			setActiveTab("profile");
		}
	}, [activeTab, isOwnProfile]);

	const renderContent = () => {
		if (!effectiveUserId) {
			return <div className="text-gray-500">Missing profile identifier.</div>;
		}
		if (loading) {
			return <div className="text-gray-500">Loading profile...</div>;
		}
		if (!userProfile) {
			return <div className="text-gray-500">No profile data available.</div>;
		}
		switch (activeTab) {
			case "profile":
				return (
					<ProfileInformation
						user={userProfile}
						avatar={avatar}
						onUpdateProfile={isOwnProfile ? handleProfileUpdate : undefined}
						isSaving={isSavingProfile}
						onUploadAvatar={isOwnProfile ? handleAvatarUpload : undefined}
						isUploadingAvatar={isUploadingAvatar}
						readOnly={!isOwnProfile}
					/>
				);
			case "settings":
				if (!isOwnProfile) return null;
				return (
					<AccountSettings
						onChangePassword={handlePasswordChange}
						isSaving={isSavingPassword}
					/>
				);
			default:
				return null;
		}
	};

	const LayoutComponent = layoutByRole[String(roleName).toUpperCase()] ?? React.Fragment;

	const pageContent = (
		<div className="space-y-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900">Profile</h1>
				<p className="text-gray-600 mt-1">
					{isOwnProfile
						? "Manage your personal information and settings"
						: "View profile details"}
				</p>
			</div>

			<div className="bg-white rounded-lg shadow-md">
				<div className="border-b border-gray-200">
					<nav className="flex -mb-px">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							return (
								<button
									key={tab.id}
									type="button"
									onClick={() => setActiveTab(tab.id)}
									className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
										activeTab === tab.id
											? "border-brand-600 text-brand-600"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									}`}
								>
									<Icon size={18} />
									{tab.label}
								</button>
							);
						})}
					</nav>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow-md p-6">{renderContent()}</div>
		</div>
	);

	if (LayoutComponent === React.Fragment) {
		return <>{pageContent}</>;
	}

	return <LayoutComponent>{pageContent}</LayoutComponent>;
};

export default ProfilePage;
