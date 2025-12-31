export type LiveClassStatus = "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";

export interface LiveClass {
  liveClassId: string;
  courseId: string;
  title: string;
  description?: string;
  instructorId: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  meetingUrl: string;
  recordingUrl?: string;
  status: LiveClassStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LiveClassAttendance {
  liveClassId: string;
  userId: string;
  joinedAt: string;
}
