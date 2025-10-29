# Brother Gold Cricket BAT Factory App

A comprehensive React Native + Expo mobile application for managing cricket bat factory operations with real-time Firebase backend.

## 🏏 About

Brother Gold is a professional cricket bat factory management system designed specifically for Pakistani cricket industry. The app provides complete workflow management from worker registration to daily log tracking and financial reporting.

## ✨ Features

### 🔐 Authentication & Roles
- **Owner Login**: Fixed credentials with full system access
- **Manager Signup**: Approval-based system with factory assignment
- **Role-based Access**: Different dashboards for owners and managers

### 🏭 Factory Management
- **Multiple Factories**: Support for multiple factory locations
- **Factory Assignment**: Managers assigned to specific factories
- **Real-time Sync**: All data synchronized across devices

### 👥 Worker Management
- **Worker Registration**: Add workers with photos and designations
- **Photo Upload**: Camera/photo library integration
- **Worker Profiles**: Complete worker information management

### 📊 Daily Operations
- **Work Logging**: Track daily work and payments
- **Approval System**: Owner approval for all financial transactions
- **Real-time Updates**: Instant sync across all connected devices

### 📈 Reports & Analytics
- **Visual Charts**: Beautiful charts using Victory Native
- **Time-based Filters**: Daily, weekly, monthly, yearly reports
- **Export PDF**: Professional PDF report generation
- **Factory-wise Reports**: Detailed analytics by factory

### 🎨 Professional Design
- **Gold & Blue Theme**: Premium color scheme
- **Animations**: Smooth animations using Reanimated
- **Responsive UI**: Optimized for mobile devices
- **Professional Layout**: Clean and intuitive interface

## 🛠️ Technology Stack

- **Frontend**: React Native + Expo
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Charts**: Victory Native
- **Animations**: React Native Reanimated, Lottie
- **PDF Export**: Expo Print
- **Image Handling**: Expo Image Picker
- **Navigation**: React Navigation

## 📱 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Firebase account

### Step 1: Clone and Install
```bash
# Navigate to project directory
cd brother-gold-app

# Install dependencies
npm install
```

### Step 2: Firebase Configuration
1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add Android app to your Firebase project
3. Download `google-services.json`
4. Update `src/services/firebase.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### Step 3: Firebase Setup
1. Enable Authentication (Email/Password)
2. Create Firestore database
3. Set up Firebase Storage
4. Upload Firebase rules from `firebase-rules.json`

### Step 4: Run the App
```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 🏗️ Building APK

### Using Build Script
```bash
# Make script executable
chmod +x build_apk.sh

# Run build script
./build_apk.sh
```

### Manual Build
```bash
# Prebuild project
npx expo prebuild

# Build APK
expo build:android -t apk
```

## 🔑 Default Credentials

### Owner Account
- **Email**: `owner@brothergold.com`
- **Password**: `B2rother-GoL!D2`

### Manager Accounts
- Managers must sign up and wait for owner approval
- Owner assigns factories to approved managers

## 📊 Database Structure

### Collections

#### Users
```javascript
{
  email: "user@example.com",
  role: "owner" | "manager" | "manager_pending",
  status: "approved" | "pending",
  assigned_factory: "factory_id",
  createdAt: "timestamp"
}
```

#### Factories
```javascript
{
  name: "Factory Name",
  location: "Factory Location",
  created_at: "timestamp",
  created_by: "user_id"
}
```

#### Workers
```javascript
{
  name: "Worker Name",
  designation: "Worker Designation",
  image_url: "photo_url",
  factory_id: "factory_id",
  factory_name: "Factory Name",
  created_at: "timestamp",
  created_by: "user_id"
}
```

#### Daily Logs
```javascript
{
  worker_id: "worker_id",
  worker_name: "Worker Name",
  date: "YYYY-MM-DD",
  nature_of_work: "Work description",
  amount_PKR: 1000,
  approved: false,
  factory_id: "factory_id",
  factory_name: "Factory Name",
  created_at: "timestamp",
  created_by: "user_id"
}
```

## 🎯 Usage Guide

### For Owners
1. Login with owner credentials
2. Add new factories
3. Approve pending manager registrations
4. Assign factories to managers
5. View all reports and analytics
6. Export PDF reports

### For Managers
1. Sign up as manager
2. Wait for owner approval
3. Add workers to your factory
4. Create daily work logs
5. View factory-specific reports
6. Track worker performance

## 🔧 Customization

### Theme Colors
Update colors in `src/screens/*` files:
- Primary Gold: `#FFD700`
- Secondary Gold: `#FFA500`
- Primary Blue: `#1e3a8a`

### Logo & Branding
Replace images in `assets/` folder:
- `icon.png`: App icon (1024x1024)
- `splash.png`: Splash screen (1024x1024)
- `adaptive-icon.png`: Android adaptive icon

### Currency
App uses Pakistani Rupee (₨) by default. Update currency symbols in relevant files.

## 📱 App Features

### Screens
1. **Splash Screen**: Animated logo with gradient background
2. **Login**: Owner/Manager authentication
3. **Signup**: Manager registration
4. **Owner Dashboard**: Full system control
5. **Manager Dashboard**: Factory-specific management
6. **Reports**: Analytics and PDF export

### Key Functionalities
- Real-time data synchronization
- Offline support with Firebase persistence
- Image upload and storage
- PDF report generation
- Professional chart visualizations
- Role-based access control

## 🔒 Security Features

- Firebase Authentication
- Firestore Security Rules
- Role-based permissions
- Data validation
- Secure file uploads

## 📊 Reports Available

### Visual Charts
- Worker earnings (Bar chart)
- Factory performance (Pie chart - Owner only)
- Time-based analytics

### Export Options
- PDF reports with tables and charts
- Custom date range filtering
- Professional formatting
- Shareable reports

## 🚀 Performance Optimizations

- Firebase offline persistence
- Optimized image loading
- Efficient data queries
- Minimal bundle size
- Smooth animations

## 🌟 Future Enhancements

- Push notifications
- Advanced analytics
- Worker attendance tracking
- Inventory management
- Multi-language support
- Tablet optimization

## 📞 Support

For technical support or questions:
- Check the documentation
- Review Firebase console logs
- Test with development build
- Ensure all permissions are granted

## 📄 License

This project is created for Brother Gold Cricket BAT Factory. All rights reserved.

---

**Built with ❤️ for Pakistani Cricket Industry**