# TowerIQ - Telecom Mission Control

TowerIQ is a modern, enterprise-grade telecom infrastructure management platform that provides comprehensive control and monitoring capabilities for telecom towers, devices, and security policies. Built with a focus on user experience and modern design, TowerIQ helps telecom operators visualize and manage their infrastructure efficiently.

## 🌟 Features

- **Tower Management**

  - View tower status and performance metrics
  - Track carrier connections and coverage
  - Manage equipment and maintenance schedules
  - View tower analytics and statistics

- **Device Management**

  - Comprehensive device inventory
  - Device status monitoring
  - Security compliance tracking
  - Device policy management

- **Security Policy Management**

  - Create and manage security policies
  - Policy compliance monitoring
  - Policy enforcement tracking
  - Policy updates and versioning

- **Modern UI/UX**
  - Beautiful, responsive design
  - Dark/Light mode support
  - Interactive dashboards and charts
  - Smooth page transitions and animations

## 🛠 Tech Stack

- **Frontend Framework**

  - [Next.js 15.3.3](https://nextjs.org/) (App Router)
  - [React 19.0.0](https://reactjs.org/)
  - [TypeScript 5.8.3](https://www.typescriptlang.org/)

- **Styling & UI**

  - [Tailwind CSS 4](https://tailwindcss.com/)
  - [shadcn/ui](https://ui.shadcn.com/) (New York style)
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
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-org/telecom-mission-control.git
   cd telecom-mission-control/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key # Generate using: openssl rand -base64 32
   BCRYPT_SALT_ROUNDS=10
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## 📝 Note

This is currently a frontend-only application that uses simulated data to demonstrate the user interface and interactions. The data is generated using a seed script and stored in JSON format. Future versions will include backend integration for real data management.

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

### Mock Credentials

For development and testing, the following mock users are available:

| Email                | Password    |
| -------------------- | ----------- |
| alice@enterprise.com | password123 |
| bob@enterprise.com   | password123 |

### Route Protection

The application uses middleware to protect routes:

- Public routes: `/` (landing page) and `/login`
- Protected routes: All other routes require authentication
- Automatic redirection to login page for unauthenticated users
- Automatic redirection to dashboard for authenticated users trying to access login page
