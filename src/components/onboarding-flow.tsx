
'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Mail, Loader2, Pencil } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, type User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useUserData } from '@/hooks/use-user-data';
import { calculateBMR, calculateTDEE, calculateCaloricGoal, calculateAge } from '@/lib/calculations';
import type { UserData } from '@/types';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  user_first_name: z.string().min(1, 'Please enter your name.'),
  user_goal: z.enum(['Build muscle', 'Maintain weight', 'Lose weight'], { required_error: 'Please select a goal.'}),
  user_current_activity_level: z.enum(['Sedentary', 'Lightly active', 'Moderately active', 'Very active', 'Extremely active'], { required_error: 'Please select an activity level.'}),
  user_gender: z.enum(['male', 'female'], { required_error: 'Please select a gender.'}),
  dob_year: z.string().min(1, 'Select year'),
  dob_month: z.string().min(1, 'Select month'),
  dob_day: z.string().min(1, 'Select day'),
  user_height: z.number({ required_error: 'Height is required.'}).min(1, 'Height must be a positive number.'),
  user_height_unit: z.enum(['cm', 'ft']),
  user_current_weight: z.number({ required_error: 'Weight is required.'}).min(1, 'Weight must be a positive number.'),
  user_current_weight_unit: z.enum(['kg', 'lbs']),
  user_goal_weight: z.number({ required_error: 'Goal weight is required.'}).min(1, 'Goal weight must be a positive number.'),
  user_goal_weight_unit: z.enum(['kg', 'lbs']),
  user_caloric_goal_intensity_value: z.number().min(0).max(50),
});

type OnboardingFormValues = z.infer<typeof formSchema>;

const TOTAL_STEPS = 8;

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const methods = useForm<OnboardingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_first_name: '',
      user_goal: 'Maintain weight',
      user_current_activity_level: 'Lightly active',
      user_gender: 'male',
      user_height_unit: 'cm',
      user_current_weight_unit: 'kg',
      user_goal_weight_unit: 'kg',
      user_caloric_goal_intensity_value: 20,
    },
  });

  const { trigger } = methods;

  const handleNext = async () => {
    const fields: (keyof OnboardingFormValues)[] = [
      [],
      ['user_first_name'],
      ['user_goal'],
      ['user_current_activity_level'],
      ['user_gender', 'dob_year', 'dob_month', 'dob_day'],
      ['user_height', 'user_height_unit', 'user_current_weight', 'user_current_weight_unit', 'user_goal_weight', 'user_goal_weight_unit'],
      ['user_caloric_goal_intensity_value'],
      [],
      [],
    ][step] as (keyof OnboardingFormValues)[];
    
    const isValid = await trigger(fields);
    if (isValid) {
      if (step < TOTAL_STEPS) {
        setStep(s => s + 1);
      }
    }
  };

  const handleBack = () => setStep(s => s - 1);

  return (
    <FormProvider {...methods}>
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
             <h1 className="text-2xl font-headline font-bold text-primary">Myetician</h1>
             <span className="text-sm text-muted-foreground">Step {step} of {TOTAL_STEPS}</span>
          </div>
          <Progress value={(step / TOTAL_STEPS) * 100} className="w-full" />
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col justify-center">
            <form>
                {step === 1 && <StepName />}
                {step === 2 && <StepGoal />}
                {step === 3 && <StepActivity />}
                {step === 4 && <StepBio />}
                {step === 5 && <StepMeasurements />}
                {step === 6 && <StepIntensity />}
                {step === 7 && <StepSummary setStep={setStep} />}
                {step === 8 && <StepAuth />}
            </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 1 || step === TOTAL_STEPS}>Back</Button>
          {step < TOTAL_STEPS && <Button onClick={handleNext}>Next</Button>}
        </CardFooter>
      </Card>
    </FormProvider>
  );
}

// Step Components

const StepName = () => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div>
      <CardTitle className="mb-2 font-headline">What should we call you?</CardTitle>
      <CardDescription>Let's start with your first name.</CardDescription>
      <Input {...register('user_first_name')} placeholder="Your first name" className="mt-6" />
      {errors.user_first_name && <p className="text-destructive text-sm mt-1">{`${errors.user_first_name.message}`}</p>}
    </div>
  );
};

const StepGoal = () => {
    const { control, getValues } = useFormContext<OnboardingFormValues>();
    const name = getValues('user_first_name');
    const options = ['Build muscle', 'Maintain weight', 'Lose weight'];
    return (
      <div>
        <CardTitle className="mb-2 font-headline">What's your primary goal?</CardTitle>
        <CardDescription>This helps us tailor your daily targets.</CardDescription>
        <FormField
          control={control}
          name="user_goal"
          render={({ field }) => (
            <FormItem className="mt-6">
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 gap-4"
                >
                  {options.map(option => (
                    <FormItem key={option}>
                      <Label className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary cursor-pointer">
                        <FormControl>
                          <RadioGroupItem value={option} />
                        </FormControl>
                        <span>{option}</span>
                      </Label>
                    </FormItem>
                  ))}
                </RadioGroup>
              <FormMessage className="mt-2" />
            </FormItem>
          )}
        />
      </div>
    );
};

