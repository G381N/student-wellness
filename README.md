# CampusWell - Student Mental Health & Community Support Platform

A comprehensive Next.js application designed to support student mental health and foster community connections in college environments.

## 🌟 Features

### 🏠 Landing Page
- Beautiful gradient design with smooth animations
- Quick action cards for easy navigation
- Hero section introducing the platform
- Responsive design for all devices

### 🎯 Activity Feed & Management
- **Activity Feed**: Browse campus events and activities
- **Create Activities**: Students can create and organize events
- Filter by categories (Academic, Wellness, Social, Professional)
- Real-time updates and engagement features

### 🧘 Wellness Center
- **Breathing Exercises**: 
  - 1-minute Quick Reset
  - 2-minute Focus Session  
  - 5-minute Deep Relaxation
  - Interactive breathing animations
  - Timer and progress tracking
- **Video Library**: Curated mental health and self-help videos
- **Wellness Tools**: Links to additional resources

### 💬 Issues Board (Anonymous Complaints)
- Anonymous issue submission system
- Upvote/downvote functionality
- Category filtering (Academic, Facilities, Food Service, etc.)
- Status tracking (New, Reviewing, Resolved)
- Real-time sorting by popularity or recency

### 📚 Learn More Section
- Comprehensive mental health education
- Topics include:
  - Understanding Anxiety
  - Recognizing Depression
  - Managing Academic Stress
  - Healthy Relationships
  - Self-Care Essentials
  - Effective Study Skills
- Expandable content with resources
- Emergency support information

### 👥 About Us Page
- Counseling center information
- Meet the counseling team
- Contact information and hours
- Service descriptions
- Emergency contact details

### 🔐 Authentication System
- Firebase Authentication integration
- Login and registration pages
- User session management
- Protected routes and personalized experience

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: React Icons (Feather Icons)
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Storage
- **Language**: TypeScript
- **Development**: Turbopack (Next.js 15)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-wellness
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication with Email/Password
   - Create a Firestore database
   - Enable Storage (optional)
   - Get your Firebase configuration

4. **Configure environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Update the Firebase configuration values:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**
```bash
npm run dev
   ```

6. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Pages Overview

| Route | Description |
|-------|-------------|
| `/` | Landing page with platform overview |
| `/activities` | Browse campus activities and events |
| `/activities/create` | Create new activities/events |
| `/wellness` | Wellness center hub |
| `/wellness/breathing/[duration]` | Interactive breathing exercises |
| `/wellness/videos` | Mental health video library |
| `/complaints` | Anonymous issues board |
| `/learn` | Mental health education content |
| `/about` | Counseling center information |
| `/login` | User authentication |
| `/register` | New user registration |

## 🎨 Design Features

- **Responsive Design**: Mobile-first approach with breakpoints for all screen sizes
- **Modern UI**: Clean, modern interface with gradient backgrounds
- **Smooth Animations**: Framer Motion for engaging user interactions
- **Accessible**: Semantic HTML and ARIA labels for screen readers
- **Fast Loading**: Optimized with Next.js 15 and Turbopack

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── activities/         # Activity-related pages
│   ├── wellness/          # Wellness center pages
│   ├── complaints/        # Issues board
│   ├── learn/            # Educational content
│   ├── about/            # About page
│   ├── login/            # Authentication
│   └── register/         # User registration
├── components/            # Reusable React components
│   └── Navbar.tsx        # Navigation component
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                  # Utility libraries
│   └── firebase.ts       # Firebase configuration
└── globals.css           # Global styles
```

### Key Components

- **AuthProvider**: Manages user authentication state
- **Navbar**: Main navigation with responsive design
- **Breathing Exercises**: Interactive breathing animations
- **Video Library**: Curated content with modal playback
- **Issues Board**: Anonymous feedback system

## 🔐 Firebase Setup Details

### Authentication
- Enable Email/Password authentication
- Configure authorized domains for production

### Firestore Collections
The app expects these collections:
- `activities` - Campus events and activities
- `issues` - Anonymous complaints/feedback
- `users` - User profiles (optional)

### Security Rules
Configure Firestore security rules:
```javascript
// Example rules - customize based on your needs
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /activities/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /issues/{document} {
      allow read: if true;
      allow write: if true; // Anonymous submissions
    }
  }
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with automatic CI/CD

### Other Platforms
- **Netlify**: Configure build settings for Next.js
- **AWS Amplify**: Use Next.js build configuration
- **Digital Ocean**: Use App Platform with Node.js

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation

## 🎯 Future Enhancements

- Push notifications for activities
- Chat/messaging system
- Admin dashboard
- Analytics and reporting
- Mobile app (React Native)
- Integration with campus systems
- AI-powered mental health chatbot

---

Built with ❤️ for student mental health and community building.
