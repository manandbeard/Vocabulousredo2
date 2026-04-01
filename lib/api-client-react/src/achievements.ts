import { useQuery } from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";

export interface Achievement {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: "streak" | "reviews" | "retention" | "class_milestone";
  targetValue: number | null;
  createdAt: string;
}

export interface UserAchievementWithDetails {
  id: number;
  achievementId: number;
  userId: number;
  classId: number | null;
  earnedAt: string;
  achievement: Achievement;
}

export interface ClassMilestoneWithDetails extends UserAchievementWithDetails {
  className: string;
}

export interface StudentAchievementsResponse {
  earned: UserAchievementWithDetails[];
  locked: Achievement[];
}

export const getStudentAchievementsUrl = (studentId: number) =>
  `/api/students/${studentId}/achievements`;

export const getStudentAchievements = async (
  studentId: number,
  options?: RequestInit,
): Promise<StudentAchievementsResponse> => {
  return customFetch<StudentAchievementsResponse>(getStudentAchievementsUrl(studentId), {
    ...options,
    method: "GET",
  });
};

export const getStudentAchievementsQueryKey = (studentId: number) =>
  [`/api/students/${studentId}/achievements`] as const;

export const useGetStudentAchievements = (studentId: number) => {
  return useQuery({
    queryKey: getStudentAchievementsQueryKey(studentId),
    queryFn: () => getStudentAchievements(studentId),
    enabled: studentId > 0,
  });
};

export const getTeacherMilestonesUrl = (teacherId: number) =>
  `/api/teacher/${teacherId}/milestones`;

export const getTeacherMilestones = async (
  teacherId: number,
  options?: RequestInit,
): Promise<ClassMilestoneWithDetails[]> => {
  return customFetch<ClassMilestoneWithDetails[]>(getTeacherMilestonesUrl(teacherId), {
    ...options,
    method: "GET",
  });
};

export const getTeacherMilestonesQueryKey = (teacherId: number) =>
  [`/api/teacher/${teacherId}/milestones`] as const;

export const useGetTeacherMilestones = (teacherId: number) => {
  return useQuery({
    queryKey: getTeacherMilestonesQueryKey(teacherId),
    queryFn: () => getTeacherMilestones(teacherId),
    enabled: teacherId > 0,
  });
};
