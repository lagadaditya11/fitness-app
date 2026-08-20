export interface AuthResponse {
  token: string
  email: string
  displayName: string
}

export interface Food {
  id: number
  name: string
  caloriesPer100g: number
  proteinPer100g?: number
  carbsPer100g?: number
  fatPer100g?: number
}

export interface FoodLogEntry {
  id: number
  name: string
  grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
  mealType: string
}

export interface DaySummary {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
  byMeal: Record<string, FoodLogEntry[]>
}

export interface Exercise {
  id: number
  name: string
  muscleGroup?: string
}

export interface WorkoutSession {
  id: number
  date: string
  name?: string
  notes?: string
  durationMinutes?: number
}

export interface WorkoutSet {
  id: number
  weightKg?: number
  reps?: number
  setNumber: number
  exercise?: Exercise
}

export interface ProfileMetrics {
  bmr: number
  tdee: number
  dailyGoal: number
  profile: {
    id: number
    email: string
    displayName: string
    heightCm?: number
    weightKg?: number
    age?: number
    sex?: string
    activityLevel?: string
    customDailyCalories?: number
  }
}

export interface DayPoint {
  date: string
  caloriesIn: number
  caloriesBurned: number
  goal: number
}