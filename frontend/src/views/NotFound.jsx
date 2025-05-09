import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved. Please check the URL or go back to the homepage.
      </p>
      <Button asChild>
        <Link to="/">Back to Dashboard</Link>
      </Button>
    </div>
  );
};

export default NotFound;
