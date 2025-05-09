import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { repositoryAPI } from "../services/api";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, RefreshCw, Github, Code, Settings, AlertTriangle } from "lucide-react";

const Repositories = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      const response = await repositoryAPI.getAll();
      setRepositories(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching repositories:", err);
      setError("Failed to load repositories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncGithub = async () => {
    try {
      setSyncLoading(true);
      setSuccessMessage("");
      await repositoryAPI.syncGithub();
      await fetchRepositories();
      setSuccessMessage("GitHub repositories synchronized successfully");
    } catch (err) {
      console.error("Error syncing GitHub repositories:", err);
      setError("Failed to sync GitHub repositories. Please check your GitHub connection in settings.");
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncLoading(true);
      setSuccessMessage("");
      await repositoryAPI.syncAll();
      setSuccessMessage("All repository data synchronized successfully");
    } catch (err) {
      console.error("Error syncing all repositories:", err);
      setError("Failed to sync repository data. Please try again later.");
    } finally {
      setSyncLoading(false);
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      await repositoryAPI.toggleActive(id, !currentActive);
      setRepositories(repositories.map((repo) => (repo.id === id ? { ...repo, active: !currentActive } : repo)));
    } catch (err) {
      console.error("Error toggling repository active status:", err);
      setError("Failed to update repository status. Please try again later.");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredRepositories = repositories.filter(
    (repo) => repo.name.toLowerCase().includes(searchTerm.toLowerCase()) || repo.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Placeholder repositories data for development
  const placeholderRepositories = [
    {
      id: 1,
      name: "Project A",
      fullName: "user/project-a",
      description: "This is a description for Project A - a sample project.",
      lastSyncTime: new Date().toISOString(),
      active: true,
    },
    {
      id: 2,
      name: "Project B",
      fullName: "user/project-b",
      description: "Project B - another sample project for demonstration purposes.",
      lastSyncTime: new Date().toISOString(),
      active: true,
    },
    {
      id: 3,
      name: "Project C",
      fullName: "user/project-c",
      description: "Project C is an inactive repository in this example.",
      lastSyncTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      active: false,
    },
  ];

  // Use real data if available, otherwise use placeholder data
  const displayRepositories = repositories.length > 0 ? filteredRepositories : placeholderRepositories;

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Repositories</h1>
          <p className="text-muted-foreground">Manage and track your GitHub repositories</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleSyncGithub} disabled={syncLoading}>
            <Github size={16} />
            Sync GitHub Repos
          </Button>
          <Button className="flex items-center gap-2" onClick={handleSyncAll} disabled={syncLoading}>
            <RefreshCw size={16} className={syncLoading ? "animate-spin" : ""} />
            Sync All Data
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md flex items-start gap-2">
          <AlertTriangle size={20} />
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 text-green-800 p-4 rounded-md flex items-start gap-2">
          <RefreshCw size={20} />
          <p>{successMessage}</p>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search repositories..." value={searchTerm} onChange={handleSearchChange} className="pl-10" />
      </div>

      {displayRepositories.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <Code size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No repositories found</h2>
          <p className="text-muted-foreground mb-6">
            {repositories.length === 0
              ? "Connect your GitHub account and sync your repositories to get started"
              : "No repositories match your search criteria"}
          </p>
          {repositories.length === 0 && <Button onClick={() => navigate("/settings")}>Connect GitHub</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayRepositories.map((repo) => (
            <div
              key={repo.id}
              className={`border rounded-lg overflow-hidden transition-all duration-300 ${repo.active ? "hover:shadow-md" : "opacity-75"}`}
            >
              <div className="p-5 flex justify-between border-b">
                <div>
                  <h2 className="text-lg font-medium">{repo.name}</h2>
                  <p className="text-sm text-muted-foreground">{repo.fullName}</p>
                </div>
                <div className="flex items-center">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(repo.id, repo.active);
                    }}
                    className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${repo.active ? "bg-primary/20" : "bg-muted"}`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full transition-transform ${
                        repo.active ? "bg-primary transform translate-x-4" : "bg-muted-foreground"
                      }`}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {repo.description && <p className="mb-4 text-sm">{repo.description}</p>}

                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">Last synced: {formatDate(repo.lastSyncTime)}</div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle sync repo
                      }}
                    >
                      <RefreshCw size={14} />
                      Sync
                    </Button>

                    <Button size="sm" className="flex items-center gap-1" onClick={() => navigate(`/repositories/${repo.id}`)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Repositories;
