import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.json');

// Helper to check if file exists
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Initial state of the database with mock users for leaderboard calculation
const DEFAULT_DB = {
  profile: {
    name: 'Pallavi',
    city: 'Mumbai',
    familySize: 4,
    electricityRate: 7.5, // INR per kWh
    emissionFactor: 0.82, // kg CO2 / kWh for Indian grid
  },
  bills: [],
  travelLogs: [],
  streakLogs: [], // array of objects: { date: 'YYYY-MM-DD', electricityCheck: bool, waterCheck: bool, travelCheck: bool }
  chatHistory: [], // array of objects: { role: 'user'|'model', text: string, timestamp: Date }
  // Mock users database to rank the user against (real live percentile calculation!)
  leaderboardUsers: [
    { name: 'Sneha Gupta', city: 'Bengaluru', savings: 1850, ecoScore: 92, ecoCoins: 850 },
    { name: 'Priya Patel', city: 'Ahmedabad', savings: 1420, ecoScore: 86, ecoCoins: 680 },
    { name: 'Aarav Sharma', city: 'Delhi', savings: 1100, ecoScore: 78, ecoCoins: 510 },
    { name: 'Amit Singh', city: 'Pune', savings: 680, ecoScore: 65, ecoCoins: 320 },
    { name: 'Vikram Mehta', city: 'Mumbai', savings: 250, ecoScore: 48, ecoCoins: 120 }
  ]
};

// Thread-safe lock / simple queue for writing
let writeQueue = Promise.resolve();

async function readDb() {
  try {
    if (!(await fileExists(DB_PATH))) {
      await writeDb(DEFAULT_DB);
      return DEFAULT_DB;
    }
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database file, returning defaults:', error);
    return DEFAULT_DB;
  }
}

async function writeDb(data) {
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing to database:', error);
    }
  });
  return writeQueue;
}

