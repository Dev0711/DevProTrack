import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const response = await register({ username, email, password });

    if (response.success) {
      setSuccess("Registration successful! You can now log in.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      setError(response.message);
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen py-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">DevProTrack</CardTitle>
          <CardDescription>Create your account</CardDescription>
        </CardHeader>

        <CardContent>
          {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">{error}</div>}

          {success && <div className="bg-green-100 text-green-800 text-sm p-3 rounded-md mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input id="username" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input id="email" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="animate-spin mr-2 inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Signing up...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
