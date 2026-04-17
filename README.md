# Period Tracker – Full Stack Web Application

## 🔍 Overview

Period Tracker is a full-stack web application that helps users track menstrual cycles, view their current cycle phase, and get smart predictions for upcoming periods. It features a secure and user-friendly dashboard built with Django and Next.js.


## ✨ Key Features

* **Cycle Tracking** – Log period start/end dates and flow intensity along with notes
* **Cycle Phase Detection** – Automatically shows current phase (Menstrual, Follicular, Ovulation, Luteal)
* **Smart Predictions** – Predicts next period based on cycle history
* **Password Reset via Email** – Secure email-based password reset system
* **Dashboard Analytics** – View cycle insights and statistics
* **Authentication & Security** – Token-based login with user-specific data isolation

## 🛠️ Tech Stack

**Frontend**

* Next.js (React + TypeScript)
* Tailwind CSS

**Backend**

* Django & Django REST Framework
* SQLite (dev) / PostgreSQL (production-ready)
* JWT Authentication

**Tools & Services**

* Reset Password via Email

## ⚙️ Installation & Setup

### 1. Clone the Repository

### 2. Backend Setup

```
python -m venv venv
venv\Scripts\activate   
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup

```
cd frontend
npm install
npm run dev
```

## 📈 Learning Outcomes

* Built a full-stack application using Django + Next.js
* Designed RESTful APIs for frontend-backend integration
* Implemented secure authentication and user isolation
* Developed prediction logic based on historical data
* Integrated email based password reset

## 🚀 Future Enhancements

* Advanced Email Notifications – More customizable alerts and reminder scheduling
* Enhanced Symptom Tracking – Add more symptoms, trends, and detailed analysis
* Data Visualization – Charts for cycle patterns and symptom insights
* Mobile Application – Native iOS and Android apps
* AI-Based Predictions – More accurate cycle predictions using machine learning

## 🎥 Demo 
https://github.com/user-attachments/assets/c893c124-39b4-4ab9-8258-caaf7aec1ec8
