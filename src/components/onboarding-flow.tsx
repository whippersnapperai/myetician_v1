'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

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

const formSchema = z.object({
  user_first_name: z.string().min(1, 'Please enter your name.'),
  user_goal: z.enum(['Build muscle', 'Maintain weight', 'Lose weight']),
  user_current_activity_level: z.enum(['Sedentary', 'Lightly active', 'Moderately active', 'Very active', 'Extremely active']),
  user_gender: z.enum(['male', 'female']),
  dob_year: z.string().min(4, 'Select year'),
  dob_month: z.string().min(1, 'Select month'),
  dob_day: z.string().min(1, 'Select day'),
  user_height: z.number().min(1, 'Height is required'),
  user_height_unit: z.enum(['cm', 'ft']),
  user_current_weight: z.number().min(1, 'Weight is required'),
  user_current_weight_unit: z.enum(['kg', 'lbs']),
  user_goal_weight: z.number().min(1, 'Goal weight is required'),
  user_goal_weight_unit: z.enum(['kg', 'lbs']),
  user_caloric_goal_intensity_value: z.number().min(0).max(50),
});

type OnboardingFormValues = z.infer<typeof formSchema>;

const TOTAL_STEPS = 9;

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { saveUserData } = useUserData();

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

  const { formState: { errors }, trigger, getValues, watch } = methods;

  const handleNext = async () => {
    const fields: (keyof OnboardingFormValues)[] = [
      [],
      ['user_first_name'],
      ['user_goal'],
      ['user_current_activity_level'],
      ['user_gender'],
      ['dob_year', 'dob_month', 'dob_day'],
      ['user_height', 'user_height_unit'],
      ['user_current_weight', 'user_current_weight_unit'],
      ['user_goal_weight', 'user_goal_weight_unit'],
      ['user_caloric_goal_intensity_value'],
    ][step] as (keyof OnboardingFormValues)[];
    
    const isValid = await trigger(fields);
    if (isValid) {
      if (step === TOTAL_STEPS) {
        handleSubmit();
      } else {
        setStep(s => s + 1);
      }
    }
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = () => {
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
    
    saveUserData(completeUserData);
    router.push('/');
  };

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
            <form onSubmit={methods.handleSubmit(handleSubmit)}>
                {step === 1 && <StepName />}
                {step === 2 && <StepGoal />}
                {step === 3 && <StepActivity />}
                {step === 4 && <StepGender />}
                {step === 5 && <StepDob />}
                {step === 6 && <StepHeight />}
                {step === 7 && <StepCurrentWeight />}
                {step === 8 && <StepGoalWeight />}
                {step === 9 && <StepIntensity />}
            </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>Back</Button>
          <Button onClick={handleNext}>{step === TOTAL_STEPS ? 'Finish' : 'Next'}</Button>
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
    const { control, formState: { errors } } = useFormContext();
    const options = ['Build muscle', 'Maintain weight', 'Lose weight'];
    return (
      <div>
        <CardTitle className="mb-2 font-headline">What's your primary goal?</CardTitle>
        <CardDescription>This helps us tailor your daily targets.</CardDescription>
        <RadioGroup
          onValueChange={(value) => control.register('user_goal').onChange({ target: { value } })}
          defaultValue={control._defaultValues.user_goal}
          className="mt-6 grid grid-cols-1 gap-4"
        >
          {options.map(option => (
            <Label key={option} className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
              <RadioGroupItem value={option} id={option} />
              <span>{option}</span>
            </Label>
          ))}
        </RadioGroup>
        {errors.user_goal && <p className="text-destructive text-sm mt-1">{`${errors.user_goal.message}`}</p>}
      </div>
    );
};

