## Axios Instance (API Connection)
( File: src/utils/axiosInstance.js)
The project uses a custom Axios instance to manage backend API calls.

Base URL: Points to the deployed backend (/api).

Token Handling: Automatically attaches JWT from localStorage in every request.

Error Handling: If a 401 Unauthorized response occurs, the user is logged out and redirected to /login.

Advantage: Simplifies API communication and ensures consistent authentication across all requests.


## File: context/AuthContext.jsx

Description:

Handles authentication state across the entire app using React Context.

Maintains user and token information

Supports persistent login via localStorage

Provides login and logout functions

Accessible anywhere using useAuth() hook

## File: context/SocketContext.jsx

Description:

Manages the real-time WebSocket connection between the frontend and backend using Socket.IO.

Establishes connection when user logs in

Authenticates using JWT token

Automatically reconnects on network issues

Emits user_connected for online tracking

Provides useSocket() hook for easy access in any component

## File: context/CallContext.jsx

=> Description:
Manages all voice and video call features using WebRTC and Socket.IO inside a React Context.

=> Functions:

Starts, receives, accepts, and ends calls
git
Handles audio/video streams

Shares call state across the app

Manages mute/unmute and camera toggle

Exchanges ICE candidates for direct connection

=> Key Points:

Uses WebRTC for real-time media

Uses Socket.IO for call signaling

ICE candidates help browsers find best connection paths

Cleans up when call ends

Accessible anywhere with useCall() hook