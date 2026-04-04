import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, BarChart2, Edit3, Trash2, ExternalLink, Settings, CheckCircle2 } from "lucide-react";
import { 
  useListSurveys, 
  useCreateSurvey, 
  useDeleteSurvey, 
  useUpdateSurvey,
  getListSurveysQueryKey 
} from "@workspace/api-client-react";
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
  const [isCreating, setIsCreating] = useState(false);
  
  const { data: surveys, isLoading } = useListSurveys({ 
    query: { queryKey: getListSurveysQueryKey() } 
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
    createSurvey.mutate({ data: { title: "Untitled Survey", description: "" } });
  };

  const togglePublish = (id: number, currentStatus: boolean) => {
    updateSurvey.mutate({ id, data: { isPublished: !currentStatus } });
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Surveys</h1>
          <p className="text-muted-foreground mt-1">Manage your forms and view responses.</p>
        </div>
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
          <Button onClick={handleCreate} disabled={isCreating}>
            <Plus className="h-4 w-4 mr-2" />
            Create your first survey
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey) => (
            <Card key={survey.id} className="flex flex-col hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="line-clamp-2 text-lg leading-tight">{survey.title || "Untitled"}</CardTitle>
                  <Badge variant={survey.isPublished ? "default" : "secondary"} className="shrink-0 font-medium">
                    {survey.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <CardDescription className="text-xs flex items-center gap-2 mt-1">
                  <span>{format(new Date(survey.createdAt), "MMM d, yyyy")}</span>
                  <span>•</span>
                  <span>{survey.questionCount} questions</span>
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
              </div>
              
              <CardFooter className="pt-4 pb-4 gap-2 flex-wrap">
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
                  {survey.isPublished ? (
                    <Link href={`/surveys/${survey.id}`}>
                      <Button variant="outline" size="sm" className="px-3 h-9" title="View public form">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  ) : (
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
          ))}
        </div>
      )}
    </Layout>
  );
}