import { describe, it, expect } from 'vitest';
import { getCoordsFromString, generateTravelFallback } from './gemini.js';

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
