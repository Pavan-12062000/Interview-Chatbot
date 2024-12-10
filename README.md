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

### **2.Install PostgreSQL database and Create a database in pgAdmin and the scripts are there in DB Scripts.txt file in the root directory of chatbot_backend folder.**

### **3.To run the services in a secure connection (HTTPS).**

#### **3.1 Self Signed SSL Certificate.**

##### **3.1.1 Step 1: Generate Self Signed SSL Certificate**
Download openssl exe file and use openaal to create a self-signed ssl certificate.
To generate a new private key:
```bash
openssl genrsa -out private-key.pem 2048 
```

Create a Certificate Signed Request (CSR):
```bash
openssl req -new -key private-key.pem -out certificate.csr -subj 
"/C=CA/ST=ON/L=Ottawa/O=MyCompany/CN=localhost"  
```

Create a configuration file (.cnf) and add the below code:
```bash
[ v3_req ]
subjectAltName = @alt_names    
[ alt_names ]  
DNS.1 = localhost  
```

Generate the Self-Signed Certificate with SAN
```bash
 openssl x509 -req -in certificate.csr -signkey private-key.pem -out certificate.pem -days 365 -extensions v3_req -extfile C:\path\to\openssl.cnf  
```

##### **3.1.2 Step 2:  Installing a self-signed SSL certificate into the Trusted Root Certification Authorities store on a Windows system**
• Press Windows + R and type mmc and enter.  
• Go to File > Add/Remove snap-in...  
• Select certificates and click add.  
• Choose computer account and click next and then click finish.  
• In the left pane, expand Certificates (Local Computer) > Trusted Root 
Certification Authorities > Certificates.  
• Right click on certificates and select all tasks > Import.  
• Follow the import wizard, select certificate.pem file, and choose to install it 
in the Trusted Root Certification Authorities.  

#### **3.2 Create a new folder "certificates" in the root directory and add the downloaded private-key.pem and certificate.pem files in it**

#### **3.3 Navigate to the backend services**
```vash
cd chatbot_backend
```

#### **3.4 Create a .env file in the root directory and add the below in the .env file:**
**NEBIUS_API_KEY = "your_api_key"**
**PORT = 8080**

#### **3.5 Install all the deoendencies:**
```bash
npm i
```

#### **3.6 Update the below fields in dbconenction.js file with your credentials:**
- database: 'your_database_name'
- password: 'your_password'

#### **3.7 Uncomment the lines from 3 to 44 in the file app.js and comment the remaining code**

#### **3.8 To run the backend service, run the below command:**
   ```bash
   node app
   ```

#### **3.9 Open a new terminal and navigate to the frontend service:**
   ```bash
   cd chatbot_frontend
   ```

#### **3.10 Install all the required dependencies:**
   ```bash
   npm i
   ```

#### **3.11 Uncomment the line 3 and comment line 5 inside authService.js**

#### **3.12 Replace the line  “start”: “react-scripts start” with ”start": "cross-env HTTPS=true SSL_CRT_FILE=.././certificates/certificate.pem SSL_KEY_FILE=.././certificates/private-key.pem react-scripts start” inside package.json file**

#### **3.13 To run the frontend service, run the below command:**
   ```bash
   npm start
   ```

### **4. To run the services in a secure connection (HTTPS):**

#### **4.1 Navigate to the backend service:**
   ```bash
   cd chatbot_backend
   ```

#### 4.2 Create a .env file in the root directory and add the below in the .env file: 
**NEBIUS_API_KEY = "your_api_key"**


#### **4.3 Install all the required dependencies:**
   ```bash
   npm i
   ```

#### **4.4 Update the below fields in dbconenction.js file with your credentials:**
- database: 'your_database_name'
- password: 'your_password'

#### **4.5 To run the backend service, run the below command:**
   ```bash
   node app
   ```

#### **4.6 Open a new terminal and navigate to the frontend service:**
   ```bash
   cd chatbot_frontend
  
   ```   
#### **4.7 Install all the required dependencies:**
   ```bash
   npm i
   ```   

#### **4.8 To run the frontend service, run the below command:**
   ```bash
   npm start
   ```
