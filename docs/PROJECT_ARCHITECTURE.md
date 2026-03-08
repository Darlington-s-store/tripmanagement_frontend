# TripEase Ghana - Project Architecture & Modules

This document outlines the core functional modules of the TripEase Ghana platform, as defined for the final year project documentation.

---

## 🛡️ 1. Admin Module
The Admin Module provides comprehensive control over the platform's ecosystem, focusing on user management and high-level system maintenance.

### A. User Management
Administrators have full visibility and authority over all registered accounts.
*   **User Discovery**: View all users with advanced search (Name, Email, Phone) and role filtering.
*   **Lifecycle Control**: Activate, suspend, or reactivate traveler and provider accounts.
*   **Data Integrity**: Update profile details, change user roles (Traveller, Provider, Admin), and permanently delete duplicate/fraudulent accounts.
*   **Activity Monitoring**: Track registration dates and user interactions to maintain platform security.

### B. Access Control
*   Manage granular permissions for **Traveller**, **Provider**, and **Admin** roles.
*   Control system-wide settings and administrative approvals.

---

## 👤 2. User Module
The User Module is designed for the platform's primary audience, providing seamless travel planning and interaction features.

### A. Core Traveler Features
*   **Account Management**: Personal dashboard to manage bookings, profiles, and travel settings.
*   **Travel Planning**: Use the AI-assisted itinerary builder and search for hotels, transport, and guides.
*   **Booking History**: View confirmed, pending, and past travel arrangements.

### B. Feedback Submission (Reviews)
Users can share their experiences after using services, subject to strict conditions:
*   **Verified Reviews**: Only logged-in users with **Completed Bookings** can submit reviews.
*   **Service-Specific Ratings**: Rate and comment on hotels, transport, and tour guide services individually.
*   **Dynamic Star System**: Provide quantitative feedback (1-5 stars) across multiple service aspects.

---

## ⭐ 3. Review & Moderation Module
This module ensures the transparency and trustworthiness of the platform by balancing user feedback with administrative oversight.

### A. User Review Conditions
*   Users can only review a service they have actually used (verified by booking ID).
*   Drafting/editing capabilities are available before final submission.

### B. Administrative Moderation
The admin serves as the final moderator for all user-generated content:
*   **Moderation Pipeline**: View all reviews across the platform in a centralized dashboard.
*   **Review Control**: Approve valid feedback, reject or edit inappropriate/offensive content.
*   **Quality Assurance**: Identify and delete "fake" or suspicious reviews to prevent rating manipulation.
*   **Reporting Support**: Manage flagged or reported reviews from other users.

### C. Provider Interaction
*   **Insight Dashboard**: Providers can view all reviews related specifically to their listings.
*   **Response Management**: Providers can respond to reviews to resolve issues or thank travelers.
*   **Service Ratings**: Detailed visibility into how their specific services (Hotels, Transport) are being rated.

---

## 📝 Combined Project Statement
**TripEase Ghana allows users to submit verified reviews only after completing bookings, while the administrator provides critical oversight through the management of both user accounts and review moderation. This ensures a safe, transparent, and high-quality travel ecosystem for West Africa.**

## 📖 Feature Summary Table

| Feature | Admin | Traveler | Provider |
| :--- | :---: | :---: | :---: |
| Manage Users | ✅ | ❌ | ❌ |
| Create Reviews | ❌ | ✅ (Verified) | ❌ |
| Moderate Reviews | ✅ | ❌ | ❌ |
| Suspend Accounts | ✅ | ❌ | ❌ |
| Respond to Reviews | ❌ | ❌ | ✅ |
| AI Itinerary Planning | ❌ | ✅ | ❌ |
| View All Reviews | ✅ | ✅ | ✅ (Own Only) |
