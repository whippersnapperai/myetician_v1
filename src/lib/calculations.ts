import type { UserData } from "@/types";

export const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  export const calculateBMR = (userData: Omit<UserData, 'user_calculated_bmr' | 'user_calculated_tdee' | 'user_caloric_goal'>): number => {
    const age = calculateAge(userData.user_dob);
    const weightInKg = userData.user_current_weight_unit === 'kg' 
      ? userData.user_current_weight 
      : userData.user_current_weight * 0.453592;
    const heightInCm = userData.user_height_unit === 'cm' 
      ? userData.user_height 
      : userData.user_height * 2.54;
  
    if (userData.user_gender === 'male') {
      // Revised Harris-Benedict Equation for men
      return 88.362 + (13.397 * weightInKg) + (4.799 * heightInCm) - (5.677 * age);
    } else {
      // Revised Harris-Benedict Equation for women
      return 447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age);
    }
  };
  
  export const calculateTDEE = (bmr: number, activityFactor: number): number => {
    return bmr * activityFactor;
  };
  
  export const calculateCaloricGoal = (tdee: number, goal: UserData['user_goal'], intensity: number): number => {
    // Intensity is a percentage, e.g., 20 for 20%. Let's use a safe range.
    const intensityFactor = intensity / 100;
    const calorieChange = tdee * intensityFactor;
  
    switch(goal) {
      case 'Build muscle':
        return tdee + Math.min(calorieChange, 500); // Cap surplus at 500 for healthy gain
      case 'Lose weight':
        return tdee - Math.min(calorieChange, 750); // Cap deficit at 750 for healthy loss
      case 'Maintain weight':
      default:
        return tdee;
    }
  };
