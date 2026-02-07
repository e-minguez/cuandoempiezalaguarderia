# 👶 ¿Cuándo empieza la guardería?

A simple, focused calculator for new parents in Spain to determine the optimal date to start kindergarten ("guardería") or childcare. It calculates the timeline by maximizing parental leave coverage.

## 🌟 Features

*   **Optimal Timeline Calculation**:
    *   **Baja Obligatoria**: 6 weeks (mother + father simultaneously).
    *   **Baja Voluntaria**: Remaining weeks sequential (Mother then Father) to maximize coverage.
    *   **Lactancia (Breastfeeding)**: Calculated in *working days* (skipping weekends/holidays).
    *   **Vacaciones (PTO)**: Calculated in *working days*.
*   **Holiday Management**:
    *   **Automatic**: Integration with `date-holidays` for National and Regional (CCAA) holidays.
    *   **Manual**: Click any day on the calendar to toggle it as a local holiday.
*   **Visual Calendar**:
    *   6-month view (expandable) to visualize the entire leave period.
    *   Color-coded periods (Mandatory, Mother, Father, Breastfeeding, PTO).
    *   Weekend and holiday highlighting.
*   **Privacy Focused**: All calculations happen in your browser. No data is sent to any server.

## 🛠️ Tech Stack

*   **Framework**: [Vite](https://vitejs.dev/) + [React](https://react.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) (Icons)
*   **Date Logic**:
    *   [`date-fns`](https://date-fns.org/)
    *   [`date-holidays`](https://github.com/commenthol/date-holidays)
    *   [`react-day-picker`](https://react-day-picker.js.org/)

## 🚀 Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start the development server**:
    ```bash
    npm run dev
    ```

3.  **Build for production**:
    ```bash
    npm run build
    ```

## 📝 License

MIT
