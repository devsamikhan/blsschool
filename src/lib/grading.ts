/**
 * grading.ts
 * Centralized grading rules for BLS Isakhel.
 * Used by PrincipalExamResults to auto-calculate grades from marks.
 */

export function autoGrade(obtained: number, total: number): string {
  if (total <= 0) return 'N/A';
  const pct = (obtained / total) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
}

export function autoStanding(percentage: number): 'PROMOTED' | 'HELD' | 'PROBATION' {
  if (percentage >= 50) return 'PROMOTED';
  if (percentage >= 33) return 'PROBATION';
  return 'HELD';
}

export function calculateExamSummary(exams: { totalMarks: number; obtainedMarks: number }[]) {
  const total = exams.reduce((s, e) => s + e.totalMarks, 0);
  const obtained = exams.reduce((s, e) => s + e.obtainedMarks, 0);
  const percentage = total > 0 ? (obtained / total) * 100 : 0;
  return { total, obtained, percentage: parseFloat(percentage.toFixed(1)) };
}
