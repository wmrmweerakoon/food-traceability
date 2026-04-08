# How to Find and Use the JWT Token in Postman

## Where to Find the Token

After making a successful **Register** or **Login** request, the JWT token is located in the response body:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxZjQ0NjQwZjQ2YzQ4MDAwMTM4ZjQ2NCIsInJvbGUiOiJST0xFX0NPTlNVTUVSIiwiaWF0IjoxNjQzMjQ1MzQ1LCJleHAiOjE2NDM4NTAxNDV9.xxxxxxxxxxxxxxx",
    "user": { ... }
  }
}
```

The token is in the `data.token` field.

## Manual Method

1. After running a Register/Login request in Postman, look at the response body
2. Copy the value from `data.token`
3. For subsequent requests requiring authentication:
   - Go to the "Headers" tab
   - Add a new header with key `Authorization` and value `Bearer [paste-your-token-here]`
   
   **Important**: Make sure to include the word "Bearer" followed by a space before your token. It should look like:
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxZjQ0NjQwZjQ2YzQ4MDAwMTM4ZjQ2NCIsInJvbGUiOiJST0xFX0NPTlNVTUVSIiwiaWF0IjoxNjQzMjQ1MzQ1LCJleHAiOjE2NDM4NTAxNDV9.xxxxxxxxxxxxxxx
   ```

   **Not just the token by itself**, which would cause the "Access token is required" error you're seeing.

## Automatic Method (Recommended)

To automatically capture and reuse the token:

1. In your Register/Login request, go to the **Tests** tab
2. Add this script:

```javascript
// Capture the token from the response and store it in an environment variable
var responseJson = pm.response.json();
if(responseJson.success && responseJson.data && responseJson.data.token) {
    pm.environment.set("token", responseJson.data.token);
    console.log("Token stored in environment variable 'token'");
}
```

3. In requests that need the token, use `{{token}}` in the Authorization header:

| KEY | VALUE |
|-----|-------|
| Authorization | Bearer {{token}} |

## Using the Pre-configured Collection

The provided Postman collection already has:

1. A "Get Current User Profile" request with the Authorization header pre-set to `Bearer {{token}}`
2. If you've run the script in the Tests tab of the login/register requests, this will automatically use the latest token

## Verifying Token Storage

To check if your token is properly stored:

1. Click the eye icon in the top-right corner of Postman
2. Select your environment
3. Look for the "token" variable in the list
4. You should see the JWT token value stored there

## Troubleshooting

- If you get a 401 error on protected endpoints, your token may have expired (they expire after 7 days) or not be properly set
- Make sure you're using the "same" environment in both the request that captures the token and the requests that use it
- Check the Console tab (View > Show Postman Console) to see if the token is being captured properly
- **Common Issue**: If you're getting "Access token is required" error, it means the Authorization header is not formatted correctly. It must be exactly: `Authorization: Bearer [your-jwt-token]`
- The middleware splits the Authorization header by space and expects "Bearer" as the first part and the token as the second part
- Case matters: use "Authorization" not "authorization" or "AUTHORIZATION"
- Make sure there's a space between "Bearer" and your token
