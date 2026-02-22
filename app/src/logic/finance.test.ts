import { describe, it, expect } from 'vitest';
import { calculateOptimalShare } from './finance';
import type { FinanceInputs, IncomeYear } from './finance';

describe('Finance Logic', () => {
  it('should calculate Human Capital and Optimal Share correctly for the 55-year-old example', async () => {
    // Example from page 19-20 of the paper
    const incomeStream: IncomeYear[] = [];
    for (let age = 56; age <= 100; age++) {
      incomeStream.push({
        age,
        wage: age <= 66 ? 100000 : 0,
        retirementBenefit: age > 66 ? 40000 : 0
      });
    }

    const rf = Math.exp(0.02) - 1; // 2% log risk-free
    const stock = Math.exp(0.04) - 1; // 2% log rf + 2% log premium = 4% log return

    const inputs: FinanceInputs = {
      riskAversion: 7,
      currentAge1: 55,
      netWorth: 1000000,
      expectedStockReturn: stock,
      riskFreeRate: rf,
      incomeStream1: incomeStream
    };

    const { getDiscountRate } = await import('./finance');
    console.log('Discount rate at age 55:', getDiscountRate(55, false, inputs));

    const result = calculateOptimalShare(inputs);

    // The paper says H = 924,805
    console.log('Calculated Human Capital:', result.humanCapital);
    expect(result.humanCapital).toBeGreaterThan(920000);
    expect(result.humanCapital).toBeLessThan(930000);

    // Merton's alpha* for gamma=7, log rf=2%, log stock=4%, sigma=0.185
    // alpha* = (log_ep + 0.5 * sigma^2) / (gamma * sigma^2)
    // alpha* = (0.02 + 0.5 * 0.185^2) / (7 * 0.185^2)
    // alpha* = (0.02 + 0.0171125) / (7 * 0.034225)
    // alpha* = 0.0371125 / 0.239575 = 0.1549...
    // Recommended share = 0.1549 * (1 + 924805/1000000) = 0.298 (~30%)
    expect(result.shareWithHC).toBeGreaterThan(0.28);
    expect(result.shareWithHC).toBeLessThan(0.32);
  });
});
