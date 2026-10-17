'use client';

import { useState, useMemo } from 'react';

export interface ChartPoint {
  step: number;
  fan1: number;
  fan2: number;
  fan3: number;
  fan4: number;
}

interface RULChartProps {
  data: ChartPoint[];
  cycle: number;
  source: string;
  isDark?: boolean;
}

const FAN_COLORS = {
  fan1: '#0284c7', // Sky Blue
  fan2: '#059669', // Emerald Green
  fan3: '#d97706', // Amber Yellow
  fan4: '#7c3aed', // Violet Purple
};

export function RULChart({ data, cycle, source, isDark = false }: RULChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Layout bounds (SVG coordinate system)
  const SVG_WIDTH = 900;
  const SVG_HEIGHT = 320;
  const PAD = { top: 25, right: 35, bottom: 40, left: 55 };
  const PLOT_W = SVG_WIDTH - PAD.left - PAD.right;
  const PLOT_H = SVG_HEIGHT - PAD.top - PAD.bottom;

  // Theme-aware color variables
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(15, 23, 42, 0.08)';
  const axisTextColor = isDark ? '#94a3b8' : '#475569';
  const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)';
  const tooltipBorder = isDark ? '#334155' : '#cbd5e1';
  const tooltipText = isDark ? '#f8fafc' : '#0f172a';

  // Calculate dynamic scales
  const { yUpper, yTicks, xTicks, pointsWithCoords } = useMemo(() => {
    const validData = data.length > 0 ? data : [{ step: 1, fan1: 100, fan2: 90, fan3: 80, fan4: 70 }];
    const minS = validData[0].step;
    const maxS = Math.max(minS + 1, validData[validData.length - 1].step);

    const allVals = validData.flatMap((d) => [d.fan1, d.fan2, d.fan3, d.fan4]);
    const maxVal = Math.max(100, ...allVals);
    const upperY = Math.max(120, Math.ceil((maxVal + 15) / 20) * 20);

    // Y grid ticks (e.g. 0, 40, 80, 120, 160, 200)
    const yTickCount = 5;
    const yStep = upperY / yTickCount;
    const yT = Array.from({ length: yTickCount + 1 }, (_, i) => Math.round(i * yStep));

    // X coordinates mapping
    const getX = (step: number) => PAD.left + ((step - minS) / Math.max(1, maxS - minS)) * PLOT_W;
    const getY = (val: number) => PAD.top + (1 - Math.max(0, val) / upperY) * PLOT_H;

    const coords = validData.map((d, idx) => ({
      ...d,
      idx,
      x: getX(d.step),
      y1: getY(d.fan1),
      y2: getY(d.fan2),
      y3: getY(d.fan3),
      y4: getY(d.fan4),
    }));

    return {
      minStep: minS,
      maxStep: maxS,
      yUpper: upperY,
      yTicks: yT,
      xTicks: coords.filter((_, i) => i % Math.max(1, Math.floor(coords.length / 6)) === 0),
      pointsWithCoords: coords,
    };
  }, [data, PLOT_W, PLOT_H, PAD.left, PAD.top]);

  const yWarn = PAD.top + (1 - 40 / yUpper) * PLOT_H;
  const yCrit = PAD.top + (1 - 15 / yUpper) * PLOT_H;

  const hoveredPoint = hoveredIndex !== null && pointsWithCoords[hoveredIndex] ? pointsWithCoords[hoveredIndex] : null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs transition-colors duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wider">
              PREDICTED RUL TRAJECTORY OVER TIME
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              SLIDING WINDOW (25 CYCLES)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Realtime SCADA Stream • Operational Cycle #{cycle} •{' '}
            {source === 'NASA_CMAPSS' ? 'NASA C-MAPSS FD001 Authentic Replay' : 'Physics Twin Simulation'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span> TBF-01 (Unit 1)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> TBF-02
          </span>
          <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> TBF-03
          </span>
          <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> TBF-04
          </span>
        </div>
      </div>

      {/* Industrial Vector Canvas */}
      <div className="relative w-full h-[320px] font-mono select-none">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Horizontal Grid lines & Y-axis labels */}
          {yTicks.map((val) => {
            const y = PAD.top + (1 - val / yUpper) * PLOT_H;
            return (
              <g key={`y-${val}`}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={SVG_WIDTH - PAD.right}
                  y2={y}
                  stroke={gridColor}
                  strokeWidth="1"
                />
                <text
                  x={PAD.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill={axisTextColor}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Vertical X-axis ticks & lines */}
          {xTicks.map((pt) => (
            <g key={`x-${pt.step}`}>
              <line
                x1={pt.x}
                y1={PAD.top}
                x2={pt.x}
                y2={SVG_HEIGHT - PAD.bottom}
                stroke={gridColor}
                strokeWidth="1"
              />
              <text
                x={pt.x}
                y={SVG_HEIGHT - PAD.bottom + 16}
                textAnchor="middle"
                fill={axisTextColor}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="600"
              >
                {pt.step}
              </text>
            </g>
          ))}

          {/* Warning Threshold Line (40 Days) */}
          <line
            x1={PAD.left}
            y1={yWarn}
            x2={SVG_WIDTH - PAD.right}
            y2={yWarn}
            stroke="#d97706"
            strokeWidth="1.6"
            strokeDasharray="4 4"
          />
          <text
            x={SVG_WIDTH - PAD.right}
            y={yWarn - 5}
            textAnchor="end"
            fill="#d97706"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Warning Limit (40d)
          </text>

          {/* Critical Threshold Line (15 Days) */}
          <line
            x1={PAD.left}
            y1={yCrit}
            x2={SVG_WIDTH - PAD.right}
            y2={yCrit}
            stroke="#dc2626"
            strokeWidth="1.6"
            strokeDasharray="4 4"
          />
          <text
            x={SVG_WIDTH - PAD.right}
            y={yCrit - 5}
            textAnchor="end"
            fill="#dc2626"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Critical Hazard (15d)
          </text>

          {/* Degradation Curves */}
          <path d={pointsWithCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y1}`).join(' ')} fill="none" stroke={FAN_COLORS.fan1} strokeWidth="2.5" />
          <path d={pointsWithCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y2}`).join(' ')} fill="none" stroke={FAN_COLORS.fan2} strokeWidth="2.5" />
          <path d={pointsWithCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y3}`).join(' ')} fill="none" stroke={FAN_COLORS.fan3} strokeWidth="2.5" />
          <path d={pointsWithCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y4}`).join(' ')} fill="none" stroke={FAN_COLORS.fan4} strokeWidth="2.5" />

          {/* Data Points */}
          {pointsWithCoords.map((pt, idx) => (
            <g key={`pt-${pt.step}`} onMouseEnter={() => setHoveredIndex(idx)}>
              <circle cx={pt.x} cy={pt.y1} r="3.5" fill={FAN_COLORS.fan1} />
              <circle cx={pt.x} cy={pt.y2} r="3.5" fill={FAN_COLORS.fan2} />
              <circle cx={pt.x} cy={pt.y3} r="3.5" fill={FAN_COLORS.fan3} />
              <circle cx={pt.x} cy={pt.y4} r="3.5" fill={FAN_COLORS.fan4} />
              {/* Wide mouse hover target */}
              <rect
                x={pt.x - 15}
                y={PAD.top}
                width="30"
                height={PLOT_H}
                fill="transparent"
                className="cursor-pointer"
              />
            </g>
          ))}

          {/* Hover Crosshair */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={PAD.top}
              x2={hoveredPoint.x}
              y2={SVG_HEIGHT - PAD.bottom}
              stroke={axisTextColor}
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
          )}

          {/* Axis Labels */}
          <text
            x={SVG_WIDTH / 2}
            y={SVG_HEIGHT - 6}
            textAnchor="middle"
            fill={axisTextColor}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Operational Cycles / Flight Time Steps
          </text>
          <text
            x={-(SVG_HEIGHT / 2)}
            y="16"
            transform="rotate(-90)"
            textAnchor="middle"
            fill={axisTextColor}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Predicted RUL (Days)
          </text>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute top-3 p-3 rounded shadow-lg text-[11px] pointer-events-none z-20 font-mono transition-all"
            style={{
              backgroundColor: tooltipBg,
              borderColor: tooltipBorder,
              borderWidth: 1,
              color: tooltipText,
              left: `${Math.min(SVG_WIDTH - 220, Math.max(10, (hoveredPoint.x / SVG_WIDTH) * 100))}%`,
            }}
          >
            <div className="font-bold border-b border-slate-200 dark:border-slate-700 pb-1 mb-1.5 flex items-center justify-between gap-3">
              <span>Operational Cycle #{hoveredPoint.step}</span>
              <span className="text-[10px] text-slate-500">Live Reading</span>
            </div>
            <div className="space-y-1">
              <div className="text-sky-700 dark:text-sky-400 font-semibold">TBF-01 (Unit 1): {hoveredPoint.fan1.toFixed(1)}d</div>
              <div className="text-emerald-700 dark:text-emerald-400 font-semibold">TBF-02: {hoveredPoint.fan2.toFixed(1)}d</div>
              <div className="text-amber-700 dark:text-amber-400 font-semibold">TBF-03: {hoveredPoint.fan3.toFixed(1)}d</div>
              <div className="text-purple-700 dark:text-purple-400 font-semibold">TBF-04: {hoveredPoint.fan4.toFixed(1)}d</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
