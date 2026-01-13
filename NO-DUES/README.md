# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

```

```
NO-DUES
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  ├─ favicon.ico
│  ├─ GBU.jpg
│  └─ vite.svg
├─ README.md
├─ src
│  ├─ App.css
│  ├─ App.jsx
│  ├─ assets
│  │  └─ react.svg
│  ├─ components
│  │  ├─ admin
│  │  │  └─ ApplicationsList.jsx
│  │  ├─ common
│  │  │  ├─ ApprovalControls.jsx
│  │  │  ├─ Header.jsx
│  │  │  ├─ HomeButton.jsx
│  │  │  ├─ RoleLayout.jsx
│  │  │  └─ Sidebar.jsx
│  │  └─ ui
│  │     ├─ accordion.jsx
│  │     ├─ alert-dialog.jsx
│  │     ├─ alert.jsx
│  │     ├─ aspect-ratio.jsx
│  │     ├─ avatar.jsx
│  │     ├─ badge.jsx
│  │     ├─ breadcrumb.jsx
│  │     ├─ button.jsx
│  │     ├─ calendar.jsx
│  │     ├─ card.jsx
│  │     ├─ carousel.jsx
│  │     ├─ chart.jsx
│  │     ├─ checkbox.jsx
│  │     ├─ collapsible.jsx
│  │     ├─ command.jsx
│  │     ├─ context-menu.jsx
│  │     ├─ dialog.jsx
│  │     ├─ drawer.jsx
│  │     ├─ dropdown-menu.jsx
│  │     ├─ form.jsx
│  │     ├─ hover-card.jsx
│  │     ├─ input-otp.jsx
│  │     ├─ input.jsx
│  │     ├─ label.jsx
│  │     ├─ menubar.jsx
│  │     ├─ navigation-menu.jsx
│  │     ├─ pagination.jsx
│  │     ├─ popover.jsx
│  │     ├─ progress.jsx
│  │     ├─ radio-group.jsx
│  │     ├─ resizable.jsx
│  │     ├─ scroll-area.jsx
│  │     ├─ select.jsx
│  │     ├─ separator.jsx
│  │     ├─ sheet.jsx
│  │     ├─ sidebar.jsx
│  │     ├─ skeleton.jsx
│  │     ├─ slider.jsx
│  │     ├─ sonner.jsx
│  │     ├─ switch.jsx
│  │     ├─ table.jsx
│  │     ├─ tabs.jsx
│  │     ├─ textarea.jsx
│  │     ├─ toast.jsx
│  │     ├─ toaster.jsx
│  │     ├─ toggle-group.jsx
│  │     ├─ toggle.jsx
│  │     ├─ tooltip.jsx
│  │     └─ use-toast.js
│  ├─ contexts
│  │  ├─ ApplicationContext.jsx
│  │  ├─ AuthContext.jsx
│  │  └─ StudentAuthContext.jsx
│  ├─ hooks
│  │  └─ useAuth.jsx
│  ├─ index.css
│  ├─ lib
│  │  └─ utils.js
│  ├─ main.jsx
│  ├─ pages
│  │  ├─ Accounts
│  │  │  ├─ AccountsDashboard.jsx
│  │  │  ├─ ApplicationActionModal.jsx
│  │  │  ├─ ApplicationsTable.jsx
│  │  │  ├─ DashboardStats.jsx
│  │  │  └─ HistoryPage.jsx
│  │  ├─ Admin
│  │  ├─ CRC
│  │  │  ├─ ApplicationActionModal.jsx
│  │  │  ├─ ApplicationsTable.jsx
│  │  │  ├─ CRCDashboard.jsx
│  │  │  ├─ DashboardStats.jsx
│  │  │  └─ HistoryPage.jsx
│  │  ├─ Hostels
│  │  │  ├─ ApplicationActionModal.jsx
│  │  │  ├─ ApplicationsTable.jsx
│  │  │  ├─ DashboardStats.jsx
│  │  │  ├─ HistoryPage.jsx
│  │  │  └─ HostelsDashboard.jsx
│  │  ├─ Laboratories
│  │  │  ├─ ApplicationActionModal.jsx
│  │  │  ├─ ApplicationsTable.jsx
│  │  │  ├─ DashboardStats.jsx
│  │  │  ├─ HistoryPage.jsx
│  │  │  └─ LabDashboard.jsx
│  │  ├─ Library
│  │  │  ├─ ApplicationActionModal.jsx
│  │  │  ├─ ApplicationsTable.jsx
│  │  │  ├─ DashboardStats.jsx
│  │  │  ├─ HistoryPage.jsx
│  │  │  └─ LibraryDashboard.jsx
│  │  ├─ login
│  │  │  └─ loginscreen.jsx
│  │  ├─ MainPage.jsx
│  │  ├─ Schools
│  │  │  ├─ ApplicationActionModal.jsx
│  │  │  ├─ ApplicationsTable.jsx
│  │  │  ├─ DashboardStats.jsx
│  │  │  ├─ HistoryPage.jsx
│  │  │  └─ SchoolDashboard.jsx
│  │  ├─ Sports
│  │  │  ├─ ApplicationActionModal.jsx
│  │  │  ├─ ApplicationsTable.jsx
│  │  │  ├─ DashboardStats.jsx
│  │  │  ├─ HistoryPage.jsx
│  │  │  └─ SportsDashboard.jsx
│  │  └─ Student
│  │     ├─ Login.jsx
│  │     ├─ MyApplications.jsx
│  │     ├─ Overview.jsx
│  │     ├─ Register.jsx
│  │     ├─ StudentDashboard.jsx
│  │     ├─ StudentEntry.jsx
│  │     └─ TrackStatus.jsx
│  └─ utils
│     ├─ applicationWorkflow.js
│     └─ auth.js
└─ vite.config.js

```