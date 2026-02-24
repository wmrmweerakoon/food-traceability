# Testing Login and Register Functionality with Postman

This guide explains how to test the authentication endpoints of the Food Traceability App using Postman.

## Prerequisites

- Install [Postman](https://www.postman.com/) on your computer
- Make sure the backend server is running (typically on `http://localhost:5000`)
- Import the provided Postman collection file

## Importing the Collection

1. Open Postman
2. Click on the "Import" button in the top left corner
3. Select the `postman_collection.json` file provided in this repository
4. The collection "Food Traceability App - Authentication" will be imported

## Environment Setup

1. Create a new environment in Postman:
   - Click on the gear icon in the top right corner
   - Click "Add"
   - Name your environment (e.g., "Local Development")
   - Add a variable named `baseUrl` with the value `http://localhost:5000`
   - Save the environment

## Testing Endpoints

### 1. Register User Endpoint

**URL**: `POST {{baseUrl}}/api/auth/register`

#### Required Fields:
- `username` (string, required): Unique username
- `email` (string, required): Valid email address
- `password` (string, required): Password (minimum 6 characters)
- `firstName` (string, required): First name
- `lastName` (string, required): Last name
- `contactNumber` (string, optional): Contact number
- `role` (string, optional): User role (default: ROLE_CONSUMER)
- `address` (object, optional): Address object with street, city, state, zipCode, country

#### Sample Request Body:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User",
  "contactNumber": "+1234567890",
  "role": "ROLE_CONSUMER",
  "address": {
    "street": "123 Main St",
    "city": "Colombo",
    "state": "Western",
    "zipCode": "00100",
    "country": "Sri Lanka"
  }
}
```

#### Expected Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "_id": "user-id",
      "username": "testuser",
      "email": "test@example.com",
      "role": "ROLE_CONSUMER",
      "firstName": "Test",
      "lastName": "User",
      ...
    }
  }
}
```

### 2. Login User Endpoint

**URL**: `POST {{baseUrl}}/api/auth/login`

#### Required Fields:
- `email` (string, required): Email address of the user
- `password` (string, required): Password of the user

#### Sample Request Body:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Expected Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "_id": "user-id",
      "username": "testuser",
      "email": "test@example.com",
      "role": "ROLE_CONSUMER",
      "firstName": "Test",
      "lastName": "User",
      ...
    }
  }
}
```

### 3. Get Current User Profile Endpoint

**URL**: `GET {{baseUrl}}/api/auth/me`

#### Headers:
- `Authorization`: `Bearer {{token}}` (use the token received from login/register)

#### Expected Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user-id",
      "username": "testuser",
      "email": "test@example.com",
      "role": "ROLE_CONSUMER",
      "firstName": "Test",
      "lastName": "User",
      ...
    }
  }
}
```

## Testing Process

1. **Register a new user**:
   - Select the "Register User" request from the collection
   - Make sure your environment is selected
   - Send the request
   - Verify that you receive a success response with a JWT token
   - The token is located in the response under `data.token`

2. **Login with the registered user**:
   - Select the "Login User" request from the collection
   - Update the request body with the email and password of the registered user
   - Send the request
   - Verify that you receive a success response with a JWT token
   - The token is located in the response under `data.token`

3. **Get user profile**:
   - Select the "Get Current User Profile" request from the collection
   - Copy the token from the previous response (either from register or login)
   - Add it to the Authorization header as "Bearer <token>" - Postman can automatically capture this token for reuse by setting up a test script in the login/register requests:
     ```javascript
     // In Tests tab of login/register requests, add:
     var responseJson = pm.response.json();
     if(responseJson.success && responseJson.data.token) {
         pm.environment.set("token", responseJson.data.token);
     }
     ```
   - Send the request
   - Verify that you receive the user profile data

4. **Using the captured token**:
   - After running the register or login request once, the token will be stored in your Postman environment
   - Subsequent requests to protected endpoints will automatically use this token
   - You can view and manage environment variables by clicking the eye icon in the top right corner

## Common Issues and Troubleshooting

- **400 Bad Request**: Check that all required fields are provided
- **401 Unauthorized**: Verify that the email/password combination is correct
- **403 Forbidden**: Account might be deactivated
- **500 Internal Server Error**: Check server logs for more details

## Additional Notes

- The JWT token expires in 7 days
- Passwords are hashed using bcrypt
- Email addresses are stored in lowercase
- Username and email must be unique
- The default role for new users is ROLE_CONSUMER