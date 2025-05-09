import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    const response = await login(username, password);

    if (response.success) {
      navigate("/dashboard");
    } else {
      setError(response.message);
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen py-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">DevProTrack</CardTitle>
          <CardDescription>Sign in to track your development productivity</CardDescription>
        </CardHeader>

        <CardContent>
          {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input id="username" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="animate-spin mr-2 inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
