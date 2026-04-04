import { useParams, Link } from "wouter";
import { 
  useGetSurvey, 
  getGetSurveyQueryKey,
  useGetSurveySummary,
  getGetSurveySummaryQueryKey,
  useListSurveyResponses,
  getListSurveyResponsesQueryKey
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Users, BarChart } from "lucide-react";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SurveyResults() {
  const { id } = useParams<{ id: string }>();
  const surveyId = Number(id);
  
  const { data: survey, isLoading: isSurveyLoading } = useGetSurvey(surveyId, {
    query: { enabled: !!surveyId, queryKey: getGetSurveyQueryKey(surveyId) }
  });
  
  const { data: summary, isLoading: isSummaryLoading } = useGetSurveySummary(surveyId, {
    query: { enabled: !!surveyId, queryKey: getGetSurveySummaryQueryKey(surveyId) }
  });

  const { data: responses, isLoading: isResponsesLoading } = useListSurveyResponses(surveyId, {
    query: { enabled: !!surveyId, queryKey: getListSurveyResponsesQueryKey(surveyId) }
  });

  if (isSurveyLoading || isSummaryLoading || isResponsesLoading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (!survey || !summary) return null;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{survey.title} - Results</h1>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.totalResponses}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {summary.totalResponses > 0 ? "100%" : "0%"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Of started surveys</p>
            </CardContent>
          </Card>
        </div>

        {summary.totalResponses === 0 ? (
          <Card className="border-dashed p-12 text-center bg-muted/20">
            <BarChart className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Waiting for responses</h3>
            <p className="text-muted-foreground">Share your survey link to start collecting data.</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {summary.questions.map((q, i) => (
              <Card key={q.questionId} className="shadow-sm overflow-hidden border-t-2 border-t-primary/20">
                <CardHeader className="bg-muted/10 pb-4 border-b">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg leading-tight">
                      <span className="text-muted-foreground mr-2">{i + 1}.</span>
                      {q.questionText}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground shrink-0 whitespace-nowrap">
                      {q.totalAnswers} answers
                    </div>
                  </div>
                  <CardDescription className="uppercase tracking-wider text-xs font-semibold mt-1">
                    {q.questionType.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {q.questionType === 'text' ? (
                    <ScrollArea className="h-[250px] w-full rounded-md border p-4 bg-muted/5">
                      <div className="space-y-4">
                        {responses?.map((res) => {
                          const parsedAnswers = JSON.parse(res.answers);
                          const answer = parsedAnswers[q.questionId];
                          if (!answer) return null;
                          return (
                            <div key={res.id} className="text-sm bg-background p-3 rounded border shadow-sm">
                              {answer}
                              <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-dashed">
                                {res.respondentName || "Anonymous"} • {format(new Date(res.submittedAt), "MMM d, yyyy")}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={Object.entries(q.answerBreakdown).map(([name, value]) => ({ name, count: value }))}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" allowDecimals={false} />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={150}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(val) => {
                              try {
                                const parsed = JSON.parse(val);
                                return Array.isArray(parsed) ? parsed.join(', ') : val;
                              } catch {
                                return val.length > 20 ? val.substring(0, 20) + '...' : val;
                              }
                            }}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`${value} responses`, 'Count']}
                            labelFormatter={(label) => {
                              try {
                                const parsed = JSON.parse(label);
                                return Array.isArray(parsed) ? parsed.join(', ') : label;
                              } catch {
                                return label;
                              }
                            }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="hsl(var(--primary))" 
                            radius={[0, 4, 4, 0]} 
                            barSize={32}
                          />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}