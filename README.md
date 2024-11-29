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

### **1.Clone the repository:**  
- Clone the repository using:  
  ```bash
  git clone "https://github.com/Pavan-12062000/Interview-Chatbot"
  ```

### **2.Navigate to the backend service:**
   ```bash
   cd chatbot_backend
   ```

### **3.Install PostgreSQL database and Create a database in pgAdmin and the scripts are there in DB Scripts.txt file in the root directory of chatbot_backend folder.**

### 4.Create a .env file in the root directory and add the below in the .env file: 
**NEBIUS_API_KEY = "your_api_key"**


### **5.Install all the required dependencies:**
   ```bash
   npm i
   ```

### **6. Update the below fields in dbconenction.js file with your credentials:**
- database: 'your_database_name'
- password: 'your_password'

### **7. To run the backend service, run the below command:**
   ```bash
   node app
   ```

### **8. Open a new terminal and navigate to the frontend service:**
   ```bash
   cd chatbot_frontend
  
   ```   
### **9. Install all the required dependencies:**
   ```bash
   npm i
   ```   

### **10. To run the frontend service, run the below command:**
   ```bash
   npm start
   ```