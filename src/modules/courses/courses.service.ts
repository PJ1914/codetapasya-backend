import { Course, Enrollment } from './courses.types.js';
import { CourseStatus } from '../../enums/CourseStatus.enum.js';
import { docClient, TABLES, queryByUserId } from '../../config/dynamo.js';
import { GetCommand, PutCommand, UpdateCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

export class CourseService {
  /**
   * Get all published courses (accessible to free users)
   */
  static async getPublishedCourses() {
    const cmd = new ScanCommand({
      TableName: TABLES.COURSES,
      FilterExpression: '#status = :published',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':published': CourseStatus.PUBLISHED },
    });
    const result = await docClient.send(cmd);
    return result.Items || [];
  }

  /**
   * Get all courses for admin (regardless of status)
   */
  static async getAllCoursesForAdmin() {
    const cmd = new ScanCommand({
      TableName: TABLES.COURSES,
    });
    const result = await docClient.send(cmd);
    return result.Items || [];
  }

  /**
   * Get course by ID - includes access control checks
   */
  static async getCourseById(courseId: string, userId?: string) {
    const cmd = new GetCommand({
      TableName: TABLES.COURSES,
      Key: { courseId },
    });
    const result = await docClient.send(cmd);
    const course = result.Item as Course | undefined;

    if (!course) return null;

    // If user provided, check enrollment for content access
    if (userId) {
      const enrollment = await CourseService.getUserEnrollment(userId, courseId);
      return { ...course, isEnrolled: !!enrollment, enrollment };
    }

    return course;
  }

  /**
   * Get user enrollment in a course
   */
  static async getUserEnrollment(userId: string, courseId: string) {
    const cmd = new ScanCommand({
      TableName: TABLES.ENROLLMENTS,
      FilterExpression: 'userId = :uid AND courseId = :cid',
      ExpressionAttributeValues: { ':uid': userId, ':cid': courseId },
    });
    const result = await docClient.send(cmd);
    return result.Items?.[0] as Enrollment | undefined;
  }

  /**
   * Create a new course (admin only)
   */
  static async createCourse(data: any, createdBy: string) {
    const courseId = randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const course: Course = {
      courseId,
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags || [],
      price: data.price || 0,
      isPremium: data.isPremium || false,
      status: CourseStatus.DRAFT,
      createdBy,
      createdAt: now,
      updatedAt: now,
      enrollmentCount: 0,
    };

    const cmd = new PutCommand({
      TableName: TABLES.COURSES,
      Item: course,
    });
    await docClient.send(cmd);
    return course;
  }

  /**
   * Update course metadata (admin only)
   */
  static async updateCourse(courseId: string, data: any) {
    const now = Math.floor(Date.now() / 1000);
    const updateExpressions: string[] = [];
    const expressionAttributeValues: any = {};
    const expressionAttributeNames: any = {};

    const updateFields = ['title', 'description', 'category', 'tags', 'price', 'isPremium'];
    updateFields.forEach((field) => {
      if (data[field] !== undefined) {
        updateExpressions.push(`#${field} = :${field}`);
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = data[field];
      }
    });

    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = now;

    const cmd = new UpdateCommand({
      TableName: TABLES.COURSES,
      Key: { courseId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });
    const result = await docClient.send(cmd);
    return result.Attributes as Course;
  }

  /**
   * Change course status (admin only)
   */
  static async changeCourseStatus(courseId: string, status: CourseStatus) {
    const now = Math.floor(Date.now() / 1000);
    const cmd = new UpdateCommand({
      TableName: TABLES.COURSES,
      Key: { courseId },
      UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
      ExpressionAttributeNames: { '#status': 'status', '#updatedAt': 'updatedAt' },
      ExpressionAttributeValues: { ':status': status, ':updatedAt': now },
      ReturnValues: 'ALL_NEW',
    });
    const result = await docClient.send(cmd);
    return result.Attributes as Course;
  }

  /**
   * Delete course (admin only)
   */
  static async deleteCourse(courseId: string) {
    const cmd = new DeleteCommand({
      TableName: TABLES.COURSES,
      Key: { courseId },
    });
    await docClient.send(cmd);
    return true;
  }

  /**
   * Enroll user in a course
   */
  static async enrollUserInCourse(userId: string, courseId: string) {
    const enrollmentId = randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const enrollment: Enrollment = {
      enrollmentId,
      userId,
      courseId,
      enrolledAt: now,
      completionPercentage: 0,
    };

    const cmd = new PutCommand({
      TableName: TABLES.ENROLLMENTS,
      Item: enrollment,
    });
    await docClient.send(cmd);

    // Increment enrollment count on course
    const updateCmd = new UpdateCommand({
      TableName: TABLES.COURSES,
      Key: { courseId },
      UpdateExpression: 'SET enrollmentCount = if_not_exists(enrollmentCount, :zero) + :inc',
      ExpressionAttributeValues: { ':zero': 0, ':inc': 1 },
    });
    await docClient.send(updateCmd);

    return enrollment;
  }

  /**
   * Unenroll user from course
   */
  static async unenrollUserFromCourse(userId: string, courseId: string) {
    // Delete enrollment
    const deleteCmd = new DeleteCommand({
      TableName: TABLES.ENROLLMENTS,
      Key: { enrollmentId: `${userId}#${courseId}` }, // Adjust key if needed
    });
    await docClient.send(deleteCmd);

    // Decrement enrollment count
    const updateCmd = new UpdateCommand({
      TableName: TABLES.COURSES,
      Key: { courseId },
      UpdateExpression: 'SET enrollmentCount = if_not_exists(enrollmentCount, :one) - :dec',
      ExpressionAttributeValues: { ':one': 1, ':dec': 1 },
    });
    await docClient.send(updateCmd);

    return true;
  }
}
