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
