import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { repositoryAPI, analyticsAPI } from "../services/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, RefreshCw, Github, Activity, GitPullRequest, Clock, Code, FileText } from "lucide-react";
import ReactMarkdown from 'react-markdown';

const RepositoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repository, setRepository] = useState(null);
  const [commitStats, setCommitStats] = useState(null);
  const [prStats, setPrStats] = useState(null);
  const [readmeContent, setReadmeContent] = useState(null);
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [syncLoading, setSyncLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch repository data
      const repoResponse = await repositoryAPI.getById(id);
      setRepository(repoResponse.data);
      
      // Get date range (last 30 days)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Fetch repository stats
      const [commitResponse, prResponse] = await Promise.all([
        analyticsAPI.getRepositoryCommits(id, startDate, endDate),
        analyticsAPI.getRepositoryPullRequests(id, startDate, endDate)
      ]);
      
      setCommitStats(commitResponse.data);
      setPrStats(prResponse.data);
      setError(null);
      
      // Fetch README.md content
      await fetchReadme(repoResponse.data.fullName);
    } catch (err) {
      console.error("Error fetching repository data:", err);
      setError("Failed to load repository data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReadme = async (fullName) => {
    try {
      setReadmeLoading(true);
      console.log("Fetching README for:", fullName);
      
      let content = null;
      
      // First try with our backend API
      try {
        const response = await repositoryAPI.getReadme(fullName);
        console.log("Backend API response:", response);
        
        if (response.data && response.data.length > 0) {
          console.log("Backend API returned content, length:", response.data.length);
          content = response.data;
        } else {
          console.log("Backend API returned empty content");
        }
      } catch (apiErr) {
        console.error("Backend API error:", apiErr);
      }
      
      // If backend fetch failed, try direct GitHub raw content as fallback
      if (!content) {
        console.log("Trying direct GitHub fetch using API service");
        try {
          const directResponse = await repositoryAPI.getReadmeDirectFromGitHub(fullName);
          if (directResponse.data) {
            console.log("Direct GitHub fetch successful, length:", directResponse.data.length);
            content = directResponse.data;
          }
        } catch (directErr) {
          console.error("Direct GitHub fetch error:", directErr);
        }
      }
      
      // Set content if we found any
      if (content) {
        console.log("Setting README content, length:", content.length);
        setReadmeContent(content);
      } else {
        console.log("No README content found from any source");
        setReadmeContent(null);
      }
    } catch (err) {
      console.error("Error in README fetch process:", err);
      // Don't set null on general errors
    } finally {
      setReadmeLoading(false);
    }
  };

  const testRefreshReadme = async () => {
    if (!repository) return;
    
    console.log("======= README FETCH TEST ========");
    console.log("Repository:", repository.fullName);
    
    // Test backend API
    try {
      console.log("\n1. Testing backend API:");
      const response = await repositoryAPI.getReadme(repository.fullName);
      console.log("✅ Backend API SUCCESS!");
      console.log("Data length:", response.data ? response.data.length : 0);
      console.log("Data sample:", response.data ? response.data.substring(0, 100) : "No content");
    } catch (err) {
      console.error("❌ Backend API FAILED:", err.message);
    }
    
    // Test direct GitHub fetch
    try {
      console.log("\n2. Testing direct GitHub fetch:");
      const response = await repositoryAPI.getReadmeDirectFromGitHub(repository.fullName);
      console.log("✅ Direct GitHub fetch SUCCESS!");
      console.log("Data length:", response.data ? response.data.length : 0);
      console.log("Data sample:", response.data ? response.data.substring(0, 100) : "No content");
    } catch (err) {
      console.error("❌ Direct GitHub fetch FAILED:", err.message);
    }
    
    // Now do the normal fetch which should work from one of the sources
    console.log("\n3. Performing normal fetch (should use one of the above methods):");
    await fetchReadme(repository.fullName);
    console.log("======= TEST COMPLETE ========");
  };

  const handleSyncRepository = async () => {
    if (!repository) return;
    
    try {
      setSyncLoading(true);
      await repositoryAPI.syncRepository(repository.fullName);
      await fetchData();
    } catch (err) {
      console.error("Error syncing repository:", err);
      setError("Failed to sync repository. Please try again later.");
    } finally {
      setSyncLoading(false);
    }
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
                onClick={handleSyncRepository}
                disabled={syncLoading}
              >
                <RefreshCw size={16} className={syncLoading ? "animate-spin" : ""} />
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
        {activeTab === "overview" && commitStats && prStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Commit Stats Card */}
              <Card className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Commits</p>
                      <h3 className="text-3xl font-bold">{commitStats.totalCommits}</h3>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">{commitStats.avgCommitsPerDay?.toFixed(1) || "0"} per day on average</div>
                </CardContent>
              </Card>

              {/* PR Stats Card */}
              <Card className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Pull Requests</p>
                      <h3 className="text-3xl font-bold">{prStats.totalPRs}</h3>
                    </div>
                    <div className="p-2 bg-indigo-100 rounded-full">
                      <GitPullRequest className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    {prStats.openPRs} open, {prStats.mergedPRs} merged
                  </div>
                </CardContent>
              </Card>

              {/* Cycle Time Card */}
              <Card className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Avg Cycle Time</p>
                      <h3 className="text-3xl font-bold">{Math.round((prStats.avgCycleTime || 0) / 60)}h</h3>
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
                      <h3 className="text-3xl font-bold">{commitStats.commitsByAuthor ? Object.keys(commitStats.commitsByAuthor).length : 0}</h3>
                    </div>
                    <div className="p-2 bg-emerald-100 rounded-full">
                      <Code className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">active contributors</div>
                </CardContent>
              </Card>
            </div>

            {/* Contributors list card */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contributors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(commitStats.commitsByAuthor).map(([author, count]) => (
                      <div key={author} className="flex items-center">
                        <div className="w-32 font-medium truncate">{author}</div>
                        <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(count / Math.max(...Object.values(commitStats.commitsByAuthor))) * 100}%`,
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

            {/* README.md card */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>README.md</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs" 
                      onClick={testRefreshReadme}
                    >
                      <RefreshCw size={14} className="mr-1" />
                      Refresh README
                    </Button>
                    <div className="text-muted-foreground text-sm">
                      Project documentation & description
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {readmeLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : readmeContent ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary prose-pre:bg-muted/50 prose-pre:rounded">
                      <ReactMarkdown
                        components={{
                          // Improve image handling to use relative URLs from GitHub
                          img: ({ node, ...props }) => {
                            let src = props.src;
                            
                            // Handle relative URLs
                            if (src && !src.startsWith('http') && repository) {
                              const repoUrl = `https://github.com/${repository.fullName}`;
                              const branch = 'main'; // Assume main as default branch
                              
                              // Handle different relative path patterns
                              if (src.startsWith('./')) {
                                src = `${repoUrl}/raw/${branch}/${src.substring(2)}`;
                              } else if (src.startsWith('/')) {
                                src = `${repoUrl}/raw/${branch}${src}`;
                              } else {
                                src = `${repoUrl}/raw/${branch}/${src}`;
                              }
                            }
                            
                            return <img {...props} src={src} alt={props.alt || ''} className="rounded-md max-w-full h-auto" />;
                          },
                          // Add syntax highlighting class for code blocks
                          code: ({ node, inline, className, children, ...props }) => {
                            return inline ? (
                              <code className="bg-muted/30 px-1 py-0.5 rounded text-sm" {...props}>
                                {children}
                              </code>
                            ) : (
                              <pre className="p-4 rounded-md bg-muted/30 overflow-x-auto">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            );
                          }
                        }}
                      >
                        {readmeContent}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed rounded-md">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        No README.md file found in this repository
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Click "Refresh README" to try again or "Sync Repository" to refresh repository data
                      </p>
                    </div>
                  )}
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
