import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Area, ComposedChart } from 'recharts';

// ============================================
// GAME DATA & CONSTANTS
// ============================================

const FOODS = [
  { name: 'Apple', carbs: 25, image: '🍎', hint: 'Medium fruit' },
  { name: 'Banana', carbs: 27, image: '🍌', hint: 'Yellow fruit' },
  { name: 'Slice of Bread', carbs: 15, image: '🍞', hint: 'Grain product' },
  { name: 'Rice Bowl', carbs: 45, image: '🍚', hint: 'Starchy grain' },
  { name: 'Pasta Plate', carbs: 43, image: '🍝', hint: 'Italian classic' },
  { name: 'Orange Juice (8oz)', carbs: 26, image: '🧃', hint: 'Fruit drink' },
  { name: 'Chocolate Bar', carbs: 35, image: '🍫', hint: 'Sweet treat' },
  { name: 'Egg', carbs: 1, image: '🥚', hint: 'Protein source' },
  { name: 'Chicken Breast', carbs: 0, image: '🍗', hint: 'Lean meat' },
  { name: 'Potato', carbs: 37, image: '🥔', hint: 'Root vegetable' },
  { name: 'Milk (8oz)', carbs: 12, image: '🥛', hint: 'Dairy drink' },
  { name: 'Yogurt Cup', carbs: 17, image: '🥛', hint: 'Fermented dairy' },
  { name: 'Pizza Slice', carbs: 36, image: '🍕', hint: 'Fast food favorite' },
  { name: 'Ice Cream Scoop', carbs: 16, image: '🍨', hint: 'Frozen dessert' },
  { name: 'Hamburger', carbs: 40, image: '🍔', hint: 'Includes bun' },
  { name: 'Salad (no dressing)', carbs: 5, image: '🥗', hint: 'Leafy greens' },
  { name: 'Soda Can', carbs: 39, image: '🥤', hint: 'Fizzy drink' },
  { name: 'Diet Soda', carbs: 0, image: '🥤', hint: 'Zero sugar' },
  { name: 'Cookie', carbs: 20, image: '🍪', hint: 'Baked sweet' },
  { name: 'Donut', carbs: 25, image: '🍩', hint: 'Ring-shaped pastry' }
];

const EMERGENCY_SCENARIOS = [
  {
    situation: "Your friend with diabetes is confused, sweating, and shaking. Their blood glucose is 45 mg/dL.",
    options: [
      { text: "Give them insulin immediately", correct: false, feedback: "No! They're having low blood sugar. Insulin would make it worse." },
      { text: "Give them orange juice or glucose tablets", correct: true, feedback: "Correct! Fast-acting sugar helps raise blood glucose quickly." },
      { text: "Tell them to exercise", correct: false, feedback: "Exercise would lower blood sugar further - dangerous in this situation." },
      { text: "Wait and see if it gets better", correct: false, feedback: "Severe hypoglycemia is an emergency. Action is needed now!" }
    ],
    category: "Hypoglycemia"
  },
  {
    situation: "Blood glucose reading shows 320 mg/dL and you're feeling nauseous with fruity breath odor.",
    options: [
      { text: "Eat a meal to feel better", correct: false, feedback: "Eating would raise blood sugar even higher." },
      { text: "Take rapid-acting insulin and drink water, check for ketones", correct: true, feedback: "Correct! High glucose with nausea and fruity breath may indicate DKA risk." },
      { text: "Go to sleep and check in the morning", correct: false, feedback: "This could be diabetic ketoacidosis - a medical emergency!" },
      { text: "Drink sugary juice", correct: false, feedback: "This would dangerously raise blood sugar further." }
    ],
    category: "Hyperglycemia/DKA"
  },
  {
    situation: "You're about to exercise and your blood glucose is 85 mg/dL.",
    options: [
      { text: "Exercise immediately - that's a perfect level", correct: false, feedback: "85 is borderline low for exercise; blood sugar will drop during activity." },
      { text: "Have a small carb snack (15-20g) before exercising", correct: true, feedback: "Correct! A snack prevents hypoglycemia during exercise." },
      { text: "Take extra insulin before exercise", correct: false, feedback: "This would cause dangerous low blood sugar during exercise." },
      { text: "Skip exercise today", correct: false, feedback: "You can still exercise safely with proper preparation." }
    ],
    category: "Exercise Safety"
  },
  {
    situation: "Your insulin pump has stopped working and you don't have a backup. Blood glucose is 200 mg/dL and rising.",
    options: [
      { text: "Wait for the pump to start working again", correct: false, feedback: "Without insulin, blood sugar will continue rising dangerously." },
      { text: "Take a correction dose with an insulin pen/syringe and call your doctor", correct: true, feedback: "Correct! You need an alternative insulin delivery method immediately." },
      { text: "Exercise vigorously to bring it down", correct: false, feedback: "Without insulin, exercise alone won't adequately control rising glucose." },
      { text: "Drink lots of water and skip your next meal", correct: false, feedback: "You still need insulin - water alone won't solve this." }
    ],
    category: "Equipment Failure"
  },
  {
    situation: "You wake up at 3 AM feeling sweaty with a blood glucose of 55 mg/dL.",
    options: [
      { text: "Go back to sleep, it will correct itself", correct: false, feedback: "Nocturnal hypoglycemia is dangerous and needs treatment." },
      { text: "Take 15-20g fast-acting carbs, recheck in 15 minutes", correct: true, feedback: "Correct! Follow the 15-15 rule: 15g carbs, wait 15 minutes, recheck." },
      { text: "Take your morning insulin dose early", correct: false, feedback: "More insulin would make low blood sugar worse!" },
      { text: "Call 911 immediately", correct: false, feedback: "55 mg/dL is treatable at home if you're conscious and can swallow." }
    ],
    category: "Night-time Hypoglycemia"
  },
  {
    situation: "You're feeling fine but your CGM shows blood glucose dropping rapidly from 140 to 90 in 20 minutes.",
    options: [
      { text: "Ignore it - 90 is still normal", correct: false, feedback: "The rapid drop suggests it will continue falling - be proactive!" },
      { text: "Take insulin to stabilize it", correct: false, feedback: "Insulin would accelerate the drop." },
      { text: "Have a small snack and monitor closely", correct: true, feedback: "Correct! Rapid drops often continue. A snack prevents hypoglycemia." },
      { text: "Exercise to burn off excess insulin", correct: false, feedback: "Exercise would make blood sugar drop even faster." }
    ],
    category: "Trend Monitoring"
  },
  {
    situation: "Your child with diabetes is sick with the flu, not eating much, and blood glucose is 180 mg/dL.",
    options: [
      { text: "Skip insulin since they're not eating", correct: false, feedback: "Never skip basal insulin! Illness often raises blood sugar." },
      { text: "Give usual basal insulin, adjust meal doses, monitor for ketones", correct: true, feedback: "Correct! Sick day management requires careful monitoring and hydration." },
      { text: "Double the insulin to fight the illness", correct: false, feedback: "Too much insulin with reduced eating causes hypoglycemia." },
      { text: "Let them eat whatever they want to get energy", correct: false, feedback: "Blood sugar management is still important during illness." }
    ],
    category: "Sick Day Management"
  },
  {
    situation: "After eating a large meal, blood glucose spikes to 280 mg/dL. It's been 30 minutes since you took insulin.",
    options: [
      { text: "Take another full dose of rapid insulin", correct: false, feedback: "Stacking insulin causes dangerous lows later. Wait for the first dose to work." },
      { text: "Go for a light walk and wait for insulin to peak", correct: true, feedback: "Correct! Light activity helps, and rapid insulin peaks around 1-2 hours." },
      { text: "Eat more protein to balance it out", correct: false, feedback: "More food won't lower blood sugar." },
      { text: "Panic and go to the emergency room", correct: false, feedback: "280 mg/dL after a meal, with insulin on board, isn't an emergency yet." }
    ],
    category: "Post-meal Spikes"
  }
];

