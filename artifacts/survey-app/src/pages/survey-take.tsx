import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useGetSurvey, 
  getGetSurveyQueryKey,
  useListSurveyQuestions,
  getListSurveyQuestionsQueryKey,
  useSubmitSurveyResponse
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";

export default function SurveyTake() {
  const { id } = useParams<{ id: string }>();
  const surveyId = Number(id);
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { data: survey, isLoading: isSurveyLoading, error: surveyError } = useGetSurvey(surveyId, {
    query: { enabled: !!surveyId, queryKey: getGetSurveyQueryKey(surveyId), retry: false }
  });
  
  const { data: questions, isLoading: isQuestionsLoading } = useListSurveyQuestions(surveyId, {
    query: { enabled: !!surveyId, queryKey: getListSurveyQuestionsQueryKey(surveyId) }
  });

  const submitResponse = useSubmitSurveyResponse({
    mutation: {
      onSuccess: () => {
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onError: () => {
        toast({ title: "Failed to submit response", variant: "destructive" });
      }
    }
  });

  // Dynamic schema based on questions
  const formSchema = z.object({
    respondentName: z.string().optional(),
    answers: z.record(z.string(), z.any())
  }).superRefine((data, ctx) => {
    // Custom validation to check required fields since Zod schema is dynamic
    if (!questions) return;
    
    questions.forEach(q => {
      const val = data.answers[q.id.toString()];
      if (q.required) {
        if (!val || val === "" || (Array.isArray(val) && val.length === 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "This question is required",
            path: ["answers", q.id.toString()]
          });
        }
      }
    });
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      respondentName: "",
      answers: {}
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Format answers (multiple choice arrays become comma separated or JSON)
    const formattedAnswers: Record<string, string> = {};
    
    Object.entries(data.answers).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        formattedAnswers[key] = JSON.stringify(val);
      } else {
        formattedAnswers[key] = String(val);
      }
    });
    
    submitResponse.mutate({
      id: surveyId,
      data: {
        respondentName: data.respondentName || null,
        answers: formattedAnswers
      }
    });
  };

  if (surveyError) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-t-4 border-t-destructive">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Survey Not Found</CardTitle>
            <CardDescription>This survey doesn't exist or is not available.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isSurveyLoading || isQuestionsLoading) {
    return (
      <div className="min-h-screen bg-muted/20 py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (survey && !survey.isPublished) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Survey Closed</CardTitle>
            <CardDescription>This survey is currently not accepting responses.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-t-4 border-t-green-500 text-center py-8">
          <CardHeader>
            <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-500" />
            </div>
            <CardTitle className="text-2xl">Response Submitted!</CardTitle>
            <CardDescription className="text-base mt-2">
              Thank you for completing "{survey?.title}". Your response has been recorded.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const sortedQuestions = questions ? [...questions].sort((a, b) => a.orderIndex - b.orderIndex) : [];

  return (
    <div className="min-h-screen bg-muted/20 py-10 px-4 md:py-16">
      <div className="max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Header Card */}
            <Card className="shadow-md border-t-8 border-t-primary rounded-xl overflow-hidden">
              <CardHeader className="bg-card pb-8">
                <CardTitle className="text-3xl font-bold tracking-tight">{survey?.title}</CardTitle>
                {survey?.description && (
                  <CardDescription className="text-base mt-4 whitespace-pre-wrap text-foreground/80">
                    {survey.description}
                  </CardDescription>
                )}
              </CardHeader>
              <Separator />
              <CardContent className="bg-muted/10 pt-6">
                <FormField
                  control={form.control}
                  name="respondentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" className="bg-background max-w-md" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Question Cards */}
            {sortedQuestions.map((q, index) => {
              const options = q.options ? JSON.parse(q.options) : [];
              
              return (
                <Card key={q.id} className="shadow-sm rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 transition-all">
                  <CardContent className="p-6 sm:p-8">
                    <FormField
                      control={form.control}
                      name={`answers.${q.id}`}
                      render={({ field, fieldState }) => (
                        <FormItem className="space-y-4">
                          <div className="flex gap-2">
                            <FormLabel className="text-base font-semibold leading-relaxed">
                              {index + 1}. {q.text}
                              {q.required && <span className="text-destructive ml-1">*</span>}
                            </FormLabel>
                          </div>
                          
                          <FormControl>
                            <div className="pt-2">
                              {q.type === 'text' && (
                                <Textarea 
                                  placeholder="Your answer" 
                                  className="min-h-[100px] resize-y bg-background"
                                  {...field}
                                  value={field.value || ""}
                                />
                              )}

                              {q.type === 'single_choice' && (
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="flex flex-col space-y-3"
                                >
                                  {options.map((opt: string, i: number) => (
                                    <div key={i} className="flex items-center space-x-3">
                                      <RadioGroupItem value={opt} id={`q${q.id}-opt${i}`} className="w-5 h-5" />
                                      <Label htmlFor={`q${q.id}-opt${i}`} className="text-base font-normal cursor-pointer leading-snug">
                                        {opt}
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              )}

                              {q.type === 'multiple_choice' && (
                                <div className="flex flex-col space-y-3">
                                  {options.map((opt: string, i: number) => {
                                    const currentValues = Array.isArray(field.value) ? field.value : [];
                                    const isChecked = currentValues.includes(opt);
                                    
                                    return (
                                      <div key={i} className="flex items-center space-x-3">
                                        <Checkbox 
                                          id={`q${q.id}-opt${i}`} 
                                          className="w-5 h-5 rounded"
                                          checked={isChecked}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              field.onChange([...currentValues, opt]);
                                            } else {
                                              field.onChange(currentValues.filter((v: string) => v !== opt));
                                            }
                                          }}
                                        />
                                        <Label htmlFor={`q${q.id}-opt${i}`} className="text-base font-normal cursor-pointer leading-snug">
                                          {opt}
                                        </Label>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {q.type === 'rating' && (
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="flex flex-row flex-wrap gap-4 pt-2"
                                >
                                  {options.map((opt: string, i: number) => (
                                    <div key={i} className="flex flex-col items-center space-y-2">
                                      <RadioGroupItem 
                                        value={opt} 
                                        id={`q${q.id}-opt${i}`} 
                                        className="w-8 h-8 md:w-10 md:h-10 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary" 
                                      />
                                      <Label htmlFor={`q${q.id}-opt${i}`} className="text-sm font-medium cursor-pointer">
                                        {opt}
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              );
            })}

            <div className="flex justify-between items-center pt-4">
              <p className="text-sm text-muted-foreground">
                Never submit passwords through this form.
              </p>
              <Button 
                type="submit" 
                size="lg" 
                className="px-8 font-semibold shadow-md"
                disabled={submitResponse.isPending}
              >
                {submitResponse.isPending ? "Submitting..." : "Submit Response"}
              </Button>
            </div>
            
          </form>
        </Form>
      </div>
    </div>
  );
}