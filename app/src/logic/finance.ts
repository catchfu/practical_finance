export interface FinanceInputs {
  riskAversion: number; // 1-10
  currentAge1: number;
  currentAge2?: number;
  netWorth: number;
  expectedStockReturn: number; // e.g., 0.05 (5%)
  riskFreeRate: number; // e.g., 0.02 (2%)
  incomeStream1: IncomeYear[];
  incomeStream2?: IncomeYear[];
}

export interface IncomeYear {
  age: number;
  wage: number;
  retirementBenefit: number;
}

const STOCK_VOLATILITY = 0.185;
const PERM_SHOCK_VAR = Math.pow(0.130, 2); // College grad: 0.130
const TEMP_SHOCK_VAR = Math.pow(0.242, 2); // College grad: 0.242
const REPLACEMENT_RATE = 0.40; // Default 40%

/**
 * Table 1: Pre-retirement labor income discount rate coefficients (Column 3)
 */
const PRE_RETIRE_COEFFS = {
  constant: -0.020,
  rra_10: 0.087,
  log_equity_premium: -0.267,
  log_rf: 1.132,
  perm_var: 4.332,
  temp_var: 0.028,
  rep_rate: 0.010,
  age_100: -0.149,
  age_100_sq: 0.142,
};

/**
 * Table 2: Retirement labor income discount rate coefficients (Column 3)
 */
const RETIRE_COEFFS = {
  constant: -0.166,
  rra_10: 0.0003,
  log_equity_premium: -0.217,
  log_rf: 0.893,
  age_100: 0.476,
  age_100_sq: -0.295,
};

/**
 * Calculates the one-period-ahead discount rate for labor income at a specific age.
 * @param age Current age
 * @param nextYearIncomeIsRetirement Whether the income arriving at age+1 is a retirement benefit
 */
export function getDiscountRate(age: number, nextYearIncomeIsRetirement: boolean, inputs: FinanceInputs): number {
  const rra = inputs.riskAversion;
  const log_rf = Math.log(1 + inputs.riskFreeRate);
  const log_r = Math.log(1 + inputs.expectedStockReturn);
  const log_ep = log_r - log_rf;
  
  const a100 = age / 100;
  const a100sq = a100 * a100;

  if (!nextYearIncomeIsRetirement) {
    return (
      PRE_RETIRE_COEFFS.constant +
      PRE_RETIRE_COEFFS.rra_10 * (rra / 10) +
      PRE_RETIRE_COEFFS.log_equity_premium * log_ep +
      PRE_RETIRE_COEFFS.log_rf * log_rf +
      PRE_RETIRE_COEFFS.perm_var * PERM_SHOCK_VAR +
      PRE_RETIRE_COEFFS.temp_var * TEMP_SHOCK_VAR +
      PRE_RETIRE_COEFFS.rep_rate * REPLACEMENT_RATE +
      PRE_RETIRE_COEFFS.age_100 * a100 +
      PRE_RETIRE_COEFFS.age_100_sq * a100sq
    );
  } else {
    return (
      RETIRE_COEFFS.constant +
      RETIRE_COEFFS.rra_10 * (rra / 10) +
      RETIRE_COEFFS.log_equity_premium * log_ep +
      RETIRE_COEFFS.log_rf * log_rf +
      RETIRE_COEFFS.age_100 * a100 +
      RETIRE_COEFFS.age_100_sq * a100sq
    );
  }
}

/**
 * Calculates Human Capital (H) - the present discounted value of future labor income.
 */
export function calculateHumanCapital(currentAge: number, incomeStream: IncomeYear[], inputs: FinanceInputs): number {
  let totalHC = 0;
  let cumulativeDiscount = 1;

  for (let age = currentAge + 1; age <= 100; age++) {
    const yearData = incomeStream.find(y => y.age === age);
    if (!yearData) continue;

    const income = yearData.wage + yearData.retirementBenefit;
    if (income === 0) continue;

    const nextYearIncomeIsRetirement = yearData.retirementBenefit > 0 && yearData.wage === 0;
    const r = getDiscountRate(age - 1, nextYearIncomeIsRetirement, inputs);
    cumulativeDiscount *= (1 + r);
    
    totalHC += income / cumulativeDiscount;
  }

  return totalHC;
}

/**
 * Calculates the Optimal Risky Share (alpha).
 */
export function calculateOptimalShare(inputs: FinanceInputs): { 
  shareWithHC: number, 
  shareWithoutHC: number,
  humanCapital: number 
} {
  const equityPremium = inputs.expectedStockReturn - inputs.riskFreeRate;
  const var_r = Math.pow(STOCK_VOLATILITY, 2);
  
  // Merton's alpha* (the share if there were no labor income)
  // alpha* = (r - rf + 0.5 * sigma^2) / (gamma * sigma^2)
  const mertonAlpha = (equityPremium + 0.5 * var_r) / (inputs.riskAversion * var_r);
  
  const hc1 = calculateHumanCapital(inputs.currentAge1, inputs.incomeStream1, inputs);
  const hc2 = inputs.incomeStream2 && inputs.currentAge2 
    ? calculateHumanCapital(inputs.currentAge2, inputs.incomeStream2, inputs) 
    : 0;
  
  const totalHC = hc1 + hc2;
  
  // Recommended share of FINANCIAL wealth: alpha* * (1 + H/W)
  const recommendedShare = mertonAlpha * (1 + totalHC / inputs.netWorth);
  
  return {
    shareWithHC: Math.min(1, Math.max(0, recommendedShare)),
    shareWithoutHC: Math.min(1, Math.max(0, mertonAlpha)),
    humanCapital: totalHC
  };
}
