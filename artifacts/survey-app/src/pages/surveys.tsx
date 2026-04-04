import { useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Settings, BarChart2, Trash2, CheckCircle2, Plus, Clock } from "lucide-react";
import {
  useListSurveys,
  useCreateSurvey,
  useDeleteSurvey,
  useUpdateSurvey,
  useCompleteSurvey,
  useGetUserCompletions,
  getListSurveysQueryKey,
  getGetUserQueryKey,
  getGetUserCompletionsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { Layout } from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Surveys() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, updatePoints } = useAuth();
  const [creating, setCreating] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  const { data: surveys, isLoading } = useListSurveys({
    query: { queryKey: getListSurveysQueryKey() },
  });

  const { data: completions } = useGetUserCompletions(user?.userId || 0, {
    query: { enabled: !!user, queryKey: getGetUserCompletionsQueryKey(user?.userId || 0) },
  });

  const createSurvey = useCreateSurvey({
    mutation: {
      onSuccess: (s) => {
        queryClient.invalidateQueries({ queryKey: getListSurveysQueryKey() });
        setLocation(`/surveys/${s.id}/edit`);
      },
      onError: () => { toast({ title: "Failed to create survey", variant: "destructive" }); setCreating(false); },
    },
  });

  const updateSurvey = useUpdateSurvey({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListSurveysQueryKey() }),
      onError: () => toast({ title: "Failed to update", variant: "destructive" }),
    },
  });

  const deleteSurvey = useDeleteSurvey({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListSurveysQueryKey() }),
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    },
  });

  const completeMutation = useCompleteSurvey({
    mutation: {
      onSuccess: (data) => {
        updatePoints(user!.points + data.pointsEarned);
        queryClient.invalidateQueries({ queryKey: getGetUserCompletionsQueryKey(user!.userId) });
        queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(user!.userId) });
        toast({ title: `+${data.pointsEarned} KSh earned!` });
        setClaimingId(null);
      },
      onError: () => { toast({ title: "Failed to claim", variant: "destructive" }); setClaimingId(null); },
    },
  });

  const handleCreate = () => {
    setCreating(true);
    createSurvey.mutate({ data: { title: "Untitled Survey", description: "", reward: 0, externalUrl: "" } });
  };

  return (
    <Layout>
      <div className="px-4 pt-4 pb-2 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xl font-extrabold" style={{ color: "#004d00" }}>Browse All Topics</p>
          {user && (
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl text-white"
              style={{ background: "#00b33c" }}
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "#d4f5d4" }} />
            ))}
          </div>
        ) : !surveys?.length ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: "#fff", border: "1.5px dashed #b3ffb3" }}>
            <p className="font-semibold text-sm" style={{ color: "#004d00" }}>No surveys available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {surveys.map((survey, idx) => {
              const isCompleted = completions?.includes(survey.id);
              return (
                <div
                  key={survey.id}
                  className="rounded-2xl px-4 py-3 flex items-center gap-3"
                  style={{ background: "#fff", border: "1.5px solid #e0f5e0" }}
                >
                  <span
                    className="text-sm font-bold w-6 text-center shrink-0"
                    style={{ color: "#00b33c" }}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "#004d00" }}>
                      {survey.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: survey.isPublished ? "#e5f7e0" : "#f5f5f5", color: survey.isPublished ? "#00b33c" : "#999" }}
                      >
                        {survey.isPublished ? "Live" : "Draft"}
                      </span>
                      {!survey.externalUrl && (
                        <span className="text-xs flex items-center gap-0.5" style={{ color: "#888" }}>
                          <Clock className="h-3 w-3" />{survey.questionCount}q
                        </span>
                      )}
                    </div>
                  </div>

                  {survey.reward > 0 && (
                    <span
                      className="text-xs font-extrabold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: "#ff6b35", color: "#fff" }}
                    >
                      {survey.reward} KSh
                    </span>
                  )}

                  {/* Actions row */}
                  <div className="flex items-center gap-1 shrink-0">
                    {survey.isPublished && !isCompleted && (
                      survey.externalUrl ? (
                        <>
                          <button
                            className="p-1.5 rounded-lg"
                            style={{ background: "#e5f7e0" }}
                            onClick={() => window.open(survey.externalUrl!, "_blank")}
                          >
                            <ExternalLink className="h-3.5 w-3.5" style={{ color: "#004d00" }} />
                          </button>
                          {survey.reward > 0 && user && (
                            <button
                              className="text-xs font-bold px-2 py-1 rounded-lg text-white"
                              style={{ background: "#00b33c" }}
                              disabled={claimingId === survey.id}
                              onClick={() => { setClaimingId(survey.id); completeMutation.mutate({ id: survey.id, data: { userId: user.userId } }); }}
                            >
                              {claimingId === survey.id ? "…" : "Claim"}
                            </button>
                          )}
                        </>
                      ) : (
                        <Link href={`/surveys/${survey.id}`}>
                          <button className="text-xs font-bold px-2 py-1 rounded-lg text-white" style={{ background: "#00b33c" }}>
                            Start
                          </button>
                        </Link>
                      )
                    )}

                    {isCompleted && (
                      <CheckCircle2 className="h-4 w-4" style={{ color: "#00b33c" }} />
                    )}

                    {user && (
                      <>
                        <Link href={`/surveys/${survey.id}/edit`}>
                          <button className="p-1.5 rounded-lg" style={{ background: "#e5f7e0" }}>
                            <Settings className="h-3.5 w-3.5" style={{ color: "#004d00" }} />
                          </button>
                        </Link>
                        {!survey.isPublished && (
                          <button
                            className="p-1.5 rounded-lg"
                            style={{ background: "#e5f7e0" }}
                            onClick={() => updateSurvey.mutate({ id: survey.id, data: { isPublished: true } })}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#00b33c" }} />
                          </button>
                        )}
                        <button
                          className="p-1.5 rounded-lg"
                          style={{ background: "#fff0f0" }}
                          onClick={() => { if (confirm(`Delete "${survey.title}"?`)) deleteSurvey.mutate({ id: survey.id }); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" style={{ color: "#dc2626" }} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
