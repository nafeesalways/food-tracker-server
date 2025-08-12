# 🍽️ Food Tracker Server

This is the backend server for the **Food Expiry Tracker** application. It provides a RESTful API to manage users' food inventories, track expiration dates, submit notes, and get expiry alerts.

## 🧩 Features

- ✅ Add, update, and delete food items.
- 📅 Track expiry dates and receive alerts for near-expired items.
- 🔐 User authentication via Firebase.
- 📝 Attach personal notes to food items.
- 🔍 Query food inventory with filters (by expiry, type, etc.).
- 🛡️ Role-based access control (Admin/User).
- 📦 Built with Node.js, Express, MongoDB.

---

## 🚀 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** Firebase Admin SDK
- **Others:** dotenv, cors, morgan

---

## 📷 Screenshot

![Food Tracker Server Screenshot](https://images.unsplash.com/photo-1564653464933-49d666e03bb8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fGZvb2QlMjB0cmFja2VyJTIwbW9iaWxlfGVufDB8fDB8fHww)


---

## 📦 Installation & Setup

```bash
git clone https://github.com/yourusername/food-tracker-server.git
cd food-tracker-server
npm install
nodemon index.js