const StepActivity = () => {
    const { control, formState: { errors } } = useFormContext();
    const options = [
        { value: 'Sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
        { value: 'Lightly active', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
        { value: 'Moderately active', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
        { value: 'Very active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
        { value: 'Extremely active', label: 'Extremely Active', desc: 'Very hard exercise & physical job' },
    ];
    return (
      <div>
        <CardTitle className="mb-2 font-headline">Describe your activity level.</CardTitle>
        <CardDescription>This is crucial for estimating your daily calorie needs.</CardDescription>
        <RadioGroup
          onValueChange={(value) => control.register('user_current_activity_level').onChange({ target: { value } })}
          defaultValue={control._defaultValues.user_current_activity_level}
          className="mt-6 grid grid-cols-1 gap-2"
        >
          {options.map(option => (
            <Label key={option.value} className="flex flex-col items-start space-x-3 p-3 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
              <div className="flex items-center">
                <RadioGroupItem value={option.value} id={option.value} className="mr-3"/>
                <span className="font-semibold">{option.label}</span>
              </div>
              <span className="text-sm text-muted-foreground ml-7">{option.desc}</span>
            </Label>
          ))}
        </RadioGroup>
        {errors.user_current_activity_level && <p className="text-destructive text-sm mt-1">{`${errors.user_current_activity_level.message}`}</p>}
      </div>
    );
};


const StepGender = () => {
    const { control, formState: { errors } } = useFormContext();
    return (
      <div>
        <CardTitle className="mb-2 font-headline">What's your gender?</CardTitle>
        <CardDescription>Biological sex is used to calculate your metabolic rate.</CardDescription>
        <RadioGroup
          onValueChange={(value) => control.register('user_gender').onChange({ target: { value } })}
          defaultValue={control._defaultValues.user_gender}
          className="mt-6 grid grid-cols-2 gap-4"
        >
            <Label className="flex items-center justify-center space-x-3 p-4 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
              <RadioGroupItem value="male" id="male" />
              <span>Male</span>
            </Label>
            <Label className="flex items-center justify-center space-x-3 p-4 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
              <RadioGroupItem value="female" id="female" />
              <span>Female</span>
            </Label>
        </RadioGroup>
        {errors.user_gender && <p className="text-destructive text-sm mt-1">{`${errors.user_gender.message}`}</p>}
      </div>
    );
};

const StepDob = () => {
    const { control, formState: { errors } } = useFormContext();
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i - 16);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: `${i + 1}`.padStart(2, '0'), label: new Date(0, i).toLocaleString('default', { month: 'long' }) }));
    const days = Array.from({ length: 31 }, (_, i) => `${i + 1}`.padStart(2, '0'));

    return (
      <div>
        <CardTitle className="mb-2 font-headline">What's your date of birth?</CardTitle>
        <CardDescription>Your age helps us make more accurate calculations.</CardDescription>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <Select onValueChange={(value) => control.register('dob_year').onChange({ target: { value } })}>
            <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>{years.map(y => <SelectItem key={y} value={`${y}`}>{y}</SelectItem>)}</SelectContent>
          </Select>
           <Select onValueChange={(value) => control.register('dob_month').onChange({ target: { value } })}>
            <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
          </Select>
           <Select onValueChange={(value) => control.register('dob_day').onChange({ target: { value } })}>
            <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
            <SelectContent>{days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {(errors.dob_year || errors.dob_month || errors.dob_day) && <p className="text-destructive text-sm mt-1">Please select a valid date.</p>}
      </div>
    );
};

const StepHeight = () => {
    const { register, control, formState: { errors } } = useFormContext();
    return (
      <div>
        <CardTitle className="mb-2 font-headline">What's your height?</CardTitle>
        <div className="mt-6 flex gap-2">
            <Input type="number" {...register('user_height', { valueAsNumber: true })} placeholder="e.g. 180" />
            <Select onValueChange={(value) => control.register('user_height_unit').onChange({ target: { value } })} defaultValue={control._defaultValues.user_height_unit}>
                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="ft">ft</SelectItem>
                </SelectContent>
            </Select>
        </div>
        {errors.user_height && <p className="text-destructive text-sm mt-1">{`${errors.user_height.message}`}</p>}
      </div>
    );
};

const StepCurrentWeight = () => {
    const { register, control, formState: { errors } } = useFormContext();
    return (
      <div>
        <CardTitle className="mb-2 font-headline">What's your current weight?</CardTitle>
         <div className="mt-6 flex gap-2">
            <Input type="number" {...register('user_current_weight', { valueAsNumber: true })} placeholder="e.g. 75" />
            <Select onValueChange={(value) => control.register('user_current_weight_unit').onChange({ target: { value } })} defaultValue={control._defaultValues.user_current_weight_unit}>
                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
            </Select>
        </div>
        {errors.user_current_weight && <p className="text-destructive text-sm mt-1">{`${errors.user_current_weight.message}`}</p>}
      </div>
    );
};

const StepGoalWeight = () => {
    const { register, control, formState: { errors } } = useFormContext();
    return (
      <div>
        <CardTitle className="mb-2 font-headline">What's your goal weight?</CardTitle>
         <div className="mt-6 flex gap-2">
            <Input type="number" {...register('user_goal_weight', { valueAsNumber: true })} placeholder="e.g. 70" />
            <Select onValueChange={(value) => control.register('user_goal_weight_unit').onChange({ target: { value } })} defaultValue={control._defaultValues.user_goal_weight_unit}>
                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
            </Select>
        </div>
        {errors.user_goal_weight && <p className="text-destructive text-sm mt-1">{`${errors.user_goal_weight.message}`}</p>}
      </div>
    );
};

const StepIntensity = () => {
    const { control, watch } = useFormContext();
    const intensity = watch('user_caloric_goal_intensity_value');
    const goal = watch('user_goal');
    let label;
    switch (goal) {
        case 'Build muscle': label = 'Calorie Surplus'; break;
        case 'Lose weight': label = 'Calorie Deficit'; break;
        default: label = 'Intensity';
    }

    return (
      <div>
        <CardTitle className="mb-2 font-headline">Set your pace</CardTitle>
        <CardDescription>
          {goal === 'Maintain weight' 
            ? 'You\'ve chosen to maintain your weight. This setting has no effect.' 
            : `How aggressively do you want to pursue your goal?`}
        </CardDescription>
         <div className="mt-8">
            <Label className="flex justify-between"><span>{label}</span><span className="font-bold text-primary">{intensity}%</span></Label>
            <Slider
              defaultValue={[20]}
              max={50}
              step={1}
              onValueChange={(value) => control.register('user_caloric_goal_intensity_value').onChange({ target: { value: value[0] } })}
              disabled={goal === 'Maintain weight'}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Slower</span>
              <span>Faster</span>
            </div>
         </div>
      </div>
    );
};
