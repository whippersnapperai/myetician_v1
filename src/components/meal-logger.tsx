'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserData } from '@/hooks/use-user-data';
import { analyzeMealPhoto } from '@/ai/flows/analyze-meal-photo';
import { searchFood, type FoodItem as ApiFoodItem } from '@/ai/flows/search-food';
import type { MealType } from '@/types';

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
import { Camera, Plus, Sparkles, Utensils, X as XIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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

const logFormSchema = z.object({
  mealType: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
});
type LogFormValues = z.infer<typeof logFormSchema>;


function ManualLogDialog({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { logMeal } = useUserData();
  const { toast } = useToast();
  const [addedFoods, setAddedFoods] = useState<ApiFoodItem[]>([]);

  const form = useForm<LogFormValues>({
    resolver: zodResolver(logFormSchema),
    defaultValues: { mealType: 'Breakfast' },
  });

  const onSubmit = (data: LogFormValues) => {
    if (addedFoods.length === 0) {
      toast({ variant: 'destructive', title: 'No food added', description: 'Please add at least one food item to log.' });
      return;
    }

    addedFoods.forEach(food => {
      logMeal({
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbohydrates: food.carbohydrates,
        fat: food.fat,
        mealType: data.mealType,
      });
    });

    toast({ title: "Meal logged!", description: `${data.mealType} has been added to your daily log.` });
    setAddedFoods([]);
    setOpen(false);
  };

  const addFood = (food: ApiFoodItem) => {
    setAddedFoods(prev => [...prev, food]);
  }

  const removeFood = (index: number) => {
    setAddedFoods(prev => prev.filter((_, i) => i !== index));
  }

  const totalMacros = addedFoods.reduce((acc, food) => {
    acc.calories += food.calories;
    acc.protein += food.protein;
    acc.carbohydrates += food.carbohydrates;
    acc.fat += food.fat;
    return acc;
  }, { calories: 0, protein: 0, carbohydrates: 0, fat: 0 });

  return (
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>Log a Meal</DialogTitle>
        <DialogDescription>Search for food items and add them to your meal.</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="mealType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a meal time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Breakfast">Breakfast</SelectItem>
                      <SelectItem value="Lunch">Lunch</SelectItem>
                      <SelectItem value="Dinner">Dinner</SelectItem>
                      <SelectItem value="Snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
                <Label>Meal</Label>
                <FoodSearchAutocomplete onFoodSelect={addFood} />
            </div>

            {addedFoods.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-medium">Added Foods</h4>
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                        {addedFoods.map((food, index) => (
                            <div key={index} className="flex items-center justify-between p-2 text-sm border-b last:border-b-0">
                                <div>
                                    <p className="font-semibold">{food.name}</p>
                                    <p className="text-muted-foreground">{Math.round(food.calories)} cal &bull; {food.servingSize}</p>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFood(index)}>
                                    <XIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <div className="p-2 bg-muted/50 rounded-md text-sm font-medium grid grid-cols-2 gap-x-4 gap-y-1">
                        <div>Total Calories: <span className="text-primary font-bold">{Math.round(totalMacros.calories)}</span></div>
                        <div>Protein: <span className="font-bold">{Math.round(totalMacros.protein)}g</span></div>
                        <div>Carbs: <span className="font-bold">{Math.round(totalMacros.carbohydrates)}g</span></div>
                        <div>Fat: <span className="font-bold">{Math.round(totalMacros.fat)}g</span></div>
                    </div>
                </div>
            )}

          </div>
          <DialogFooter>
            <Button type="submit">Log Meal</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}

function FoodSearchAutocomplete({ onFoodSelect }: { onFoodSelect: (food: ApiFoodItem) => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ApiFoodItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPopoverOpen, setPopoverOpen] = useState(false);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            if(isPopoverOpen) setPopoverOpen(false);
            return;
        }

        const handler = setTimeout(async () => {
            setIsLoading(true);
            setPopoverOpen(true);
            try {
                const response = await searchFood({ query });
                setResults(response.results);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [query]);

    const handleSelect = (food: ApiFoodItem) => {
        onFoodSelect(food);
        setQuery('');
        setResults([]);
        setPopoverOpen(false);
    };

    return (
        <Popover open={isPopoverOpen && query.length > 0} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <div className="relative mt-1">
                    <Input
                        placeholder="Search for a food..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onFocus={() => query.length > 1 && setPopoverOpen(true)}
                        className="pr-8"
                    />
                    {isLoading && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <div className="max-h-60 overflow-y-auto">
                    {results.length === 0 && !isLoading && <p className="p-4 text-sm text-center text-muted-foreground">No results found.</p>}
                    {results.map((food, index) => (
                        <button 
                            key={`${food.name}-${index}`}
                            type="button"
                            onClick={() => handleSelect(food)}
                            className="flex items-center justify-between w-full text-left p-3 hover:bg-accent text-sm border-b last:border-b-0"
                        >
                            <div>
                                <p>{food.name}</p>
                                <p className="text-xs text-muted-foreground">{food.servingSize}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-primary">{Math.round(food.calories)} cal</p>
                            </div>
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

const mealSchema = z.object({
  name: z.string().min(1, 'Meal name is required'),
  calories: z.number().min(0, 'Calories must be positive'),
  protein: z.number().min(0, 'Protein must be positive'),
  carbohydrates: z.number().min(0, 'Carbs must be positive'),
  fat: z.number().min(0, 'Fat must be positive'),
});

type MealFormValues = z.infer<typeof mealSchema>;


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
      logMeal({...analysis, mealType: 'Snack' });
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
         <p className="text-xs text-muted-foreground">*This is an AI-generated estimate.</p>
        <DialogFooter>
            <Button variant="outline" onClick={onRetry}>Try another</Button>
            <Button onClick={onLog}>Log this meal</Button>
        </DialogFooter>
    </div>
)
