# TripEase Ghana 🇬🇭

TripEase Ghana is a comprehensive trip planning platform designed to help travellers discover and book experiences across Ghana.

## Features

- **Hotel Booking**: Find and book hotels across Accra, Cape Coast, Takoradi, and more.
- **Tour Guides**: Connect with certified local guides for authentic experiences.
- **Attraction Search**: Discover landmarks, national parks, and cultural sites.
- **Transport Services**: Organize movement between cities with ease.
- **Trip Planner**: Build multi-day itineraries with integrated cost calculations.
- **Secure Payments**: Integrated with local payment methods like Mobile Money (MoMo).

## Technology Stack

- **Frontend**: Vite, React, TypeScript, Tailwind CSS, shadcn/ui.
- **Backend**: Node.js, Express, PostgreSQL.
- **State Management**: React Query.
- **Icons**: Lucide React.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL database

### Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd project-work
   ```

2. Install dependencies:
   ```sh
   npm install
   cd backend && npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the `backend` directory based on the configuration.

4. Start the development servers:
   ```sh
   # In the root directory
   npm run dev
   
   # In the backend directory
   npm run dev
   ```

## Documentation

- [Admin User Management](docs/admin-user-management.md) - Detailed features for administrators.
- [Setup Guide](SETUP.md) - How to setup the project.
- [Implementation Status](IMPLEMENTATION_STATUS.md) - Current progress and features.

## License

&copy; ${new Date().getFullYear()} TripEase Ghana. All rights reserved.
