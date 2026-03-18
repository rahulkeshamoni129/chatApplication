# 🛡️ Echo Chat: Secure Real-Time Communication

**Echo Chat** is a modern, high-performance messaging platform built with the MERN stack. It prioritizes user privacy through **End-to-End Encryption (E2EE)** while maintaining a seamless, real-time user experience.

![Chat Application Mockup](https://api.dicebear.com/7.x/shapes/svg?seed=echo-chat)

## ✨ Features

### 🔒 Privacy & Security (E2EE)
- **End-to-End Encryption**: Messages are encrypted on the sender's device and can only be decrypted by the recipient.
- **Security PIN Sync**: Your private keys are protected by a user-defined PIN and synchronized across devices via secure server-side storage.
- **Session Protection**: Private keys are stored in `sessionStorage`, ensuring your identity is verified every time you open a new browser session.

### 💬 Messaging Experience
- **Direct & Group Chats**: Create circles with friends or message users directly.
- **Real-Time Interaction**: Powered by **Socket.io** for instant message delivery, typing indicators, and online/offline status.
- **Smart Filtering**: Organize your sidebar by "All," "Unread," "Groups," or "Pinned" chats.
- **Global Search**: Find anyone on the platform instantly with a reactive search interface.

### 🛠️ Admin & Management
- **Centralized Dashboard**: System administrators can monitor logs, manage users, and toggle maintenance mode.
- **Security Logs**: Track login activities and system events for security auditing.
- **Group Moderation**: Full control over group members and history.

## 🚀 Tech Stack

- **Frontend**: React, Zustand (State Management), TailwindCSS, Axios, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io.
- **Database**: MongoDB (Mongoose).
- **Security**: SubtleCrypto API (Browser-native encryption), JWT, bcryptjs.

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rahulkeshamoni129/chatApplication.git
   cd chatApplication
   ```

2. **Backend Setup**:
   ```bash
   cd Backend
   npm install
   npm start
   ```

3. **Frontend Setup**:
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

