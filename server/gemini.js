import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn('WARNING: GEMINI_API_KEY environment variable is not set. EcoSave Express will run in Fallback/Local calculation mode.');
}

// Helper to strip markdown formatting and parse JSON safely
function parseGeminiJson(rawText) {
  try {
    let cleanText = rawText.trim();
    // Strip markdown code fences if present (e.g., ```json ... ``` or ``` ...)
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
    }
    return JSON.parse(cleanText.trim());
  } catch (e) {
    console.error('Failed to parse Gemini output as JSON. Raw output:', rawText);
    throw new Error('Invalid JSON format from AI model');
  }
}

// 1. BILL INTELLIGENCE ANALYZER
export async function analyzeBill(fileBuffer, mimeType, manualData = null, electricityRate = 7.5) {
  // If no Gemini API key, use fallback
  if (!genAI) {
    return generateBillFallback(manualData, electricityRate);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    let prompt = `
      You are an expert utility bill auditor for Indian households.
      Analyze this electricity bill and extract the following details. Return the results in JSON format.
      
      For India, the average grid emission factor is ~0.82 kg CO2 per kWh.
      Calculate:
      - co2SavedKg = savedKWh * 0.82
      - savingsPotentialRupees = savedKWh * ${electricityRate}

      The JSON structure MUST be exactly:
      {
        "billingPeriod": "Month Year (e.g., June 2026)",
        "unitsConsumed": number (kWh),
        "billAmount": number (INR),
        "savingsPotentialRupees": number (estimated rupee savings per month by optimizing usage by 10-20%),
        "savedKWh": number (estimated units saved corresponding to the rupee savings),
        "co2SavedKg": number (savedKWh * 0.82),
        "recommendations": [
          {
            "title": "Short title",
            "description": "Actionable, tailored recommendation for an Indian household, mentioning appliances or habits",
            "rupeeSavings": number (INR saved/month),
            "co2Savings": number (kg CO2 reduced/month)
          }
        ]
      }
      Provide exactly 3 highly customized recommendations based on the bill volume.
    `;

    let result;
    if (fileBuffer && mimeType) {
      // Vision upload mode
      const part = {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType: mimeType
        }
      };
      result = await model.generateContent([prompt, part]);
    } else if (manualData) {
      // Manual inputs mode
      const manualPrompt = `
        Here is the manual input provided by the user:
        - Units Consumed: ${manualData.units} kWh
        - Bill Amount: ₹${manualData.amount}
        - Billing Period / Month: ${manualData.period || 'Current Month'}

        ${prompt}
      `;
      result = await model.generateContent([manualPrompt]);
    } else {
      throw new Error('Either fileBuffer or manualData must be provided');
    }

    const responseText = result.response.text();
    return parseGeminiJson(responseText);
  } catch (error) {
    console.error('Gemini Bill Analysis failed, using fallback:', error);
    return generateBillFallback(manualData, electricityRate);
  }
}

// Fallback logic for Bill Intelligence
function generateBillFallback(manualData, electricityRate) {
  const units = manualData ? Number(manualData.units) : 350;
  const amount = manualData ? Number(manualData.amount) : (units * electricityRate);
  const period = manualData ? manualData.period : 'June 2026';

  // Estimate 15% savings
  const savedKWh = Math.round(units * 0.15);
  const savingsPotentialRupees = Math.round(savedKWh * electricityRate);
  const co2SavedKg = Number((savedKWh * 0.82).toFixed(2));

  return {
    billingPeriod: period,
    unitsConsumed: units,
    billAmount: amount,
    savingsPotentialRupees,
    savedKWh,
    co2SavedKg,
    recommendations: [
      {
        title: 'AC Temperature Setting',
        description: 'Set your air conditioner to 24°C or 26°C instead of 18°C. Every 1°C increase saves about 6% of AC electricity.',
        rupeeSavings: Math.round(savingsPotentialRupees * 0.5),
        co2Savings: Number((co2SavedKg * 0.5).toFixed(1))
      },
      {
        title: 'Standby Power Audit',
        description: 'Turn off televisions, Wi-Fi routers at night, and chargers from the wall switch. Standby power accounts for 5-10% of your bill.',
        rupeeSavings: Math.round(savingsPotentialRupees * 0.3),
        co2Savings: Number((co2SavedKg * 0.3).toFixed(1))
      },
      {
        title: 'LED Lighting Upgrade',
        description: 'Replace remaining tube lights or old CFL bulbs with energy-efficient 9W LED bulbs in common areas like the kitchen and hall.',
        rupeeSavings: Math.round(savingsPotentialRupees * 0.2),
        co2Savings: Number((co2SavedKg * 0.2).toFixed(1))
      }
    ]
  };
}

