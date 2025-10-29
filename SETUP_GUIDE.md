# Brother Gold App - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites Check
```bash
# Check Node.js (v14+)
node --version

# Check npm
npm --version

# Install Expo CLI globally
npm install -g @expo/cli
```

### 2. Firebase Setup (3 minutes)
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create new project "Brother Gold"
3. Add Android app (package: `com.brothergold.app`)
4. Download `google-services.json` to project root
5. Enable Email/Password Authentication
6. Create Firestore database (Production mode)
7. Enable Firebase Storage

### 3. Update Firebase Config
Edit `src/services/firebase.js` and replace placeholder values:
```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 4. Install & Run
```bash
# Install dependencies
npm install

# Start development
npm start

# Or run on Android device/emulator
npm run android
```

### 5. Test Login
- **Owner**: `owner@brothergold.com` / `B2rother-GoL!D2`
- **Manager**: Sign up and wait for owner approval

## 📱 Build APK for Production

```bash
# Make build script executable
chmod +x build_apk.sh

# Run automated build
./build_apk.sh

# Or manual build
expo build:android -t apk
```

## 🔧 Firebase Rules Setup

Copy rules from `firebase-rules.json` to Firebase Console:
1. Go to Firestore Database → Rules
2. Replace existing rules with content from `firebase-rules.json`
3. Publish rules

## 📂 Project Structure
```
brother-gold-app/
├── assets/                 # App images and icons
├── src/
│   ├── screens/           # All app screens
│   │   ├── SplashScreen.js
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── OwnerDashboard.js
│   │   ├── ManagerDashboard.js
│   │   └── ReportsScreen.js
│   ├── services/          # Firebase & Auth services
│   │   ├── firebase.js
│   │   └── auth.js
│   └── assets/            # Additional assets
├── App.js                 # Main app component
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── build_apk.sh          # Build script
├── firebase-rules.json   # Firebase security rules
└── README.md             # Complete documentation
```

## 🎯 Features Overview

### ✅ Completed Features
- [x] Professional gold/blue theme
- [x] Animated splash screen with logo
- [x] Owner authentication system
- [x] Manager signup with approval
- [x] Factory management (owner)
- [x] Worker management with photos
- [x] Daily work logging
- [x] Owner approval system
- [x] Real-time data sync
- [x] Visual charts and analytics
- [x] PDF report export
- [x] Offline support
- [x] Responsive design

### 🎨 Design Elements
- **Colors**: Gold (#FFD700), Navy Blue (#1e3a8a)
- **Fonts**: System fonts with proper fallbacks
- **Animations**: Smooth transitions and loading states
- **Icons**: Professional cricket-themed branding

### 🔐 Security Features
- Firebase Authentication
- Role-based access control
- Data validation
- Secure file uploads
- Firestore security rules

## 🚀 Next Steps After Setup

1. **Test Owner Login**: Use default credentials
2. **Add First Factory**: Create your factory location
3. **Approve Test Manager**: Sign up as manager and approve
4. **Add Workers**: Test photo upload and worker creation
5. **Create Logs**: Test daily work logging
6. **Generate Reports**: Test PDF export functionality

## 📱 Testing Checklist

### Owner Functions
- [ ] Login with owner credentials
- [ ] Add new factory
- [ ] View pending managers
- [ ] Approve manager signup
- [ ] Assign factory to manager
- [ ] View all reports
- [ ] Export PDF reports

### Manager Functions
- [ ] Sign up as new manager
- [ ] Wait for approval notification
- [ ] Login after approval
- [ ] Add workers with photos
- [ ] Create daily work logs
- [ ] View factory reports
- [ ] Check approval status

### Technical Tests
- [ ] Offline functionality
- [ ] Image upload working
- [ ] Real-time sync active
- [ ] PDF export successful
- [ ] Charts displaying correctly
- [ ] No console errors

## 🔧 Troubleshooting

### Common Issues
1. **Firebase config error**: Check API keys in `firebase.js`
2. **Build fails**: Ensure all dependencies installed
3. **Images not loading**: Check Firebase Storage rules
4. **Login fails**: Verify Firebase Authentication enabled

### Debug Tips
```bash
# Check logs
expo logs

# Clear cache
expo start -c

# Reset Metro bundler
expo start --reset-cache
```

## 📞 Support

If you encounter issues:
1. Check Firebase console for errors
2. Verify all services are enabled
3. Check device/emulator permissions
4. Review console logs for error messages

## 🎯 Success Indicators

✅ App builds successfully  
✅ Login screen appears  
✅ Owner dashboard loads  
✅ Can add factories  
✅ Manager signup works  
✅ Real-time updates active  
✅ Charts display data  
✅ PDF export works  

---

**🚀 Ready to launch! Your Brother Gold app is now ready for production use.**