## Axios Instance (API Connection)

The project uses a custom Axios instance to manage backend API calls.

Base URL: Points to the deployed backend (/api).

Token Handling: Automatically attaches JWT from localStorage in every request.

Error Handling: If a 401 Unauthorized response occurs, the user is logged out and redirected to /login.

Advantage: Simplifies API communication and ensures consistent authentication across all requests.

## File: src/utils/axiosInstance.js

File: context/AuthContext.jsx

Description:

Handles authentication state across the entire app using React Context.

Maintains user and token information

Supports persistent login via localStorage

Provides login and logout functions

Accessible anywhere using useAuth() hook