# Overview

This is a modern e-commerce web application for Arçelik, a Turkish home appliance brand. The application features a product catalog with categories like refrigerators, washing machines, air conditioners, and built-in appliances. It includes shopping cart functionality, product search, campaigns section, and corporate information pages. The project is built as a full-stack application with a React frontend and Express.js backend, designed to showcase home appliances with Turkish content and branding.

## Recent Changes (Aug 19, 2025)
- **Database Migration Complete**: Successfully migrated from MemStorage to DatabaseStorage for persistent data
- **Slider Management**: All slider settings (image upload, show/hide) now persist in database
- **Homepage Product Selection**: Featured and popular product selections survive server restarts
- **Admin Panel Fixed**: Categories, navigation, and product management now working with database
- **Authentication Restored**: Test admin user created (emreabd123@gmail.com / emre123)

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API structure with route handlers in `/server/routes.ts`
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **Development**: Hot module replacement and middleware for request logging

## Data Storage Solutions
- **ORM**: Drizzle ORM configured for PostgreSQL with Neon Database
- **Schema**: Shared TypeScript schema definitions in `/shared/schema.ts`
- **Tables**: Users, products, and cart items with proper relationships
- **Validation**: Zod schemas for runtime validation of API inputs and outputs
- **Current Implementation**: Memory-based storage with sample data for development

## Authentication and Authorization
- **Session Management**: Basic session structure prepared with connect-pg-simple for PostgreSQL sessions
- **User Schema**: Defined but not fully implemented in current iteration
- **Security**: Express middleware configured for JSON parsing and CORS handling

## External Dependencies
- **Database**: Neon Database (PostgreSQL) configured through Drizzle
- **UI Components**: Radix UI primitives for accessible component foundations
- **Development**: Replit-specific plugins for development environment integration
- **Fonts**: Google Fonts integration (DM Sans, Geist Mono, Architects Daughter, Fira Code)
- **Icons**: Lucide React for consistent iconography
- **Validation**: Zod for schema validation and type inference
- **Date Handling**: date-fns for date manipulation and formatting