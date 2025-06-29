import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  ExternalLink,
  Trash2,
  Download,
  Filter,
  Search,
  Copy,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { URLScrapeButton } from "@/components/url-scraper";

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  candidates_count: number;
  created_at: string;
  updated_at: string;
}

interface SavedCandidate {
  id: string;
  name: string;
  linkedin_url: string;
  job_title: string;
  company: string;
  location: string;
  work_email: string | null;
  personal_emails: string[] | null;
  mobile_phone: string | null;
  profile_summary: string | null;
  profile_completeness: number | null;
  created_at: string;
  project_candidates: {
    added_at: string;
    notes: string | null;
    tags: string[] | null;
  }[];
}

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [candidates, setCandidates] = useState<SavedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (user && projectId) {
      fetchProjectData();
    }
  }, [user, projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);

      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", user?.id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch candidates in the project
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("saved_candidates")
        .select(`
          *,
          project_candidates!inner(
            added_at,
            notes,
            tags
          )
        `)
        .eq("project_candidates.project_id", projectId)
        .order("project_candidates.added_at", { ascending: false });

      if (candidatesError) throw candidatesError;
      setCandidates(candidatesData || []);
    } catch (error) {
      console.error("Error fetching project data:", error);
      toast.error("Failed to load project data");
      navigate("/search-history");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCandidate = async (candidateId: string) => {
    if (!confirm("Are you sure you want to remove this candidate from the project?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("project_candidates")
        .delete()
        .eq("project_id", projectId)
        .eq("candidate_id", candidateId);

      if (error) throw error;

      toast.success("Candidate removed from project");
      fetchProjectData();
    } catch (error) {
      toast.error("Failed to remove candidate");
    }
  };

  const handleCopyField = (value: string, fieldName: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExportCandidates = () => {
    const csvContent = [
      ["Name", "Job Title", "Company", "Location", "Work Email", "Personal Emails", "Phone", "LinkedIn URL"],
      ...filteredCandidates.map(candidate => [
        candidate.name,
        candidate.job_title || "",
        candidate.company || "",
        candidate.location || "",
        candidate.work_email || "",
        candidate.personal_emails?.join("; ") || "",
        candidate.mobile_phone || "",
        candidate.linkedin_url
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.name.replace(/\s+/g, "-")}-candidates.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Candidates exported successfully");
  };

  const filteredCandidates = candidates.filter(candidate => {
    const searchLower = searchTerm.toLowerCase();
    return (
      candidate.name.toLowerCase().includes(searchLower) ||
      candidate.job_title?.toLowerCase().includes(searchLower) ||
      candidate.company?.toLowerCase().includes(searchLower) ||
      candidate.location?.toLowerCase().includes(searchLower) ||
      candidate.work_email?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p className="text-gray-600">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/search-history")}
            className="mb-4 hover:bg-white/50 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${project.color}20` }}
            >
              <Users
                className="w-8 h-8"
                style={{ color: project.color }}
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#39FF14] to-[#9D4EDD] bg-clip-text text-transparent">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-gray-600 mt-2 text-lg">{project.description}</p>
              )}
              <div className="flex gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Created {format(new Date(project.created_at), "MMM d, yyyy")}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {project.candidates_count} candidates
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <URLScrapeButton
              context="general"
              buttonText="Add Research"
              projectId={project.id}
            />
            <Button
              onClick={handleExportCandidates}
              disabled={filteredCandidates.length === 0}
              className="bg-gradient-to-r from-[#39FF14] to-[#9D4EDD] hover:opacity-90 text-white font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search candidates by name, title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        {/* Candidates Grid */}
        <div className="grid gap-4">
          {filteredCandidates.length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
              <CardContent className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? "No candidates match your search" : "No candidates in this project yet"}
              </p>
              {!searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/sourcing")}
                >
                  Start Sourcing
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="bg-white/90 backdrop-blur-sm border-gray-200 hover:shadow-xl transition-all hover:scale-[1.01] hover:bg-white group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold">{candidate.name}</h3>
                      {candidate.profile_completeness && (
                        <Badge variant="outline">
                          {candidate.profile_completeness}% complete
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      {candidate.job_title && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          <span>{candidate.job_title}</span>
                        </div>
                      )}
                      {candidate.company && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building className="w-4 h-4" />
                          <span>{candidate.company}</span>
                        </div>
                      )}
                      {candidate.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{candidate.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Contact Information */}
                    {(candidate.work_email || candidate.personal_emails?.length || candidate.mobile_phone) && (
                      <div className="bg-gradient-to-r from-green-50 to-purple-50 p-4 rounded-lg mb-4 space-y-2 border border-green-200/50">
                        {candidate.work_email && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-green-600" />
                              <span>{candidate.work_email}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyField(candidate.work_email!, "Email")}
                              className="p-1"
                            >
                              {copiedField === "Email" ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        )}
                        {candidate.mobile_phone && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-green-600" />
                              <span>{candidate.mobile_phone}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyField(candidate.mobile_phone!, "Phone")}
                              className="p-1"
                            >
                              {copiedField === "Phone" ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Summary */}
                    {candidate.profile_summary && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {candidate.profile_summary}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a
                          href={candidate.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View LinkedIn
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveCandidate(candidate.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      </div>
    </div>
  );
};

export default ProjectDetail;