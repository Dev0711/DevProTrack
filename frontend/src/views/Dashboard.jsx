import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { analyticsAPI } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { BarChart, Activity, GitPullRequest, Code } from "lucide-react";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await analyticsAPI.getDashboard();
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // Placeholder data for initial UI
  const placeholderData = {
    username: "Developer",
    totalRepositories: 5,
    activeRepositories: 3,
    commitStats: {
      totalCommits: 120,
      avgCommitsPerDay: 4.2,
    },
    pullRequestStats: {
      totalPRs: 25,
      openPRs: 3,
      mergedPRs: 18,
      avgCycleTime: 1860, // in minutes (31 hours)
    },
    commitTrend: 12.5,
    prCompletionTrend: -5.2,
    topRepositories: [
      { id: 1, name: "Project A", fullName: "user/project-a", commitCount: 45, prCount: 8 },
      { id: 2, name: "Project B", fullName: "user/project-b", commitCount: 32, prCount: 6 },
      { id: 3, name: "Project C", fullName: "user/project-c", commitCount: 28, prCount: 5 },
    ],
  };

  // Use real data if available, otherwise use placeholder
  const data = dashboardData || placeholderData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Developer Dashboard</h1>
        <p className="text-muted-foreground">Overview of your development activity and productivity metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Commit Stats */}
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Commits</p>
                <h3 className="text-3xl font-bold">{data.commitStats?.totalCommits || 0}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className={`flex items-center ${data.commitTrend > 0 ? "text-green-500" : "text-red-500"}`}>
                {data.commitTrend > 0 ? "↑" : "↓"} {Math.abs(Math.round(data.commitTrend))}%
              </span>
              <span className="text-muted-foreground ml-2">vs. previous period</span>
            </div>
          </CardContent>
        </Card>

        {/* PR Stats */}
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Pull Requests</p>
                <h3 className="text-3xl font-bold">{data.pullRequestStats?.totalPRs || 0}</h3>
              </div>
              <div className="p-2 bg-indigo-100 rounded-full">
                <GitPullRequest className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-muted-foreground">
                {data.pullRequestStats?.openPRs || 0} open, {data.pullRequestStats?.mergedPRs || 0} merged
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Cycle Time */}
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg Cycle Time</p>
                <h3 className="text-3xl font-bold">{Math.round((data.pullRequestStats?.avgCycleTime || 0) / 60)}h</h3>
              </div>
              <div className="p-2 bg-amber-100 rounded-full">
                <BarChart className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-muted-foreground">from creation to merge</span>
            </div>
          </CardContent>
        </Card>

        {/* Repositories */}
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Repositories</p>
                <h3 className="text-3xl font-bold">{data.totalRepositories || 0}</h3>
              </div>
              <div className="p-2 bg-emerald-100 rounded-full">
                <Code className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-muted-foreground">{data.activeRepositories || 0} active repositories</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Repositories Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Top Repositories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data.topRepositories || []).map((repo) => (
            <Card key={repo.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/repositories/${repo.id}`)}>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-1">{repo.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{repo.fullName}</p>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-1" />
                    <span>{repo.commitCount} commits</span>
                  </div>
                  <div className="flex items-center">
                    <GitPullRequest className="h-4 w-4 mr-1" />
                    <span>{repo.prCount} PRs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
