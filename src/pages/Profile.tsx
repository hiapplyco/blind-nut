import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  User, 
  Mail, 
  Calendar, 
  Search, 
  Folder, 
  Users,
  Star,
  Activity,
  Settings,
  LogOut,
  Edit3,
  Camera
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, startOfWeek, startOfMonth, formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  totalSearches: number;
  totalCandidatesSaved: number;
  totalProjects: number;
  favoriteSearches: number;
  recentActivity: Array<{
    id: string;
    type: 'search' | 'save' | 'project';
    description: string;
    timestamp: string;
  }>;
  searchesThisWeek: number;
  searchesThisMonth: number;
  topPlatforms: Array<{ platform: string; count: number }>;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState({
    full_name: "",
    avatar_url: ""
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
      fetchUserStats();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfileData(data);
        setEditingProfile({
          full_name: data.full_name || "",
          avatar_url: data.avatar_url || ""
        });
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user?.id,
          email: user?.email || "",
          full_name: user?.user_metadata?.full_name || null,
          avatar_url: user?.user_metadata?.avatar_url || null
        };

        const { data: createdProfile, error: createError } = await supabase
          .from("profiles")
          .insert(newProfile)
          .select()
          .single();

        if (createError) throw createError;
        setProfileData(createdProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    }
  };

  const fetchUserStats = async () => {
    try {
      setLoading(true);

      // Fetch total searches
      const { count: searchCount } = await supabase
        .from("search_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);

      // Fetch searches this week
      const weekStart = startOfWeek(new Date());
      const { count: weekSearchCount } = await supabase
        .from("search_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)
        .gte("created_at", weekStart.toISOString());

      // Fetch searches this month
      const monthStart = startOfMonth(new Date());
      const { count: monthSearchCount } = await supabase
        .from("search_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)
        .gte("created_at", monthStart.toISOString());

      // Fetch favorite searches
      const { count: favoriteCount } = await supabase
        .from("search_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)
        .eq("is_favorite", true);

      // Fetch total candidates saved
      const { count: candidateCount } = await supabase
        .from("saved_candidates")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);

      // Fetch total projects
      const { count: projectCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)
        .eq("is_archived", false);

      // Fetch platform distribution
      const { data: platformData } = await supabase
        .from("search_history")
        .select("platform")
        .eq("user_id", user?.id);

      const platformCounts = platformData?.reduce((acc: Record<string, number>, item) => {
        const platform = item.platform || "linkedin";
        acc[platform] = (acc[platform] || 0) + 1;
        return acc;
      }, {});

      const topPlatforms = Object.entries(platformCounts || {})
        .map(([platform, count]) => ({ platform, count: count as number }))
        .sort((a, b) => b.count - a.count);

      // Fetch recent activity
      const recentActivity: UserStats['recentActivity'] = [];

      // Recent searches
      const { data: recentSearches } = await supabase
        .from("search_history")
        .select("id, search_query, created_at")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      recentSearches?.forEach(search => {
        recentActivity.push({
          id: search.id,
          type: 'search',
          description: `Searched for "${search.search_query}"`,
          timestamp: search.created_at
        });
      });

      // Recent saved candidates
      const { data: recentCandidates } = await supabase
        .from("saved_candidates")
        .select("id, name, created_at")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      recentCandidates?.forEach(candidate => {
        recentActivity.push({
          id: candidate.id,
          type: 'save',
          description: `Saved candidate ${candidate.name}`,
          timestamp: candidate.created_at
        });
      });

      // Sort activity by timestamp
      recentActivity.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setUserStats({
        totalSearches: searchCount || 0,
        totalCandidatesSaved: candidateCount || 0,
        totalProjects: projectCount || 0,
        favoriteSearches: favoriteCount || 0,
        searchesThisWeek: weekSearchCount || 0,
        searchesThisMonth: monthSearchCount || 0,
        topPlatforms,
        recentActivity: recentActivity.slice(0, 10)
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editingProfile.full_name,
          avatar_url: editingProfile.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      setShowEditProfile(false);
      fetchProfileData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || 'U';
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profileData?.avatar_url || undefined} />
              <AvatarFallback className="text-2xl bg-purple-100 text-purple-700">
                {getInitials(profileData?.full_name, profileData?.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profileData?.full_name || "Your Profile"}
              </h1>
              <p className="text-gray-600">{profileData?.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {profileData?.created_at ? format(new Date(profileData.created_at), "MMMM yyyy") : "Unknown"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditProfile(true)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold">{userStats?.totalSearches || 0}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {userStats?.searchesThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Saved Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold">{userStats?.totalCandidatesSaved || 0}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold">{userStats?.totalProjects || 0}</span>
            </div>
            <Button
              variant="link"
              size="sm"
              className="text-xs p-0 h-auto mt-1"
              onClick={() => navigate("/search-history?tab=projects")}
            >
              View all
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Favorite Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold">{userStats?.favoriteSearches || 0}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Quick access
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest searches and saved candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userStats?.recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                ) : (
                  userStats?.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'search' ? 'bg-purple-100' :
                        activity.type === 'save' ? 'bg-green-100' :
                        'bg-blue-100'
                      }`}>
                        {activity.type === 'search' && <Search className="w-4 h-4 text-purple-600" />}
                        {activity.type === 'save' && <Users className="w-4 h-4 text-green-600" />}
                        {activity.type === 'project' && <Folder className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Activity</CardTitle>
                <CardDescription>Your search patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">This Week</span>
                      <span className="text-sm text-gray-600">
                        {userStats?.searchesThisWeek || 0} searches
                      </span>
                    </div>
                    <Progress 
                      value={(userStats?.searchesThisWeek || 0) / Math.max(userStats?.searchesThisMonth || 1, 1) * 100} 
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">This Month</span>
                      <span className="text-sm text-gray-600">
                        {userStats?.searchesThisMonth || 0} searches
                      </span>
                    </div>
                    <Progress 
                      value={100} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Usage</CardTitle>
                <CardDescription>Where you search for candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats?.topPlatforms.map((platform) => (
                    <div key={platform.platform} className="flex items-center justify-between">
                      <Badge variant="outline" className="capitalize">
                        {platform.platform}
                      </Badge>
                      <span className="text-sm font-medium">{platform.count} searches</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={editingProfile.full_name}
                onChange={(e) => setEditingProfile({ ...editingProfile, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                value={editingProfile.avatar_url}
                onChange={(e) => setEditingProfile({ ...editingProfile, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProfile(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;