
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
│  ├─ api
│  │  └─ axios.js
│  ├─ App.css
│  ├─ App.jsx
│  ├─ assets
│  │  └─ react.svg
│  ├─ components
│  │  ├─ common
│  │  │  ├─ ApprovalControls.jsx
│  │  │  ├─ HomeButton.jsx
│  │  │  ├─ OverdueAlertModal.jsx
│  │  │  ├─ RoleLayout.jsx
│  │  │  └─ Sidebar.jsx
│  │  ├─ modals
│  │  │  └─ SessionTimeoutModal.jsx
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
│  │  │  ├─ AdminApplicationModals.jsx
│  │  │  ├─ AdminDashboard.jsx
│  │  │  ├─ ApplicationManagement.jsx
│  │  │  ├─ ApplicationsDetailModal.jsx
│  │  │  ├─ AuditLogs.jsx
│  │  │  ├─ CreateDepartmentModal.jsx
│  │  │  ├─ CreateSchoolModal.jsx
│  │  │  ├─ DashboardStats.jsx
│  │  │  ├─ DeleteConfirmModal.jsx
│  │  │  ├─ DeleteStructureModal.jsx
│  │  │  ├─ LogoutConfirmModal.jsx
│  │  │  ├─ PerformanceChart.jsx
│  │  │  ├─ ProfileModal.jsx
│  │  │  ├─ QuickActions.jsx
│  │  │  ├─ RecentLogsWidget.jsx
│  │  │  ├─ RegisterUserModal.jsx
│  │  │  ├─ RejectionModal.jsx
│  │  │  ├─ Reports.jsx
│  │  │  ├─ SchoolDeptManagement.jsx
│  │  │  ├─ SystemMetricsWidget.jsx
│  │  │  ├─ UserActivityTable.jsx
│  │  │  └─ UserManagement.jsx
│  │  ├─ CRC
│  │  │  ├─ ApplicationActionModal.jsx
│  │  │  ├─ ApplicationsTable.jsx
│  │  │  ├─ CRCDashboard.jsx
│  │  │  ├─ DashboardStats.jsx
│  │  │  └─ HistoryPage.jsx
│  │  ├─ HOD
│  │  │  ├─ ApplicationActionModal.jsx
│  │  │  ├─ ApplicationsTable.jsx
│  │  │  ├─ DashboardStats.jsx
│  │  │  ├─ HistoryPage.jsx
│  │  │  └─ HODDashboard.jsx
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
│  │  ├─ Office
│  │  │  ├─ ApplicationActionModal.jsx
│  │  │  ├─ ApplicationsTable.jsx
│  │  │  ├─ DashboardStats.jsx
│  │  │  ├─ HistoryPage.jsx
│  │  │  └─ OfficeDashboard.jsx
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
│  │     ├─ ForgotPasswordModal.jsx
│  │     ├─ Login.jsx
│  │     ├─ MyApplications.jsx
│  │     ├─ Overview.jsx
│  │     ├─ Register.jsx
│  │     ├─ StudentDashboard.jsx
│  │     ├─ StudentEntry.jsx
│  │     └─ TrackStatus.jsx
│  └─ utils
│     ├─ applicationWorkflow.js
│     ├─ auth.js
│     └─ navigation.js
├─ vercel.json
└─ vite.config.js

```