const INSULIN_SCENARIOS = [
  {
    question: "When should you take rapid-acting insulin relative to a meal?",
    options: [
      { text: "30-45 minutes before eating", timing: 'early', feedback: "This timing works for regular insulin, but rapid-acting works faster." },
      { text: "15-20 minutes before eating", timing: 'optimal', feedback: "Correct! This allows rapid insulin to start working as food is absorbed." },
      { text: "Right as you start eating", timing: 'late', feedback: "This can cause a post-meal spike before insulin catches up." },
      { text: "30 minutes after eating", timing: 'very_late', feedback: "Too late! Blood sugar will spike significantly before insulin works." }
    ],
    insulinType: "rapid",
    correctTiming: "optimal"
  },
  {
    question: "You're about to eat a high-fat meal like pizza. When should you take rapid insulin?",
    options: [
      { text: "All at once, 15 minutes before eating", timing: 'standard', feedback: "Fat slows digestion - you may go low then high later." },
      { text: "Split dose: some before, some 1-2 hours after", timing: 'optimal', feedback: "Correct! Fat delays carb absorption, so extended coverage helps." },
      { text: "Double dose right before eating", timing: 'wrong', feedback: "This causes early hypoglycemia and doesn't address delayed absorption." },
      { text: "Skip the pre-meal dose, take it all after", timing: 'late', feedback: "You'll spike significantly before the late insulin works." }
    ],
    insulinType: "rapid",
    correctTiming: "optimal",
    mealType: "high-fat"
  },
  {
    question: "When is the best time to take long-acting (basal) insulin?",
    options: [
      { text: "Only when blood sugar is high", timing: 'reactive', feedback: "Basal insulin should be taken consistently, not reactively." },
      { text: "At the same time every day", timing: 'optimal', feedback: "Correct! Consistency helps maintain steady background insulin levels." },
      { text: "Right before each meal", timing: 'wrong', feedback: "That's when rapid insulin is used. Basal is usually once or twice daily." },
      { text: "Whenever you remember", timing: 'inconsistent', feedback: "Inconsistent timing leads to gaps or overlaps in coverage." }
    ],
    insulinType: "basal",
    correctTiming: "optimal"
  },
  {
    question: "Your blood sugar is 250 mg/dL before lunch. When should you take your correction + meal dose?",
    options: [
      { text: "Wait until blood sugar normalizes, then eat", timing: 'delayed', feedback: "This can work but delays your meal significantly." },
      { text: "Take correction now, eat in 20-30 minutes", timing: 'optimal', feedback: "Correct! Giving insulin a head start helps with high starting glucose." },
      { text: "Eat first, then take insulin based on how you feel", timing: 'reactive', feedback: "This leads to even higher post-meal spikes." },
      { text: "Skip the correction, just take meal insulin", timing: 'insufficient', feedback: "You need extra insulin to address the already-high glucose." }
    ],
    insulinType: "rapid",
    correctTiming: "optimal",
    scenario: "correction"
  },
  {
    question: "You're having a low-carb meal (grilled chicken salad). How should you adjust rapid insulin timing?",
    options: [
      { text: "Take same amount 15-20 minutes before", timing: 'standard', feedback: "Less carbs means less insulin needed, not just same timing." },
      { text: "Reduce dose and take closer to meal time", timing: 'optimal', feedback: "Correct! Fewer carbs need less insulin, and protein/fat digest slower." },
      { text: "Skip rapid insulin entirely", timing: 'skip', feedback: "Even low-carb meals may need some coverage for protein effects." },
      { text: "Take insulin 45 minutes before", timing: 'early', feedback: "With fewer carbs, this timing risks hypoglycemia." }
    ],
    insulinType: "rapid",
    correctTiming: "optimal",
    mealType: "low-carb"
  }
];

