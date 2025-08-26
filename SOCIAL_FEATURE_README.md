# TerpTracker Social Feature Implementation

## 🎯 **Feature Overview**

This branch implements a **classmate finder** feature that allows UMD students to:
- Connect with other students in the **exact same course sections**
- Share Instagram handles for easy social connection
- Find study partners and actual classmates you'll see in class

## 🔐 **Authentication Model with Clerk**

### **1. Primary Login**
- Users sign up with any email (personal or university)
- Clerk creates a `userId`
- Email serves as primary login method

### **2. UMD Email Verification**
- Users add their `@umd.edu` email as a secondary email
- Clerk sends verification email
- Once confirmed, user is tagged as `universityVerified: true`

### **3. Social Media Integration**
- Users add their Instagram handle
- Instagram handles are shared with classmates who have the same courses
- No privacy concerns - focused on UMD student connections

## 🛠️ **Technical Implementation**

### **Components Created**
1. **`AuthWrapper.tsx`** - Handles authentication flow and profile setup
2. **`ClassmateFinder.tsx`** - Main classmate discovery component
3. **Updated `page.tsx`** - Added tab navigation and integration

### **Data Flow**
1. User signs up with Clerk
2. User completes profile setup (UMD email + Instagram)
3. User creates schedules with course section numbers
4. Classmate finder matches by exact course + section
5. Users can copy Instagram handles to connect

### **Storage Strategy**
- User data stored in `localStorage` with key pattern: `user-data-${userId}`
- Schedule data shared between schedule builder and classmate finder
- No backend database required for MVP

## 🚀 **Setup Instructions**

### **1. Install Dependencies**
```bash
npm install @clerk/nextjs
```

### **2. Configure Clerk**
Create `.env.local` file:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### **3. Set up Clerk Dashboard**
1. Create account at [clerk.com](https://clerk.com)
2. Create new application
3. Copy publishable and secret keys
4. Configure email templates for UMD verification

## 📱 **User Experience Flow**

### **New User Journey**
1. **Sign Up** - Any email address
2. **Profile Setup** - Add UMD email and Instagram handle
3. **Schedule Building** - Create schedules with course section numbers
4. **Classmate Discovery** - Find students in same sections
5. **Social Connection** - Copy Instagram handles to connect

### **Returning User Journey**
1. **Sign In** - Email-based authentication
2. **Schedule Management** - Load saved schedules
3. **Classmate Search** - Find new classmates
4. **Social Updates** - Update Instagram handle if needed

## 🔒 **Privacy & Security**

### **Data Protection**
- Only UMD students can use classmate finder (email verification)
- Instagram handles are the only personal data shared
- No real names, phone numbers, or other personal info
- Local storage only - no server-side data collection

### **FERPA Compliance**
- No official enrollment data used
- User-generated schedule data only
- No integration with UMD systems
- Students opt-in to share their own schedules

## 🎨 **UI/UX Features**

### **Authentication**
- Clean sign-in/sign-up flow
- Profile completion wizard
- UMD email verification modal
- Instagram handle input

### **Classmate Finder**
- Schedule selection dropdown
- Section-based matching algorithm
- Overlap percentage display
- Instagram handle copying
- Course + section display
- No results state with helpful tips

### **Navigation**
- Tab-based interface
- Schedule Builder tab
- Find Classmates tab
- Seamless switching between features

## 🚀 **Future Enhancements**

### **Phase 2 Features**
1. **Real-time Messaging** - In-app chat with classmates
2. **Study Group Formation** - Create and join study groups
3. **Course-specific Forums** - Discussion boards per course
4. **Push Notifications** - New classmates joining courses

### **Advanced Matching**
1. **Professor Preferences** - Match by professor ratings
2. **Study Style Matching** - Group vs individual study preferences
3. **Major-based Filtering** - Connect with students in same major
4. **Graduation Year** - Connect with students in same year

## 🐛 **Known Limitations**

1. **Local Storage Only** - Data not synced across devices
2. **No Real-time Updates** - Manual refresh required
3. **Limited to Browser** - No mobile app yet
4. **No Verification** - Instagram handles not validated

## 📊 **Analytics & Metrics**

### **Key Metrics to Track**
- User registration rate
- UMD email verification rate
- Schedule sharing adoption
- Classmate discovery usage
- Instagram handle copy rate

### **Success Indicators**
- High UMD student adoption
- Active classmate connections
- Positive user feedback
- Social media engagement

## 🔧 **Development Notes**

### **File Structure**
```
app/
├── components/
│   ├── AuthWrapper.tsx      # Authentication & profile setup
│   └── ClassmateFinder.tsx  # Classmate discovery component
├── page.tsx                 # Main app with tab navigation
└── layout.tsx              # Clerk provider wrapper
```

### **Key Functions**
- `findClassmates()` - Core matching algorithm
- `saveUserData()` - Local storage management
- `copyInstagramHandle()` - Social connection helper

### **State Management**
- User authentication state (Clerk)
- User profile data (localStorage)
- Schedule data (shared between tabs)
- Classmate search results

This implementation provides a solid foundation for UMD student social connections while maintaining simplicity and privacy.
