# Overview

ElegantShop is a modern e-commerce web application built with React and Express.js that provides both customer-facing shopping features and administrative management capabilities. The application serves as a complete online store platform where customers can browse products, add items to their cart, and submit contact information for purchases. Administrators can manage products, categories, and view customer inquiries through a dedicated admin panel.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side application is built using React with TypeScript and leverages modern UI patterns:

- **Component Framework**: React with TypeScript for type safety and modern development practices
- **UI Components**: Radix UI primitives with shadcn/ui for consistent, accessible design components
- **Styling**: Tailwind CSS for utility-first styling with custom CSS variables for theming
- **State Management**: React Query for server state management and React Context for client-side state (cart and theme)
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

The application follows a component-based architecture with clear separation of concerns:
- UI components in `/components/ui/` for reusable design elements
- Feature components for specific functionality (admin dashboard, product grid, etc.)
- Context providers for global state management (cart, theme)
- Custom hooks for reusable logic

## Backend Architecture

The server-side application uses Express.js with a file-based storage system:

- **Server Framework**: Express.js with TypeScript for API endpoints
- **Data Storage**: JSON file-based storage system with an abstraction layer for potential database migration
- **Authentication**: Session-based authentication using express-session
- **Password Security**: bcrypt for password hashing
- **API Design**: RESTful API structure with clear endpoint organization

The backend implements a storage abstraction pattern through the `IStorage` interface, allowing for easy migration from JSON files to a database system. The current `JSONFileStorage` implementation provides:
- Product management (CRUD operations)
- Category management
- Customer data collection
- Admin authentication

## Data Storage Solutions

Currently uses a file-based storage system with plans for database migration:

- **Current Implementation**: JSON files stored in `/server/data/` directory
- **Storage Abstraction**: Interface-based design allows seamless migration to databases
- **Database Configuration**: Drizzle ORM configured for PostgreSQL with schema definitions ready
- **Migration Ready**: Database schema defined in `/shared/schema.ts` using Drizzle and Zod

The schema includes:
- Products (with pricing, inventory, categories, ratings)
- Categories (for product organization)
- Customers (contact information and interested products)
- Admins (authentication credentials)

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, React Query for frontend state management
- **Express.js**: Server framework with session management capabilities
- **TypeScript**: Type safety across the entire application stack

### UI and Styling
- **Radix UI**: Accessible component primitives for consistent UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **shadcn/ui**: Pre-built component library based on Radix UI

### Development and Build Tools
- **Vite**: Modern build tool and development server
- **Drizzle ORM**: Database toolkit for PostgreSQL integration
- **Zod**: Schema validation library for type-safe data handling

### Database Integration
- **@neondatabase/serverless**: PostgreSQL database driver for Neon
- **Drizzle Kit**: Database migration and management tools

### Authentication and Security
- **bcrypt**: Password hashing for secure authentication
- **express-session**: Session management for user authentication
- **connect-pg-simple**: PostgreSQL session store (configured but not active with current file storage)

### Form and Data Handling
- **React Hook Form**: Form state management with validation
- **@hookform/resolvers**: Integration between React Hook Form and Zod validation

The application is architected to be easily deployable and scalable, with clear separation between frontend and backend concerns, and a storage layer that can evolve from file-based to database-driven as needed.