import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const Settings = () => {
  const { currentUser, connectGithub } = useContext(AuthContext);

  const [githubUsername, setGithubUsername] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleConnectGithub = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    if (!githubUsername || !githubToken) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await connectGithub(githubUsername, githubToken);

      if (response.success) {
        setSuccess("GitHub account connected successfully");
        setGithubUsername("");
        setGithubToken("");
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("An error occurred while connecting your GitHub account");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Username</h3>
              <p>{currentUser?.username || "Not available"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Email</h3>
              <p>{currentUser?.email || "Not available"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">GitHub Connection</h3>
              <p className={currentUser?.hasGithubToken ? "text-green-600" : "text-red-500"}>
                {currentUser?.hasGithubToken ? "Connected" : "Not Connected"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* GitHub Integration */}
        <Card>
          <CardHeader>
            <CardTitle>GitHub Integration</CardTitle>
            <CardDescription>Connect your GitHub account to track your development activity</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">{error}</div>}

            {success && <div className="bg-green-100 text-green-800 text-sm p-3 rounded-md mb-4">{success}</div>}

            <form onSubmit={handleConnectGithub} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="githubUsername" className="text-sm font-medium">
                  GitHub Username
                </label>
                <Input
                  id="githubUsername"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="Your GitHub username"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="githubToken" className="text-sm font-medium">
                  GitHub Personal Access Token
                </label>
                <Input
                  id="githubToken"
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="Your GitHub personal access token"
                />
                <p className="text-xs text-muted-foreground">
                  Create a token with 'repo' scope at GitHub &gt; Settings &gt; Developer settings &gt; Personal access tokens
                </p>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="animate-spin mr-2 inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                    Connecting...
                  </>
                ) : (
                  "Connect GitHub Account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive productivity reports via email</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-6 bg-primary/20 rounded-full p-1 cursor-pointer">
                    <div className="h-4 w-4 bg-primary rounded-full transform translate-x-4"></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Weekly Digest</h3>
                  <p className="text-sm text-muted-foreground">Receive a weekly summary of your productivity</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-6 bg-muted rounded-full p-1 cursor-pointer">
                    <div className="h-4 w-4 bg-muted-foreground rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