const StepActivity = () => {
    const { control } = useFormContext<OnboardingFormValues>();
    const options = [
        { value: 'Sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
        { value: 'Lightly active', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
        { value: 'Moderately active', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
        { value: 'Very active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
        { value: 'Extremely active', label: 'Extremely Active', desc: 'Very hard exercise & physical job' },
    ];
    return (
      <div>
        <CardTitle className="mb-2 font-headline">Describe your activity level</CardTitle>
        <CardDescription>This is crucial for estimating your daily calorie needs.</CardDescription>
        <FormField
          control={control}
          name="user_current_activity_level"
          render={({ field }) => (
            <FormItem className="mt-6">
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 gap-2"
                >
                  {options.map(option => (
                    <FormItem key={option.value}>
                        <Label className="flex flex-col items-start p-3 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary cursor-pointer space-y-1">
                            <div className="flex items-center w-full">
                                <FormControl>
                                    <RadioGroupItem value={option.value} className="mr-3"/>
                                </FormControl>
                                <span className="font-semibold flex-1">{option.label}</span>
                            </div>
                            <span className="text-sm text-muted-foreground pl-7">{option.desc}</span>
                        </Label>
                    </FormItem>
                  ))}
                </RadioGroup>
              <FormMessage className="mt-2" />
            </FormItem>
          )}
        />
      </div>
    );
};

const StepBio = () => {
    const { control, formState: { errors } } = useFormContext<OnboardingFormValues>();
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i - 16);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: `${i + 1}`.padStart(2, '0'), label: new Date(0, i).toLocaleString('default', { month: 'long' }) }));
    const days = Array.from({ length: 31 }, (_, i) => `${i + 1}`.padStart(2, '0'));

    return (
        <div>
            <CardTitle className="mb-2 font-headline">Tell us about yourself</CardTitle>
            <CardDescription>This information helps us make more accurate calculations for your goals.</CardDescription>
            <div className="mt-6 space-y-6">
                <div>
                    <FormLabel>Gender</FormLabel>
                    <FormField
                    control={control}
                    name="user_gender"
                    render={({ field }) => (
                        <FormItem className="mt-2">
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
                        >
                            <FormItem>
                                <Label className="flex items-center justify-center space-x-3 p-4 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary cursor-pointer">
                                <FormControl>
                                    <RadioGroupItem value="male" />
                                </FormControl>
                                <span>Male</span>
                                </Label>
                            </FormItem>
                            <FormItem>
                                <Label className="flex items-center justify-center space-x-3 p-4 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary cursor-pointer">
                                <FormControl>
                                    <RadioGroupItem value="female" />
                                </FormControl>
                                <span>Female</span>
                                </Label>
                            </FormItem>
                        </RadioGroup>
                        <FormMessage className="mt-2" />
                        </FormItem>
                    )}
                    />
                </div>
                
                <div>
                    <FormLabel>Date of Birth</FormLabel>
                    <div className="mt-2 grid grid-cols-3 gap-4">
                        <FormField
                            control={control}
                            name="dob_year"
                            render={({ field }) => (
                            <FormItem>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>{years.map(y => <SelectItem key={y} value={`${y}`}>{y}</SelectItem>)}</SelectContent>
                                </Select>
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="dob_month"
                            render={({ field }) => (
                            <FormItem>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="dob_day"
                            render={({ field }) => (
                            <FormItem>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>{days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                </Select>
                            </FormItem>
                            )}
                        />
                    </div>
                    {(errors.dob_year || errors.dob_month || errors.dob_day) && <p className="text-destructive text-sm mt-1">Please select a valid date.</p>}
                </div>
            </div>
        </div>
    );
};

const StepMeasurements = () => {
    const { control, watch } = useFormContext<OnboardingFormValues>();
    
    const heightUnit = watch('user_height_unit');
    const currentWeightUnit = watch('user_current_weight_unit');
    const goalWeightUnit = watch('user_goal_weight_unit');

    const heightConfigs = {
        cm: { min: 120, max: 220, step: 1, default: 170 },
        ft: { min: 4, max: 8, step: 0.1, default: 5.5 },
    };
    const weightConfigs = {
        kg: { min: 30, max: 180, step: 0.5, default: 70 },
        lbs: { min: 65, max: 400, step: 1, default: 150 },
    };

    return (
        <div>
            <CardTitle className="mb-2 font-headline">Your Measurements</CardTitle>
            <CardDescription>Use the sliders to provide your measurements.</CardDescription>
            <div className="mt-6 space-y-8 pt-4">
                <FormField
                    control={control}
                    name="user_height"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex justify-between items-baseline">
                                <FormLabel>Height</FormLabel>
                                <span className="text-lg font-bold text-primary tabular-nums">
                                    {(field.value || 0).toFixed(heightUnit === 'ft' ? 1 : 0)} {heightUnit}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <FormControl>
                                    <Slider
                                        min={heightConfigs[heightUnit].min}
                                        max={heightConfigs[heightUnit].max}
                                        step={heightConfigs[heightUnit].step}
                                        value={[field.value || heightConfigs[heightUnit].default]}
                                        onValueChange={(value) => field.onChange(value[0])}
                                        className="flex-1"
                                    />
                                </FormControl>
                                <FormField
                                    control={control}
                                    name="user_height_unit"
                                    render={({ field: selectField }) => (
                                        <FormItem>
                                            <Select onValueChange={selectField.onChange} defaultValue={selectField.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="cm">cm</SelectItem>
                                                    <SelectItem value="ft">ft</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={control}
                    name="user_current_weight"
                    render={({ field }) => (
                        <FormItem>
                             <div className="flex justify-between items-baseline">
                                <FormLabel>Current Weight</FormLabel>
                                <span className="text-lg font-bold text-primary tabular-nums">
                                    {(field.value || 0).toFixed(currentWeightUnit === 'kg' ? 1 : 0)} {currentWeightUnit}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <FormControl>
                                    <Slider
                                        min={weightConfigs[currentWeightUnit].min}
                                        max={weightConfigs[currentWeightUnit].max}
                                        step={weightConfigs[currentWeightUnit].step}
                                        value={[field.value || weightConfigs[currentWeightUnit].default]}
                                        onValueChange={(value) => field.onChange(value[0])}
                                        className="flex-1"
                                    />
                                </FormControl>
                                <FormField
                                    control={control}
                                    name="user_current_weight_unit"
                                    render={({ field: selectField }) => (
                                        <FormItem>
                                            <Select onValueChange={selectField.onChange} defaultValue={selectField.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="kg">kg</SelectItem>
                                                    <SelectItem value="lbs">lbs</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="user_goal_weight"
                    render={({ field }) => (
                        <FormItem>
                             <div className="flex justify-between items-baseline">
                                <FormLabel>Goal Weight</FormLabel>
                                <span className="text-lg font-bold text-primary tabular-nums">
                                    {(field.value || 0).toFixed(goalWeightUnit === 'kg' ? 1 : 0)} {goalWeightUnit}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <FormControl>
                                    <Slider
                                        min={weightConfigs[goalWeightUnit].min}
                                        max={weightConfigs[goalWeightUnit].max}
                                        step={weightConfigs[goalWeightUnit].step}
                                        value={[field.value || weightConfigs[goalWeightUnit].default]}
                                        onValueChange={(value) => field.onChange(value[0])}
                                        className="flex-1"
                                    />
                                </FormControl>
                                <FormField
                                    control={control}
                                    name="user_goal_weight_unit"
                                    render={({ field: selectField }) => (
                                        <FormItem>
                                            <Select onValueChange={selectField.onChange} defaultValue={selectField.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="kg">kg</SelectItem>
                                                    <SelectItem value="lbs">lbs</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
};

const StepIntensity = () => {
    const { control, watch } = useFormContext<OnboardingFormValues>();
    const goal = watch('user_goal');
    let label;
    switch (goal) {
        case 'Build muscle': label = 'Calorie Surplus'; break;
        case 'Lose weight': label = 'Calorie Deficit'; break;
        default: label = 'Intensity';
    }

    return (
      <div>
        <CardTitle className="mb-2 font-headline">Personalize your plan</CardTitle>
        <CardDescription>
          {goal === 'Maintain weight'
            ? "You've chosen to maintain your weight, so no adjustments are needed."
            : `How aggressively do you want to pursue your goal? A higher percentage means faster results.`}
        </CardDescription>
         <div className="mt-8 pt-4">
            <FormField
              control={control}
              name="user_caloric_goal_intensity_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-between"><span>{label}</span><span className="font-bold text-primary">{field.value}%</span></FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      max={50}
                      step={1}
                      onValueChange={(value) => field.onChange(value[0])}
                      disabled={goal === 'Maintain weight'}
                      className="mt-2"
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
         </div>
      </div>
    );
};

const StepSummary = ({ setStep }: { setStep: (step: number) => void }) => {
    const { getValues } = useFormContext<OnboardingFormValues>();
    const [isEditing, setIsEditing] = useState(false);
    const values = getValues();
    const { dob_day, dob_month, dob_year } = values;

    const summaryItems = [
        { label: 'Name', value: values.user_first_name, step: 1 },
        { label: 'Goal', value: values.user_goal, step: 2 },
        { label: 'Activity Level', value: values.user_current_activity_level, step: 3 },
        { label: 'Gender', value: values.user_gender, step: 4 },
        { label: 'Date of Birth', value: `${dob_month}/${dob_day}/${dob_year}`, step: 4 },
        { label: 'Height', value: `${values.user_height} ${values.user_height_unit}`, step: 5 },
        { label: 'Current Weight', value: `${values.user_current_weight} ${values.user_current_weight_unit}`, step: 5 },
        { label: 'Goal Weight', value: `${values.user_goal_weight} ${values.user_goal_weight_unit}`, step: 5 },
        { label: 'Intensity', value: values.user_goal === 'Maintain weight' ? 'N/A' : `${values.user_caloric_goal_intensity_value}%`, step: 6 },
    ];
    
    return (
        <div>
            <CardTitle className="mb-2 font-headline">Review Your Information</CardTitle>
            <CardDescription>
                Please confirm your details below. If anything is incorrect, you can edit it before creating your account.
            </CardDescription>
            <div className="mt-6 space-y-3">
                {summaryItems.map(item => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                        <div>
                            <p className="text-sm text-muted-foreground">{item.label}</p>
                            <p className="font-semibold capitalize">{item.value}</p>
                        </div>
                        {isEditing && item.label !== 'Name' && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => setStep(item.step)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit {item.label}</span>
                            </Button>
                        )}
                    </div>
                ))}
            </div>
             {!isEditing && (
                <div className="mt-6 flex justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                        Edit Details
                    </Button>
                </div>
            )}
        </div>
    );
};


const StepAuth = () => {
  const { getValues } = useFormContext<OnboardingFormValues>();
  const { saveUserData } = useUserData();
  const router = useRouter();
  const name = getValues('user_first_name');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { toast } = useToast();

  const handleFinalSubmit = async (user: User) => {
    const values = getValues();
    const activityFactors = {
      'Sedentary': 1.2,
      'Lightly active': 1.375,
      'Moderately active': 1.55,
      'Very active': 1.725,
      'Extremely active': 1.9
    };
    
    const dob = `${values.dob_year}-${values.dob_month}-${values.dob_day}`;
    const partialUserData = {
        ...values,
        user_dob: dob,
        user_age: calculateAge(dob),
        user_activity_factor_value: activityFactors[values.user_current_activity_level],
    };

    const bmr = calculateBMR(partialUserData);
    const tdee = calculateTDEE(bmr, partialUserData.user_activity_factor_value);
    const caloricGoal = calculateCaloricGoal(tdee, values.user_goal, values.user_caloric_goal_intensity_value);

    const completeUserData: UserData = {
        ...partialUserData,
        user_calculated_bmr: bmr,
        user_calculated_tdee: tdee,
        user_caloric_goal: caloricGoal,
    };
    
    await saveUserData(completeUserData, user);
    router.push('/');
  }

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    if (!isFirebaseConfigured || !auth) {
        toast({
            variant: "destructive",
            title: "Firebase Not Configured",
            description: "Cannot sign in. Please configure Firebase credentials in .env file.",
        });
        setIsSigningIn(false);
        return;
    }
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleFinalSubmit(result.user);
    } catch (error: any) {
      console.error("Google Sign-In Error", error);
      toast({
        variant: "destructive",
        title: "Sign-in failed",
        description: error.message || "Could not sign in with Google. Please try again.",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailSignIn = () => {
      toast({
        title: "Coming Soon!",
        description: "Email sign-up is not yet available. Please use Google Sign-in.",
      });
  };

  return (
    <div>
      <CardTitle className="mb-2 font-headline">You're all set, {name}!</CardTitle>
      <CardDescription>
        One last step. Create an account to save your progress and access your personalized plan.
      </CardDescription>
      <div className="mt-6 space-y-4">
        <Button className="w-full" size="lg" onClick={handleGoogleSignIn} disabled={isSigningIn}>
           {isSigningIn ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.16c1.56 0 2.95.54 4.04 1.58l3.15-3.15C17.45 1.99 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.54 6.16-4.54z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
          )}
          {isSigningIn ? 'Signing In...' : 'Sign up with Google'}
        </Button>
        <Button className="w-full" variant="secondary" size="lg" onClick={handleEmailSignIn}>
            <Mail className="mr-2 h-5 w-5" />
            Sign up with Email
        </Button>
      </div>
       <p className="mt-4 text-center text-xs text-muted-foreground">
        By signing up, you agree to our Terms of Service.
      </p>
    </div>
  );
};
