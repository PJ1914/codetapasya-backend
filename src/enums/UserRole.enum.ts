export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum Permission {
  CREATE_COURSE = 'create:course',
  UPDATE_COURSE = 'update:course',
  DELETE_COURSE = 'delete:course',
  CHANGE_COURSE_STATUS = 'change:course:status',
  VIEW_COURSE = 'view:course',
  ENROLL_COURSE = 'enroll:course',
  VIEW_ANALYTICS = 'view:analytics',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.CREATE_COURSE,
    Permission.UPDATE_COURSE,
    Permission.DELETE_COURSE,
    Permission.CHANGE_COURSE_STATUS,
    Permission.VIEW_COURSE,
    Permission.VIEW_ANALYTICS,
  ],
  [UserRole.USER]: [
    Permission.VIEW_COURSE,
    Permission.ENROLL_COURSE,
  ],
};
