export interface SurveyMeta {
  category: string;
  company: string;
  icon: string;
  iconColor: string;
  minutesPerQ: number;
}

const META: Record<string, SurveyMeta> = {
  "Daily Lifestyle & Preferences":    { category: "Lifestyle",          company: "Kantar Research Kenya",      icon: "sun",         iconColor: "#f59e0b", minutesPerQ: 0.6 },
  "Safaricom Network Experience":     { category: "Telecom",            company: "Safaricom",                  icon: "wifi",        iconColor: "#00b33c", minutesPerQ: 0.7 },
  "Food Preferences & Eating Habits": { category: "Food",               company: "EABL Foods Research",        icon: "coffee",      iconColor: "#d97706", minutesPerQ: 0.65 },
  "Electronics & Gadgets":            { category: "Technology",         company: "Kenya Tech Research",        icon: "monitor",     iconColor: "#6366f1", minutesPerQ: 0.6 },
  "Travel & Tourism in Kenya":        { category: "Travel",             company: "Kenya Tourism Board",        icon: "map-pin",     iconColor: "#0ea5e9", minutesPerQ: 0.65 },
  "Health & Wellness":                { category: "Health",             company: "Kenya Ministry of Health",   icon: "heart",       iconColor: "#ef4444", minutesPerQ: 0.65 },
  "Fashion & Clothing Habits":        { category: "Fashion",            company: "Textile Research Kenya",     icon: "shopping-bag",iconColor: "#ec4899", minutesPerQ: 0.6 },
  "Sports & Fitness in Kenya":        { category: "Sports",             company: "SportPesa Research",         icon: "activity",    iconColor: "#f97316", minutesPerQ: 0.5 },
  "Banking & Financial Services":     { category: "Finance",            company: "Kenya Bankers Association",  icon: "dollar-sign", iconColor: "#22c55e", minutesPerQ: 0.7 },
  "Entertainment & Media":            { category: "Entertainment",      company: "Nation Media Group",         icon: "tv",          iconColor: "#8b5cf6", minutesPerQ: 0.6 },
  "Equity Bank Digital Services":     { category: "Banking",            company: "Equity Bank",                icon: "credit-card", iconColor: "#0369a1", minutesPerQ: 0.65 },
  "Communication & Social Habits":    { category: "Social",             company: "Kenya Communication Res.",   icon: "message-circle",iconColor:"#14b8a6", minutesPerQ: 0.6 },
  "Bidco Consumer Products Survey":   { category: "Consumer Products",  company: "Bidco Africa",               icon: "package",     iconColor: "#f59e0b", minutesPerQ: 0.65 },
  "Entertainment & Leisure Preferences":{ category: "Entertainment",   company: "Standard Media Group",       icon: "film",        iconColor: "#8b5cf6", minutesPerQ: 0.6 },
  "KCB Mobile Banking Experience":    { category: "Banking",            company: "KCB Bank",                   icon: "credit-card", iconColor: "#1e40af", minutesPerQ: 0.7 },
  "Transportation & Travel Habits":   { category: "Transport",          company: "Kenya Roads Board",          icon: "truck",       iconColor: "#78716c", minutesPerQ: 0.65 },
  "Airtel Kenya Service Quality":     { category: "Telecom",            company: "Airtel Kenya",               icon: "radio",       iconColor: "#ef4444", minutesPerQ: 0.65 },
  "Home & Living Preferences":        { category: "Lifestyle",          company: "HomeAfrica Research",        icon: "home",        iconColor: "#84cc16", minutesPerQ: 0.6 },
  "Co-operative Bank Customer Survey":{ category: "Banking",            company: "Co-operative Bank",          icon: "briefcase",   iconColor: "#0891b2", minutesPerQ: 0.7 },
  "Personal Goals & Future Plans":    { category: "Personal Development",company: "Strathmore University",    icon: "target",      iconColor: "#a855f7", minutesPerQ: 0.65 },
  "M-Pesa Usage and Satisfaction":    { category: "Mobile Money",       company: "Safaricom",                  icon: "smartphone",  iconColor: "#00b33c", minutesPerQ: 0.6 },
  "Money Management & Spending Habits":{ category: "Finance",           company: "Central Bank of Kenya",     icon: "trending-up", iconColor: "#22c55e", minutesPerQ: 0.65 },
  "East African Breweries Brand Survey":{ category: "Consumer Products",company: "East African Breweries",    icon: "award",       iconColor: "#f59e0b", minutesPerQ: 0.65 },
  "Weather & Environment Preferences":{ category: "Environment",        company: "Kenya Meteorological Dept", icon: "cloud",       iconColor: "#64748b", minutesPerQ: 0.6 },
  "Britam Insurance Awareness Survey":{ category: "Insurance",          company: "Britam Insurance",           icon: "shield",      iconColor: "#7c3aed", minutesPerQ: 0.7 },
  "Digital Technology Usage Survey":  { category: "Technology",         company: "Kenya Tech Research",        icon: "cpu",         iconColor: "#6366f1", minutesPerQ: 0.65 },
  "Community & Social Life Survey":   { category: "Social",             company: "Kenya National Bureau",      icon: "users",       iconColor: "#14b8a6", minutesPerQ: 0.6 },
  "Healthcare Access in Kenya":       { category: "Health",             company: "Ministry of Health Kenya",   icon: "plus-circle", iconColor: "#ef4444", minutesPerQ: 0.7 },
  "Welcome Bonus Survey":             { category: "Onboarding",         company: "SurveyPesa KE",              icon: "gift",        iconColor: "#00b33c", minutesPerQ: 0.5 },
};