// Database helper functions
export const db = {
  // Get entire database state
  async getState() {
    return await readDb();
  },

  // Reset database (for testing)
  async reset() {
    await writeDb(DEFAULT_DB);
    return DEFAULT_DB;
  },

  // User Profile
  async getProfile() {
    const state = await readDb();
    return state.profile;
  },

  async updateProfile(profileUpdates) {
    const state = await readDb();
    state.profile = { ...state.profile, ...profileUpdates };
    await writeDb(state);
    return state.profile;
  },

  // Bill Intelligence
  async getBills() {
    const state = await readDb();
    return state.bills;
  },

  async addBill(bill) {
    const state = await readDb();
    const newBill = {
      id: 'bill_' + Date.now(),
      dateAdded: new Date().toISOString(),
      ...bill
    };
    state.bills.push(newBill);
    await writeDb(state);
    return newBill;
  },

  // Travel Tracker
  async getTravelLogs() {
    const state = await readDb();
    return state.travelLogs;
  },

  async addTravelLog(log) {
    const state = await readDb();
    const newLog = {
      id: 'travel_' + Date.now(),
      dateAdded: new Date().toISOString(),
      ...log
    };
    state.travelLogs.push(newLog);
    await writeDb(state);
    return newLog;
  },

  // Daily Streak
  async getStreakLogs() {
    const state = await readDb();
    return state.streakLogs;
  },

  async addStreakCheckIn(checkIn) {
    // checkIn: { date: 'YYYY-MM-DD', electricityCheck: bool, waterCheck: bool, travelCheck: bool }
    const state = await readDb();
    
    // Remove if check-in for this date already exists (update it)
    state.streakLogs = state.streakLogs.filter(log => log.date !== checkIn.date);
    
    state.streakLogs.push({
      ...checkIn,
      timestamp: new Date().toISOString()
    });
    
    // Sort logs by date ascending
    state.streakLogs.sort((a, b) => a.date.localeCompare(b.date));
    
    await writeDb(state);
    return checkIn;
  },

  // Chat History (Leak Assistant)
  async getChatHistory() {
    const state = await readDb();
    return state.chatHistory;
  },

  async addChatMessage(role, text) {
    const state = await readDb();
    const newMsg = {
      id: 'msg_' + Date.now(),
      role,
      text,
      timestamp: new Date().toISOString()
    };
    state.chatHistory.push(newMsg);
    // Limit chat history length to avoid huge payload size
    if (state.chatHistory.length > 50) {
      state.chatHistory.shift();
    }
    await writeDb(state);
    return newMsg;
  },

  // Dynamic calculations for streak and statistics
  async getStats() {
    const state = await readDb();
    const profile = state.profile;
    
    // 1. Calculate Streaks dynamically
    const streakLogs = state.streakLogs || [];
    let currentStreak = 0;
    
    if (streakLogs.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      
      // Get yesterday's date string
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Gather all unique check-in dates
      const checkInDates = new Set(streakLogs.map(log => log.date));
      
      // Check if user has checked in today or yesterday to continue the streak
      let checkDate = null;
      if (checkInDates.has(todayStr)) {
        checkDate = new Date(todayStr);
      } else if (checkInDates.has(yesterdayStr)) {
        checkDate = new Date(yesterdayStr);
      }
      
      if (checkDate) {
        currentStreak = 1;
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const checkDateStr = checkDate.toISOString().split('T')[0];
          if (checkInDates.has(checkDateStr)) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // 2. Sum Savings from Bills
    let electricitySavingsRupees = 0;
    let electricitySavedKWh = 0;
    let electricityCO2SavedKg = 0;
    
    state.bills.forEach(bill => {
      electricitySavingsRupees += Number(bill.savingsPotentialRupees || 0);
      electricitySavedKWh += Number(bill.savedKWh || 0);
      electricityCO2SavedKg += Number(bill.co2SavedKg || 0);
    });

    // 3. Sum Savings from Travel Tracker
    let travelSavingsRupees = 0;
    let travelCO2SavedKg = 0;
    
    state.travelLogs.forEach(log => {
      travelSavingsRupees += Number(log.savingsRupees || 0);
      travelCO2SavedKg += Number(log.co2SavedKg || 0);
    });

    // 4. Sum Savings from Water/Leak Assistant check-ins
    // We award ₹30 saved per water-conservation streak check-in
    // We award ₹150 saved for leak fixes submitted in check-ins
    let waterSavingsRupees = 0;
    let waterCO2SavedKg = 0;
    
    streakLogs.forEach(log => {
      if (log.waterCheck) {
        waterSavingsRupees += 30; // ₹30 saved per dry/efficient day
        waterCO2SavedKg += 0.5; // ~0.5kg CO2 saved (pumping/filtering electricity offset)
      }
    });

    // Total dynamic savings
    const totalSavingsRupees = electricitySavingsRupees + travelSavingsRupees + waterSavingsRupees;
    const totalCO2SavedKg = electricityCO2SavedKg + travelCO2SavedKg + waterCO2SavedKg;

    // 5. EcoCoins Calculation
    // Commented Formula:
    // - 1 EcoCoin awarded for every ₹10 saved
    // - 15 EcoCoins awarded per day of active streak
    // - 5 EcoCoins awarded per individual daily check-in logged
    const savingsCoins = Math.floor(totalSavingsRupees / 10);
    const streakCoins = currentStreak * 15;
    const checkInCoins = streakLogs.length * 5;
    const totalEcoCoins = savingsCoins + streakCoins + checkInCoins;

    // 6. Dynamic EcoScore (out of 100)
    // - Streak factor: up to 30 points (3 points per streak day, max 30)
    // - Carbon factor: up to 40 points (1 point per 2 kg CO2 saved, max 40)
    // - Action factor: up to 30 points (10 points per uploaded bill or travel route log, max 30)
    const streakPoints = Math.min(30, currentStreak * 3);
    const carbonPoints = Math.min(40, Math.floor(totalCO2SavedKg / 2));
    const actionPoints = Math.min(30, (state.bills.length * 10) + (state.travelLogs.length * 10));
    const ecoScore = Math.max(45, Math.min(100, 45 + streakPoints + carbonPoints + actionPoints)); // Starts at 45 (base score)

    // 7. Ranking / Percentile calculation against mock database
    const allUsers = [
      ...state.leaderboardUsers,
      { name: profile.name, city: profile.city, savings: totalSavingsRupees, ecoScore: ecoScore, ecoCoins: totalEcoCoins }
    ];
    
    // Sort all users by EcoScore (primary) and savings (secondary) descending
    allUsers.sort((a, b) => {
      if (b.ecoScore !== a.ecoScore) {
        return b.ecoScore - a.ecoScore;
      }
      return b.savings - a.savings;
    });

    const userRankIndex = allUsers.findIndex(u => u.name === profile.name);
    const leaderboardRank = userRankIndex + 1;
    const totalUsers = allUsers.length;
    
    // Percentile = (Total - Rank) / (Total - 1) * 100
    // E.g., Rank 1 out of 6 -> 5/5 * 100 = 100th percentile (Top 1%)
    // Rank 3 out of 6 -> 3/5 * 100 = 60th percentile (Top 40%)
    const percentileVal = totalUsers > 1 
      ? Math.round(((totalUsers - leaderboardRank) / (totalUsers - 1)) * 100)
      : 100;
    
    // Percentage bracket, e.g. "Top 12%"
    // If rank is 1, return "Top 5%"
    const topPercentStr = `Top ${Math.max(1, 100 - percentileVal)}%`;

    return {
      totalSavingsRupees,
      totalCO2SavedKg,
      totalEcoCoins,
      ecoScore,
      currentStreak,
      leaderboardRank,
      topPercentStr,
      breakdown: {
        electricity: electricitySavingsRupees,
        travel: travelSavingsRupees,
        water: waterSavingsRupees
      },
      reductions: {
        electricityKg: electricityCO2SavedKg,
        travelKg: travelCO2SavedKg,
        waterKg: waterCO2SavedKg
      },
      leaderboard: allUsers.map((u, i) => ({ ...u, rank: i + 1 }))
    };
  }
};
