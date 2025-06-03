# TowerIQ - Telecom Mission Control

TowerIQ is a modern, enterprise-grade telecom infrastructure management platform that provides comprehensive control and monitoring capabilities for telecom towers, devices, and security policies. Built with a focus on user experience and modern design, TowerIQ helps telecom operators visualize and manage their infrastructure efficiently.

## 🌟 Features

- **Tower Management**

  - View tower status and performance metrics
  - Track carrier connections and coverage
  - Manage equipment and maintenance schedules
  - View tower analytics and statistics
  - Real-time device discovery and monitoring

- **Device Management**

  - Comprehensive device inventory
  - Device status monitoring
  - Security compliance tracking
  - Device policy management
  - Automatic device discovery and approval

- **Security Policy Management**

  - Create and manage security policies
  - Policy compliance monitoring
  - Policy enforcement tracking
  - Policy updates and versioning
  - Real-time policy enforcement

- **App Management**

  - Track app usage and actions
  - Monitor app compliance
  - Manage app permissions
  - Track app security metrics

- **Modern UI/UX**
  - Beautiful, responsive design
  - Dark/Light mode support
  - Interactive dashboards and charts
  - Smooth page transitions and animations
  - Offline support with service workers

## 🛠 Tech Stack

- **Frontend Framework**

  - [Next.js 15.3.3](https://nextjs.org/) (App Router)
  - [React 19.0.0](https://reactjs.org/)
  - [TypeScript 5.8.3](https://www.typescriptlang.org/)

- **Styling & UI**

  - [Tailwind CSS 4](https://tailwindcss.com/)
  - [shadcn/ui](https://ui.shadcn.com/)
  - [Lucide Icons 0.511.0](https://lucide.dev/)
  - [Framer Motion 12.15.0](https://www.framer.com/motion/)

- **Authentication & Security**

  - [NextAuth.js 4.24.11](https://next-auth.js.org/)
  - [bcryptjs 3.0.2](https://github.com/dcodeIO/bcrypt.js/)

- **Development Tools**
  - [ESLint 9](https://eslint.org/)
  - [TypeScript 5.8.3](https://www.typescriptlang.org/)
  - [tsx 4.19.4](https://github.com/esbuild-kit/tsx)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm (Node Package Manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-org/telecom-mission-control.git
   cd telecom-mission-control/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   BCRYPT_SALT_ROUNDS=10
   ```

4. Generate seed data:

   ```bash
   npm run generate-seed
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Environment Variables

| Variable             | Description                                | Required | Default |
| -------------------- | ------------------------------------------ | -------- | ------- |
| `NEXTAUTH_URL`       | The base URL of your application           | Yes      | -       |
| `NEXTAUTH_SECRET`    | Secret key for JWT encryption              | Yes      | -       |
| `BCRYPT_SALT_ROUNDS` | Number of salt rounds for password hashing | Yes      | 10      |

### Development Configuration

- **ESLint**: Configured with strict TypeScript rules
- **TypeScript**: Strict mode enabled
- **Docker**: Containerized development environment

## 📝 Data Model

The application uses a comprehensive data model that includes:

- Enterprises and Users
- Devices and Towers
- Policies and Rules
- Apps and Actions
- Metrics and Analytics

For detailed information about the data model, refer to the documentation in the `lib/data` directory.

## 🎨 Theming

The application supports both light and dark modes with:

- Custom gradient backgrounds
- Glass-effect components
- Consistent color scheme
- Smooth transitions
- Responsive design

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

## 🔐 Authentication

The application uses NextAuth.js for authentication with the following features:

- Email/Password authentication
- JWT-based session management
- Protected routes with middleware
- Role-based access control

### Mock Credentials

For development and testing, the following pre-seeded enterprise accounts are available:

| Email                       | Enterprise                     | Password    |
| --------------------------- | ------------------------------ | ----------- |
| Demarco.Carroll78@gmail.com | Wisoky, Simonis and Stark Ltd  | password123 |
| Leonor.Crona1@yahoo.com     | Kunde LLC Ltd                  | password123 |
| Ellis81@hotmail.com         | Mohr and Sons Ltd              | password123 |
| Pauline89@gmail.com         | Schumm Inc Ltd                 | password123 |
| Toney91@hotmail.com         | Dietrich, Stracke and Lang Ltd | password123 |
| Makenna.Lesch84@hotmail.com | Reilly, Reichert and Huel Ltd  | password123 |

> **Note**: All internal routes are protected and require authentication. Use any of the above accounts to access the application.

### Route Protection

The application uses middleware to protect routes:

- Public routes: `/` (landing page) and `/login`
- Protected routes: All other routes require authentication
- Automatic redirection to login page for unauthenticated users
- Automatic redirection to dashboard for authenticated users trying to access login page

## 📦 Docker Support

The application includes Docker configuration for containerized development and deployment:

```bash
# Build the Docker image
docker build -t toweriq-frontend .

# Run the container
docker run -p 3000:3000 toweriq-frontend
```

## 🔄 Offline Support

The application includes service worker support for offline functionality:

- Offline data access
- Background sync
- Push notifications
- Cache management
