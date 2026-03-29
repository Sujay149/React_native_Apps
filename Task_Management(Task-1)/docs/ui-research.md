# TaskTrack UI/UX Research Notes

Date: 2026-03-28
Scope: Mobile task management UX patterns and practical guidance for TaskTrack redesign.

## 1. Mobile UI Patterns

What I learned:
- Card layouts work well when each task carries metadata (status, priority, assignee, location) because cards can visually group details.
- Dense list layouts are better for power users and long backlogs; they should still include quick status cues.
- FAB placement: bottom-right is a familiar pattern for primary create actions; keep clear from bottom tab overlap.
- Bottom sheet vs full-screen modal:
  - Bottom sheet is better for quick choices (status picker, photo source, filters).
  - Full-screen is better for multi-step or long forms.
- Swipe actions improve speed for repetitive actions: right swipe for complete, left swipe for delete/archive.
- Strong empty states should include icon/illustration, explanation, and one explicit CTA (not only "No data").

Real app example:
- Google Tasks: simple list with clear add affordance and lightweight interaction model.

## 2. Color and Typography

What I learned:
- Keep a compact palette (5 core colors + semantic states):
  - Background/surface
  - Primary
  - Accent
  - Success/warning/danger semantic tones
- Semantic colors should drive UI states (error border, success badge, warning sync state).
- Text hierarchy should remain stable across screens:
  - H1: page identity
  - H2/H3: section headers
  - Body: primary content
  - Caption: metadata
- Use bold weight for actionable labels and key metrics; regular/medium for supporting copy.
- Light mode first, dark mode later: ensure tokenized colors so dark theme can be added without rewriting styles.

Real app example:
- Asana mobile: clear hierarchy and semantic color usage for project/task statuses.

## 3. Micro-interactions

What I learned:
- Press feedback should be immediate (opacity, scale, ripple/haptic where available).
- Skeleton loaders are more reassuring than isolated spinners because users see expected layout structure.
- Lightweight transition animation (fade/slide) improves perceived polish for screen navigation.
- Toast/snackbar is preferred for non-blocking success states; alerts are best for destructive confirmations.
- Haptic cues should be used sparingly for completion, confirmation, and destructive actions.

Real app example:
- Todoist mobile: responsive interactions and smooth transitions make task actions feel fast.

## 4. Form UX

What I learned:
- Inline validation should appear while user edits (or on blur), not only after submit.
- Floating labels prevent ambiguity once fields are filled and reduce placeholder over-reliance.
- Keyboard types should match field intent (email-address, phone-pad, numeric).
- Auto-focus on first important field reduces friction for create/edit forms.
- Submit button should remain disabled until required fields are valid.
- Keyboard avoiding + scrollable forms are required on mobile to keep focused input visible.

Real app example:
- Notion mobile quick-create flows: compact forms with clear focus and action feedback.

## 5. Accessibility Basics

What I learned:
- Minimum touch target should be at least 48x48 for tappable elements.
- Ensure strong contrast for text/icon and interactive controls.
- Add meaningful accessibility labels to icon-only buttons.
- Support dynamic type/font scaling where possible; avoid clipping in fixed-height containers.
- Do not rely on color alone for status; pair with text and icon.

Real app example:
- Microsoft To Do: clear labels, readable contrast, and comfortable touch targets.

## Practical Design Decisions Applied to TaskTrack

- Use shared theme tokens for color, typography, spacing, radii, and shadows.
- Use card-based task list with status dot + priority badge.
- Add FAB for create action and swipe gestures for complete/delete.
- Add skeleton task cards while loading.
- Improve empty state with icon + guidance + CTA.
- Use floating labels and inline validation in create/edit flows.
- Use bottom sheet for task status selection.
- Use visual profile analytics (progress ring + mini weekly bar chart).
