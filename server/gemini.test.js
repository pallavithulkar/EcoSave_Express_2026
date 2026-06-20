import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getCoordsFromString, generateTravelFallback } from './gemini.js';
import { db } from './db.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.json');

describe('Travel Optimizer Math Tests', () => {
  it('should hash start point correctly within top-left SVG viewport (x: 30-130, y: 30-100)', () => {
    const coords = getCoordsFromString('Andheri West', true);
    expect(coords.x).toBeGreaterThanOrEqual(30);
    expect(coords.x).toBeLessThanOrEqual(130);
    expect(coords.y).toBeGreaterThanOrEqual(30);
    expect(coords.y).toBeLessThanOrEqual(100);
  });

  it('should hash destination point correctly within bottom-right SVG viewport (x: 230-350, y: 140-210)', () => {
    const coords = getCoordsFromString('Bandra Kurla Complex', false);
    expect(coords.x).toBeGreaterThanOrEqual(230);
    expect(coords.x).toBeLessThanOrEqual(350);
    expect(coords.y).toBeGreaterThanOrEqual(140);
    expect(coords.y).toBeLessThanOrEqual(210);
  });

  it('should generate identical coordinates for same location name', () => {
    const coords1 = getCoordsFromString('Dadar', true);
    const coords2 = getCoordsFromString('Dadar', true);
    expect(coords1.x).toBe(coords2.x);
    expect(coords1.y).toBe(coords2.y);
  });

  it('should calculate fallback green transit values accurately', () => {
    const start = 'Colaba';
    const dest = 'Andheri';
    const mode = 'Petrol Car';
    const dist = 25;
    const cost = 200;
    const co2 = 4.5; // 25 * 0.18

    const result = generateTravelFallback(start, dest, mode, dist, co2, cost);
    expect(result.alternativeMode).toBe('Metro & Share Auto');
    expect(result.savingsRupees).toBe(Math.round(cost * 0.6));
    expect(result.co2SavedKg).toBe(Number((co2 * 0.8).toFixed(2)));
    expect(result.startCoords).toBeDefined();
    expect(result.destCoords).toBeDefined();
    expect(result.currentRoutePath).toContain('M');
    expect(result.alternativeRoutePath).toContain('M');
  });
});

