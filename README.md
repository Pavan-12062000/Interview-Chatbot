# **Interview Chatbot for Job Seekers**

## **Table of Contents**
1. [Overview](#overview)  
2. [Features](#features)  
3. [Technologies Used](#technologies-used)  
4. [Team Roles](#team-roles)  
5. [Goals](#goals)  
6. [Usage Instructions](#usage-instructions)  
7. [Contributing](#contributing)  
8. [Contact](#contact)  

---

## **Overview**  
The **Interview Chatbot for Job Seekers** is an AI-powered platform designed to enhance interview preparedness for job seekers. By simulating interviews, analyzing resumes, and offering actionable feedback, this tool empowers users to excel in their career pursuits.  

This chatbot serves:  
- **Recent Graduates** preparing for their first professional interviews.  
- **Career Changers** transitioning into new industries or roles.  
- **Experienced Professionals** seeking to refine their interview techniques and stay competitive.  

---

## **Features**  

### **1. Resume Upload & Job Description Analysis**  
- Upload resumes in **PDF**, **Word**, or **Text** format.  
- Analyze job descriptions to extract key skills, requirements, and keywords.  
- Match resume data with job descriptions to identify alignment and gaps.  

### **2. Live Interview Simulation**  
- Interactive interview questions based on job descriptions and industry standards.  
- Real-time feedback on responses, highlighting strengths and improvement areas.  
- Adaptive questioning that evolves based on user performance.  

### **3. Personalized Feedback & Recommendations**  
- Identify user **strengths** in communication and responses.  
- Highlight **weaknesses** such as response depth or structure.  
- Provide actionable **recommendations** to improve interview readiness.  

---

## **Technologies Used**  
- **Frontend**: React.js  
- **Backend**: Node.js  
- **Database**: PostgreSQL  

---

## **Team Roles**  

| **Team Member**       | **Role**                     | **Responsibilities**                                                |  
|------------------------|------------------------------|----------------------------------------------------------------------|  
| **Fangyuan Lin**       | Prompt Engineer             | Develops prompts to improve chatbot responses.                      |  
| **Yuan Gao**           | Frontend Developer          | Designs and implements the user interface using React.js.           |  
| **Pavan Sree Pichuka** | Backend Developer           | Develops chatbot logic and integrates external data using Node.js.  |  
| **Ravi Prassand Kumar Siva Subramanea Pillai** | Project Manager & DB Developer | Oversees project execution and implements chat session history in PostgreSQL. |  

---

## **Goals**  
1. Create a comprehensive, interactive interview preparation platform.  
2. Continuously enhance chatbot features based on user feedback.  
3. Ensure accessibility and ease of use for job seekers from all technical backgrounds.  

---

## **Usage Instructions**  

### **1. Setting Up**  
- Clone the repository using:  
  ```bash
  git clone <repository_url>

### **Navigate to the project directory and install dependencies for both frontend and backend:**
   ```bash
   cd frontend
   npm install
   ```

   ```bash
   cd ../backend
   npm install
   ```

**Configure the PostgreSQL database connection in the .env file within the backend folder.**

### **2. Running the Application **
- Start the backend server:
```bash
cd backend
npm start
```

- Start the React frontend:
```bash
cd frontend
npm start
```
**Access the platform in your browser at http://localhost:3000.**
### **3. Using the Platform**
- Register/Login:
New users can register for an account, while returning users can log in using their credentials.

- Upload Resume and Job Description:
Upload your resume and the desired job description. The chatbot analyzes these documents and provides insights on skills alignment and areas needing improvement.

- Simulate Interviews:
Engage in realistic, AI-driven interview simulations.
Receive instant feedback after each question, helping you improve your responses in real time.

- View Personalized Feedback:
Access detailed reports on your performance, including strengths, weaknesses, and actionable recommendations for improvement.

### **4. Customization**
Modify prompts, feedback algorithms, or question databases by editing backend files to tailor the platform to specific needs.

# Interview-Chatbot
To run:
1. npm i
2. cd chatbot_froentend
   npm start
3. cd chatbot_backend
   nodemon app

Configure your local database