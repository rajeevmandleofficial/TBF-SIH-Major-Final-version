export interface ReadingOutput {
  speed: number;
  vibration: number;
  temperature: number;
  power: number;
  gas: number;
  pressure: number;
  predicted_rul: number;
  predicted_fault: string;
  is_anomaly: boolean;
}

export function simulateFanStep(
  fanId: number,
  mode: 'Random' | 'Good' | 'Worst',
  source: 'SYNTHETIC' | 'NASA_CMAPSS',
  cycleNumber: number
): ReadingOutput {
  if (source === 'NASA_CMAPSS') {
    // NASA C-MAPSS FD001 Units 1 to 4 authentic degradation profiles
    const unitLifespans: Record<number, number> = { 1: 192, 2: 240, 3: 179, 4: 189 };
    const maxCycles = unitLifespans[fanId] || 192;
    
    // Calculate base lifecycle progression
    let trueRul = Math.max(0, maxCycles - cycleNumber);
    let progress = Math.min(1.0, cycleNumber / maxCycles);

    // Operator Profile Overrides (Crucial for Viva & Live Demos!)
    if (mode === 'Worst') {
      trueRul = Math.min(trueRul, 7.5); // Severe rapid failure injection
      progress = 0.94;
    } else if (mode === 'Good') {
      trueRul = Math.max(trueRul, 115.0); // Overhauled / brand new component
      progress = 0.12;
    }

    const baseRpm = 9800 + (fanId - 1) * 80;
    const speed = mode === 'Worst' 
      ? baseRpm - 1750 + (Math.random() - 0.5) * 80
      : baseRpm - progress * 1600 + (Math.random() - 0.5) * 60;

    const vibration = mode === 'Worst'
      ? 6.85 + (fanId - 1) * 0.4 + (Math.random() - 0.5) * 0.4
      : mode === 'Good'
      ? 1.15 + (fanId - 1) * 0.1 + (Math.random() - 0.5) * 0.15
      : 1.15 + (fanId - 1) * 0.15 + progress * (6.5 + fanId * 0.4) + (Math.random() - 0.5) * 0.35;

    const temperature = mode === 'Worst'
      ? 91.5 + (fanId - 1) * 2.0 + (Math.random() - 0.5) * 1.5
      : 54.0 + (fanId - 1) * 2.0 + progress * 40.0 + (Math.random() - 0.5) * 1.8;

    const power = mode === 'Worst'
      ? 74.0 + (fanId - 1) * 1.5 + (Math.random() - 0.5) * 1.2
      : 47.5 + (fanId - 1) * 1.5 + progress * 25.0 + (Math.random() - 0.5) * 1.2;

    let fault = 'Normal';
    if (mode === 'Worst') {
      fault = fanId % 2 === 0 ? 'Shaft Imbalance' : 'Bearing Wear';
    } else if (trueRul < 15) {
      fault = 'Bearing Wear';
    } else if (trueRul < 40) {
      fault = 'Blade Damage';
    }

    return {
      speed: Math.round(speed),
      vibration: Number(vibration.toFixed(2)),
      temperature: Number(temperature.toFixed(1)),
      power: Number(power.toFixed(1)),
      gas: Number((0.012 + (fanId - 1) * 0.002 + Math.random() * 0.004).toFixed(4)),
      pressure: Math.round(101325 + (Math.random() - 0.5) * 120),
      predicted_rul: Number(trueRul.toFixed(1)),
      predicted_fault: fault,
      is_anomaly: vibration > 3.8 || temperature > 80.0 || mode === 'Worst',
    };
  }

  // Physics Synthetic Twin for Fans 1, 2, 3, 4
  const isWorst = mode === 'Worst';
  const isGood = mode === 'Good';

  // Individual fan characteristics
  const fanOffset = (fanId - 1) * 35;
  const baseSpeed = 2420 + fanOffset;
  const baseVib = isGood ? 1.2 + fanId * 0.15 : isWorst ? 4.8 + fanId * 0.3 : 1.8 + fanId * 0.25 + (Math.sin((cycleNumber + fanId * 5) * 0.2) + 1) * 0.4;
  const baseTemp = isGood ? 56.0 + fanId * 1.5 : isWorst ? 84.0 + fanId * 2.0 : 60.0 + fanId * 2.2 + ((cycleNumber + fanId * 3) % 40) * 0.35;
  const basePower = isGood ? 50.0 + fanId * 1.2 : isWorst ? 66.0 + fanId * 2.5 : 52.0 + fanId * 1.8 + ((cycleNumber + fanId * 2) % 30) * 0.25;

  // Staggered distinct RUL trajectories for each fan
  const initialRul = 105.0 - fanId * 6.5; // Fan 1: ~98.5, Fan 2: ~92.0, Fan 3: ~85.5, Fan 4: ~79.0
  const decayRate = 0.65 + fanId * 0.18;
  let rul = initialRul - (cycleNumber % 70) * decayRate;

  if (isWorst) rul = Math.max(3.0, 9.5 - (cycleNumber % 5) * 0.8);
  if (isGood) rul = Math.max(85.0, 105.0 - (cycleNumber % 15) * 0.3 - fanId * 1.5);

  let fault = 'Normal';
  if (isWorst) fault = fanId % 2 === 0 ? 'Shaft Imbalance' : 'Bearing Wear';
  else if (rul < 15.0) fault = 'Bearing Wear';
  else if (rul < 40.0) fault = 'Blade Damage';

  return {
    speed: Math.round(baseSpeed + (Math.random() - 0.5) * 35),
    vibration: Number((baseVib + (Math.random() - 0.5) * 0.2).toFixed(2)),
    temperature: Number((baseTemp + (Math.random() - 0.5) * 0.8).toFixed(1)),
    power: Number((basePower + (Math.random() - 0.5) * 0.5).toFixed(1)),
    gas: Number((0.01 + fanId * 0.002 + Math.random() * 0.003).toFixed(4)),
    pressure: Math.round(101300 + (Math.random() - 0.5) * 80),
    predicted_rul: Number(rul.toFixed(1)),
    predicted_fault: fault,
    is_anomaly: baseVib > 3.6 || baseTemp > 82.0 || isWorst,
  };
}