describe('Database Module & Stats Engine Tests', () => {
  let backupData = null;

  beforeAll(async () => {
    try {
      const exists = await fs.access(DB_PATH).then(() => true).catch(() => false);
      if (exists) {
        backupData = await fs.readFile(DB_PATH, 'utf-8');
      }
    } catch (e) {
      // Ignore
    }
  });

  afterAll(async () => {
    if (backupData !== null) {
      await fs.writeFile(DB_PATH, backupData, 'utf-8');
    }
  });

  it('should reset the database to DEFAULT_DB', async () => {
    const state = await db.reset();
    expect(state.profile.name).toBe('Pallavi');
    expect(state.bills).toHaveLength(0);
    expect(state.travelLogs).toHaveLength(0);
    expect(state.streakLogs).toHaveLength(0);
    expect(state.chatHistory).toHaveLength(0);
  });

  it('should update and retrieve profile information', async () => {
    await db.reset();
    const updated = await db.updateProfile({ name: 'Test User', city: 'Delhi', familySize: 5 });
    expect(updated.name).toBe('Test User');
    expect(updated.city).toBe('Delhi');
    expect(updated.familySize).toBe(5);

    const profile = await db.getProfile();
    expect(profile.name).toBe('Test User');
  });

  it('should add electricity bills and fetch them', async () => {
    await db.reset();
    const newBill = await db.addBill({
      billingPeriod: 'Jan 2026',
      unitsConsumed: 250,
      billAmount: 1875,
      savingsPotentialRupees: 280,
      savedKWh: 37,
      co2SavedKg: 30.34
    });

    expect(newBill.id).toBeDefined();
    expect(newBill.dateAdded).toBeDefined();
    expect(newBill.unitsConsumed).toBe(250);

    const bills = await db.getBills();
    expect(bills).toHaveLength(1);
    expect(bills[0].billingPeriod).toBe('Jan 2026');
  });

  it('should add travel logs and fetch them', async () => {
    await db.reset();
    const newLog = await db.addTravelLog({
      distanceKm: 12,
      currentCO2Kg: 2.16,
      currentCostRupees: 100,
      alternativeMode: 'Metro',
      savingsRupees: 60,
      co2SavedKg: 1.72
    });

    expect(newLog.id).toBeDefined();
    expect(newLog.dateAdded).toBeDefined();
    expect(newLog.distanceKm).toBe(12);

    const logs = await db.getTravelLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].alternativeMode).toBe('Metro');
  });

  it('should manage streak check-ins, overwrite same date and sort them', async () => {
    await db.reset();
    await db.addStreakCheckIn({ date: '2026-06-20', electricityCheck: true, waterCheck: true, travelCheck: false });
    await db.addStreakCheckIn({ date: '2026-06-19', electricityCheck: false, waterCheck: true, travelCheck: true });
    // Overwrite '2026-06-20'
    await db.addStreakCheckIn({ date: '2026-06-20', electricityCheck: true, waterCheck: false, travelCheck: true });

    const logs = await db.getStreakLogs();
    expect(logs).toHaveLength(2);
    expect(logs[0].date).toBe('2026-06-19');
    expect(logs[1].date).toBe('2026-06-20');
    expect(logs[1].waterCheck).toBe(false); // updated value
  });

  it('should cap chat message history to 50 items', async () => {
    await db.reset();
    for (let i = 0; i < 55; i++) {
      await db.addChatMessage('user', `Message ${i}`);
    }

    const history = await db.getChatHistory();
    expect(history).toHaveLength(50);
    expect(history[0].text).toBe('Message 5');
  });

  it('should calculate stats, eco score, coins, and leaderboard rank accurately', async () => {
    await db.reset();
    
    // Add bill
    await db.addBill({
      savingsPotentialRupees: 300,
      savedKWh: 40,
      co2SavedKg: 32.8
    });

    // Add travel log
    await db.addTravelLog({
      savingsRupees: 100,
      co2SavedKg: 2.2
    });

    // Add streak logs to calculate current streak
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    await db.addStreakCheckIn({ date: yesterdayStr, electricityCheck: true, waterCheck: true, travelCheck: true });
    await db.addStreakCheckIn({ date: todayStr, electricityCheck: true, waterCheck: true, travelCheck: true });

    const stats = await db.getStats();

    // Verify Savings:
    // Electricity: ₹300, Travel: ₹100, Water: ₹30 * 2 = ₹60 => Total = ₹460
    expect(stats.totalSavingsRupees).toBe(460);

    // Verify CO2 Saved:
    // Electricity: 32.8, Travel: 2.2, Water: 0.5 * 2 = 1.0 => Total = 36.0 kg
    expect(stats.totalCO2SavedKg).toBe(36.0);

    // Verify Streak Calculation:
    expect(stats.currentStreak).toBe(2);

    // Verify EcoCoins:
    // Savings coins: 460 / 10 = 46
    // Streak coins: 2 * 15 = 30
    // Check-in coins: 2 * 5 = 10
    // Total EcoCoins = 46 + 30 + 10 = 86
    expect(stats.totalEcoCoins).toBe(86);

    // Verify EcoScore:
    // Base score = 45
    // Streak points: min(30, 2 * 3) = 6
    // Carbon points: min(40, floor(36.0 / 2)) = 18
    // Action points: min(30, (1 bill * 10) + (1 travel * 10)) = 20
    // EcoScore = 45 + 6 + 18 + 20 = 89
    expect(stats.ecoScore).toBe(89);

    // Verify leaderboard ranking
    expect(stats.leaderboardRank).toBe(2);
    expect(stats.topPercentStr).toBe('Top 20%');
  });
});
