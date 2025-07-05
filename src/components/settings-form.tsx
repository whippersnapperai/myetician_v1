'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useUserData } from '@/hooks/use-user-data';
import { calculateBMR, calculateTDEE, calculateCaloricGoal } from '@/lib/calculations';
import type { UserData } from '@/types';
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Sun, Moon, Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const settingsSchema = z.object({
  user_goal: z.enum(['Build muscle', 'Maintain weight', 'Lose weight']),
  user_current_activity_level: z.enum(['Sedentary', 'Lightly active', 'Moderately active', 'Very active', 'Extremely active']),
  user_current_weight: z.number().min(1, 'Weight must be a positive number.'),
  user_goal_weight: z.number().min(1, 'Goal weight must be a positive number.'),
  user_caloric_goal_intensity_value: z.number().min(0).max(50),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsForm() {
  const { userData, saveUserData, loading } = useUserData();
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();
  const router = useRouter();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: userData ? {
      user_goal: userData.user_goal,
      user_current_activity_level: userData.user_current_activity_level,
      user_current_weight: userData.user_current_weight,
      user_goal_weight: userData.user_goal_weight,
      user_caloric_goal_intensity_value: userData.user_caloric_goal_intensity_value,
    } : {
      user_goal: 'Maintain weight',
      user_current_activity_level: 'Lightly active',
      user_current_weight: 0,
      user_goal_weight: 0,
      user_caloric_goal_intensity_value: 20,
    },
  });

  useEffect(() => {
    if (userData) {
      form.reset({
        user_goal: userData.user_goal,
        user_current_activity_level: userData.user_current_activity_level,
        user_current_weight: userData.user_current_weight,
        user_goal_weight: userData.user_goal_weight,
        user_caloric_goal_intensity_value: userData.user_caloric_goal_intensity_value,
      });
    }
  }, [userData, form]);

  if (loading || !userData) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-2/4" />
            </CardHeader>
            <CardContent className="space-y-8">
                 <div className="space-y-4">
                    <Skeleton className="h-6 w-1/3" />
                    <div className="flex space-x-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                 </div>
                 <div className="space-y-6 border-t pt-6">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                 </div>
            </CardContent>
        </Card>
    );
  }

  const onSubmit = (values: SettingsFormValues) => {
    const activityFactors = {
      'Sedentary': 1.2,
      'Lightly active': 1.375,
      'Moderately active': 1.55,
      'Very active': 1.725,
      'Extremely active': 1.9
    };
    
    const partialUserData = {
        ...userData,
        ...values,
        user_activity_factor_value: activityFactors[values.user_current_activity_level],
    };

    const bmr = calculateBMR(partialUserData);
    const tdee = calculateTDEE(bmr, partialUserData.user_activity_factor_value);
    const caloricGoal = calculateCaloricGoal(tdee, values.user_goal, values.user_caloric_goal_intensity_value);

    const completeUserData: UserData = {
        ...userData,
        ...values,
        user_calculated_bmr: bmr,
        user_calculated_tdee: tdee,
        user_caloric_goal: caloricGoal,
    };
    
    saveUserData(completeUserData);
    toast({
        title: 'Settings Saved!',
        description: 'Your profile and goals have been updated.',
    });
    router.push('/');
  };
  
  const currentGoal = form.watch('user_goal');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your account settings and preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-2">
            <h3 className="text-lg font-medium">Appearance</h3>
            <div className="flex items-center space-x-2">
                <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')} size="sm">
                    <Sun className="mr-2" /> Light
                </Button>
                <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')} size="sm">
                    <Moon className="mr-2" /> Dark
                </Button>
            </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-lg font-medium border-t pt-6">Profile & Goals</h3>
            
            <FormField
              control={form.control}
              name="user_goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Goal</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Build muscle">Build muscle</SelectItem>
                      <SelectItem value="Maintain weight">Maintain weight</SelectItem>
                      <SelectItem value="Lose weight">Lose weight</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user_current_activity_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       <SelectItem value="Sedentary">Sedentary: Little or no exercise</SelectItem>
                       <SelectItem value="Lightly active">Lightly Active: Light exercise 1-3 days/week</SelectItem>
                       <SelectItem value="Moderately active">Moderately Active: Moderate exercise 3-5 days/week</SelectItem>
                       <SelectItem value="Very active">Very Active: Hard exercise 6-7 days/week</SelectItem>
                       <SelectItem value="Extremely active">Extremely Active: Very hard exercise & physical job</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="user_current_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Weight ({userData.user_current_weight_unit})</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="user_goal_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Weight ({userData.user_goal_weight_unit})</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
             <FormField
              control={form.control}
              name="user_caloric_goal_intensity_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-between">
                    <span>
                      {currentGoal === 'Build muscle' ? 'Calorie Surplus' : 
                       currentGoal === 'Lose weight' ? 'Calorie Deficit' : 'Intensity'}
                    </span>
                    <span className="font-bold text-primary">{field.value}%</span>
                  </FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      max={50}
                      step={1}
                      onValueChange={(value) => field.onChange(value[0])}
                      disabled={currentGoal === 'Maintain weight'}
                    />
                  </FormControl>
                   <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Slower</span>
                    <span>Faster</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
