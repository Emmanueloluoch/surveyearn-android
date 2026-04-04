import { db, surveysTable, questionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

type QuestionType = "single_choice" | "multiple_choice" | "text" | "rating";

interface SurveyDef {
  title: string;
  description: string;
  reward: number;
  questions: {
    text: string;
    type: QuestionType;
    options?: string[];
  }[];
}

const SURVEYS: SurveyDef[] = [
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
    title: "Equity Bank Digital Services",
    description: "Share your experience with Equity Bank's app, Equitel, and digital banking.",
    reward: 125,
    questions: [
      { text: "Are you an Equity Bank customer?", type: "single_choice", options: ["Yes, primary bank", "Yes, secondary bank", "No, but I've used their services", "No, I'm not a customer"] },
      { text: "Which Equity Bank digital products do you use?", type: "multiple_choice", options: ["Equity Mobile app", "Equitel SIM", "EazzyBanking (USSD)", "Equity Online (web)", "Eazzy Biz (business)", "None"] },
      { text: "How would you rate the Equity Mobile app experience?", type: "rating" },
      { text: "How often do you use Equitel or Equity Mobile for transactions?", type: "single_choice", options: ["Several times a day", "Daily", "A few times a week", "Occasionally", "Never"] },
      { text: "What feature do you use most on Equity digital platforms?", type: "single_choice", options: ["Money transfers", "Bill payments", "Loan requests", "Account balance checks", "Savings/investments"] },
      { text: "What improvement would most benefit Equity's digital services?", type: "single_choice", options: ["Faster transaction speeds", "Lower transaction fees", "Better app design", "More loan products", "Improved customer support"] },
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
  {
    title: "Bidco Consumer Products Survey",
    description: "Rate your experience with Bidco products used in everyday Kenyan homes.",
    reward: 125,
    questions: [
      { text: "Which Bidco products do you use regularly?", type: "multiple_choice", options: ["Cooking oil (Elianto, Golden Fry)", "Laundry soap (Lemon, Fresh Care)", "Bathing soap (Bidco bar soap)", "Margarine (Blueband)", "Toothpaste (Toothpick brand)", "None"] },
      { text: "How often do you buy Bidco cooking oil?", type: "single_choice", options: ["Every week", "Every 2 weeks", "Once a month", "Less often", "I don't buy Bidco oil"] },
      { text: "How would you rate the quality of Bidco products?", type: "rating" },
      { text: "Where do you usually purchase Bidco products?", type: "single_choice", options: ["Supermarket", "Local duka / kiosk", "Market", "Wholesale shop", "Online"] },
      { text: "How does Bidco compare to competing brands?", type: "single_choice", options: ["Much better", "Slightly better", "About the same", "Slightly worse", "Much worse"] },
      { text: "Would you recommend Bidco products to others?", type: "single_choice", options: ["Definitely yes", "Probably yes", "Not sure", "Probably not", "Definitely not"] },
    ],
  },
  {
    title: "Entertainment & Leisure Preferences",
    description: "Tell us how you spend your leisure time and what entertainment you enjoy.",
    reward: 120,
    questions: [
      { text: "How do you most often spend your weekends?", type: "multiple_choice", options: ["Visiting family/friends", "Going to church", "Watching sport or movies", "Shopping / running errands", "Outdoor activities", "Relaxing at home"] },
      { text: "How often do you go to a cinema or live event?", type: "single_choice", options: ["Weekly", "Monthly", "A few times a year", "Rarely", "Never"] },
      { text: "Which leisure activity do you enjoy most?", type: "single_choice", options: ["Watching movies or series", "Music and concerts", "Outdoor & nature activities", "Sports and fitness", "Socialising with friends", "Gaming"] },
      { text: "How much do you spend on entertainment per month (KSh)?", type: "single_choice", options: ["Under 500", "500–2,000", "2,000–5,000", "5,000–10,000", "Above 10,000"] },
      { text: "How satisfied are you with entertainment options in your city?", type: "rating" },
    ],
  },
  {
    title: "KCB Mobile Banking Experience",
    description: "Share your experience with KCB's mobile app, KCB M-Pesa, and digital services.",
    reward: 125,
    questions: [
      { text: "Are you a KCB customer?", type: "single_choice", options: ["Yes, primary bank", "Yes, secondary account", "No, but I've used KCB M-Pesa", "No, I'm not a customer"] },
      { text: "Which KCB digital services do you use?", type: "multiple_choice", options: ["KCB Mobile App", "KCB M-Pesa", "USSD (*522#)", "KCB Internet banking", "KCB Mobi Loan", "None"] },
      { text: "How would you rate the KCB Mobile app?", type: "rating" },
      { text: "How quickly does KCB resolve customer complaints?", type: "single_choice", options: ["Very quickly (same day)", "Within a few days", "It takes over a week", "They rarely resolve issues", "I've never had a complaint"] },
      { text: "Have you used KCB Mobi Loan or any KCB loan product?", type: "single_choice", options: ["Yes, and it was great", "Yes, but terms were tough", "No, but I plan to", "No, not interested"] },
      { text: "What would improve your KCB experience most?", type: "single_choice", options: ["Lower fees", "Faster app", "Better loan rates", "More branches / ATMs", "Improved customer support"] },
      { text: "How likely are you to recommend KCB to a friend?", type: "rating" },
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
    title: "Airtel Kenya Service Quality",
    description: "Rate your experience with Airtel Kenya's network, data bundles, and Airtel Money.",
    reward: 120,
    questions: [
      { text: "Are you an Airtel Kenya subscriber?", type: "single_choice", options: ["Yes, as primary line", "Yes, as secondary line", "I was but moved to another provider", "No"] },
      { text: "How would you rate Airtel's network coverage in your area?", type: "rating" },
      { text: "Which Airtel services do you use?", type: "multiple_choice", options: ["Voice calls", "Mobile data", "Airtel Money", "Airtel TV", "SMS bundles"] },
      { text: "How do Airtel's data bundle prices compare to competitors?", type: "single_choice", options: ["Much cheaper", "Slightly cheaper", "About the same", "Slightly more expensive", "Much more expensive"] },
      { text: "Have you used Airtel Money?", type: "single_choice", options: ["Yes, regularly", "Yes, occasionally", "No, I use M-Pesa instead", "No, I don't use mobile money"] },
      { text: "What would make you switch to or stay with Airtel?", type: "single_choice", options: ["Better network coverage", "Cheaper data bundles", "Better customer service", "More Airtel Money features", "Nothing — I prefer Safaricom"] },
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
    title: "Co-operative Bank Customer Survey",
    description: "Share your experience with Co-op Bank's services, MCo-opCash, and digital tools.",
    reward: 125,
    questions: [
      { text: "Are you a Co-operative Bank customer?", type: "single_choice", options: ["Yes, primary bank", "Yes, secondary account", "No, but I've used MCo-opCash", "No, I'm not a customer"] },
      { text: "Which Co-op Bank services do you use?", type: "multiple_choice", options: ["MCo-opCash mobile app", "Co-op Online (internet banking)", "USSD (*667#)", "ATM banking", "Fixed deposit / savings"] },
      { text: "How would you rate the MCo-opCash app experience?", type: "rating" },
      { text: "How often do you use MCo-opCash for transactions?", type: "single_choice", options: ["Several times a day", "Daily", "A few times a week", "Occasionally", "Never"] },
      { text: "What do you like most about Co-operative Bank?", type: "single_choice", options: ["Good interest rates on savings", "Wide branch network", "Fair loan terms", "Easy mobile banking", "Good customer service"] },
      { text: "How likely are you to recommend Co-op Bank to a colleague or friend?", type: "rating" },
      { text: "What is one thing Co-op Bank could improve?", type: "single_choice", options: ["Faster loan approvals", "Reduced bank charges", "Better mobile app", "More ATM locations", "Improved online support"] },
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
    title: "M-Pesa Usage and Satisfaction",
    description: "Tell us how you use M-Pesa and how satisfied you are with Safaricom's mobile money.",
    reward: 125,
    questions: [
      { text: "How long have you been using M-Pesa?", type: "single_choice", options: ["Less than 1 year", "1–3 years", "3–5 years", "More than 5 years"] },
      { text: "Which M-Pesa services do you use most?", type: "multiple_choice", options: ["Sending money to individuals", "Paying bills (KPLC, water, etc.)", "Buying goods (Lipa na M-Pesa)", "M-Pesa savings (M-Shwari, KCB M-Pesa)", "Withdrawing cash at agents", "Fuliza (overdraft)"] },
      { text: "How satisfied are you with M-Pesa transaction charges?", type: "rating" },
      { text: "Do you use Fuliza (M-Pesa overdraft)?", type: "single_choice", options: ["Yes, regularly", "Yes, occasionally", "No, never used it", "No, I don't qualify"] },
      { text: "How does M-Pesa compare to alternatives (Airtel Money, T-Kash)?", type: "single_choice", options: ["Much better", "Slightly better", "About the same", "Slightly worse", "I only use M-Pesa"] },
      { text: "How often do you use Lipa na M-Pesa for in-store purchases?", type: "single_choice", options: ["Every day", "Most days", "A few times a week", "Occasionally", "Never — I prefer cash"] },
      { text: "How likely are you to continue using M-Pesa in the next 12 months?", type: "rating" },
    ],
  },
  {
    title: "Money Management & Spending Habits",
    description: "Help us understand how Kenyans budget, save, and manage their finances.",
    reward: 120,
    questions: [
      { text: "Do you follow a monthly budget?", type: "single_choice", options: ["Yes, strictly", "Yes, loosely", "I try but often fail", "No, I don't budget"] },
      { text: "What percentage of your income do you save each month?", type: "single_choice", options: ["I save nothing", "Less than 10%", "10–20%", "20–30%", "More than 30%"] },
      { text: "Which expenses take the largest share of your monthly income?", type: "multiple_choice", options: ["Rent / housing", "Food and groceries", "Transport", "School fees or education", "Healthcare", "Entertainment and social"] },
      { text: "Do you use any investment or savings platform?", type: "multiple_choice", options: ["M-Shwari", "KCB M-Pesa", "Sacco / chama", "Money market fund", "Fixed deposit", "None"] },
      { text: "How confident are you in managing your personal finances?", type: "rating" },
      { text: "What is your biggest financial challenge?", type: "single_choice", options: ["Irregular or low income", "Too many expenses", "No savings habit", "Debt repayment", "Lack of financial literacy"] },
    ],
  },
  {
    title: "East African Breweries Brand Survey",
    description: "Share your experiences with EABL brands like Tusker, Guinness, and Senator.",
    reward: 130,
    questions: [
      { text: "Do you consume alcoholic beverages?", type: "single_choice", options: ["Yes, regularly", "Yes, occasionally (social settings)", "Rarely", "No, I don't drink alcohol"] },
      { text: "Which EABL brands have you consumed?", type: "multiple_choice", options: ["Tusker Lager", "Guinness", "White Cap", "Senator Keg", "Smirnoff Ice", "Johnnie Walker", "None"] },
      { text: "What is your preferred beverage at a social gathering?", type: "single_choice", options: ["Beer", "Spirits (whisky, vodka)", "Wine", "Soft drink / juice", "Water"] },
      { text: "Where do you most often consume EABL products?", type: "single_choice", options: ["Bar or pub", "Restaurant", "Home", "Events / parties", "I don't consume them"] },
      { text: "How would you rate Tusker Lager's quality?", type: "rating" },
      { text: "Do responsible drinking campaigns influence your consumption habits?", type: "single_choice", options: ["Yes, significantly", "Yes, slightly", "Not really", "No"] },
    ],
  },
  {
    title: "Weather & Environment Preferences",
    description: "Share your views on Kenya's climate, environment, and sustainability.",
    reward: 120,
    questions: [
      { text: "Which Kenyan climate do you prefer?", type: "single_choice", options: ["Cool highlands (Nairobi, Nyeri)", "Hot and dry (Nairobi east, Rift)", "Warm and coastal (Mombasa)", "Hot semi-arid (Kitui, Garissa)", "No strong preference"] },
      { text: "How concerned are you about climate change in Kenya?", type: "rating" },
      { text: "What environmental issues affect your daily life most?", type: "multiple_choice", options: ["Flooding and poor drainage", "Drought and water shortages", "Air pollution (dust, smoke)", "Garbage and waste management", "Deforestation", "Erratic or unreliable rains"] },
      { text: "Do you actively practice environmental conservation?", type: "single_choice", options: ["Yes, e.g. recycling, tree planting", "Somewhat — I try to reduce waste", "Not really", "No"] },
      { text: "How do you dispose of household waste?", type: "single_choice", options: ["County garbage collection", "Private waste collector", "Burning", "Open dumping (near the house)", "Composting"] },
    ],
  },
  {
    title: "Britam Insurance Awareness Survey",
    description: "Share your knowledge and experience with Britam insurance products.",
    reward: 125,
    questions: [
      { text: "Are you aware of Britam as an insurance and investment company?", type: "single_choice", options: ["Yes, very familiar", "Yes, I've heard of them", "Slightly familiar", "No, I've never heard of them"] },
      { text: "Do you currently hold a Britam insurance policy?", type: "single_choice", options: ["Yes, life insurance", "Yes, health insurance", "Yes, motor insurance", "Yes, other product", "No, I don't have Britam insurance"] },
      { text: "What type of insurance do you currently have?", type: "multiple_choice", options: ["NHIF / health insurance", "Life insurance", "Motor vehicle insurance", "Home insurance", "Education policy", "None"] },
      { text: "What is your main reason for not having private insurance?", type: "single_choice", options: ["Too expensive", "I rely on NHIF", "I don't trust insurance companies", "I don't know how to buy it", "I already have insurance"] },
      { text: "How important do you think insurance is for financial security?", type: "rating" },
      { text: "Would you consider buying Britam insurance in the next 12 months?", type: "single_choice", options: ["Yes, definitely", "Possibly, I'll consider it", "Unlikely", "No"] },
    ],
  },
  {
    title: "Digital Technology Usage Survey",
    description: "Tell us how you use the internet, apps, and digital tools in everyday life.",
    reward: 120,
    questions: [
      { text: "How do you primarily access the internet?", type: "single_choice", options: ["Mobile data (Safaricom)", "Mobile data (Airtel)", "Home Wi-Fi broadband", "Office / school Wi-Fi", "A combination of the above"] },
      { text: "Which apps do you use daily?", type: "multiple_choice", options: ["WhatsApp", "TikTok", "YouTube", "Facebook", "Twitter / X", "Google / Chrome", "M-Pesa app"] },
      { text: "How do you primarily make online payments?", type: "single_choice", options: ["M-Pesa", "Visa / debit card", "Airtel Money", "Bank transfer", "I don't buy things online"] },
      { text: "Have you ever shopped on an e-commerce platform?", type: "single_choice", options: ["Yes, regularly (Jumia, Kilimall, etc.)", "Yes, occasionally", "No, but I've considered it", "No"] },
      { text: "How comfortable are you with using technology for daily tasks?", type: "rating" },
      { text: "What is your biggest concern about using the internet in Kenya?", type: "single_choice", options: ["Cybercrime and fraud", "High data costs", "Unreliable internet connection", "Privacy and data security", "I have no major concerns"] },
    ],
  },
  {
    title: "Community & Social Life Survey",
    description: "Share how you engage with your community, neighbours, and social circles.",
    reward: 120,
    questions: [
      { text: "How would you describe your community?", type: "single_choice", options: ["Very close-knit and supportive", "Friendly but mostly private", "Mixed — depends on neighbours", "Not very connected"] },
      { text: "Are you a member of a chama, sacco, or community group?", type: "single_choice", options: ["Yes, a chama (investment group)", "Yes, a sacco", "Yes, a church or community group", "Yes, multiple groups", "No"] },
      { text: "How often do you attend community events?", type: "single_choice", options: ["Weekly", "Monthly", "A few times a year", "Rarely", "Never"] },
      { text: "What community issues matter most to you?", type: "multiple_choice", options: ["Security and crime", "Youth unemployment", "Education quality", "Clean water and sanitation", "Healthcare access", "Roads and infrastructure"] },
      { text: "How safe do you feel in your neighbourhood?", type: "rating" },
    ],
  },
  {
    title: "Healthcare Access in Kenya",
    description: "Help improve healthcare by sharing how you access medical services in Kenya.",
    reward: 125,
    questions: [
      { text: "How far is the nearest healthcare facility from your home?", type: "single_choice", options: ["Less than 1 km", "1–5 km", "5–10 km", "More than 10 km"] },
      { text: "What type of healthcare facility do you most often use?", type: "single_choice", options: ["Government hospital (Level 4/5)", "Government health centre / dispensary", "Private clinic or hospital", "Pharmacy / chemist", "Traditional healer"] },
      { text: "Do you have health insurance?", type: "single_choice", options: ["Yes, NHIF only", "Yes, private insurance only", "Both NHIF and private", "No insurance"] },
      { text: "What is your biggest challenge accessing healthcare in Kenya?", type: "multiple_choice", options: ["High medical costs", "Long waiting times", "Distance to nearest facility", "Drug shortages", "Poor quality of care", "Lack of specialists"] },
      { text: "Have you ever used telehealth or an online doctor service?", type: "single_choice", options: ["Yes, regularly", "Yes, once or twice", "No, but I'd like to try", "No, I prefer in-person visits"] },
      { text: "How would you rate the quality of healthcare services in Kenya?", type: "rating" },
    ],
  },
];

async function seed() {
  console.log(`Seeding ${SURVEYS.length} surveys...`);

  for (const surveyDef of SURVEYS) {
    const existing = await db
      .select({ id: surveysTable.id })
      .from(surveysTable)
      .where(eq(surveysTable.title, surveyDef.title))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  SKIP: "${surveyDef.title}" already exists`);
      continue;
    }

    const [survey] = await db
      .insert(surveysTable)
      .values({
        title: surveyDef.title,
        description: surveyDef.description,
        reward: surveyDef.reward,
        isPublished: true,
      })
      .returning({ id: surveysTable.id });

    await db.insert(questionsTable).values(
      surveyDef.questions.map((q, i) => ({
        surveyId: survey.id,
        text: q.text,
        type: q.type,
        options: q.options ? JSON.stringify(q.options) : null,
        orderIndex: i,
        required: true,
      }))
    );

    console.log(`  OK: "${surveyDef.title}" (${surveyDef.questions.length} questions, KSh ${surveyDef.reward})`);
  }

  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
