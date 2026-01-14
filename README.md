# ApexStore - Modern Multi-Vendor E-commerce Platform

ApexStore is a full-stack, premium e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js). It features a robust multi-vendor system, AI-powered product recommendations, integrated payment gateways, and a modern, glassmorphism-inspired UI.

![ApexStore Logo](https://via.placeholder.com/800x200?text=ApexStore+Premium+E-commerce)

## 🚀 Key Features

### 👤 For Customers
- **Premium Shopping Experience**: Modern, responsive UI with smooth animations and transitions.
- **AI Recommendations**: Personalized product suggestions powered by Groq/Gemini.
- **Persistent Cart & Wishlist**: Save items for later with seamless backend synchronization.
- **Advanced Reviews**: Interactive star ratings and detailed customer feedback section.
- **Secure Checkout**: Integrated with Paystack and Flutterwave for local and international payments.
- **Order Tracking**: Detailed order history and real-time status updates.

### 🏪 For Vendors
- **Comprehensive Dashboard**: Real-time sales statistics, revenue tracking, and order analytics.
- **Product Management**: Intuitive interface for managing inventory, images, and specifications.
- **Multi-Vendor Isolation**: Secure system ensuring vendors only manage their own products and orders.
- **Order Fulfillment**: Streamlined process for tracking and updating customer orders.

### 🛡️ For Administrators
- **Global Overview**: High-level statistics across all vendors and users.
- **User Management**: Tools to manage customer and vendor accounts.
- **System Monitoring**: View all platform activities and ensure smooth operations.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React
- **Routing**: React Router 7

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT & BcryptJS
- **AI Integration**: Groq SDK & Google Generative AI
- **Communications**: Nodemailer

## ⚙️ Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Atlas or Local)

### 1. Clone & Install
```bash
# Clone the repository
git clone <repository-url>
cd apexStore

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
VITE_API_URL=http://localhost:5000/api

# AI Keys
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key

# Payment Keys
PAYSTACK_SECRET_KEY=your_paystack_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_key

# Email Config
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```

### 3. Run the Application
```bash
# Start backend (from root)
npm run dev

# Start frontend (from client)
cd client
npm run dev
```

## 🔐 Security Features
- **Row-Level Security**: Vendors can only access their specific data.
- **Atomic Operations**: Financial stats are updated using MongoDB atomic operators to prevent data loss.
- **Protected Routes**: Role-based access control (RBAC) enforced on both frontend and backend.

## 📄 License
This project is licensed under the ISC License.
