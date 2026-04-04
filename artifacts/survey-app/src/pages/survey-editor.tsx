import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GripVertical, Plus, Trash2, Save, ArrowLeft, CheckCircle2, Eye, LayoutList, TextCursorInput, ListChecks, List, Star } from "lucide-react";
import { 
  useGetSurvey, 
  getGetSurveyQueryKey,
  useUpdateSurvey,
  useListSurveyQuestions,
  getListSurveyQuestionsQueryKey,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  QuestionType,
  Question,
  UpdateQuestionBodyType
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

// Form schemas
const surveySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  reward: z.coerce.number().min(0).default(0),
  externalUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type SurveyFormValues = z.infer<typeof surveySchema>;

// Helper for UI type labels
const getTypeLabel = (type: string) => {
  switch (type) {
    case 'text': return 'Text Input';
    case 'single_choice': return 'Single Choice (Radio)';
    case 'multiple_choice': return 'Multiple Choice (Checkbox)';
    case 'rating': return 'Rating Scale';
    default: return type;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'text': return <TextCursorInput className="h-4 w-4 text-blue-500" />;
    case 'single_choice': return <List className="h-4 w-4 text-indigo-500" />;
    case 'multiple_choice': return <ListChecks className="h-4 w-4 text-violet-500" />;
    case 'rating': return <Star className="h-4 w-4 text-amber-500" />;
    default: return <LayoutList className="h-4 w-4" />;
  }
};

export default function SurveyEditor() {
  const { id } = useParams<{ id: string }>();
  const surveyId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Data fetching
  const { data: survey, isLoading: isSurveyLoading } = useGetSurvey(surveyId, {
    query: { enabled: !!surveyId, queryKey: getGetSurveyQueryKey(surveyId) }
  });
  
  const { data: questions, isLoading: isQuestionsLoading } = useListSurveyQuestions(surveyId, {
    query: { enabled: !!surveyId, queryKey: getListSurveyQuestionsQueryKey(surveyId) }
  });

  // Mutations
  const updateSurvey = useUpdateSurvey({
    mutation: {
      onSuccess: () => {
        toast({ title: "Survey settings saved" });
        queryClient.invalidateQueries({ queryKey: getGetSurveyQueryKey(surveyId) });
      },
      onError: () => toast({ title: "Failed to save survey", variant: "destructive" })
    }
  });

  const createQuestion = useCreateQuestion({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSurveyQuestionsQueryKey(surveyId) });
      }
    }
  });

  const updateQuestion = useUpdateQuestion({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSurveyQuestionsQueryKey(surveyId) });
      }
    }
  });

  const deleteQuestion = useDeleteQuestion({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSurveyQuestionsQueryKey(surveyId) });
      }
    }
  });

  // Form setup
  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      title: "",
      description: "",
      reward: 0,
      externalUrl: "",
    }
  });

  // Initialize form
  useEffect(() => {
    if (survey) {
      form.reset({
        title: survey.title,
        description: survey.description || "",
        reward: survey.reward || 0,
        externalUrl: survey.externalUrl || "",
      });
    }
  }, [survey, form]);

  const onSaveSurvey = (data: SurveyFormValues) => {
    const payload = {
      ...data,
      externalUrl: data.externalUrl === "" ? null : data.externalUrl,
    };
    updateSurvey.mutate({ id: surveyId, data: payload });
  };

  const handleAddQuestion = (type: string) => {
    const orderIndex = questions ? questions.length : 0;
    let defaultOptions = null;
    
    if (type === 'single_choice' || type === 'multiple_choice') {
      defaultOptions = JSON.stringify(['Option 1', 'Option 2']);
    } else if (type === 'rating') {
      defaultOptions = JSON.stringify(['1', '2', '3', '4', '5']);
    }
    
    createQuestion.mutate({
      data: {
        surveyId,
        text: "New Question",
        type: type as any,
        required: false,
        orderIndex,
        options: defaultOptions
      }
    });
  };

  const handleDeleteQuestion = (questionId: number) => {
    deleteQuestion.mutate({ id: questionId });
  };

  const handleUpdateQuestionField = (question: Question, field: string, value: any) => {
    updateQuestion.mutate({
      id: question.id,
      data: {
        [field]: value
      }
    });
  };

  const handleUpdateOptions = (question: Question, options: string[]) => {
    updateQuestion.mutate({
      id: question.id,
      data: {
        options: JSON.stringify(options)
      }
    });
  };

  const togglePublish = () => {
    if (!survey) return;
    updateSurvey.mutate({
      id: surveyId,
      data: { isPublished: !survey.isPublished }
    }, {
      onSuccess: () => {
        toast({ title: survey.isPublished ? "Survey unpublished" : "Survey published" });
        queryClient.invalidateQueries({ queryKey: getGetSurveyQueryKey(surveyId) });
      }
    });
  };

  if (isSurveyLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Build Survey</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2 mr-2">
              <Switch 
                id="published" 
                checked={survey?.isPublished || false} 
                onCheckedChange={togglePublish}
                disabled={updateSurvey.isPending}
              />
              <Label htmlFor="published" className="font-medium cursor-pointer">
                {survey?.isPublished ? (
                  <span className="text-green-600 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Published</span>
                ) : "Draft"}
              </Label>
            </div>
            {survey?.isPublished && (
              <Link href={`/surveys/${surveyId}`}>
                <Button variant="outline" size="sm" className="gap-1.5 h-9">
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </Link>
            )}
            <Button 
              size="sm" 
              className="h-9 gap-1.5" 
              onClick={form.handleSubmit(onSaveSurvey)}
              disabled={updateSurvey.isPending}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Survey Details Card */}
          <Card className="border-t-4 border-t-primary shadow-md">
            <CardHeader className="pb-4">
              <CardTitle>Survey Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-5" onSubmit={form.handleSubmit(onSaveSurvey)}>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Survey Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a clear, descriptive title" className="text-lg py-6" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide any instructions or context for your respondents" 
                            className="resize-y min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="reward"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reward Points</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" min="0" {...field} />
                          </FormControl>
                          <FormDescription>Points awarded upon completion.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="externalUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>External URL (Optional)</FormLabel>
                          <FormControl>
                            <Input type="url" placeholder="https://..." {...field} />
                          </FormControl>
                          <FormDescription>If provided, acts as a link to an external survey.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Questions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                Questions
                <span className="bg-muted text-muted-foreground text-xs py-0.5 px-2 rounded-full font-medium">
                  {questions?.length || 0}
                </span>
              </h2>
            </div>
            
            {isQuestionsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : questions && questions.length > 0 ? (
              <div className="space-y-6">
                {questions.sort((a, b) => a.orderIndex - b.orderIndex).map((question, index) => (
                  <QuestionEditor 
                    key={question.id} 
                    question={question} 
                    index={index}
                    onUpdateField={handleUpdateQuestionField}
                    onUpdateOptions={handleUpdateOptions}
                    onDelete={() => handleDeleteQuestion(question.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-12 border rounded-xl bg-card border-dashed">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LayoutList className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-1">No questions yet</h3>
                <p className="text-muted-foreground mb-4">Add your first question to start building your survey.</p>
              </div>
            )}
          </div>

          {/* Add Question Controls */}
          <Card className="border-dashed bg-muted/30">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div>
                  <h3 className="font-medium text-lg">Add a Question</h3>
                  <p className="text-sm text-muted-foreground">Choose a question type to add to your survey</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 w-full max-w-2xl">
                  <Button variant="outline" className="gap-2 shadow-sm" onClick={() => handleAddQuestion('text')}>
                    {getTypeIcon('text')} Text Input
                  </Button>
                  <Button variant="outline" className="gap-2 shadow-sm" onClick={() => handleAddQuestion('single_choice')}>
                    {getTypeIcon('single_choice')} Single Choice
                  </Button>
                  <Button variant="outline" className="gap-2 shadow-sm" onClick={() => handleAddQuestion('multiple_choice')}>
                    {getTypeIcon('multiple_choice')} Multiple Choice
                  </Button>
                  <Button variant="outline" className="gap-2 shadow-sm" onClick={() => handleAddQuestion('rating')}>
                    {getTypeIcon('rating')} Rating Scale
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

// Sub-component for individual question editing
function QuestionEditor({ 
  question, 
  index, 
  onUpdateField, 
  onUpdateOptions, 
  onDelete 
}: { 
  question: Question;
  index: number;
  onUpdateField: (q: Question, field: string, val: any) => void;
  onUpdateOptions: (q: Question, opts: string[]) => void;
  onDelete: () => void;
}) {
  // Parse options if available
  const parsedOptions = question.options ? JSON.parse(question.options) : [];
  
  // Local state for debounce
  const [text, setText] = useState(question.text);
  const textTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (textTimeoutRef.current) clearTimeout(textTimeoutRef.current);
    textTimeoutRef.current = setTimeout(() => {
      onUpdateField(question, 'text', e.target.value);
    }, 500);
  };

  const handleOptionChange = (optIndex: number, val: string) => {
    const newOptions = [...parsedOptions];
    newOptions[optIndex] = val;
    onUpdateOptions(question, newOptions);
  };

  const handleAddOption = () => {
    onUpdateOptions(question, [...parsedOptions, `Option ${parsedOptions.length + 1}`]);
  };

  const handleRemoveOption = (optIndex: number) => {
    const newOptions = [...parsedOptions];
    newOptions.splice(optIndex, 1);
    onUpdateOptions(question, newOptions);
  };

  return (
    <Card className="group relative shadow-sm border-l-4 border-l-transparent hover:border-l-primary/50 transition-colors focus-within:border-l-primary">
      <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-move text-muted-foreground p-1 transition-opacity">
        <GripVertical className="h-5 w-5" />
      </div>
      
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-2 font-medium text-sm text-muted-foreground">
          <span className="flex items-center justify-center bg-muted h-6 w-6 rounded-md text-xs">{index + 1}</span>
          <span className="flex items-center gap-1.5">{getTypeIcon(question.type)} {getTypeLabel(question.type)}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Input 
              value={text} 
              onChange={handleTextChange}
              placeholder="Question text" 
              className="text-base font-medium py-5 border-transparent bg-muted/30 hover:border-input focus:bg-background transition-colors"
            />
          </div>

          <div className="pl-2 pt-2 border-l-2 border-muted/50 ml-1">
            {question.type === 'text' && (
              <div className="p-3 bg-muted/20 border border-dashed rounded-md text-sm text-muted-foreground">
                Text input field will appear here
              </div>
            )}

            {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
              <div className="space-y-2">
                {parsedOptions.map((opt: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 group/opt">
                    <div className="h-4 w-4 rounded-full border flex-shrink-0" style={{ borderRadius: question.type === 'multiple_choice' ? '4px' : '50%' }} />
                    <Input 
                      value={opt} 
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      className="h-8 py-1 text-sm bg-transparent border-transparent hover:border-input focus:bg-background"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 opacity-0 group-hover/opt:opacity-100 text-muted-foreground hover:text-destructive" 
                      onClick={() => handleRemoveOption(i)}
                      disabled={parsedOptions.length <= 1}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 mt-2 text-primary" onClick={handleAddOption}>
                  <Plus className="h-3.5 w-3.5" /> Add option
                </Button>
              </div>
            )}

            {question.type === 'rating' && (
              <div className="flex items-center gap-4 bg-muted/20 p-3 rounded-md border border-dashed">
                <span className="text-sm text-muted-foreground font-medium">Scale length:</span>
                <Select 
                  value={parsedOptions.length.toString()} 
                  onValueChange={(v) => {
                    const count = parseInt(v, 10);
                    const newOpts = Array.from({length: count}, (_, i) => (i + 1).toString());
                    onUpdateOptions(question, newOpts);
                  }}
                >
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 5, 7, 10].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1 ml-auto text-amber-500">
                  {Array.from({length: Math.min(5, parsedOptions.length)}).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  {parsedOptions.length > 5 && <span className="text-xs font-medium text-muted-foreground">+{parsedOptions.length - 5}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 justify-end border-t border-t-muted/30 mt-4">
        <div className="flex items-center gap-2">
          <Label htmlFor={`req-${question.id}`} className="text-sm font-normal text-muted-foreground cursor-pointer">Required</Label>
          <Switch 
            id={`req-${question.id}`} 
            checked={question.required} 
            onCheckedChange={(val) => onUpdateField(question, 'required', val)} 
            className="scale-75 origin-right"
          />
        </div>
      </CardFooter>
    </Card>
  );
}