// ============================================
// SHARED COMPONENTS
// ============================================

const GameCard = ({ title, description, icon, onClick, color, isActive }) => (
  <div
    onClick={onClick}
    className={`
      relative overflow-hidden cursor-pointer transition-all duration-500 transform
      ${isActive ? 'scale-105 ring-4 ring-white/50' : 'hover:scale-102 hover:shadow-2xl'}
    `}
    style={{
      background: `linear-gradient(135deg, ${color}dd, ${color}99)`,
      borderRadius: '24px',
      padding: '32px',
      minHeight: '200px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)'
    }}
  >
    <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ fontSize: '120px', transform: 'translate(20%, -20%)' }}>
      {icon}
    </div>
    <div className="relative z-10">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'system-ui' }}>{title}</h3>
      <p className="text-white/80 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

const ScoreDisplay = ({ score, maxScore, label }) => (
  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3">
    <div className="text-3xl">⭐</div>
    <div>
      <div className="text-white/60 text-xs uppercase tracking-wider">{label}</div>
      <div className="text-white text-xl font-bold">{score} / {maxScore}</div>
    </div>
  </div>
);

const ProgressBar = ({ current, total, color = '#10b981' }) => (
  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-500"
      style={{ width: `${(current / total) * 100}%`, background: color }}
    />
  </div>
);

