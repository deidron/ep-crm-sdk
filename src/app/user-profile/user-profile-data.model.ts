import { Entity } from '@ep-crm/core';

export interface UserProfileData {
  contact: Entity | null;
  activityCount: number;
  recentActivities: Entity[];
}
