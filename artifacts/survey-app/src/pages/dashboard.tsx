import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Clock, Gift, ChevronRight, TrendingUp } from "lucide-react";
import {
  useListSurveys,
  useCompleteSurvey,
  getListSurveysQueryKey,
  useGetUserCompletions,
  getGetUserQueryKey,
  getGetUserCompletionsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { Layout } from "@/components/layout";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, updatePoints } = useAuth();
  const [claimingSurveyId, setClaimingSurveyId] = useState<number | null>(null);

  const { data: surveys, isLoading } = useListSurveys({
    query: { queryKey: getListSurveysQueryKey() },
  });

  const { data: completions } = useGetUserCompletions(user?.userId || 0, {
    query: {
      enabled: !!user,
      queryKey: getGetUserCompletionsQueryKey(user?.userId || 0),
    },
  });

  const completeSurveyMutation = useCompleteSurvey({
    mutation: {
      onSuccess: (data) => {
        updatePoints(user!.points + data.pointsEarned);
        queryClient.invalidateQueries({ queryKey: getGetUserCompletionsQueryKey(user!.userId) });
        queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(user!.userId) });
        toast({ title: `+${data.pointsEarned} KSh earned!`, description: "Reward added to your balance." });
        setClaimingSurveyId(null);
      },
      onError: () => {
        toast({ title: "Failed to claim reward", variant: "destructive" });
        setClaimingSurveyId(null);
      },
    },
  });

  const handleClaimReward = (surveyId: number) => {
    if (!user) { setLocation("/login"); return; }
    setClaimingSurveyId(surveyId);
    completeSurveyMutation.mutate({ id: surveyId, data: { userId: user.userId } });
  };

  const published = surveys?.filter((s) => s.isPublished) ?? [];

  return (
    <Layout>
      {/* ── Balance hero ── */}
      <div style={{ background: "#004d00" }} className="px-4 pb-5 pt-2">
        <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>Total Balance</p>
        <p className="text-4xl font-extrabold text-white mb-3">
          {(user?.points ?? 0).toLocaleString()} KSh
        </p>
        <div className="flex gap-2">
          <Link href="/wallet" className="flex-1">
            <button
              className="w-full py-2 rounded-xl text-sm font-bold"
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
            >
              Withdraw
            </button>
          </Link>
          <Link href="/surveys" className="flex-1">
            <button
              className="w-full py-2 rounded-xl text-sm font-bold"
              style={{ background: "#00b33c", color: "#fff" }}
            >
              Earn More
            </button>
          </Link>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* ── Welcome bonus ── */}
        {!user && (
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "#fff", border: "1.5px solid #b3ffb3" }}
          >
            <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "#e5f7e0" }}>
              <Gift className="h-5 w-5" style={{ color: "#00b33c" }} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: "#004d00" }}>Welcome Bonus</p>
              <p className="text-xs" style={{ color: "#666" }}>Sign up now and get a bonus on your first survey!</p>
            </div>
            <Link href="/signup">
              <button className="text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ background: "#00b33c" }}>
                Join
              </button>
            </Link>
          </div>
        )}

        {/* ── Today's Surveys ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-base" style={{ color: "#004d00" }}>Today's Surveys</p>
            <Link href="/surveys">
              <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color: "#00b33c" }}>
                View all <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl h-20 animate-pulse" style={{ background: "#d4f5d4" }} />
              ))}
            </div>
          ) : published.length === 0 ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: "#fff", border: "1.5px dashed #b3ffb3" }}>
              <TrendingUp className="h-8 w-8 mx-auto mb-2" style={{ color: "#00b33c" }} />
              <p className="font-semibold text-sm" style={{ color: "#004d00" }}>No surveys yet</p>
              <p className="text-xs mt-1" style={{ color: "#666" }}>Check back soon for new earning opportunities.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {published.map((survey) => {
                const isCompleted = completions?.includes(survey.id);
                return (
                  <div
                    key={survey.id}
                    className="rounded-2xl p-4 flex items-center gap-3"
                    style={{ background: "#fff", border: "1.5px solid #e0f5e0" }}
                  >
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold"
                      style={{ background: "#e5f7e0", color: "#004d00" }}
                    >
                      {survey.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-tight truncate" style={{ color: "#004d00" }}>
                        {survey.title}
                      </p>
                      {survey.description && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: "#666" }}>
                          {survey.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {!survey.externalUrl && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: "#888" }}>
                            <Clock className="h-3 w-3" />
                            {survey.questionCount} questions
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {survey.reward > 0 && (
                        <span
                          className="text-xs font-extrabold px-2 py-0.5 rounded-full"
                          style={{ background: "#ff6b35", color: "#fff" }}
                        >
                          +{survey.reward} KSh
                        </span>
                      )}
                      {isCompleted ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "#e5f7e0", color: "#00b33c" }}>
                          Claimed
                        </span>
                      ) : survey.externalUrl ? (
                        <div className="flex gap-1">
                          <button
                            className="text-xs font-bold px-2 py-1 rounded-lg"
                            style={{ background: "#e5f7e0", color: "#004d00" }}
                            onClick={() => window.open(survey.externalUrl!, "_blank")}
                          >
                            <ExternalLink className="h-3 w-3 inline mr-0.5" />
                            Open
                          </button>
                          {survey.reward > 0 && user && (
                            <button
                              className="text-xs font-bold px-2 py-1 rounded-lg text-white"
                              style={{ background: "#00b33c" }}
                              disabled={claimingSurveyId === survey.id}
                              onClick={() => handleClaimReward(survey.id)}
                            >
                              {claimingSurveyId === survey.id ? "…" : "Claim"}
                            </button>
                          )}
                        </div>
                      ) : (
                        <Link href={`/surveys/${survey.id}`}>
                          <button
                            className="text-xs font-bold px-3 py-1 rounded-lg text-white"
                            style={{ background: "#00b33c" }}
                          >
                            Start
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
