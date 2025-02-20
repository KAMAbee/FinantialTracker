# Financial Tracker

![Static Badge](https://img.shields.io/badge/KAMAbee-Financial_Tracker-blue)
![Static Badge](https://img.shields.io/badge/Merrorgit-Financial_Tracker-blue)

![GitHub top language](https://img.shields.io/github/languages/top/KAMAbee/FinantialTracker)

![GitHub](https://img.shields.io/github/license/KAMAbee/FinantialTracker)

![Logotype](./logo/FinancialTracker.png)

## Description
**Financial Tracker** is a web application designed to help users manage their personal finances, set savings goals, and track progress. With this tool, you can easily monitor your spending, set financial goals, and track your savings over time.

## Key Features
- 🏦 **Goal Management**: Create, update, and manage financial goals like saving for a vacation, buying a new gadget, or paying off debt.
- 💰 **Savings Tracking**: Track the amount you've saved towards each goal and monitor your progress.
- 💸 **Transactions Managment**: Add, delete and classify transactions, whether they are expenses or income.
- 📊 **Transaction filtration** Filter transactions and and get the transactions you are interested in.

## Technologies Used
- **Frontend**: EJS, HTML, CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## How to Use
- Register: Create an account and log in
- Create a transaction: Start by creating a transaction.
- Add Goal: Add a goal and its deadline.
- Manage Budget: Manage your budget by adding different transactions and completing goals.

## Setup instructions
1. #### Clone the repository
```bash
https://github.com/KAMAbee/FinantialTracker
```

2. #### Move to the project directory
```bash
cd ./FinantialTracker
```

3. #### Install Dependencies
```bash
npm install
```

4. #### Set up Environment Variables .env
```bash
MONGO_URI=mongodb://localhost:27017/<yourDB>
JWT_SECRET=<yourJWTSecretKey>
SECRET_KEY=<yourSecretKey>
EMAIL_USER=<yourOutlookEmail>
EMAIL_PASSWORD=<yourOutlookPassword>
```

5. #### Create and connect to DB
- Start MongoDB locally or connect to a remote database.

6. #### Run the Project
```bash
node server.js
```

## API documentation

####Overview
This API allows users to manage their financial transactions, goals, and user roles. It includes endpoints for user registration, login, transaction management, goal management, and admin functionalities.

### Authentication

All endpoints require JWT authentication unless specified otherwise.

## Endpoints

### User Routes

#### Registration
- **URL:** `/registration`
- **Method:** `POST`
- **Description:** Registers a new user.
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "repeatPassword": "string"
  }
  ```
- **Response:** Redirects to the login page.

#### Login 
- **URL:** `/login`
- **Method:** `POST`
- **Description:** Logs in a user.
- **Request Body:**
 ```json
 {
  "username": "string",
  "password": "string"
}
  ```
- **Response:** Redirects to the home page.


#### Profile 
- **URL:** `/profile`
- **Method:** `GET`
- **Description:** Retrieves the user's profile.
- **Response:** Renders the profile page.


### Transaction Routes

#### Get All Transactions 
- **URL:** `/transactions`
- **Method:** `GET`
- **Description:** Retrieves all transactions for the authenticated user.
- **Response:**  Renders the transactions page.


#### Add Transaction 
- **URL:** `/transactions/addTransactions`
- **Method:** `POST`
- **Description:** Adds a new transaction.
- **Request Body:**
```json
{
  "name": "string",
  "amount": "number",
  "category": "string",
  "type": "string"
}
```
- **Response:** Redirects to the transactions page.


#### Delete Transaction 
- **URL:** `/transactions/deleteTransaction`
- **Method:** `POST`
- **Description:** Deletes a transaction.
- **Request Body:**
```json
{
  "transactionId": "string"
}
```
- **Response:** Redirects to the transactions page.


#### Update Transaction 
- **URL:** `/transactions/updateTransaction`
- **Method:** `POST`
- **Description:** Updates a transaction.
- **Request Body:**
```json
{
  "transactionId": "string",
  "name": "string",
  "amount": "number",
  "category": "string",
  "type": "string"
}
```
- **Response:** Redirects to the transactions page.

#### Add Category
- **URL:** `/transactions/addCategory`
- **Method:** `POST`
- **Description:** Adds a new category.
- **Request Body:**
```json
{
  "categoryName": "string"
}
```
- **Response:** Redirects to the transactions page.


#### Update Category
- **URL:** `/transactions/updateCategory`
- **Method:** `POST`
- **Description:** Updates a category.
- **Request Body:**
```json
{
  "categoryId": "string",
  "categoryName": "string"
}
```
- **Response:** Redirects to the transactions page.

#### Delete Category
- **URL:** `/transactions/deleteCategory`
- **Method:** `POST`
- **Description:**  Deletes a category.
- **Request Body:**
```json
{
  "categoryId": "string",
}
```
- **Response:** Redirects to the transactions page.



### Goal Routes

#### Get All Goals
- **URL:** `/goals`
- **Method:** `GET`
- **Description:** Retrieves all goals for the authenticated user.
- **Response:** Renders the goals page.


#### Add Goal
- **URL:** `/goals/addGoal`
- **Method:** `POST`
- **Description:** Adds a new goal
- **Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "goalAmount": "number",
  "deadline": "string"
}
```
- **Response:** Redirects to the goals page.


#### Add Money to Goal
- **URL:** `/goals/addMoney`
- **Method:** `POST`
- **Description:** Adds money to a goal.
- **Request Body:**
```json
{
  "goalId": "string",
  "amount": "number"
}
```
- **Response:** Redirects to the goals page.


#### Delete Goal
- **URL:** `/goals/deleteGoal`
- **Method:** `POST`
- **Description:** Deletes a goal.
- **Request Body:**
```json
{
  "goalId": "string"
}
```
- **Response:** Redirects to the goals page.


#### Update Goal
- **URL:** `/goals/updateGoal`
- **Method:** `POST`
- **Description:** Updates a goal.
- **Request Body:**
```json
{
  "goalId": "string",
  "name": "string",
  "amount": "number",
  "description": "string",
  "deadline": "string"
}
```
- **Response:** Redirects to the goals page.


### Admin Routes

#### Get All Users and Statistics
- **URL:** `/admin`
- **Method:** `GET`
- **Description:** Retrieves all users and various statistics.
- **Response:** Renders the admin page.


#### Update User Role
- **URL:** `/admin/updateRole`
- **Method:** `POST`
- **Description:** Updates the role of a user.
- **Request Body:**
```json
{
  "userId": "string",
  "role": "string"
}
```
- **Response:** Redirects to the admin page.


### Error Handling
All endpoints return appropriate HTTP status codes and error messages in case of failures.
