import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define our base API URL - you might want to move this to an environment variable
const apiUrl = "http://localhost:3000";

// Type definitions that match our backend response structure
interface UserCredentials {
  email: string;
  password: string;
  name?: string;
}

// This interface matches the user data structure from Supabase
interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
  };
  aud: string;
  role?: string;
}

// This interface matches our backend response structure
interface AuthResponse {
  message: string;
  user: User;
}

export const apiSlice = createApi({
  reducerPath: "auth",
  // Configure the base query to work with cookies
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}/auth`,
    credentials: "include", // This is crucial for sending cookies with requests
    prepareHeaders: (headers) => {
      // Set necessary headers for our API
      headers.set("Content-Type", "application/json");
      
      // We don't need to manually set Authorization header because cookies are handled automatically
      return headers;
    },
  }),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    // Login endpoint
    loginUser: builder.mutation<AuthResponse, UserCredentials>({
      query: (credentials) => ({
        url: "/signin",
        method: "POST",
        body: credentials,
        // Ensure cookies are included with the request
        credentials: "include"
      }),
      // When login succeeds, invalidate relevant cached data
      invalidatesTags: ["Auth"],
      // Transform the response to match our expected format
      transformResponse: (response: AuthResponse) => {
        return response;
      },
    }),

    // Registration endpoint
    registerUser: builder.mutation<AuthResponse, UserCredentials>({
      query: (userData) => ({
        url: "/signup",
        method: "POST",
        body: userData,
        credentials: "include"
      }),
      invalidatesTags: ["Auth"],
    }),

    // Logout endpoint
    logoutUser: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/signout",
        method: "POST",
        credentials: "include"
      }),
      // Clear cached data on logout
      async onQueryStarted(_, { dispatch }) {
        try {
          // Reset the API state to clear any cached data
          dispatch(apiSlice.util.resetApiState());
        } catch (error) {
          console.error("Error during logout:", error);
        }
      },
      invalidatesTags: ["Auth"],
    }),

    // Get current user endpoint - useful for checking authentication status
    getCurrentUser: builder.query<User, void>({
      query: () => ({
        url: "/me",
        method: "GET",
        credentials: "include"
      }),
      providesTags: ["Auth"],
    }),

    // Refresh token endpoint - this will use the refresh_token cookie automatically
    refreshToken: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: "/refresh",
        method: "POST",
        credentials: "include"
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

// Export the generated hooks for use in components
export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useLogoutUserMutation,
  useGetCurrentUserQuery,
  useRefreshTokenMutation,
} = apiSlice;

export default apiSlice;