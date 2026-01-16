import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import FooterSection from '@/components/FooterSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Shield,
  AlertTriangle,
  Clock,
  Target,
  Activity,
  PieChart,
  Users
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

const Analytics: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Fetch real user analytics data
  const { data: userAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['user-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get user's analytics events
      const { data: events } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      // Get user's sessions
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(50);

      // Get analysis history
      const { data: analysisHistory } = await supabase
        .from('analysis_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      return {
        events: events || [],
        sessions: sessions || [],
        analysisHistory: analysisHistory || []
      };
    },
    enabled: isAuthenticated && !!user?.id,
  });

  // Process data for charts
  const processActivityData = () => {
    if (!userAnalytics?.events) return [];
    
    const dailyActivity: Record<string, number> = {};
    userAnalytics.events.forEach((event) => {
      const date = new Date(event.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    return Object.entries(dailyActivity)
      .slice(-7)
      .map(([date, count]) => ({ date, activities: count }));
  };

  const processEventTypeData = () => {
    if (!userAnalytics?.events) return [];
    
    const eventCounts: Record<string, number> = {};
    userAnalytics.events.forEach((event) => {
      const name = event.event_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      eventCounts[name] = (eventCounts[name] || 0) + 1;
    });

    return Object.entries(eventCounts)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  };

  const processRiskLevelData = () => {
    if (!userAnalytics?.analysisHistory) return [];
    
    const riskCounts: Record<string, number> = { Low: 0, Medium: 0, High: 0 };
    userAnalytics.analysisHistory.forEach((analysis) => {
      const level = analysis.risk_level || 'Medium';
      riskCounts[level] = (riskCounts[level] || 0) + 1;
    });

    return Object.entries(riskCounts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  };

  const processDeviceData = () => {
    if (!userAnalytics?.sessions) return [];
    
    const deviceCounts: Record<string, number> = {};
    userAnalytics.sessions.forEach((session) => {
      const device = session.device_type || 'Unknown';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });

    return Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#10b981', '#f59e0b'];

  const activityData = processActivityData();
  const eventTypeData = processEventTypeData();
  const riskLevelData = processRiskLevelData();
  const deviceData = processDeviceData();

  const totalEvents = userAnalytics?.events?.length || 0;
  const totalSessions = userAnalytics?.sessions?.length || 0;
  const totalAnalyses = userAnalytics?.analysisHistory?.length || 0;
  const avgSessionTime = userAnalytics?.sessions?.length 
    ? Math.round(userAnalytics.sessions.filter(s => s.ended_at).reduce((acc, s) => {
        const start = new Date(s.started_at || '').getTime();
        const end = new Date(s.ended_at || '').getTime();
        return acc + (end - start);
      }, 0) / userAnalytics.sessions.filter(s => s.ended_at).length / 60000) || 0
    : 0;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="text-3xl font-bold mb-4">Sign In to View Your Analytics</h1>
            <p className="text-muted-foreground mb-8">
              Track your insurance analysis history, coverage improvements, and risk trends over time.
            </p>
            <Badge variant="outline" className="text-sm">
              Your data is private and secure
            </Badge>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <Badge variant="outline" className="mb-4">
            <BarChart3 className="h-3 w-3 mr-1" />
            Your Insurance Analytics
          </Badge>
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your policy analysis activity, risk trends, and coverage improvements over time.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Total Activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">Actions tracked</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                {avgSessionTime > 0 ? `Avg ${avgSessionTime} min each` : 'No completed sessions'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Policies Analyzed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalAnalyses}</div>
              <p className="text-xs text-muted-foreground">Documents processed</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Coverage Health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {totalAnalyses > 0 ? 'Active' : 'Start'}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalAnalyses > 0 ? 'Tracking enabled' : 'Upload a policy'}
              </p>
            </CardContent>
          </Card>
        </div>

        {analyticsLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-muted-foreground">Loading your analytics...</div>
          </div>
        ) : totalEvents === 0 && totalAnalyses === 0 ? (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <TrendingUp className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">No Activity Yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start using the platform to see your analytics. Upload a policy, run an analysis, 
                or explore the intelligence features to begin tracking your insurance journey.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 h-auto p-2">
              <TabsTrigger value="activity" className="flex items-center gap-2 py-3">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2 py-3">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Analyses</span>
              </TabsTrigger>
              <TabsTrigger value="devices" className="flex items-center gap-2 py-3">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Devices</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2 py-3">
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Activity Over Time
                    </CardTitle>
                    <CardDescription>Your platform usage in the last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activityData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={activityData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="activities" 
                            stroke="hsl(var(--primary))" 
                            fill="hsl(var(--primary))" 
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        No activity data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Top Actions
                    </CardTitle>
                    <CardDescription>Most frequent activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {eventTypeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={eventTypeData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={100} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        No action data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analysis">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Risk Level Distribution
                    </CardTitle>
                    <CardDescription>Breakdown of analyzed policies by risk</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {riskLevelData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <RechartsPieChart>
                          <Pie
                            data={riskLevelData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {riskLevelData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        Analyze policies to see risk distribution
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Recent Analyses
                    </CardTitle>
                    <CardDescription>Your latest policy analyses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userAnalytics?.analysisHistory && userAnalytics.analysisHistory.length > 0 ? (
                      <div className="space-y-3">
                        {userAnalytics.analysisHistory.slice(0, 5).map((analysis, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div>
                              <p className="font-medium text-sm">
                                {analysis.summary?.slice(0, 50) || 'Policy Analysis'}...
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(analysis.created_at || '').toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={
                              analysis.risk_level === 'High' ? 'destructive' :
                              analysis.risk_level === 'Medium' ? 'secondary' : 'default'
                            }>
                              {analysis.risk_level || 'Unknown'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        No analyses yet. Upload a policy to get started.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="devices">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Device Usage
                  </CardTitle>
                  <CardDescription>How you access the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  {deviceData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <ResponsiveContainer width="100%" height={250}>
                        <RechartsPieChart>
                          <Pie
                            data={deviceData}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {deviceData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="space-y-4">
                        {deviceData.map((device, index) => (
                          <div key={index}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium capitalize">{device.name}</span>
                              <span className="text-sm text-muted-foreground">{device.value} sessions</span>
                            </div>
                            <Progress 
                              value={(device.value / totalSessions) * 100} 
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      No device data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Engagement Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-primary">
                      {Math.min(100, Math.round((totalEvents + totalAnalyses * 10) / 2))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Based on your activity and analyses
                    </p>
                    <Progress 
                      value={Math.min(100, Math.round((totalEvents + totalAnalyses * 10) / 2))} 
                      className="mt-4"
                    />
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Most Active Browser</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-primary capitalize">
                      {userAnalytics?.sessions?.[0]?.browser || 'N/A'}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your preferred browser for analysis
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Last Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {userAnalytics?.events?.[0]?.created_at 
                        ? new Date(userAnalytics.events[0].created_at).toLocaleDateString()
                        : 'N/A'}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {userAnalytics?.events?.[0]?.event_name?.replace(/_/g, ' ') || 'No recent activity'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <FooterSection />
    </div>
  );
};

export default Analytics;