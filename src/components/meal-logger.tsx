'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserData } from '@/hooks/use-user-data';
import { analyzeMealPhoto } from '@/ai/flows/analyze-meal-photo';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Camera, PlusCircle, Sparkles, Utensils } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

const mealSchema = z.object({
  name: z.string().min(1, 'Meal name is required'),
  calories: z.number().min(0, 'Calories must be positive'),
  protein: z.number().min(0, 'Protein must be positive'),
  carbohydrates: z.number().min(0, 'Carbs must be positive'),
  fat: z.number().min(0, 'Fat must be positive'),
});

type MealFormValues = z.infer<typeof mealSchema>;

export default function MealLogger() {
  const [isManualOpen, setManualOpen] = useState(false);
  const [isAiOpen, setAiOpen] = useState(false);
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Log Your Meal</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4">
        <Dialog open={isManualOpen} onOpenChange={setManualOpen}>
          <DialogTrigger asChild>
            <Button variant="outline"><Utensils className="mr-2 h-4 w-4" /> Log Manually</Button>
          </DialogTrigger>
          <ManualLogDialog setOpen={setManualOpen} />
        </Dialog>
        <Dialog open={isAiOpen} onOpenChange={setAiOpen}>
          <DialogTrigger asChild>
            <Button><Sparkles className="mr-2 h-4 w-4" /> Analyze with AI</Button>
          </DialogTrigger>
          <AiLogDialog setOpen={setAiOpen} />
        </Dialog>
      </CardContent>
    </Card>
  );
}


function ManualLogDialog({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { logMeal } = useUserData();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<MealFormValues>({
    resolver: zodResolver(mealSchema),
  });

  const onSubmit = (data: MealFormValues) => {
    logMeal(data);
    toast({ title: "Meal logged!", description: `${data.name} has been added to your daily log.` });
    reset();
    setOpen(false);
  };
  
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Log a Meal Manually</DialogTitle>
        <DialogDescription>Enter the nutritional details of your meal.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Meal Name</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="calories">Calories</Label>
            <Input id="calories" type="number" {...register('calories', { valueAsNumber: true })} />
            {errors.calories && <p className="text-sm text-destructive">{errors.calories.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="protein">Protein (g)</Label>
            <Input id="protein" type="number" {...register('protein', { valueAsNumber: true })} />
            {errors.protein && <p className="text-sm text-destructive">{errors.protein.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="carbohydrates">Carbs (g)</Label>
            <Input id="carbohydrates" type="number" {...register('carbohydrates', { valueAsNumber: true })} />
            {errors.carbohydrates && <p className="text-sm text-destructive">{errors.carbohydrates.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fat">Fat (g)</Label>
            <Input id="fat" type="number" {...register('fat', { valueAsNumber: true })} />
            {errors.fat && <p className="text-sm text-destructive">{errors.fat.message}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Log Meal</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function AiLogDialog({ setOpen }: { setOpen: (open: boolean) => void }) {
  const [analysis, setAnalysis] = useState<MealFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logMeal } = useUserData();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUri = reader.result as string;
        setPreview(dataUri);
        setIsLoading(true);
        setAnalysis(null);
        try {
          const result = await analyzeMealPhoto({ photoDataUri: dataUri });
          setAnalysis({
            name: result.ingredients.slice(0, 3).join(', ') || 'Analyzed Meal',
            calories: Math.round(result.calories),
            protein: Math.round(result.protein),
            carbohydrates: Math.round(result.carbohydrates),
            fat: Math.round(result.fat),
          });
        } catch (error) {
          toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not analyze the photo. Please try another one.' });
          setPreview(null);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogAnalyzedMeal = () => {
    if (analysis) {
      logMeal(analysis);
      toast({ title: 'Meal Logged!', description: `AI-analyzed meal has been added.` });
      resetState();
      setOpen(false);
    }
  };
  
  const resetState = () => {
    setAnalysis(null);
    setIsLoading(false);
    setPreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <DialogContent onInteractOutside={(e) => { if(isLoading) e.preventDefault() }}>
      <DialogHeader>
        <DialogTitle>Analyze Meal with AI</DialogTitle>
        <DialogDescription>Upload a photo of your meal for an instant nutritional estimate.</DialogDescription>
      </DialogHeader>
      
      {!preview && (
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center">
            <Camera className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Click to upload a photo</p>
            <Button onClick={() => fileInputRef.current?.click()}>Upload Image</Button>
            <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>
      )}

      {preview && (
        <div className="space-y-4">
            <img src={preview} alt="Meal preview" className="rounded-lg max-h-64 w-full object-cover"/>
            {isLoading && <AnalysisSkeleton />}
            {analysis && <AnalysisResult analysis={analysis} onLog={handleLogAnalyzedMeal} onRetry={resetState} />}
        </div>
      )}
    </DialogContent>
  );
}

const AnalysisSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
    </div>
)

const AnalysisResult = ({ analysis, onLog, onRetry }: { analysis: MealFormValues, onLog: () => void, onRetry: () => void }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">{analysis.name}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
            <p><strong>Calories:</strong> {analysis.calories}</p>
            <p><strong>Protein:</strong> {analysis.protein}g</p>
            <p><strong>Carbs:</strong> {analysis.carbohydrates}g</p>
            <p><strong>Fat:</strong> {analysis.fat}g</p>
        </div>
         <p className="text-xs text-muted-foreground">*This is an AI-generated estimate. You can edit it after logging.</p>
        <DialogFooter>
            <Button variant="outline" onClick={onRetry}>Try another</Button>
            <Button onClick={onLog}>Log this meal</Button>
        </DialogFooter>
    </div>
)
