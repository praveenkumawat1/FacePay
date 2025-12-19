# Frontend Step-Wise Flow & Setup Documentation

This document explains the frontend development process in a step-by-step manner for the Face-Based Payment System. It describes how the frontend technology was decided, how the environment was set up, and what has been implemented so far.

---

## Step 1: Frontend Technology Decision

At the beginning of the project, the frontend technology stack was finalized.  
The goal was to build a modern, fast, and animation-rich user interface that can support real-time face scanning.

After analysis, the following decisions were made:
- **Vite + React** was selected for fast development and a lightweight setup.
- The application was planned as a **Single Page Application (SPA)**.
- The frontend was kept fully independent from the backend and AI server.

This decision helped in faster development and better focus on UI/UX and real-time camera features.

---

## Step 2: Project Initialization Using Vite + React

After finalizing the technology, the frontend project was initialized using Vite with React.  
Vite was chosen because of:
- Extremely fast dev server
- Simple configuration
- Better developer experience compared to traditional setups

Once the project was created, the basic folder structure was prepared to separate pages, components, services, and styles.

---

## Step 3: Routing Setup

The next step was to handle navigation inside the application.

For this purpose:
- **react-router-dom** was installed and configured.

This enabled smooth navigation between different pages such as:
- Landing Page
- Login Page
- Signup Page
- Face Scan Page
- Dashboard

Client-side routing ensures that the application behaves like a real mobile or fintech web app without page reloads.

---

## Step 4: API Communication Setup

After routing, communication with the backend was planned.

- **Axios** was installed to handle HTTP requests.
- Axios is used to send and receive data between frontend and backend.

This includes:
- Sending signup and login data
- Sending captured face scan images in Base64 format
- Fetching authenticated user and wallet information

---

## Step 5: Real-Time Face Scan Setup

Real-time face scanning is the core feature of the project.

To achieve this:
- **react-webcam** was installed.

This library provides:
- Access to the user’s webcam using WebRTC
- Live camera preview on the browser
- Real-time image capture during face scanning

This setup is used during:
- User signup
- User login
- Future transaction authorization

---

## Step 6: Frontend AI Guidance Setup

To improve user experience during face scanning:
- **face-api.js** was installed.

This library is used only for frontend guidance such as:
- Detecting whether a face is visible
- Warning the user if multiple faces are detected

No identity verification or authentication logic is handled on the frontend.  
All final face verification is performed on the backend and AI server.

---

## Step 7: Styling Setup Using Tailwind CSS

To create a modern and consistent design:
- **Tailwind CSS** was installed and configured.

Tailwind CSS is used for:
- Utility-first styling
- Responsive layouts
- Dark mode support
- Clean and modern fintech-style UI

This helped in rapidly building UI components with consistent spacing and design.

---

## Step 8: Animation Setup

To make the application visually appealing and modern:
- **Framer Motion** was installed for smooth UI animations.
- **GSAP** was installed for advanced and scroll-based animations.

These animation libraries are used for:
- Landing page hero animations
- Page transitions
- Button hover effects
- Scroll-based section reveals

Animations are kept smooth and minimal to maintain a secure fintech feel.

---

## Step 9: Icon Integration

For icons and visual elements:
- **lucide-react** was installed.

Lucide icons are used for:
- Camera indicators
- Security icons
- Wallet and navigation icons

These icons provide a clean and professional look to the UI.

---

## Step 10: Frontend User Flow Implementation

After completing the setup, the frontend user flow was defined:

- The user first lands on the animated Landing Page.
- From there, the user can navigate to Signup or Login.
- During Signup, the user enters basic details and then performs a real-time face scan.
- During Login, the user directly performs a face scan.
- The captured face image is sent to the backend for AI verification.
- After successful verification, the user is redirected to the Dashboard.

---

## Step 11: Security Considerations

Throughout frontend development, security was kept in mind:
- Face images are not permanently stored on the frontend.
- No authentication decision is made on the frontend.
- The frontend only captures and forwards data securely.
- All biometric verification is handled by backend and AI services.

---

## Conclusion

By following this step-wise approach, a modern, secure, and scalable frontend foundation has been successfully set up.  
The frontend is now fully prepared for deeper integration with backend APIs and AI-based face verification modules.