export const FALLBACK_META: SurveyMeta = {
  category: "General", company: "SurveyPesa KE", icon: "clipboard", iconColor: "#00b33c", minutesPerQ: 0.65,
};

export function getSurveyMeta(title: string): SurveyMeta {
  return META[title] ?? FALLBACK_META;
}

export function estimateMinutes(questionCount: number, minutesPerQ: number): string {
  const mins = Math.max(1, Math.round(questionCount * minutesPerQ));
  return `${mins} min`;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "Telecom":            { bg: "#dcfce7", text: "#15803d" },
  "Food":               { bg: "#fef3c7", text: "#92400e" },
  "Technology":         { bg: "#ede9fe", text: "#6d28d9" },
  "Travel":             { bg: "#e0f2fe", text: "#0369a1" },
  "Health":             { bg: "#fee2e2", text: "#b91c1c" },
  "Fashion":            { bg: "#fce7f3", text: "#9d174d" },
  "Sports":             { bg: "#ffedd5", text: "#c2410c" },
  "Finance":            { bg: "#dcfce7", text: "#15803d" },
  "Entertainment":      { bg: "#f3e8ff", text: "#7e22ce" },
  "Banking":            { bg: "#dbeafe", text: "#1d4ed8" },
  "Social":             { bg: "#ccfbf1", text: "#0f766e" },
  "Consumer Products":  { bg: "#fef9c3", text: "#854d0e" },
  "Transport":          { bg: "#f5f5f4", text: "#44403c" },
  "Lifestyle":          { bg: "#ecfccb", text: "#3f6212" },
  "Mobile Money":       { bg: "#dcfce7", text: "#166534" },
  "Environment":        { bg: "#f0fdf4", text: "#15803d" },
  "Insurance":          { bg: "#f3e8ff", text: "#6b21a8" },
  "Personal Development":{ bg: "#faf5ff", text: "#7c3aed" },
  "Onboarding":         { bg: "#dcfce7", text: "#15803d" },
  "General":            { bg: "#f3f4f6", text: "#374151" },
};

export function getCategoryColors(category: string): { bg: string; text: string } {
  return CATEGORY_COLORS[category] ?? { bg: "#f3f4f6", text: "#374151" };
}
