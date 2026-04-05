import { ne, sql } from "drizzle-orm";
import { db, surveysTable, questionsTable } from "@workspace/db";
import { logger } from "./logger";

type QuestionType = "single_choice" | "multiple_choice" | "text" | "rating";

interface SurveyDef {
  title: string;
  description: string;
  reward: number;
  questions: { text: string; type: QuestionType; options?: string[] }[];
}

const TOPIC_SURVEYS: SurveyDef[] = [
  {
    title: "Daily Lifestyle & Preferences",
    description: "Share your daily routines and lifestyle habits to help brands serve you better.",
    reward: 130,
    questions: [
      { text: "What time do you typically wake up on weekdays?", type: "single_choice", options: ["Before 5 AM", "5–6 AM", "6–7 AM", "7–8 AM", "After 8 AM"] },
      { text: "How would you describe your lifestyle?", type: "single_choice", options: ["Very active / outdoorsy", "Moderately active", "Mostly sedentary (office/home)", "Varies by season"] },
      { text: "Which of these best describes your diet?", type: "single_choice", options: ["Traditional Kenyan diet", "Mixed local & international", "Vegetarian / vegan", "No specific preference"] },
      { text: "How do you usually spend your evenings?", type: "multiple_choice", options: ["Watching TV/streaming", "Socialising with family/friends", "Reading or studying", "Religious activities", "Exercise or outdoor activities"] },
      { text: "How satisfied are you with your current work-life balance?", type: "rating" },
      { text: "What is your biggest daily challenge?", type: "single_choice", options: ["Traffic and commuting", "Managing finances", "Balancing work and family", "Access to quality services", "Other"] },
    ],
  },
  {
    title: "Safaricom Network Experience",
    description: "Rate your experience with Safaricom's network, data, and customer service.",
    reward: 130,
    questions: [
      { text: "How long have you been a Safaricom subscriber?", type: "single_choice", options: ["Less than 1 year", "1–3 years", "3–5 years", "More than 5 years"] },
      { text: "How would you rate Safaricom's network coverage in your area?", type: "rating" },
      { text: "Which Safaricom services do you use regularly?", type: "multiple_choice", options: ["Voice calls", "SMS", "Mobile data", "M-Pesa", "Safaricom Home Fibre", "Bonga Points"] },
      { text: "How satisfied are you with Safaricom's data speeds?", type: "rating" },
      { text: "Have you ever contacted Safaricom customer care?", type: "single_choice", options: ["Yes, and it was helpful", "Yes, but it was not helpful", "No, I haven't needed to"] },
      { text: "How likely are you to recommend Safaricom to others?", type: "rating" },
      { text: "What improvement would you most like to see from Safaricom?", type: "single_choice", options: ["Better network coverage", "Lower data prices", "Faster customer support", "More affordable call rates", "Better M-Pesa limits"] },
    ],
  },
  {
    title: "Food Preferences & Eating Habits",
    description: "Tell us about your food choices, dining habits, and favourite cuisines.",
    reward: 120,
    questions: [
      { text: "How often do you cook at home?", type: "single_choice", options: ["Every day", "Most days", "A few times a week", "Rarely", "Never"] },
      { text: "Which meal do you consider most important?", type: "single_choice", options: ["Breakfast", "Lunch", "Dinner", "All equally important"] },
      { text: "What types of food do you buy most often?", type: "multiple_choice", options: ["Ugali, rice, chapati (staples)", "Vegetables and greens", "Meat and fish", "Fruits", "Packaged/processed foods", "Dairy products"] },
      { text: "How often do you eat out or order food delivery?", type: "single_choice", options: ["Daily", "2–3 times a week", "Once a week", "Occasionally", "Rarely"] },
      { text: "What is your average monthly food budget (KSh)?", type: "single_choice", options: ["Below 3,000", "3,000–6,000", "6,000–10,000", "10,000–20,000", "Above 20,000"] },
      { text: "How important is healthy eating to you?", type: "rating" },
    ],
  },
  {
    title: "Electronics & Gadgets",
    description: "Share your preferences on smartphones, TVs, and electronic devices.",
    reward: 125,
    questions: [
      { text: "What type of smartphone do you currently use?", type: "single_choice", options: ["Android (Samsung)", "Android (Tecno/Itel/Infinix)", "Android (Other brand)", "iPhone (iOS)", "I don't have a smartphone"] },
      { text: "How much did you spend on your last phone (KSh)?", type: "single_choice", options: ["Under 5,000", "5,000–15,000", "15,000–30,000", "30,000–60,000", "Above 60,000"] },
      { text: "Which electronics do you own at home?", type: "multiple_choice", options: ["Television", "Laptop/Desktop", "Tablet", "Smart speaker", "Smart TV", "Gaming console"] },
      { text: "How often do you upgrade your smartphone?", type: "single_choice", options: ["Every year", "Every 2 years", "Every 3+ years", "Only when it breaks"] },
      { text: "Where do you usually buy electronics?", type: "single_choice", options: ["Physical shops (Jumia, Phone World, etc.)", "Online (Jumia, Kilimall)", "From friends or second-hand", "Formal retailers (Samsung store, Apple reseller)"] },
      { text: "How satisfied are you with the electronics available in Kenya?", type: "rating" },
    ],
  },
  {
    title: "Travel & Tourism in Kenya",
    description: "Share your travel experiences and preferences within Kenya and beyond.",
    reward: 130,
    questions: [
      { text: "How often do you travel within Kenya for leisure?", type: "single_choice", options: ["More than once a month", "Once a month", "Every few months", "Once a year", "Rarely"] },
      { text: "Which Kenyan destinations have you visited?", type: "multiple_choice", options: ["Maasai Mara", "Diani Beach / Mombasa coast", "Lake Nakuru / Naivasha", "Mount Kenya", "Amboseli", "Tsavo National Park"] },
      { text: "What is your preferred mode of long-distance travel in Kenya?", type: "single_choice", options: ["Private car", "SGR (Madaraka Express)", "Bus/Coach", "Matatu", "Flight"] },
      { text: "How much do you typically budget per travel trip (KSh)?", type: "single_choice", options: ["Under 5,000", "5,000–15,000", "15,000–30,000", "30,000–60,000", "Above 60,000"] },
      { text: "What matters most when choosing a travel destination?", type: "single_choice", options: ["Scenery and nature", "Cost / affordability", "Safety", "Cultural experiences", "Beach or water activities"] },
      { text: "How satisfied are you with Kenya's tourism infrastructure?", type: "rating" },
    ],
  },
  {
    title: "Health & Wellness",
    description: "Help us understand how Kenyans approach their health and wellness.",
    reward: 120,
    questions: [
      { text: "How would you rate your overall health?", type: "rating" },
      { text: "Do you have health insurance?", type: "single_choice", options: ["Yes, NHIF", "Yes, private insurance", "Both NHIF and private", "No, I don't have insurance"] },
      { text: "How often do you exercise?", type: "single_choice", options: ["Every day", "3–5 times a week", "1–2 times a week", "Rarely", "Never"] },
      { text: "What health challenges do you deal with most often?", type: "multiple_choice", options: ["Stress or mental health", "Back pain", "Respiratory issues", "Digestive problems", "Weight management", "None of these"] },
      { text: "How do you usually access healthcare?", type: "single_choice", options: ["Government hospital", "Private clinic / hospital", "Pharmacy / chemist", "Traditional medicine", "Telehealth / online doctor"] },
      { text: "How important is mental health awareness to you?", type: "rating" },
    ],
  },
  {
    title: "Fashion & Clothing Habits",
    description: "Tell us about your clothing choices, shopping behaviour, and fashion preferences.",
    reward: 120,
    questions: [
      { text: "How would you describe your personal style?", type: "single_choice", options: ["Casual and comfortable", "Smart casual", "Formal / professional", "Trendy / fashionable", "Traditional / cultural"] },
      { text: "How often do you buy new clothes?", type: "single_choice", options: ["Every month", "Every 2–3 months", "Twice a year", "Once a year", "Only when needed"] },
      { text: "Where do you usually shop for clothes?", type: "multiple_choice", options: ["Supermarkets (Tuskys, Carrefour)", "Local market / Gikomba", "Brand shops / malls", "Online (Jumia, Shein)", "Mitumba (second-hand)"] },
      { text: "How much do you spend on clothing per month (KSh)?", type: "single_choice", options: ["Under 500", "500–2,000", "2,000–5,000", "5,000–10,000", "Above 10,000"] },
      { text: "Which factor matters most when buying clothes?", type: "single_choice", options: ["Price / affordability", "Quality and durability", "Brand name", "Latest fashion trends", "Comfort and fit"] },
    ],
  },
  {
    title: "Sports & Fitness in Kenya",
    description: "Share your views on sports, fitness, and how you stay active.",
    reward: 125,
    questions: [
      { text: "Which sport do you follow most closely?", type: "single_choice", options: ["Football (EPL / local league)", "Athletics (track & field)", "Rugby", "Basketball", "Cricket", "I don't follow sports"] },
      { text: "Do you support a specific football club?", type: "single_choice", options: ["Arsenal", "Manchester United", "Chelsea", "Manchester City", "Liverpool", "A local Kenyan club", "I don't follow football"] },
      { text: "How often do you engage in physical exercise or fitness?", type: "single_choice", options: ["Daily", "3–5 times a week", "1–2 times a week", "Rarely", "Never"] },
      { text: "Where do you exercise?", type: "single_choice", options: ["At a gym", "Outdoors (running, cycling)", "At home", "Sports field / court", "I don't exercise"] },
      { text: "Have you ever participated in a running event (e.g., Nairobi Marathon)?", type: "single_choice", options: ["Yes, multiple times", "Yes, once", "No, but I plan to", "No, not interested"] },
      { text: "How satisfied are you with sports facilities in your area?", type: "rating" },
    ],
  },
  {
    title: "Banking & Financial Services",
    description: "Help financial institutions understand how Kenyans bank and manage money.",
    reward: 130,
    questions: [
      { text: "Which bank do you use as your primary bank?", type: "single_choice", options: ["Equity Bank", "KCB", "Co-operative Bank", "Absa / Barclays", "NCBA", "Stanbic", "Family Bank", "Other / None"] },
      { text: "How often do you visit a bank branch?", type: "single_choice", options: ["More than once a week", "Once a week", "Once a month", "Rarely — I use mobile/online banking", "Never"] },
      { text: "Which digital banking features do you use most?", type: "multiple_choice", options: ["Mobile app", "Internet banking", "USSD (*XXX#)", "M-Pesa / mobile money integration", "ATM withdrawals"] },
      { text: "Do you have a savings account or investment product?", type: "single_choice", options: ["Yes, savings account", "Yes, fixed deposit", "Yes, money market fund", "No, but I plan to", "No"] },
      { text: "What is your biggest frustration with banking in Kenya?", type: "single_choice", options: ["High bank charges and fees", "Long queues at branches", "Poor mobile app experience", "Loan requirements too strict", "Limited ATM access"] },
      { text: "How satisfied are you with your current bank's services?", type: "rating" },
      { text: "Have you ever taken a bank loan or credit facility?", type: "single_choice", options: ["Yes, and it was helpful", "Yes, but the terms were difficult", "No, but I've considered it", "No, I prefer to avoid debt"] },
    ],
  },
  {
    title: "Entertainment & Media",
    description: "Tell us how you consume media, music, movies, and online content.",
    reward: 120,
    questions: [
      { text: "Which streaming services do you use?", type: "multiple_choice", options: ["Netflix", "Showmax", "YouTube Premium", "Disney+", "Bongo Movies", "None — I use free platforms"] },
      { text: "How many hours per day do you spend watching TV or streaming?", type: "single_choice", options: ["Less than 1 hour", "1–2 hours", "2–4 hours", "More than 4 hours"] },
      { text: "What type of content do you enjoy most?", type: "single_choice", options: ["Movies", "TV series / dramas", "News and current affairs", "Sports", "Reality shows", "Documentaries"] },
      { text: "Which Kenyan media outlets do you follow?", type: "multiple_choice", options: ["Nation / Daily Nation", "Standard Media", "Citizen TV", "NTV", "KBC", "Online blogs / social media only"] },
      { text: "How do you mainly listen to music?", type: "single_choice", options: ["Spotify", "YouTube", "Radio", "Apple Music", "Boomplay", "Downloaded MP3s"] },
      { text: "How satisfied are you with local Kenyan content (films, shows, music)?", type: "rating" },
    ],
  },
  {
    title: "M-Pesa Usage and Satisfaction",
    description: "Tell us how you use M-Pesa and how satisfied you are with Safaricom's mobile money.",
    reward: 125,
    questions: [
      { text: "How long have you been using M-Pesa?", type: "single_choice", options: ["Less than 1 year", "1–3 years", "3–5 years", "More than 5 years"] },
      { text: "How many M-Pesa transactions do you make per week?", type: "single_choice", options: ["0–2", "3–5", "6–10", "More than 10"] },
      { text: "Which M-Pesa features do you use most?", type: "multiple_choice", options: ["Send money", "Pay bills (Lipa na M-Pesa)", "Buy airtime", "M-Pesa savings (Mali)", "Fuliza overdraft", "M-Shwari"] },
      { text: "How satisfied are you with M-Pesa transaction fees?", type: "rating" },
      { text: "Have you ever had a failed M-Pesa transaction?", type: "single_choice", options: ["Yes, frequently", "Yes, occasionally", "Yes, rarely", "No, never"] },
      { text: "How would you rate M-Pesa's overall reliability?", type: "rating" },
      { text: "What M-Pesa feature would you most like to see improved?", type: "single_choice", options: ["Lower fees", "Higher transaction limits", "Faster reversals", "Better international transfers", "Improved agent network"] },
    ],
  },
  {
    title: "Transportation & Travel Habits",
    description: "Share how you move around daily — commuting, matatus, boda bodas, and more.",
    reward: 120,
    questions: [
      { text: "What is your primary mode of daily transport?", type: "single_choice", options: ["Matatu / minibus", "Boda boda / motorcycle", "Private car", "Walk", "Bus (City Hoppa, etc.)", "Train / SGR"] },
      { text: "How much do you spend on transport per day (KSh)?", type: "single_choice", options: ["Under 100", "100–300", "300–500", "500–1,000", "Above 1,000"] },
      { text: "Do you use ride-hailing apps?", type: "single_choice", options: ["Yes, frequently (Uber, Bolt, Little)", "Yes, occasionally", "No, too expensive", "No, I prefer matatu/boda"] },
      { text: "What is your biggest frustration with public transport in Kenya?", type: "single_choice", options: ["Traffic congestion", "Unsafe driving", "High fares", "Unreliable schedules", "Poor road conditions"] },
      { text: "How satisfied are you with transport infrastructure in your area?", type: "rating" },
      { text: "Would you use an electric vehicle (EV) or e-boda if available?", type: "single_choice", options: ["Yes, definitely", "Yes, if affordable", "Maybe", "No, I prefer conventional vehicles"] },
    ],
  },
  {
    title: "Home & Living Preferences",
    description: "Tell us about your home, living situation, and household preferences.",
    reward: 120,
    questions: [
      { text: "What type of housing do you currently live in?", type: "single_choice", options: ["Owned house / apartment", "Rented apartment", "Rented room (bedsitter / single room)", "Family home", "Other"] },
      { text: "How much do you pay in monthly rent (KSh)?", type: "single_choice", options: ["Under 5,000", "5,000–10,000", "10,000–20,000", "20,000–40,000", "Above 40,000 / I own my home"] },
      { text: "Which home improvement do you most need right now?", type: "single_choice", options: ["Furniture", "Kitchen appliances", "Plumbing / piped water", "Solar / reliable electricity", "Security upgrades"] },
      { text: "Do you have access to reliable electricity at home?", type: "single_choice", options: ["Yes, KPLC — very reliable", "Yes, but with frequent outages", "Partially (generator / solar)", "No access to electricity"] },
      { text: "How satisfied are you with your current living situation?", type: "rating" },
    ],
  },
  {
    title: "Personal Goals & Future Plans",
    description: "Share your ambitions, future plans, and what you are working towards.",
    reward: 120,
    questions: [
      { text: "What is your most important personal goal right now?", type: "single_choice", options: ["Building or buying a home", "Growing my business or career", "Saving and investing", "Completing education", "Improving health and fitness", "Starting a family"] },
      { text: "In how many years do you plan to own a home?", type: "single_choice", options: ["I already own one", "Within 2 years", "2–5 years", "5–10 years", "Not a current priority"] },
      { text: "Are you currently saving or investing?", type: "single_choice", options: ["Yes, regularly", "Yes, occasionally", "I want to but can't afford to", "No"] },
      { text: "Which financial goal is most important to you?", type: "single_choice", options: ["Emergency fund", "Retirement savings", "Investment portfolio", "Education fund", "Starting a business"] },
      { text: "How confident are you in achieving your goals in the next 5 years?", type: "rating" },
      { text: "What is your main barrier to achieving financial goals?", type: "single_choice", options: ["Low income", "High living costs", "Lack of savings discipline", "Lack of financial knowledge", "Unexpected expenses"] },
    ],
  },
  {
    title: "Communication & Social Habits",
    description: "Help us understand how Kenyans communicate and use social media daily.",
    reward: 120,
    questions: [
      { text: "Which social media platforms do you use daily?", type: "multiple_choice", options: ["WhatsApp", "Facebook", "TikTok", "Instagram", "Twitter / X", "YouTube", "Telegram"] },
      { text: "How many hours per day do you spend on social media?", type: "single_choice", options: ["Less than 1 hour", "1–2 hours", "2–4 hours", "More than 4 hours"] },
      { text: "What do you mainly use WhatsApp for?", type: "multiple_choice", options: ["Personal chats", "Family groups", "Business / work communication", "Community groups", "Sending money (WhatsApp Pay)"] },
      { text: "How do you prefer to communicate with businesses?", type: "single_choice", options: ["WhatsApp", "Phone call", "Email", "SMS", "Social media DM"] },
      { text: "How comfortable are you sharing personal information online?", type: "rating" },
    ],
  },
];

export async function ensureTopicSurveys(): Promise<void> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(surveysTable)
    .where(ne(surveysTable.title, "Welcome Bonus Survey"));

  if (count > 0) {
    logger.info({ count }, "Topic surveys already present, skipping seed");
    return;
  }

  logger.info("No topic surveys found — seeding now");

  for (const def of TOPIC_SURVEYS) {
    const [survey] = await db
      .insert(surveysTable)
      .values({
        title: def.title,
        description: def.description,
        reward: def.reward,
        isPublished: true,
      })
      .returning({ id: surveysTable.id });

    await db.insert(questionsTable).values(
      def.questions.map((q, i) => ({
        surveyId: survey.id,
        text: q.text,
        type: q.type,
        options: q.options ? JSON.stringify(q.options) : null,
        orderIndex: i,
        required: true,
      }))
    );
  }

  logger.info({ count: TOPIC_SURVEYS.length }, "Topic surveys seeded successfully");
}
