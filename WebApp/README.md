# TaskTrack Web Application

Modern web-based field operations and service management system built with Next.js 15, React, and Tailwind CSS.

## Features

- **Multi-Step Authentication**: Secure registration and login with employee ID support
- **Role-Based Dashboard**: Personalized dashboards for different user roles
- **Service Modules**:
  - Home Care: Patient management and care tracking
  - Health Services: Health service intake and monitoring
  - Security: Incident reporting and tracking
  - Marketing: Lead management and sales tracking
  - Education: Career guidance and educational support
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time State Management**: Zustand for client-side state with localStorage persistence
- **Modern UI**: Clean, accessible interface with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ or higher
- npm or yarn package manager

### Installation

1. Clone or navigate to the WebApp directory:
```bash
cd WebApp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your backend URL:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

### Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
WebApp/
├── src/
│   ├── app/
│   │   ├── auth/             # Authentication pages (login, signup)
│   │   ├── dashboard/        # Dashboard and main app pages
│   │   │   └── modules/      # Service module pages
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Index redirect page
│   │   └── globals.css       # Global styles
│   ├── stores/               # Zustand stores for state management
│   ├── utils/                # Utility functions and API clients
│   └── components/           # Reusable React components
├── public/                   # Static assets
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── next.config.js            # Next.js configuration
```

## Key Technologies

- **Next.js 15**: React framework with App Router
- **React 19**: Latest React features
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe development
- **Zustand**: Lightweight state management
- **Lucide React**: Icon library
- **Axios**: HTTP client

## Authentication

### Login
- Users can log in with their email or employee ID
- Password-based authentication

### Registration
Three-step registration process:
1. **Step 1**: Name, email, phone, password
2. **Step 2**: Employee ID, age, gender, service category
3. **Step 3**: Location details (state, district, mandal, village)

## API Integration

The application communicates with the TaskTrack backend API:

### Endpoints
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration

Configure the backend URL in `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://your-backend-url:port
```

## Development Guidelines

### Component Structure
- Components are organized in the `src/components/` directory
- Use functional components with hooks
- Leverage TypeScript for type safety

### State Management
- Use Zustand stores in `src/stores/` for global state
- Local component state with `useState` for UI state
- localStorage persistence for auth data

### Styling
- Use Tailwind CSS classes for styling
- Define custom colors in `tailwind.config.ts`
- Mobile-first responsive design approach

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel project settings
4. Deploy with a single click

### Environment Variables for Production

```env
NEXT_PUBLIC_BACKEND_URL=https://your-production-api-url
```

## Security

- Passwords are sent securely to the backend API
- Authentication tokens are stored in localStorage
- Use HTTPS in production
- Implement proper CORS configuration on backend

## Performance

- Next.js automatic code splitting
- Image optimization with next/image
- Built-in CSS minimization
- Efficient state management with Zustand

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues and questions, please contact the development team.

## Changelog

### v1.0.0
- Initial release
- Multi-step authentication
- Dashboard with service modules
- Responsive design
- Integration with TaskTrack backend API
