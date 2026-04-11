# Public Pages: Smooth Scrolling & Animation Plan

Goal: To elevate the premium, cinematic feel of the BLS Isakhel public pages by introducing smooth scrolling and sophisticated, scroll-triggered micro-animations. LMS features remain out of scope.

## 1. Smooth Scrolling Infrastructure

To achieve a truly "premium" feel, native browser scrolling can feel rigid. We will implement **Lenis** (by Studio Freight), a lightweight, robust smooth scrolling library that works perfectly with React and Framer Motion.

- **Dependency Addition:** `npm install @studio-freight/react-lenis`
- **Global Setup:** Wrap the `PublicLayout` or the main App routes in the `<ReactLenis>` provider to ensure smooth scrolling applies consistently across all public pages.

## 2. Animation Strategy (Framer Motion)

The pages already use `framer-motion` for basic `initial` -> `animate` and some `whileInView` effects. We will upgrade these to be more dynamic and relative to scroll position.

**Key Techniques:**
1.  **Parallax Effects:** Moving background elements (like the colored blurs) or images at a slightly different speed than the scroll to create depth.
2.  **Staggered Reveals:** When lists of cards or stats enter the viewport, they shouldn't just fade in all at once; they should stagger sequentially. (Already partially used, needing refinement).
3.  **Scroll-driven scales/opacities:** Tying the opacity or scale of an element directly to `useScroll` from Framer Motion, rather than just triggering once it hits the viewport. (e.g., Hero sections fading out as you scroll down).

## 3. Page-by-Page Implementation

### Global (All Public Pages)
- Enable Lenis smooth scrolling.
- Ensure sticky navbars interact smoothly with the new scroll context.

### A. Home Page (`/`)
- **Hero Section:** Add a subtle parallax effect to the background video/image. Link the opacity of the main heading to the scroll position so it fades out smoothly as the user scrolls down.
- **Stats Section:** Enhance the staggered fade-in.
- **Immersive Experience (Robot):** Add a slight rotational or vertical parallax to the robot image relative to scroll.
- **Testimonials/Bento Grid:** Implement scroll-triggered reveals for each grid cell.

### B. About Page (`/about`)
- **Hero:** Parallax background.
- **Legacy Section:** Add a subtle scroll-reveal to the "EST. 2014" badge.
- **Strategic Pillars:** Staggered reveal of the cards with slight upward motion.

### C. Admissions Page (`/admissions`)
- **Hero:** Scroll-linked opacity fade.
- **Admission Procedure:** Staggered card reveals.
- **Fee Matrix:** Smooth fade-in of the table/cards when entering the viewport.

### D. Academics & Programs Pages (`/academics`, `/programs`)
- **Subject Tabs/Sectors:** Enhance the entry animation of the content when switching tabs.
- **Extracurriculars Gallery:** Add a slight parallax effect to the images inside the cards as the user scrolls past.

### E. Contact Page (`/contact`)
- **Hero:** Parallax background.
- **Map Section:** Add a zoom-in parallax effect on the map placeholder image as it enters the viewport.

## User Review Required

> [!IMPORTANT]
> Do you approve the use of the `Lenis` library for smooth scrolling? It is the industry standard for this type of aesthetic and highly performant. If approved, I will proceed with installing it and refactoring the animations page by page.
