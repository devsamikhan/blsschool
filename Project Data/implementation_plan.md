# Universal Professional Report System (V2)

This plan outlines the final refinements for the BLS School Report System to ensure a "Universal Official" look that renders perfectly in print previews across all staff roles.

## Proposed Changes

### [CSS] Print Optimization

#### [MODIFY] [index.css](file:///d:/blsschool-main%20-%20Copy/src/index.css)
- Force `h-screen` and `overflow-hidden` to `auto` and `visible` respectively during print.
- Ensure the `main` container allows full-page printing without clipping.
- Hide all sidebars, headers, and dashboard navigation elements globally for `@media print`.

### [Component] Universal Template

#### [MODIFY] [ReportTemplate.tsx](file:///d:/blsschool-main%20-%20Copy/src/components/reports/ReportTemplate.tsx)
- Refine the design to look more like an "Official Government/Institutional Letterhead".
- Ensure the Logo is explicitly sized and positioned for high-quality printing.
- Add a "Document Reference" or context area that can be dynamically populated.

### [Pages] Integration

#### [MODIFY] [AccountantReports.tsx](file:///d:/blsschool-main%20-%20Copy/src/pages/accountant/AccountantReports.tsx)
- Ensure all charts have "Print High Quality" settings.
- Add a "Summary Table" of values below charts for "Real Values" visibility as requested.

#### [MODIFY] [PrincipalReports.tsx](file:///d:/blsschool-main%20-%20Copy/src/pages/principal/PrincipalReports.tsx)
- Apply the same professional table formatting for Class Performance and Enrollment.

#### [NEW] [TeacherStudentReport.tsx] (Optional/If applicable)
- If teachers need to print student lists or performance, wrap them in the `ReportTemplate`.

---

## Verification Plan

### Manual Verification
1.  **Print Preview Test**: 
    - Open any Staff Report (Accountant/Principal).
    - Trigger Print (Ctrl+P).
    - **Expected**: Full official letterhead is visible at the top, no sidebar/nav, content is not clipped.
2.  **Student Restriction**: 
    - Login as a Student.
    - **Expected**: No "Reports" menu item. No access to `/accountant/reports` or `/principal/reports`.
3.  **Real Values**: 
    - Verify that data tables showing the "real values" (e.g., fee amounts, student counts) are clear and legible in the print preview.
