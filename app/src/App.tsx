import { useState, useMemo } from 'react';
import './App.css';
import { calculateOptimalShare } from './logic/finance';
import type { FinanceInputs } from './logic/finance';
import { 
  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { TrendingUp, Wallet, ShieldCheck, Info } from 'lucide-react';

function App() {
  // Initial state based on the paper's college graduate baseline
  const [inputs, setInputs] = useState<FinanceInputs>({
    riskAversion: 7,
    currentAge1: 30,
    netWorth: 100000,
    expectedStockReturn: 0.05,
    riskFreeRate: 0.02,
    incomeStream1: Array.from({ length: 71 }, (_, i) => {
      const age = 30 + i;
      return {
        age,
        wage: age <= 66 ? 100000 : 0,
        retirementBenefit: age > 66 ? 40000 : 0
      };
    })
  });

  const results = useMemo(() => calculateOptimalShare(inputs), [inputs]);

  // Generate lifecycle data for chart
  const lifecycleData = useMemo(() => {
    const data = [];
    for (let age = inputs.currentAge1; age <= 85; age++) {
      const snapshotInputs = { ...inputs, currentAge1: age };
      const res = calculateOptimalShare(snapshotInputs);
      data.push({
        age,
        equityShare: res.shareWithHC * 100,
        mertonShare: res.shareWithoutHC * 100,
        humanCapital: res.humanCapital
      });
    }
    return data;
  }, [inputs]);

  const handleInputChange = (field: keyof FinanceInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const updateIncome = (age: number, field: 'wage' | 'retirementBenefit', value: number) => {
    setInputs(prev => ({
      ...prev,
      incomeStream1: prev.incomeStream1.map(y => y.age === age ? { ...y, [field]: value } : y)
    }));
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Practical Finance Calculator</h1>
        <p>Optimal lifecycle portfolio choice based on the Choi-Liu-Liu framework (Yale University).</p>
      </header>

      <div className="main-grid">
        <aside>
          <div className="card">
            <h2 className="card-title">
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ShieldCheck size={18} style={{marginRight: 8}} /> Risk & Wealth
              </span>
            </h2>
            
            <div className="input-group">
              <div className="value-display">
                <label>Risk Aversion (1-10)</label>
                <span className="value-badge">{inputs.riskAversion}</span>
              </div>
              <input 
                type="range" min="1" max="10" step="1" 
                value={inputs.riskAversion} 
                onChange={e => handleInputChange('riskAversion', Number(e.target.value))}
              />
            </div>

            <div className="input-group">
              <label>Current Age</label>
              <input 
                type="number" min="20" max="99" 
                value={inputs.currentAge1} 
                onChange={e => handleInputChange('currentAge1', Number(e.target.value))}
              />
            </div>

            <div className="input-group">
              <label>Investable Net Worth ($)</label>
              <input 
                type="number" 
                value={inputs.netWorth} 
                onChange={e => handleInputChange('netWorth', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <TrendingUp size={18} style={{marginRight: 8}} /> Market Expectations
              </span>
            </h2>
            
            <div className="input-group">
              <div className="value-display">
                <label>Exp. Stock Return (Real)</label>
                <span className="value-badge">{(inputs.expectedStockReturn * 100).toFixed(1)}%</span>
              </div>
              <input 
                type="range" min="0" max="0.15" step="0.005" 
                value={inputs.expectedStockReturn} 
                onChange={e => handleInputChange('expectedStockReturn', Number(e.target.value))}
              />
            </div>

            <div className="input-group">
              <div className="value-display">
                <label>Risk-Free Rate (Real)</label>
                <span className="value-badge">{(inputs.riskFreeRate * 100).toFixed(1)}%</span>
              </div>
              <input 
                type="range" min="-0.02" max="0.08" step="0.005" 
                value={inputs.riskFreeRate} 
                onChange={e => handleInputChange('riskFreeRate', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="card" style={{maxHeight: '400px', overflowY: 'auto'}}>
            <h2 className="card-title">
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Wallet size={18} style={{marginRight: 8}} /> Income Forecast
              </span>
            </h2>
            <table className="income-table">
              <thead>
                <tr>
                  <th>Age</th>
                  <th>Wage</th>
                  <th>Benefits</th>
                </tr>
              </thead>
              <tbody>
                {inputs.incomeStream1.slice(0, 40).map(year => (
                  <tr key={year.age}>
                    <td style={{fontSize: '0.75rem'}}>{year.age}</td>
                    <td>
                      <input 
                        type="number" value={year.wage} 
                        onChange={e => updateIncome(year.age, 'wage', Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" value={year.retirementBenefit} 
                        onChange={e => updateIncome(year.age, 'retirementBenefit', Number(e.target.value))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </aside>

        <main>
          <div className="result-hero">
            <div className="label">Recommended Equity Share</div>
            <div className="value">{(results.shareWithHC * 100).toFixed(0)}%</div>
            <div style={{opacity: 0.8, fontSize: '0.9rem'}}>
              Based on your ${inputs.netWorth.toLocaleString()} net worth and ${results.humanCapital.toLocaleString(undefined, {maximumFractionDigits: 0})} in Human Capital
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
            <div className="card">
              <h3 className="card-title">Merton Allocation</h3>
              <div style={{fontSize: '1.5rem', fontWeight: 700}}>{(results.shareWithoutHC * 100).toFixed(1)}%</div>
              <p style={{fontSize: '0.75rem', color: '#64748b'}}>Share if you had NO future labor income.</p>
            </div>
            <div className="card">
              <h3 className="card-title">Human Capital</h3>
              <div style={{fontSize: '1.5rem', fontWeight: 700}}>${results.humanCapital.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
              <p style={{fontSize: '0.75rem', color: '#64748b'}}>Present value of your future earnings.</p>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Optimal Equity Share Over Time</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lifecycleData}>
                  <defs>
                    <linearGradient id="colorShare" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis label={{ value: 'Equity %', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                  <Tooltip formatter={(value: number | undefined) => value !== undefined ? [`${value.toFixed(1)}%`, ''] : []} />
                  <Legend />
                  <Area 
                    type="monotone" dataKey="equityShare" name="Rec. Equity Share" 
                    stroke="#3b82f6" fillOpacity={1} fill="url(#colorShare)" strokeWidth={3}
                  />
                  <Line 
                    type="monotone" dataKey="mertonShare" name="Merton Baseline" 
                    stroke="#94a3b8" strokeDasharray="5 5" dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Info size={18} style={{marginRight: 8}} /> Why so aggressive?
              </span>
            </h2>
            <p style={{fontSize: '0.875rem', lineHeight: 1.6}}>
              Standard rules of thumb (like "100 minus age") ignore your most valuable asset: <strong>Human Capital</strong>. 
              Because your future paychecks are relatively stable (bond-like), you can afford to take more risk with your 
              liquid savings while you are young. As you age and your human capital "depletes" into financial wealth, 
              your allocation naturally shifts toward the Merton baseline.
            </p>
          </div>
        </main>
      </div>

      <footer className="footer">
        Reference: Choi, James J., Canyao Liu, and Pengcheng Liu. "Practical Finance: An Approximate Solution to Lifecycle Portfolio Choice." 2025.
      </footer>
    </div>
  );
}

export default App;

