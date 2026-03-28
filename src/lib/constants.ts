export const PAGE_SIZE = 20;

export function makeEnrollmentId(uid: string, courseId: string): string {
  return `${uid}::${courseId}`;
}

export function makeProgressId(
  uid: string,
  courseId: string,
  lessonId: string
): string {
  return `${uid}::${courseId}::${lessonId}`;
}

export function makeFavoriteId(uid: string, assetId: string): string {
  return `${uid}::${assetId}`;
}