// 2. LEAKAGE CHATBOT (BOOND MASCOT)
export async function getLeakAssistantResponse(chatHistory, userMessage) {
  if (!genAI) {
    return generateChatFallback(userMessage);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const conversationContext = chatHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Boond'}: ${msg.text}`)
      .join('\n');

    const prompt = `
      You are "Boond", a friendly water drop mascot helping Indian households detect water leakage, stop waste, and save money.
      You respond in Hinglish (Hindi written in Latin script mixed with English words, conversational, warm, and slightly playful).
      
      User message: "${userMessage}"
      
      Review the message and recent chat history:
      ${conversationContext}

      Identify if the user is discussing a leak (like a dripping tap, running toilet flush, tank overflow) or water waste. 
      Return a response in JSON format:
      {
        "message": "Conversational Hinglish response from Boond. Acknowledge, offer warm tips, and keep it very engaging.",
        "impactMetadata": {
          "rupeeImpact": number (estimated waste cost in INR per month, e.g. 150. If not a waste issue, set to 0),
          "waterImpactLitres": number (estimated water wasted in litres per month, e.g. 900. If none, set to 0),
          "actionItem": "Short specific action to fix it (e.g., Replace washer, adjust flush float value)"
        }
      }

      Keep estimates realistic. For example, a single leaky tap wastes about 300 to 1000 litres of water a month, costing around ₹50-150 in pumping electricity and water tanker costs. A running flush wastes up to 3000 litres, costing ₹300-500.
    `;

    const result = await model.generateContent([prompt]);
    return parseGeminiJson(result.response.text());
  } catch (error) {
    console.error('Gemini Chat failed, using fallback:', error);
    return generateChatFallback(userMessage);
  }
}

function generateChatFallback(userMessage) {
  const msgLower = userMessage.toLowerCase();
  let rupeeImpact = 0;
  let waterImpactLitres = 0;
  let actionItem = '';
  let responseText = '';

  if (msgLower.includes('tap') || msgLower.includes(' नल ') || msgLower.includes('leak') || msgLower.includes('dripping')) {
    rupeeImpact = 120;
    waterImpactLitres = 600;
    actionItem = 'Tap washer badalye or use Teflon tape';
    responseText = "Oh ho! Dripping tap ya leaky tap toh bohot paani waste karta hai. Ek ek boond se bucket bhar jaati hai! Isko jaldi se fix kijiye, ek naya rubber washer fitting ₹10-20 me ho jayega par har mahine ka ₹120 bill bachaega! Aap local plumber ko call karein ya khud Teflon tape lagayein.";
  } else if (msgLower.includes('flush') || msgLower.includes('toilet') || msgLower.includes('commode')) {
    rupeeImpact = 350;
    waterImpactLitres = 2500;
    actionItem = 'Toilet flush siphon float check & clean kijiye';
    responseText = "Toilet flush leak continuously chalta rehta hai aur hume pata bhi nahi chalta! Flush tank ke andar ka float valve check kijiye. Agar flush tank leak ho raha hai toh har mahine lagbhag 2500 litres paani aur ₹350 tank electricity block ho rahi hai!";
  } else if (msgLower.includes('tank') || msgLower.includes('overflow') || msgLower.includes('motor')) {
    rupeeImpact = 250;
    waterImpactLitres = 1500;
    actionItem = 'Install an Automatic Water Level Controller';
    responseText = "Water tank overflow hone se balcony aur chatt gili ho jati hai aur motor extra chalne se electricity waste hoti hai. Ek automatic water level controller lagwa lijiye (₹800-1200 range). Motor automatically band ho jayegi aur ₹250/month save honge!";
  } else {
    rupeeImpact = 50;
    waterImpactLitres = 200;
    actionItem = 'AERATOR nozzles tap par fit karein';
    responseText = "Haanji, paani save karna matlab money save karna! Kitchen taps me aerator flow regulators (₹50-80) fit kar lijiye. Paani ka flow badhiya lagega aur consumption 50% tak kam ho jayegi. Bolo, aur kya help chahiye aapko leak related?";
  }

  return {
    message: responseText,
    impactMetadata: {
      rupeeImpact,
      waterImpactLitres,
      actionItem
    }
  };
}

