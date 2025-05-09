import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { repositoryAPI, analyticsAPI } from "../services/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, RefreshCw, Github, Activity, GitPullRequest, Clock, Code } from "lucide-react";

const RepositoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repository, setRepository] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real app, we would fetch the data from the API
        // const response = await repositoryAPI.getById(id);
        // setRepository(response.data);

        // For now, use placeholder data
        setRepository(placeholderRepository);
        setError(null);
      } catch (err) {
        console.error("Error fetching repository data:", err);
        setError("Failed to load repository data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Placeholder data for development
  const placeholderRepository = {
    id: id,
    name: "Sample Repository",
    fullName: "user/sample-repository",
    description: "This is a sample repository for the DevProTrack app.",
    lastSyncTime: new Date().toISOString(),
    active: true,
    commitStats: {
      totalCommits: 120,
      avgCommitsPerDay: 4.2,
      commitsByDay: {
        "2023-12-01": 5,
        "2023-12-02": 8,
        "2023-12-03": 3,
        "2023-12-04": 7,
        "2023-12-05": 4,
      },
      commitsByAuthor: {
        "User A": 45,
        "User B": 38,
        "User C": 27,
      },
    },
    pullRequestStats: {
      totalPRs: 25,
      openPRs: 3,
      closedPRs: 4,
      mergedPRs: 18,
      avgCycleTime: 1860, // 31 hours in minutes
    },
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-4">{error}</div>
        <Button onClick={() => navigate("/repositories")}>Back to Repositories</Button>
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="p-4">
        <div className="bg-amber-100 text-amber-800 p-4 rounded-md mb-4">Repository not found</div>
        <Button onClick={() => navigate("/repositories")}>Back to Repositories</Button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/repositories")} className="p-1">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{repository.name}</h1>
          <p className="text-muted-foreground">{repository.fullName}</p>
        </div>
      </div>

      {/* Repository info card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              {repository.description && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <p className="text-sm">{repository.description}</p>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-sm font-medium mb-1">Status</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${repository.active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}
                >
                  {repository.active ? "Active" : "Inactive"}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Last Synced</h3>
                <p className="text-sm">{formatDate(repository.lastSyncTime)}</p>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-2">
              <Button
                className="w-full flex items-center justify-center gap-2"
                onClick={() => {
                  // Handle sync repository
                }}
              >
                <RefreshCw size={16} />
                Sync Repository
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => window.open(`https://github.com/${repository.fullName}`, "_blank")}
              >
                <Github size={16} />
                View on GitHub
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs navigation */}
      <div className="border-b">
        <div className="flex space-x-6">
          {["overview", "commits", "pull-requests"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 transition-colors ${
                activeTab === tab ? "border-primary text-primary" : "border-transparent hover:border-muted-foreground/30 text-muted-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Commit Stats Card */}
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Commits</p>
                    <h3 className="text-3xl font-bold">{repository.commitStats.totalCommits}</h3>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">{repository.commitStats.avgCommitsPerDay.toFixed(1)} per day on average</div>
              </CardContent>
            </Card>

            {/* PR Stats Card */}
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Pull Requests</p>
                    <h3 className="text-3xl font-bold">{repository.pullRequestStats.totalPRs}</h3>
                  </div>
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <GitPullRequest className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  {repository.pullRequestStats.openPRs} open, {repository.pullRequestStats.mergedPRs} merged
                </div>
              </CardContent>
            </Card>

            {/* Cycle Time Card */}
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Avg Cycle Time</p>
                    <h3 className="text-3xl font-bold">{Math.round(repository.pullRequestStats.avgCycleTime / 60)}h</h3>
                  </div>
                  <div className="p-2 bg-amber-100 rounded-full">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">from creation to merge</div>
              </CardContent>
            </Card>

            {/* Contributors Card */}
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Contributors</p>
                    <h3 className="text-3xl font-bold">{Object.keys(repository.commitStats.commitsByAuthor).length}</h3>
                  </div>
                  <div className="p-2 bg-emerald-100 rounded-full">
                    <Code className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">active contributors</div>
              </CardContent>
            </Card>

            {/* More charts and data visualization would go here */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contributors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(repository.commitStats.commitsByAuthor).map(([author, count]) => (
                      <div key={author} className="flex items-center">
                        <div className="w-32 font-medium truncate">{author}</div>
                        <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(count / Math.max(...Object.values(repository.commitStats.commitsByAuthor))) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <div className="w-12 text-right text-muted-foreground">{count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "commits" && (
          <div className="text-center py-16">
            <Activity size={48} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Commits View</h2>
            <p className="text-muted-foreground mb-6">
              This is a placeholder for the commits view, which would show a detailed list of commits and more analytics.
            </p>
          </div>
        )}

        {activeTab === "pull-requests" && (
          <div className="text-center py-16">
            <GitPullRequest size={48} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Pull Requests View</h2>
            <p className="text-muted-foreground mb-6">
              This is a placeholder for the pull requests view, which would show a detailed list of PRs and more analytics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepositoryDetail;
