import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { 
  Search, 
  Clock, 
  Star, 
  Folder, 
  Plus, 
  Filter,
  ChevronRight,
  Calendar,
  Hash,
  Users,
  Briefcase,
  Trash2,
  Edit3,
  MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  candidates_count: number;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

interface SearchHistoryItem {
  id: string;
  search_query: string;
  boolean_query: string;
  platform: string;
  results_count: number;
  created_at: string;
  is_favorite: boolean;
  tags: string[];
  project_id: string | null;
  project?: Project;
}

const SearchHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("searches");
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "#8B5CF6",
    icon: "folder"
  });

  const projectIcons = [
    { name: "folder", icon: Folder },
    { name: "briefcase", icon: Briefcase },
    { name: "users", icon: Users },
  ];

  const projectColors = [
    "#8B5CF6", // Purple
    "#D946EF", // Pink
    "#10B981", // Green
    "#F59E0B", // Orange
    "#3B82F6", // Blue
    "#EF4444", // Red
  ];

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch search history
      const { data: searches, error: searchError } = await supabase
        .from("search_history")
        .select(`
          *,
          project:projects(*)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (searchError) throw searchError;
      setSearchHistory(searches || []);

      // Fetch projects
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (projectError) throw projectError;
      setProjects(projectData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      const { error } = await supabase
        .from("projects")
        .insert({
          ...newProject,
          user_id: user?.id
        });

      if (error) throw error;

      toast.success("Project created successfully");
      setShowCreateProject(false);
      setNewProject({ name: "", description: "", color: "#8B5CF6", icon: "folder" });
      fetchData();
    } catch (error) {
      if (error instanceof Error && error.message?.includes("duplicate key")) {
        toast.error("A project with this name already exists");
      } else {
        toast.error("Failed to create project");
      }
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject || !editingProject.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          name: editingProject.name,
          description: editingProject.description,
          color: editingProject.color,
          icon: editingProject.icon
        })
        .eq("id", editingProject.id);

      if (error) throw error;

      toast.success("Project updated successfully");
      setEditingProject(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to update project");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      toast.success("Project deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const handleToggleFavorite = async (searchId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("search_history")
        .update({ is_favorite: !currentState })
        .eq("id", searchId);

      if (error) throw error;

      setSearchHistory(prev =>
        prev.map(item =>
          item.id === searchId ? { ...item, is_favorite: !currentState } : item
        )
      );
    } catch (error) {
      toast.error("Failed to update favorite status");
    }
  };

  const handleRunSearch = (searchItem: SearchHistoryItem) => {
    // Navigate to sourcing page with pre-filled search
    navigate("/sourcing", {
      state: {
        query: searchItem.search_query,
        booleanQuery: searchItem.boolean_query,
        platform: searchItem.platform
      }
    });
  };

  const getIconComponent = (iconName: string) => {
    const iconConfig = projectIcons.find(i => i.name === iconName);
    return iconConfig ? iconConfig.icon : Folder;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search History & Projects</h1>
        <p className="text-gray-600">Manage your recruitment searches and organize candidates into projects</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="searches">Search History</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        {/* Search History Tab */}
        <TabsContent value="searches" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Badge variant="outline" className="px-3 py-1">
                <Clock className="w-3 h-3 mr-1" />
                {searchHistory.length} searches
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <Star className="w-3 h-3 mr-1" />
                {searchHistory.filter(s => s.is_favorite).length} favorites
              </Badge>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="grid gap-4">
            {searchHistory.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{item.search_query}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFavorite(item.id, item.is_favorite)}
                          className="p-1"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              item.is_favorite ? "fill-yellow-500 text-yellow-500" : "text-gray-400"
                            }`}
                          />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary">
                          {item.platform}
                        </Badge>
                        <Badge variant="outline">
                          {item.results_count} results
                        </Badge>
                        {item.project && (
                          <Badge
                            style={{ backgroundColor: `${item.project.color}20`, color: item.project.color }}
                          >
                            <Folder className="w-3 h-3 mr-1" />
                            {item.project.name}
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {item.boolean_query}
                        </code>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleRunSearch(item)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Run Search
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <Badge variant="outline" className="px-3 py-1">
              <Folder className="w-3 h-3 mr-1" />
              {projects.length} projects
            </Badge>
            <Button onClick={() => setShowCreateProject(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const IconComponent = getIconComponent(project.icon);
              return (
                <Card 
                  key={project.id} 
                  className="hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${project.color}20` }}
                        >
                          <IconComponent
                            className="w-5 h-5"
                            style={{ color: project.color }}
                          />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {project.candidates_count} candidates
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="p-1">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProject(project);
                            }}
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {project.description && (
                      <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Created {format(new Date(project.created_at), "MMM d, yyyy")}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Project Dialog */}
      <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Organize your candidates into projects for better management
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="e.g., Senior Engineers Q1 2025"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Project description..."
                rows={3}
              />
            </div>
            <div>
              <Label>Icon</Label>
              <div className="flex gap-2 mt-2">
                {projectIcons.map(({ name, icon: Icon }) => (
                  <Button
                    key={name}
                    variant={newProject.icon === name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewProject({ ...newProject, icon: name })}
                    className="p-2"
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-2">
                {projectColors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newProject.color === color ? "border-gray-900" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewProject({ ...newProject, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateProject(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      {editingProject && (
        <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Project Name</Label>
                <Input
                  id="edit-name"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingProject.description || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Icon</Label>
                <div className="flex gap-2 mt-2">
                  {projectIcons.map(({ name, icon: Icon }) => (
                    <Button
                      key={name}
                      variant={editingProject.icon === name ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEditingProject({ ...editingProject, icon: name })}
                      className="p-2"
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {projectColors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        editingProject.color === color ? "border-gray-900" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingProject({ ...editingProject, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingProject(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProject}>Update Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SearchHistory;