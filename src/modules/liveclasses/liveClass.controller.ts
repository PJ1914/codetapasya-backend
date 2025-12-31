import { Request, Response } from "express";
import {
  createLiveClass,
  getLiveClassesByCourse,
  markAttendance
} from "./liveClass.service.js";

/**
 * Admin: Create live class
 */
export const createLiveClassHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const liveClass = await createLiveClass(req.body);
    res.status(201).json(liveClass);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create live class" });
  }
};

/**
 * User: View live classes for course
 */
export const getCourseLiveClassesHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseId } = req.params;
    const classes = await getLiveClassesByCourse(courseId);
    res.json(classes);
  } catch {
    res.status(500).json({ message: "Failed to fetch live classes" });
  }
};

/**
 * User: Join live class
 */
export const joinLiveClassHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { liveClassId } = req.params;
    const userId = req.user!.uid;

    await markAttendance(liveClassId, userId);
    res.json({ message: "Attendance marked" });
  } catch {
    res.status(500).json({ message: "Failed to join live class" });
  }
};
