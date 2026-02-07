# AGENTS.md

This file contains instructions for AI agents (coding assistants) working on this repository.
Please read this carefully before generating code or executing commands.

## 1. Project Overview
**Status:** Phase 1 Complete (Basic functionality, visual calendar, holiday handling).
**Description:** A Spanish-centric web application to calculate the optimal start date for kindergarten ("guardería") based on parental leave ("baja"), breastfeeding leave ("lactancia"), and PTO ("vacaciones").
**Goal:** Provide an easy-to-use tool for new parents in Spain to visualize their leave timeline.

## 2. Technology Stack & Commands

**Stack:**
- **Framework:** Vite + React + TypeScript
- **Styling:** Tailwind CSS (Shadcn/UI-inspired components) + `lucide-react` (icons)
- **Date Logic:** `date-fns` (Local: `es`) + `date-holidays` (Spanish holidays)
- **Calendar:** `react-day-picker` (v9)

**Commands:**
- **Install:** `npm install`
- **Dev Server:** `npm run dev` (Runs on localhost:5173)
- **Build:** `npm run build` (Outputs to `dist/`)
- **Preview:** `npm run preview`

## 3. Project Structure

- `src/App.tsx`: Main application component. Contains state (birth date, weeks config, holidays) and the visual calendar layout.
- `src/lib/calculator.ts`: Core logic. Calculates start/end dates for each period.
    - **Logic:** "Bajas" are calendar weeks (continuous). "Lactancia"/"Vacaciones" are working days (skip weekends/holidays).
- `src/lib/holidays.ts`: Wrapper around `date-holidays` to manage National and Regional (CCAA) holidays.
- `src/components/ColorPicker.tsx`: Custom lightweight color swatch picker.
- `src/lib/utils.ts`: standard `cn` helper for Tailwind class merging.

## 4. Business Logic & Rules (Spain 2025/2026)

1.  **Leave Types:**
    -   **Baja Obligatoria (Mandatory):** 6 weeks immediately after birth. Simultaneous for both parents.
    -   **Baja Voluntaria (Voluntary):** Remaining weeks (default total 17/19). Taken sequentially (Mother then Father) to maximize coverage.
    -   **Lactancia (Breastfeeding):** Calculated in *working days*. If a holiday falls in this period, the period extends.
    -   **Vacaciones (PTO):** Calculated in *working days*.

2.  **Holidays:**
    -   **Source:** `date-holidays` library for National + Autonomous Community (Region) holidays.
    -   **Manual:** User can click on the calendar to toggle "Local Holidays" (e.g., city patron saint days).
    -   **Visuals:** Holidays are crossed out (`line-through`) and highlighted in red/orange. Weekends are greyed out.

3.  **Regional Differences:**
    -   **Private Sector:** Uniform across Spain (19 weeks total typically).
    -   **Public Sector:** Some regions (Basque Country, Andalusia) have specific extra weeks. The app handles this via the manual "Weeks" input.

## 5. UI/UX Guidelines

-   **Layout:** Responsive. Sidebar for configuration (collapsible on desktop), main area for calendar.
-   **Calendar:**
    -   Shows 6 months by default (8 when sidebar closed, 1 on mobile).
    -   Clicking a day toggles it as a custom holiday.
-   **Theme:** Clean, pastel colors (Tailwind 200 series) for leave periods.
-   **Accessibility:** Ensure text contrast (dark text on pastel backgrounds).

## 6. Agent Workflow Rules

1.  **Read First:** Check `src/App.tsx` and `src/lib/calculator.ts` before modifying logic.
2.  **Incremental Changes:** Verify build (`npm run build`) after significant changes.
3.  **Localization:** Keep the UI in Spanish (`es` locale).
4.  **No Hallucinations:** Do not add new heavy dependencies (like Moment.js or full UI libraries) without asking. Use existing tools.