const Button = ({ children, onClick, variant = 'primary', disabled = false, className = '' }) => {
  const baseStyles = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform active:scale-95";
  const variants = {
    primary: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30",
    secondary: "bg-white/20 text-white hover:bg-white/30 backdrop-blur-md",
    danger: "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600",
    success: "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

// ============================================
// GAME 1: GLUCOSE GUARDIAN
// ============================================

const GlucoseGuardian = ({ onBack }) => {
  const [glucose, setGlucose] = useState(120);
  const [history, setHistory] = useState([{ time: 0, value: 120 }]);
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);
  const [insulinOnBoard, setInsulinOnBoard] = useState(0);
  const [carbsDigesting, setCarbsDigesting] = useState(0);
  const [activityLevel, setActivityLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const TARGET_LOW = 70;
  const TARGET_HIGH = 180;
  const DANGER_LOW = 54;
  const DANGER_HIGH = 250;

  useEffect(() => {
    if (gameOver || isPaused) return;

    const interval = setInterval(() => {
      setTime(t => t + 1);

      // Simulate glucose changes
      setGlucose(prev => {
        let change = 0;

        // Insulin effect (lowers glucose)
        change -= insulinOnBoard * 3;

        // Carbs effect (raises glucose)
        change += carbsDigesting * 2;

        // Activity effect (lowers glucose)
        change -= activityLevel * 2;

        // Random drift
        change += (Math.random() - 0.5) * 5;

        // Dawn phenomenon (slight rise over time)
        change += 0.5;

        const newValue = Math.max(40, Math.min(400, prev + change));

        // Check for danger zones
        if (newValue < DANGER_LOW) {
          setMessage('⚠️ SEVERE HYPOGLYCEMIA! Immediate action needed!');
        } else if (newValue > DANGER_HIGH) {
          setMessage('⚠️ SEVERE HYPERGLYCEMIA! Consider correction dose.');
        } else if (newValue < TARGET_LOW) {
          setMessage('⚡ Low glucose warning - consider carbs');
        } else if (newValue > TARGET_HIGH) {
          setMessage('📈 Above target range');
        } else {
          setMessage('✅ In target range!');
        }

        return newValue;
      });

      // Decay effects over time
      setInsulinOnBoard(prev => Math.max(0, prev - 0.1));
      setCarbsDigesting(prev => Math.max(0, prev - 0.15));
      setActivityLevel(prev => Math.max(0, prev - 0.2));

      // Update history
      setHistory(prev => {
        const newHistory = [...prev, { time: time + 1, value: glucose }];
        return newHistory.slice(-30); // Keep last 30 points
      });

      // Score based on time in range
      if (glucose >= TARGET_LOW && glucose <= TARGET_HIGH) {
        setScore(s => s + 1);
      }

      // Game over conditions
      if (glucose < 40 || glucose > 350) {
        setGameOver(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [glucose, insulinOnBoard, carbsDigesting, activityLevel, time, gameOver, isPaused]);

  const takeInsulin = (units) => {
    setInsulinOnBoard(prev => prev + units);
    setMessage(`💉 Took ${units} unit${units > 1 ? 's' : ''} of insulin`);
  };

  const eatCarbs = (grams) => {
    setCarbsDigesting(prev => prev + grams / 15);
    setMessage(`🍎 Ate ${grams}g of carbs`);
  };

  const doActivity = (intensity) => {
    setActivityLevel(prev => prev + intensity);
    setMessage(`🏃 Started ${intensity > 1 ? 'intense' : 'light'} activity`);
  };

  const getGlucoseColor = () => {
    if (glucose < TARGET_LOW) return '#ef4444';
    if (glucose > TARGET_HIGH) return '#f59e0b';
    return '#10b981';
  };

  if (gameOver) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <div className="text-center bg-white/10 backdrop-blur-xl rounded-3xl p-12 max-w-md">
          <div className="text-6xl mb-6">🎮</div>
          <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
          <p className="text-white/70 mb-2">Final Glucose: {Math.round(glucose)} mg/dL</p>
          <p className="text-white/70 mb-6">Time in Range Score: {score} seconds</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>Play Again</Button>
            <Button variant="secondary" onClick={onBack}>Back to Menu</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <h1 className="text-2xl font-bold text-white">🛡️ Glucose Guardian</h1>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </Button>
          <ScoreDisplay score={score} maxScore={time} label="Time in Range" />
        </div>
      </div>

      {/* Main Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Glucose Display */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-white/60 text-sm uppercase tracking-wider mb-1">Current Glucose</div>
              <div className="text-6xl font-bold" style={{ color: getGlucoseColor() }}>
                {Math.round(glucose)}
                <span className="text-2xl text-white/60 ml-2">mg/dL</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/60 text-sm">Target Range</div>
              <div className="text-white text-lg">{TARGET_LOW} - {TARGET_HIGH} mg/dL</div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={history}>
                <defs>
                  <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#ffffff40" />
                <YAxis domain={[40, 300]} stroke="#ffffff40" />
                <ReferenceLine y={TARGET_LOW} stroke="#ef4444" strokeDasharray="5 5" />
                <ReferenceLine y={TARGET_HIGH} stroke="#f59e0b" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="value" stroke="none" fill="url(#glucoseGradient)" />
                <Line type="monotone" dataKey="value" stroke={getGlucoseColor()} strokeWidth={3} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Message */}
          <div className="mt-4 p-4 rounded-xl bg-white/5 text-center">
            <p className="text-white text-lg">{message}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Status Indicators */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6">
            <h3 className="text-white font-semibold mb-4">Active Effects</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-white/70 text-sm mb-1">
                  <span>💉 Insulin on Board</span>
                  <span>{insulinOnBoard.toFixed(1)} units</span>
                </div>
                <ProgressBar current={insulinOnBoard} total={5} color="#3b82f6" />
              </div>
              <div>
                <div className="flex justify-between text-white/70 text-sm mb-1">
                  <span>🍎 Carbs Digesting</span>
                  <span>{(carbsDigesting * 15).toFixed(0)}g</span>
                </div>
                <ProgressBar current={carbsDigesting} total={5} color="#f59e0b" />
              </div>
              <div>
                <div className="flex justify-between text-white/70 text-sm mb-1">
                  <span>🏃 Activity Level</span>
                  <span>{activityLevel > 0 ? 'Active' : 'Resting'}</span>
                </div>
                <ProgressBar current={activityLevel} total={3} color="#10b981" />
              </div>
            </div>
          </div>

          {/* Insulin */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6">
            <h3 className="text-white font-semibold mb-4">💉 Take Insulin</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="secondary" onClick={() => takeInsulin(1)}>1u</Button>
              <Button variant="secondary" onClick={() => takeInsulin(2)}>2u</Button>
              <Button variant="secondary" onClick={() => takeInsulin(3)}>3u</Button>
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6">
            <h3 className="text-white font-semibold mb-4">🍎 Eat Carbs</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="secondary" onClick={() => eatCarbs(15)}>15g</Button>
              <Button variant="secondary" onClick={() => eatCarbs(30)}>30g</Button>
              <Button variant="secondary" onClick={() => eatCarbs(45)}>45g</Button>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6">
            <h3 className="text-white font-semibold mb-4">🏃 Activity</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => doActivity(1)}>Light Walk</Button>
              <Button variant="secondary" onClick={() => doActivity(2)}>Exercise</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// GAME 2: CARB COUNTER CHALLENGE
// ============================================

const CarbCounter = ({ onBack }) => {
  const [currentFood, setCurrentFood] = useState(null);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [maxRounds] = useState(10);
  const [feedback, setFeedback] = useState(null);
  const [usedFoods, setUsedFoods] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    selectNewFood();
  }, []);

  const selectNewFood = () => {
    const available = FOODS.filter(f => !usedFoods.includes(f.name));
    if (available.length === 0 || round > maxRounds) {
      setGameComplete(true);
      return;
    }
    const food = available[Math.floor(Math.random() * available.length)];
    setCurrentFood(food);
    setUsedFoods(prev => [...prev, food.name]);
    setGuess('');
    setFeedback(null);
    setShowHint(false);
  };

  const submitGuess = () => {
    const guessNum = parseInt(guess);
    if (isNaN(guessNum)) return;

    const actual = currentFood.carbs;
    const diff = Math.abs(guessNum - actual);
    const percentOff = (diff / actual) * 100;

    let points = 0;
    let message = '';
    let emoji = '';

    if (diff === 0) {
      points = 100;
      message = 'Perfect!';
      emoji = '🎯';
    } else if (diff <= 3) {
      points = 80;
      message = 'Excellent!';
      emoji = '🌟';
    } else if (diff <= 5) {
      points = 60;
      message = 'Great!';
      emoji = '⭐';
    } else if (diff <= 10) {
      points = 40;
      message = 'Good try!';
      emoji = '👍';
    } else if (diff <= 15) {
      points = 20;
      message = 'Close-ish';
      emoji = '🤔';
    } else {
      points = 0;
      message = 'Way off!';
      emoji = '😅';
    }

    setScore(prev => prev + points);
    setFeedback({
      points,
      message,
      emoji,
      actual,
      guess: guessNum,
      diff
    });
  };

  const nextRound = () => {
    if (round >= maxRounds) {
      setGameComplete(true);
    } else {
      setRound(r => r + 1);
      selectNewFood();
    }
  };

  if (gameComplete) {
    const percentage = Math.round((score / (maxRounds * 100)) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <div className="text-center bg-white/10 backdrop-blur-xl rounded-3xl p-12 max-w-md">
          <div className="text-6xl mb-6">
            {percentage >= 80 ? '🏆' : percentage >= 60 ? '🌟' : percentage >= 40 ? '👍' : '📚'}
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Challenge Complete!</h2>
          <p className="text-white/70 mb-2">Final Score: {score} / {maxRounds * 100}</p>
          <p className="text-white/70 mb-6">Accuracy: {percentage}%</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>Play Again</Button>
            <Button variant="secondary" onClick={onBack}>Back to Menu</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <h1 className="text-2xl font-bold text-white">🥗 Carb Counter Challenge</h1>
        <ScoreDisplay score={score} maxScore={maxRounds * 100} label="Score" />
      </div>

      {/* Progress */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex justify-between text-white/70 text-sm mb-2">
          <span>Round {round} of {maxRounds}</span>
          <span>{Math.round((round / maxRounds) * 100)}% Complete</span>
        </div>
        <ProgressBar current={round} total={maxRounds} />
      </div>

      {/* Game Card */}
      {currentFood && (
        <div className="max-w-lg mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center">
            {/* Food Display */}
            <div className="text-9xl mb-6 animate-bounce">{currentFood.image}</div>
            <h2 className="text-3xl font-bold text-white mb-2">{currentFood.name}</h2>

            {showHint && (
              <p className="text-white/60 text-sm mb-4">💡 Hint: {currentFood.hint}</p>
            )}

            {!feedback ? (
              <>
                <p className="text-white/70 mb-6">How many grams of carbs?</p>

                {/* Input */}
                <div className="flex gap-4 justify-center mb-6">
                  <input
                    type="number"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Enter grams"
                    className="w-32 px-4 py-3 rounded-xl bg-white/20 text-white text-center text-2xl font-bold border-2 border-white/30 focus:border-emerald-400 focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && submitGuess()}
                  />
                  <span className="text-white/70 self-center text-xl">g</span>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 justify-center">
                  <Button onClick={submitGuess} disabled={!guess}>Submit Guess</Button>
                  {!showHint && (
                    <Button variant="secondary" onClick={() => setShowHint(true)}>💡 Hint</Button>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Feedback */}
                <div className="mb-6">
                  <div className="text-6xl mb-4">{feedback.emoji}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{feedback.message}</h3>
                  <p className="text-white/70">
                    You guessed: <span className="text-white font-bold">{feedback.guess}g</span>
                  </p>
                  <p className="text-white/70">
                    Actual: <span className="text-emerald-400 font-bold">{feedback.actual}g</span>
                  </p>
                  <p className="text-white/70">
                    Difference: <span className={feedback.diff <= 5 ? 'text-emerald-400' : 'text-amber-400'}>{feedback.diff}g</span>
                  </p>
                  <div className="mt-4 py-2 px-4 rounded-xl inline-block" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <span className="text-white font-bold">+{feedback.points} points</span>
                  </div>
                </div>

                <Button onClick={nextRound}>
                  {round >= maxRounds ? 'See Results' : 'Next Food →'}
                </Button>
              </>
            )}
          </div>

          {/* Quick Reference */}
          <div className="mt-6 bg-white/5 backdrop-blur-xl rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-3">📊 Carb Reference Guide</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-white/70">🍞 1 slice bread ≈ 15g</div>
              <div className="text-white/70">🍎 Medium fruit ≈ 15-25g</div>
              <div className="text-white/70">🥛 1 cup milk ≈ 12g</div>
              <div className="text-white/70">🍚 1 cup rice ≈ 45g</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// GAME 3: EMERGENCY RESPONSE
// ============================================

const EmergencyResponse = ({ onBack }) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);
  const [streak, setStreak] = useState(0);

  const scenario = EMERGENCY_SCENARIOS[currentScenario];

  useEffect(() => {
    if (!timerActive || answered || gameComplete) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, answered, gameComplete]);

  const handleTimeout = () => {
    setAnswered(true);
    setSelectedAnswer(-1);
    setStreak(0);
  };

  const handleAnswer = (index) => {
    if (answered) return;

    setAnswered(true);
    setSelectedAnswer(index);
    setTimerActive(false);

    const option = scenario.options[index];
    if (option.correct) {
      const timeBonus = Math.floor(timeLeft / 3);
      const points = 100 + timeBonus + (streak * 10);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const nextScenario = () => {
    if (currentScenario >= EMERGENCY_SCENARIOS.length - 1) {
      setGameComplete(true);
    } else {
      setCurrentScenario(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setTimeLeft(30);
      setTimerActive(true);
    }
  };

  if (gameComplete) {
    const maxPossible = EMERGENCY_SCENARIOS.length * 110; // Base + some time bonus
    const percentage = Math.round((score / maxPossible) * 100);

    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <div className="text-center bg-white/10 backdrop-blur-xl rounded-3xl p-12 max-w-md">
          <div className="text-6xl mb-6">🚑</div>
          <h2 className="text-3xl font-bold text-white mb-4">Training Complete!</h2>
          <p className="text-white/70 mb-2">Final Score: {score}</p>
          <p className="text-white/70 mb-6">
            {percentage >= 80 ? "You're ready for emergencies!" :
              percentage >= 60 ? "Good knowledge, keep practicing!" :
                "Review emergency protocols and try again!"}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>Play Again</Button>
            <Button variant="secondary" onClick={onBack}>Back to Menu</Button>
          </div>
        </div>
      </div>
    );
  }

  const getTimerColor = () => {
    if (timeLeft > 20) return '#10b981';
    if (timeLeft > 10) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <h1 className="text-2xl font-bold text-white">🚨 Emergency Response</h1>
        <div className="flex gap-4 items-center">
          {streak > 0 && (
            <div className="bg-amber-500/20 text-amber-400 px-4 py-2 rounded-xl font-bold">
              🔥 {streak} Streak
            </div>
          )}
          <ScoreDisplay score={score} maxScore={EMERGENCY_SCENARIOS.length * 110} label="Score" />
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex justify-between text-white/70 text-sm mb-2">
          <span>Scenario {currentScenario + 1} of {EMERGENCY_SCENARIOS.length}</span>
          <span>Category: {scenario.category}</span>
        </div>
        <ProgressBar current={currentScenario + 1} total={EMERGENCY_SCENARIOS.length} />
      </div>

      {/* Timer */}
      {!answered && (
        <div className="max-w-3xl mx-auto mb-6">
          <div className="flex items-center justify-center gap-4">
            <div className="text-4xl">⏱️</div>
            <div className="flex-1">
              <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${(timeLeft / 30) * 100}%`,
                    background: getTimerColor()
                  }}
                />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: getTimerColor() }}>
              {timeLeft}s
            </div>
          </div>
        </div>
      )}

      {/* Scenario Card */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8">
          {/* Situation */}
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🚨</div>
              <div>
                <h2 className="text-white font-bold text-lg mb-2">EMERGENCY SCENARIO</h2>
                <p className="text-white text-xl leading-relaxed">{scenario.situation}</p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {scenario.options.map((option, index) => {
              let bgColor = 'bg-white/10 hover:bg-white/20';
              let borderColor = 'border-white/20';

              if (answered) {
                if (option.correct) {
                  bgColor = 'bg-emerald-500/30';
                  borderColor = 'border-emerald-500';
                } else if (index === selectedAnswer && !option.correct) {
                  bgColor = 'bg-red-500/30';
                  borderColor = 'border-red-500';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={answered}
                  className={`
                    w-full p-5 rounded-xl text-left transition-all duration-300 border-2
                    ${bgColor} ${borderColor}
                    ${!answered ? 'cursor-pointer transform hover:scale-[1.02]' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                      ${answered && option.correct ? 'bg-emerald-500 text-white' :
                        answered && index === selectedAnswer ? 'bg-red-500 text-white' :
                          'bg-white/20 text-white'}
                    `}>
                      {answered && option.correct ? '✓' : String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-white text-lg">{option.text}</span>
                  </div>

                  {/* Feedback */}
                  {answered && (index === selectedAnswer || option.correct) && (
                    <div className={`mt-4 p-3 rounded-lg ${option.correct ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                      <p className={option.correct ? 'text-emerald-300' : 'text-red-300'}>
                        {option.feedback}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Timeout Message */}
          {selectedAnswer === -1 && (
            <div className="mt-6 p-4 bg-amber-500/20 rounded-xl text-center">
              <p className="text-amber-300 font-semibold">⏰ Time's up! In emergencies, quick action is critical.</p>
            </div>
          )}

          {/* Next Button */}
          {answered && (
            <div className="mt-8 text-center">
              <Button onClick={nextScenario}>
                {currentScenario >= EMERGENCY_SCENARIOS.length - 1 ? 'See Results' : 'Next Scenario →'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// GAME 4: INSULIN TIMING
// ============================================

const InsulinTiming = ({ onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const question = INSULIN_SCENARIOS[currentQuestion];

  const handleAnswer = (index) => {
    if (answered) return;

    setAnswered(true);
    setSelectedAnswer(index);

    const option = question.options[index];
    if (option.timing === question.correctTiming) {
      setScore(prev => prev + 100);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion >= INSULIN_SCENARIOS.length - 1) {
      setGameComplete(true);
    } else {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    }
  };

  // Visualization of insulin action curves
  const InsulinCurve = ({ timing }) => {
    const getCurveData = () => {
      const base = [];
      for (let i = 0; i <= 6; i += 0.5) {
        let value = 0;
        // Rapid insulin curve (peaks around 1-2 hours)
        value = Math.exp(-Math.pow((i - 1.5), 2) / 0.8) * 100;
        base.push({ time: i, value });
      }
      return base;
    };

    const getMealData = () => {
      const data = [];
      let mealStart = 0;
      switch (timing) {
        case 'early': mealStart = 0.75; break;
        case 'optimal': mealStart = 0.33; break;
        case 'late': mealStart = 0; break;
        case 'very_late': mealStart = -0.5; break;
        default: mealStart = 0.33;
      }
      for (let i = 0; i <= 6; i += 0.5) {
        let value = 0;
        // Carb absorption curve (peaks around 45-60 min after eating)
        if (i >= (0.33 - mealStart)) {
          value = Math.exp(-Math.pow((i - (0.33 - mealStart) - 1), 2) / 1.2) * 80;
        }
        data.push({ time: i, meal: value });
      }
      return data;
    };

    const insulinData = getCurveData();
    const mealData = getMealData();
    const combined = insulinData.map((d, i) => ({
      ...d,
      meal: mealData[i]?.meal || 0
    }));

    return (
      <div className="h-32 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={combined}>
            <XAxis dataKey="time" stroke="#ffffff40" tickFormatter={(v) => `${v}h`} />
            <YAxis stroke="#ffffff40" hide />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} name="Insulin" />
            <Line type="monotone" dataKey="meal" stroke="#f59e0b" strokeWidth={2} dot={false} name="Carbs" />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 text-xs mt-2">
          <span className="text-blue-400">━━ Insulin action</span>
          <span className="text-amber-400">━━ Carb absorption</span>
        </div>
      </div>
    );
  };

  if (gameComplete) {
    const percentage = Math.round((score / (INSULIN_SCENARIOS.length * 100)) * 100);

    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <div className="text-center bg-white/10 backdrop-blur-xl rounded-3xl p-12 max-w-md">
          <div className="text-6xl mb-6">💉</div>
          <h2 className="text-3xl font-bold text-white mb-4">Training Complete!</h2>
          <p className="text-white/70 mb-2">Final Score: {score} / {INSULIN_SCENARIOS.length * 100}</p>
          <p className="text-white/70 mb-6">
            {percentage >= 80 ? "Excellent timing knowledge!" :
              percentage >= 60 ? "Good understanding, keep learning!" :
                "Review insulin timing principles and try again!"}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>Play Again</Button>
            <Button variant="secondary" onClick={onBack}>Back to Menu</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <h1 className="text-2xl font-bold text-white">⏱️ Insulin Timing</h1>
        <ScoreDisplay score={score} maxScore={INSULIN_SCENARIOS.length * 100} label="Score" />
      </div>

      {/* Progress */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex justify-between text-white/70 text-sm mb-2">
          <span>Question {currentQuestion + 1} of {INSULIN_SCENARIOS.length}</span>
          <span>Insulin Type: {question.insulinType === 'rapid' ? '⚡ Rapid-Acting' : '🕐 Long-Acting'}</span>
        </div>
        <ProgressBar current={currentQuestion + 1} total={INSULIN_SCENARIOS.length} />
      </div>

      {/* Question Card */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8">
          {/* Question */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💉</div>
              <div>
                <h2 className="text-white font-bold text-xl mb-2">{question.question}</h2>
                {question.mealType && (
                  <span className="inline-block px-3 py-1 bg-amber-500/30 rounded-full text-amber-300 text-sm">
                    {question.mealType === 'high-fat' ? '🍕 High-Fat Meal' : '🥗 Low-Carb Meal'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {question.options.map((option, index) => {
              let bgColor = 'bg-white/10 hover:bg-white/20';
              let borderColor = 'border-white/20';
              const isCorrect = option.timing === question.correctTiming;

              if (answered) {
                if (isCorrect) {
                  bgColor = 'bg-emerald-500/30';
                  borderColor = 'border-emerald-500';
                } else if (index === selectedAnswer && !isCorrect) {
                  bgColor = 'bg-red-500/30';
                  borderColor = 'border-red-500';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={answered}
                  className={`
                    w-full p-5 rounded-xl text-left transition-all duration-300 border-2
                    ${bgColor} ${borderColor}
                    ${!answered ? 'cursor-pointer transform hover:scale-[1.02]' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                      ${answered && isCorrect ? 'bg-emerald-500 text-white' :
                        answered && index === selectedAnswer ? 'bg-red-500 text-white' :
                          'bg-white/20 text-white'}
                    `}>
                      {answered && isCorrect ? '✓' : String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-white text-lg">{option.text}</span>
                  </div>

                  {/* Feedback with visualization */}
                  {answered && (index === selectedAnswer || isCorrect) && (
                    <div className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                      <p className={isCorrect ? 'text-emerald-300' : 'text-red-300'}>
                        {option.feedback}
                      </p>
                      <InsulinCurve timing={option.timing} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          {answered && (
            <div className="mt-8 text-center">
              <Button onClick={nextQuestion}>
                {currentQuestion >= INSULIN_SCENARIOS.length - 1 ? 'See Results' : 'Next Question →'}
              </Button>
            </div>
          )}
        </div>

        {/* Educational Info */}
        <div className="mt-6 bg-white/5 backdrop-blur-xl rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-3">📚 Insulin Timing Basics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
            <div>
              <strong className="text-blue-400">⚡ Rapid-Acting:</strong>
              <p>Starts: 15 min | Peaks: 1-2 hrs | Duration: 3-5 hrs</p>
            </div>
            <div>
              <strong className="text-purple-400">🕐 Long-Acting:</strong>
              <p>Starts: 2 hrs | No peak | Duration: 20-24 hrs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================

const DiabetesMinigames = () => {
  const [activeGame, setActiveGame] = useState(null);
  const [showIntro, setShowIntro] = useState(true);

  const games = [
    {
      id: 'glucose',
      title: 'Glucose Guardian',
      description: 'Manage blood glucose in real-time. Balance insulin, carbs, and activity to stay in range!',
      icon: '🛡️',
      color: '#10b981'
    },
    {
      id: 'carbs',
      title: 'Carb Counter',
      description: 'Test your carb estimation skills! Guess the carbs in common foods.',
      icon: '🥗',
      color: '#f59e0b'
    },
    {
      id: 'emergency',
      title: 'Emergency Response',
      description: 'Quick-fire diabetes emergency scenarios. Think fast, act faster!',
      icon: '🚨',
      color: '#ef4444'
    },
    {
      id: 'insulin',
      title: 'Insulin Timing',
      description: 'Master insulin timing for different situations and meal types.',
      icon: '⏱️',
      color: '#3b82f6'
    }
  ];

  if (showIntro) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
      }}>
        <div className="text-center max-w-2xl">
          <div className="text-8xl mb-8 animate-pulse">🎮</div>
          <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'system-ui' }}>
            Diabetes Quest
          </h1>
          <p className="text-xl text-white/70 mb-8">
            Learn diabetes management through fun, interactive mini-games.
            Master glucose control, carb counting, emergency response, and insulin timing!
          </p>
          <Button onClick={() => setShowIntro(false)} className="text-xl px-8 py-4">
            Start Playing →
          </Button>
          <p className="text-white/50 text-sm mt-6">
            Educational game for learning diabetes management concepts
          </p>
        </div>
      </div>
    );
  }

  if (activeGame === 'glucose') return <GlucoseGuardian onBack={() => setActiveGame(null)} />;
  if (activeGame === 'carbs') return <CarbCounter onBack={() => setActiveGame(null)} />;
  if (activeGame === 'emergency') return <EmergencyResponse onBack={() => setActiveGame(null)} />;
  if (activeGame === 'insulin') return <InsulinTiming onBack={() => setActiveGame(null)} />;

  return (
    <div className="min-h-screen p-8" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
    }}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'system-ui' }}>
          🎮 Diabetes Quest
        </h1>
        <p className="text-white/60">Choose a mini-game to start learning!</p>
      </div>

      {/* Game Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map(game => (
          <GameCard
            key={game.id}
            title={game.title}
            description={game.description}
            icon={game.icon}
            color={game.color}
            onClick={() => setActiveGame(game.id)}
            isActive={activeGame === game.id}
          />
        ))}
      </div>

      {/* Footer Info */}
      <div className="max-w-3xl mx-auto mt-12 text-center">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-3">📚 Learning Objectives</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/70">
            <div>🛡️ Blood glucose management</div>
            <div>🥗 Carbohydrate estimation</div>
            <div>🚨 Emergency protocols</div>
            <div>⏱️ Insulin timing</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiabetesMinigames;