// Helper to hash string to coordinates (30-130 for start, 230-350 for destination)
export function getCoordsFromString(name, isStart) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  if (isStart) {
    const x = 30 + (hash % 100);
    const y = 30 + (Math.floor(hash / 4) % 70);
    return { x, y };
  } else {
    const x = 230 + (hash % 120);
    const y = 140 + (Math.floor(hash / 4) % 70);
    return { x, y };
  }
}

// 3. TRAVEL ROUTE OPTIMIZER
export async function getTravelRecommendation(start, destination, mode, spendOrDist) {
  // Mode-based conversion constants (representative for Indian cities)
  // fuel spend / price per litre = distance
  const FUEL_PRICE = 100; // Average cost of fuel per litre in INR
  let distanceKm = 0;
  
  if (mode === 'Walking' || mode === 'Bicycle') {
    distanceKm = Number(spendOrDist) || 5;
  } else if (mode.includes('Metro') || mode.includes('Bus') || mode.includes('Auto')) {
    distanceKm = Number(spendOrDist) || 15;
  } else {
    // Car or Bike
    // If spendOrDist is likely a rupee spend (e.g. > 150), calculate km. Otherwise treat as direct km.
    const val = Number(spendOrDist) || 0;
    if (val > 100) {
      const litres = val / FUEL_PRICE;
      const mileage = mode.includes('Car') ? 12 : 45; // average km/l
      distanceKm = Math.round(litres * mileage);
    } else {
      distanceKm = val;
    }
  }

  if (distanceKm === 0) distanceKm = 20; // default baseline

  // Calculate current emissions and cost
  let currentCO2Kg = 0;
  let currentCostRupees = 0;

  switch (mode) {
    case 'Petrol Car':
      currentCO2Kg = distanceKm * 0.18; // 180g / km
      currentCostRupees = (distanceKm / 12) * FUEL_PRICE;
      break;
    case 'Diesel Car':
      currentCO2Kg = distanceKm * 0.16;
      currentCostRupees = (distanceKm / 15) * 90; // diesel price ~90
      break;
    case 'CNG Car':
      currentCO2Kg = distanceKm * 0.11;
      currentCostRupees = (distanceKm / 18) * 85; // CNG price ~85
      break;
    case 'Two-wheeler (Petrol)':
      currentCO2Kg = distanceKm * 0.06; // 60g / km
      currentCostRupees = (distanceKm / 45) * FUEL_PRICE;
      break;
    case 'Auto Rickshaw':
      currentCO2Kg = distanceKm * 0.08;
      currentCostRupees = distanceKm * 15; // rate per km
      break;
    case 'Metro':
      currentCO2Kg = distanceKm * 0.015; // highly efficient electric public
      currentCostRupees = distanceKm * 3.5;
      break;
    case 'Local Bus':
      currentCO2Kg = distanceKm * 0.03;
      currentCostRupees = distanceKm * 2;
      break;
    case 'Walking':
    case 'Bicycle':
      currentCO2Kg = 0;
      currentCostRupees = 0;
      break;
    default:
      currentCO2Kg = distanceKm * 0.15;
      currentCostRupees = distanceKm * 10;
  }

  currentCO2Kg = Number(currentCO2Kg.toFixed(2));
  currentCostRupees = Math.round(currentCostRupees);

  if (!genAI) {
    return generateTravelFallback(start, destination, mode, distanceKm, currentCO2Kg, currentCostRupees);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      You are an expert travel planner and environmental auditor in India.
      Suggest a greener and cheaper alternative for a trip from "${start}" to "${destination}".
      The user currently travels by "${mode}" covering around ${distanceKm} km, costing ₹${currentCostRupees} and emitting ${currentCO2Kg} kg of CO2.

      We want to visualize this on an SVG map with a viewBox of 0 0 400 300.
      Generate coordinates so they fit beautifully on this canvas.
      Choose startCoords inside the top-left area: x between 30 and 130, y between 30 and 100.
      Choose destCoords inside the bottom-right area: x between 230 and 350, y between 140 and 210.
      Create:
      - currentRoutePath: SVG path string starting exactly at startCoords (M startCoords.x,startCoords.y) and ending exactly at destCoords (e.g., M x,y Q x1,y1 x2,y2 or M x,y C x1,y1 x2,y2 x3,y3) for the current road travel.
      - alternativeRoutePath: SVG path string starting exactly at startCoords (M startCoords.x,startCoords.y) and ending exactly at destCoords. The path should be a smooth, distinct curve representing the green transit alternative route.

      Note: Ensure both paths are smooth curves (using Q or C command commands) rather than straight lines, and that their start/end control points match the startCoords and destCoords EXACTLY.

      Provide your recommendation in JSON format:
      {
        "alternativeMode": "Recommended mode (e.g., Metro, Carpool, Electric Auto, Cycling)",
        "reasoning": "A concise paragraph explaining why this alternative is perfect for Indian cities. Mention route convenience, heavy traffic bypass, and cost comparison.",
        "estimatedSavingsRupees": number (INR saved per trip or per month if commuted regularly),
        "estimatedCO2SavedKg": number (CO2 saved in kg, must be less than current trip emissions of ${currentCO2Kg} kg),
        "startCoords": { "x": number, "y": number },
        "destCoords": { "x": number, "y": number },
        "currentRoutePath": "SVG path string",
        "alternativeRoutePath": "SVG path string"
      }
    `;

    const result = await model.generateContent([prompt]);
    const parsed = parseGeminiJson(result.response.text());
    
    const startCoords = parsed.startCoords || getCoordsFromString(start, true);
    const destCoords = parsed.destCoords || getCoordsFromString(destination, false);

    // Ensure logical sanity of returned calculations
    return {
      distanceKm,
      currentCO2Kg,
      currentCostRupees,
      alternativeMode: parsed.alternativeMode,
      reasoning: parsed.reasoning,
      savingsRupees: Math.max(0, Math.min(currentCostRupees, parsed.estimatedSavingsRupees)),
      co2SavedKg: Number(Math.max(0, Math.min(currentCO2Kg, parsed.estimatedCO2SavedKg)).toFixed(2)),
      startCoords,
      destCoords,
      currentRoutePath: parsed.currentRoutePath || `M ${startCoords.x},${startCoords.y} Q ${(startCoords.x+destCoords.x)/2},${((startCoords.y+destCoords.y)/2)-20} ${destCoords.x},${destCoords.y}`,
      alternativeRoutePath: parsed.alternativeRoutePath || `M ${startCoords.x},${startCoords.y} Q ${(startCoords.x+destCoords.x)/2},${((startCoords.y+destCoords.y)/2)+20} ${destCoords.x},${destCoords.y}`
    };
  } catch (error) {
    console.error('Gemini Travel optimizer failed, using fallback:', error);
    return generateTravelFallback(start, destination, mode, distanceKm, currentCO2Kg, currentCostRupees);
  }
}

export function generateTravelFallback(start, destination, mode, distanceKm, currentCO2Kg, currentCostRupees) {
  let alternativeMode = 'Metro & Share Auto';
  let savingsRupees = Math.round(currentCostRupees * 0.6);
  let co2SavedKg = Number((currentCO2Kg * 0.8).toFixed(2));
  let reasoning = `For traveling from ${start} to ${destination}, shifting from a private vehicle to the Metro will help you completely bypass city traffic. Using the Metro coupled with shared first/last-mile autos reduces your travel cost to just ₹${currentCostRupees - savingsRupees} and prevents ${co2SavedKg} kg of carbon pollution!`;

  if (mode === 'Walking' || mode === 'Bicycle') {
    alternativeMode = 'Keep Walking!';
    savingsRupees = 0;
    co2SavedKg = 0;
    reasoning = `Aap toh already green transport use kar rahe hain! Walking or cycling from ${start} to ${destination} is 100% emission-free and free of cost. Aapki health and pocket dono set hain. Keep it up!`;
  } else if (mode.includes('Metro') || mode.includes('Bus')) {
    alternativeMode = 'Electric Bicycle or Carpool';
    savingsRupees = Math.round(currentCostRupees * 0.1);
    co2SavedKg = Number((currentCO2Kg * 0.2).toFixed(2));
    reasoning = `Aap already public transport use kar rahe hain! Local transit systems are the backbone of sustainable cities. You can optimize first-mile connectivity by renting shared electric cycles or walking.`;
  } else if (mode.includes('Two-wheeler')) {
    alternativeMode = 'Electric Two-Wheeler (EV)';
    savingsRupees = Math.round(currentCostRupees * 0.7);
    co2SavedKg = Number((currentCO2Kg * 0.75).toFixed(2));
    reasoning = `Riding an electric scooter like Ola, Ather, or TVS iQube drops running costs from ~₹2.2/km on petrol to under ₹0.25/km. This will cut ₹${savingsRupees} per trip and zero out tailpipe emissions.`;
  }

  const startCoords = getCoordsFromString(start, true);
  const destCoords = getCoordsFromString(destination, false);

  return {
    distanceKm,
    currentCO2Kg,
    currentCostRupees,
    alternativeMode,
    reasoning,
    savingsRupees,
    co2SavedKg,
    startCoords,
    destCoords,
    currentRoutePath: `M ${startCoords.x},${startCoords.y} Q ${(startCoords.x+destCoords.x)/2},${((startCoords.y+destCoords.y)/2)-20} ${destCoords.x},${destCoords.y}`,
    alternativeRoutePath: `M ${startCoords.x},${startCoords.y} Q ${(startCoords.x+destCoords.x)/2},${((startCoords.y+destCoords.y)/2)+20} ${destCoords.x},${destCoords.y}`
  };
}

// 4. IMPACT MIRROR COMPARISONS
export async function getImpactAnalogy(co2SavedKg) {
  if (!genAI) {
    return generateImpactFallback(co2SavedKg);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      You are an expert copywriter in sustainability. Create highly relatable Indian household analogies for carbon footprint reduction.
      The user has saved exactly ${co2SavedKg} kg of CO2 emissions.
      
      Generate two comparisons in JSON format:
      {
        "userComparison": "A descriptive, visual sentence translating ${co2SavedKg} kg CO2 into household equivalents (e.g., equivalent to switching off 5 ceiling fans for 12 days, planting X Neem tree saplings, saving Y LPG cylinders, or Z smartphone charges).",
        "communityComparison": "A sentence describing what would happen if a neighborhood of 500 Indian homes achieved this. E.g., 'If 500 households in your society did this, we would save ${co2SavedKg * 500} kg of CO2, which is like bypassing Z flights from Mumbai to Delhi or planting a whole forest of 5000 mango trees!'"
      }

      Keep comparisons culturally specific to India (LPG cylinders, neem/mango trees, ceiling fans, auto rickshaw mileage, train rides).
    `;

    const result = await model.generateContent([prompt]);
    return parseGeminiJson(result.response.text());
  } catch (error) {
    console.error('Gemini Impact Mirror failed, using fallback:', error);
    return generateImpactFallback(co2SavedKg);
  }
}

function generateImpactFallback(co2SavedKg) {
  const rounded = Number(co2SavedKg).toFixed(1);
  const neemTrees = Math.max(1, Math.round(co2SavedKg / 20)); // 1 tree absorbs ~20kg CO2 per year
  const fanHours = Math.round(co2SavedKg / 0.06); // 60W ceiling fan = 0.06 kWh per hour. 0.06 * 0.82 = 0.05kg CO2 per hour
  const lpgCylinders = Number((co2SavedKg / 1.5).toFixed(1)); // combustion comparison
  const communityTotal = Math.round(co2SavedKg * 500);

  return {
    userComparison: `Aapki carbon bachat is equivalent to planting ${neemTrees} Neem trees and letting them grow for a year, or running a standard ceiling fan continuously for ${fanHours} hours!`,
    communityComparison: `Agar aapki society ke 500 homes ye karein, toh hum milkar ${communityTotal} kg CO2 save karenge — which is equivalent to bypassing ${Math.max(1, Math.round(communityTotal / 150))} flights from Delhi to Mumbai!`
  };
}
