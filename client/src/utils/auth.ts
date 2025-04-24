import { User } from "@shared/schema";

// Login with username and password
export async function login(username: string, password: string): Promise<User> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    throw new Error("Login failed");
  }
  
  return await response.json();
}

// Check if user is authenticated
export async function checkAuth(): Promise<User | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });
  
  if (!response.ok) {
    return null;
  }
  
  return await response.json();
}

// Logout
export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Logout failed");
  }
}

// Register a new user
export async function register(userData: {
  username: string;
  password: string;
  name: string;
  email: string;
}): Promise<User> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error("Registration failed");
  }
  
  return await response.json();
}