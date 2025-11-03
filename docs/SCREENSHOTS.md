# Application Screenshots Documentation

This document describes the various screens and features of the Dime To Dozen application.

## Current Screenshots

### Expense Item Component
Located in `docs/screenshots/`:
- `expense-item-initial-state.png` - Initial view of an expense item
- `expense-item-edit-mode.png` - Expense item in edit mode
- `expense-item-after-save.png` - Expense item after saving changes

## Recommended Additional Screenshots

### Home Page (Create Expense)
**Route**: `/`

Features to capture:
- Empty state with "Create New Expense" form
- Form fields: Category dropdown, Amount input, Description field
- Submit button
- Navigation drawer (collapsed and expanded states)

### Monthly Overview
**Route**: `/monthly-overview`

Features to capture:
- Budget meters showing spending per category
- Category breakdown with visual indicators
- Total spending summary
- Budget vs. actual comparison
- Empty state (when no expenses exist)
- Full state (with multiple categories and expenses)

### Copy Groups
**Route**: `/copy-groups`

Features to capture:
- List of budget groups
- Copy/duplicate controls
- Group selection interface
- Confirmation dialog when copying

### Navigation and Layout

Components to document:
- **NavDrawer**: Side navigation with route links
- **Material Design Theme**: Dark theme implementation
- **Mobile Responsive Views**: Different breakpoints (mobile, tablet, desktop)

### Interactive States

Important UI states to capture:
- Loading states
- Error states
- Empty states
- Success notifications/feedback
- Form validation messages

## Screenshot Guidelines

When taking screenshots:
1. Use a consistent window size (1280x1024 or similar)
2. Include both mobile and desktop views
3. Capture both light and dark states (if applicable)
4. Show interactive elements in different states (hover, active, disabled)
5. Include tooltips and help text where present
6. Capture any modals or dialogs in use

## Technical Notes

The application uses:
- Material Design components for consistent UI
- Dark theme by default
- Mobile-first responsive design
- Vue 3 components with TypeScript

## Screenshot Tool Setup

For local development, screenshots can be captured using:
- Playwright with `deno task dev` running
- Browser DevTools for responsive views
- Chromium headless for automated captures
- Manual screenshots with full-page capture extensions
