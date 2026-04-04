import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, BarChart2, Edit3, Trash2, ExternalLink, Settings, CheckCircle2, Coins } from "lucide-react";
import { 
  useListSurveys, 
  useCreateSurvey, 
  useDeleteSurvey, 
  useUpdateSurvey,
  getListSurveysQueryKey,
  useGetUserCompletions,
  useCompleteSurvey,
  getGetUserQueryKey,
  getGetUserCompletionsQueryKey
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, updatePoints } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [claimingSurveyId, setClaimingSurveyId] = useState<number | null>(null);
  
  const { data: surveys, isLoading } = useListSurveys({ 
    query: { queryKey: getListSurveysQueryKey() } 
  });
  
  const { data: completions } = useGetUserCompletions(user?.userId || 0, {
    query: { enabled: !!user, queryKey: getGetUserCompletionsQueryKey(user?.userId || 0) }
  });

  const completeSurveyMutation = useCompleteSurvey({
    mutation: {
      onSuccess: (data, variables) => {
        updatePoints(user!.points + data.pointsEarned);
        queryClient.invalidateQueries({ queryKey: getGetUserCompletionsQueryKey(user!.userId) });
        queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(user!.userId) });
        toast({ title: "Reward Claimed!", description: `You earned ${data.pointsEarned} points.` });
        setClaimingSurveyId(null);
      },
      onError: (error) => {
        toast({ title: "Failed to claim reward", variant: "destructive" });
        setClaimingSurveyId(null);
      }
    }
  });

  const createSurvey = useCreateSurvey({
    mutation: {
      onSuccess: (newSurvey) => {
        queryClient.invalidateQueries({ queryKey: getListSurveysQueryKey() });
        setLocation(`/surveys/${newSurvey.id}/edit`);
        toast({ title: "Survey created" });
      },
      onError: () => {
        toast({ title: "Failed to create survey", variant: "destructive" });
        setIsCreating(false);
      }
    }
  });

  const updateSurvey = useUpdateSurvey({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSurveysQueryKey() });
        toast({ title: "Survey updated" });
      },
      onError: () => {
        toast({ title: "Failed to update survey", variant: "destructive" });
      }
    }
  });

  const deleteSurvey = useDeleteSurvey({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSurveysQueryKey() });
        toast({ title: "Survey deleted" });
      },
      onError: () => {
        toast({ title: "Failed to delete survey", variant: "destructive" });
      }
    }
  });

  const handleCreate = () => {
    setIsCreating(true);
    createSurvey.mutate({ data: { title: "Untitled Survey", description: "", reward: 0, externalUrl: "" } });
  };

  const togglePublish = (id: number, currentStatus: boolean) => {
    updateSurvey.mutate({ id, data: { isPublished: !currentStatus } });
  };

  const handleClaimReward = (surveyId: number) => {
    if (!user) return;
    setClaimingSurveyId(surveyId);
    completeSurveyMutation.mutate({ id: surveyId, data: { userId: user.userId } });
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Available Surveys</h1>
          <p className="text-muted-foreground mt-1">Complete surveys and earn points redeemable via M-Pesa.</p>
        </div>
        
        {user ? (
          <Button onClick={handleCreate} disabled={isCreating} className="w-full md:w-auto shadow-sm">
            {isCreating ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
                Creating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Survey
              </span>
            )}
          </Button>
        ) : (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Link href="/login" className="flex-1">
              <Button variant="outline" className="w-full">Login</Button>
            </Link>
            <Link href="/signup" className="flex-1">
              <Button className="w-full">Sign Up to Earn</Button>
            </Link>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex-1">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : !surveys?.length ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card/50 shadow-sm border-dashed">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <BarChart2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No surveys yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">Create your first survey to start collecting responses from your audience.</p>
          {user && (
            <Button onClick={handleCreate} disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first survey
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey) => {
            const isCompleted = completions?.includes(survey.id);
            
            return (
            <Card key={survey.id} className="flex flex-col hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3 relative">
                {survey.reward > 0 && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    <Coins className="h-3 w-3" />
                    +{survey.reward} pts
                  </div>
                )}
                <div className="flex justify-between items-start gap-4 mr-16">
                  <CardTitle className="line-clamp-2 text-lg leading-tight">{survey.title || "Untitled"}</CardTitle>
                </div>
                <CardDescription className="text-xs flex items-center gap-2 mt-1">
                  <span>{format(new Date(survey.createdAt), "MMM d, yyyy")}</span>
                  {!survey.externalUrl && (
                    <>
                      <span>•</span>
                      <span>{survey.questionCount} questions</span>
                    </>
                  )}
                  <Badge variant={survey.isPublished ? "default" : "secondary"} className="shrink-0 font-medium ml-auto">
                    {survey.isPublished ? "Published" : "Draft"}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 text-sm text-muted-foreground pb-4">
                {survey.description ? (
                  <p className="line-clamp-2">{survey.description}</p>
                ) : (
                  <p className="italic opacity-70">No description</p>
                )}
              </CardContent>
              
              <div className="px-6 py-3 border-t bg-muted/20 flex items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  <span>{survey.responseCount} responses</span>
                </div>
                {survey.externalUrl && (
                  <Badge variant="outline" className="ml-auto text-xs bg-background">External</Badge>
                )}
              </div>
              
              <CardFooter className="pt-4 pb-4 gap-2 flex-wrap">
                {/* User actions */}
                {survey.isPublished && (
                  <div className="w-full flex gap-2 mb-2">
                    {survey.externalUrl ? (
                      <>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1 gap-1.5"
                          onClick={() => window.open(survey.externalUrl!, "_blank")}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Start Survey
                        </Button>
                        {user && survey.reward > 0 && (
                          <Button 
                            variant={isCompleted ? "secondary" : "default"} 
                            size="sm" 
                            className={`flex-1 gap-1.5 ${!isCompleted ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}`}
                            disabled={isCompleted || claimingSurveyId === survey.id}
                            onClick={() => handleClaimReward(survey.id)}
                          >
                            {claimingSurveyId === survey.id ? "Claiming..." : isCompleted ? "Claimed" : "Claim Reward"}
                          </Button>
                        )}
                      </>
                    ) : (
                      <Link href={`/surveys/${survey.id}`} className="w-full">
                        <Button variant="default" size="sm" className="w-full gap-1.5" disabled={isCompleted}>
                          {isCompleted ? "Completed" : "Take Survey"}
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
                
                {/* Admin actions */}
                <div className="flex-1 flex gap-2 min-w-full sm:min-w-0">
                  <Link href={`/surveys/${survey.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1.5 h-9">
                      <Settings className="h-3.5 w-3.5" />
                      Build
                    </Button>
                  </Link>
                  <Link href={`/surveys/${survey.id}/results`} className="flex-1">
                    <Button variant={survey.responseCount > 0 ? "secondary" : "outline"} size="sm" className="w-full gap-1.5 h-9">
                      <BarChart2 className="h-3.5 w-3.5" />
                      Results
                    </Button>
                  </Link>
                </div>
                <div className="flex gap-2">
                  {!survey.isPublished && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="px-3 h-9 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 dark:border-green-900/30" 
                      title="Publish survey"
                      onClick={() => togglePublish(survey.id, survey.isPublished)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="px-3 h-9 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete survey?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{survey.title}" and all of its responses. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteSurvey.mutate({ id: survey.id })}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          )})}
        </div>
      )}
    </Layout>
  );
}