import React, { useState, useMemo } from "react";
import { getResult } from "../salaryUtils";
import { motion, AnimatePresence } from "framer-motion";

const AnimatePresenceAny = AnimatePresence as any;

export const SalaryCurveChart: React.FC = () => {
  const [maxSalary, setMaxSalary] = useState<number>(30000);
  const [isSupplementary, setIsSupplementary] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const housingFund = isSupplementary ? 0.05 : 0.07;
  const supplementaryFund = isSupplementary ? 0.05 : 0;

  // Generate 25 data points from 0 to maxSalary
  const data = useMemo(() => {
    const pointsCount = 25;
    const step = maxSalary / (pointsCount - 1);
    
    return Array.from({ length: pointsCount }, (_, i) => {
      const grossSalary = Math.round(step * i);
      if (grossSalary === 0) {
        return {
          salaryBase: 0,
          salaryAfterTaxAvg: 0,
          employeeFund: 0,
          tax: 0,
          companyFund: 0,
          totalCompanyCost: 0,
        };
      }
      
      const res = getResult(grossSalary, housingFund, supplementaryFund);
      const employeeFund = res.insuranceAndFund?.totalFund || 0;
      const tax = res.salaryTax ? res.salaryTax[0] || 0 : 0;
      const companyFund = res.insuranceAndFundOfCompany?.totalFund || 0;
      
      return {
        salaryBase: grossSalary,
        salaryAfterTaxAvg: res.salaryAfterTaxAvg,
        employeeFund: employeeFund,
        tax: tax,
        companyFund: companyFund,
        totalCompanyCost: grossSalary + companyFund,
      };
    });
  }, [maxSalary, housingFund, supplementaryFund]);

  // Max value on the Y axis is the total company cost of the largest salary point
  const maxVal = useMemo(() => {
    if (data.length === 0) return 10000;
    return Math.max(...data.map(d => d.totalCompanyCost));
  }, [data]);

  // Chart configuration
  const margin = { top: 30, right: 30, bottom: 50, left: 70 };
  const width = 800;
  const height = 450;
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Scaling helpers
  const xScale = (val: number) => margin.left + (val / maxSalary) * chartWidth;
  const yScale = (val: number) => margin.top + chartHeight - (val / maxVal) * chartHeight;

  // Formatting helpers
  const formatMoney = (amount: number) => {
    return `¥${amount.toLocaleString("zh-CN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // Stacked Area Paths
  const paths = useMemo(() => {
    if (data.length === 0) return { afterTax: "", personalFund: "", gross: "", companyCost: "" };

    // Layer 1: Tax-Free / Take-Home Pay (after tax)
    const afterTaxTop = data.map(d => `${xScale(d.salaryBase)},${yScale(d.salaryAfterTaxAvg)}`).join(" L ");
    const afterTaxPath = `M ${xScale(0)},${yScale(0)} L ${afterTaxTop} L ${xScale(maxSalary)},${yScale(0)} Z`;

    // Layer 2: AfterTax + Employee Five-One Fund
    const personalFundTop = data.map(d => `${xScale(d.salaryBase)},${yScale(d.salaryAfterTaxAvg + d.employeeFund)}`).join(" L ");
    const afterTaxBottom = [...data].reverse().map(d => `${xScale(d.salaryBase)},${yScale(d.salaryAfterTaxAvg)}`).join(" L ");
    const personalFundPath = `M ${xScale(0)},${yScale(0)} L ${personalFundTop} L ${xScale(maxSalary)},${yScale(data[data.length-1].salaryAfterTaxAvg)} L ${afterTaxBottom} Z`;

    // Layer 3: Pre-Tax Salary (AfterTax + Personal Fund + Tax)
    const grossTop = data.map(d => `${xScale(d.salaryBase)},${yScale(d.salaryBase)}`).join(" L ");
    const personalFundBottom = [...data].reverse().map(d => `${xScale(d.salaryBase)},${yScale(d.salaryAfterTaxAvg + d.employeeFund)}`).join(" L ");
    const grossPath = `M ${xScale(0)},${yScale(0)} L ${grossTop} L ${xScale(maxSalary)},${yScale(data[data.length-1].salaryAfterTaxAvg + data[data.length-1].employeeFund)} L ${personalFundBottom} Z`;

    // Layer 4: Total Company Cost (Pre-Tax + Company Fund)
    const companyCostTop = data.map(d => `${xScale(d.salaryBase)},${yScale(d.totalCompanyCost)}`).join(" L ");
    const grossBottom = [...data].reverse().map(d => `${xScale(d.salaryBase)},${yScale(d.salaryBase)}`).join(" L ");
    const companyCostPath = `M ${xScale(0)},${yScale(0)} L ${companyCostTop} L ${xScale(maxSalary)},${yScale(data[data.length-1].salaryBase)} L ${grossBottom} Z`;

    return {
      afterTax: afterTaxPath,
      personalFund: personalFundPath,
      gross: grossPath,
      companyCost: companyCostPath
    };
  }, [data, maxSalary, maxVal]);

  // Generate Ticks
  const yTicks = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => (maxVal / 5) * i);
  }, [maxVal]);

  const xTicks = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => (maxSalary / 5) * i);
  }, [maxSalary]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - margin.left;
    const mouseY = e.clientY - rect.top;

    if (mouseX >= 0 && mouseX <= chartWidth) {
      const fraction = mouseX / chartWidth;
      const index = Math.min(
        data.length - 1,
        Math.max(0, Math.round(fraction * (data.length - 1)))
      );
      setHoveredIndex(index);
      setMousePos({ x: e.clientX - rect.left, y: mouseY });
    } else {
      setHoveredIndex(null);
      setMousePos(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setMousePos(null);
  };

  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Configuration Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-gray-50 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">工资累计构成曲线</h2>
          <p className="text-xs text-gray-500 mt-1">展示工资随着税前薪资增加的各项比例分布，以及企业支付的总成本。</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {/* Supplementary Fund Switcher */}
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
            <button
              onClick={() => setIsSupplementary(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                !isSupplementary
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              无补充公积金 (7%)
            </button>
            <button
              onClick={() => setIsSupplementary(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                isSupplementary
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              有补充公积金 (5%+5%)
            </button>
          </div>

          {/* Max Salary Slider */}
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
            <span className="text-xs text-gray-500 font-medium pl-1">范围:</span>
            <input
              type="range"
              min="10000"
              max="150000"
              step="5000"
              value={maxSalary}
              onChange={(e) => setMaxSalary(Number(e.target.value))}
              className="w-24 accent-indigo-600"
            />
            <span className="text-xs font-bold text-indigo-600 w-12 text-right">
              {maxSalary / 1000}k
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="relative">
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full min-w-[640px] select-none overflow-visible"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              {/* Gradients */}
              <linearGradient id="afterTaxGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="personalFundGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="taxGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="companyCostGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={margin.left}
                  y1={yScale(tick)}
                  x2={width - margin.right}
                  y2={yScale(tick)}
                  stroke="#f3f4f6"
                  strokeWidth={1}
                />
                <text
                  x={margin.left - 10}
                  y={yScale(tick) + 4}
                  textAnchor="end"
                  className="text-xs text-gray-400 font-medium fill-current font-sans"
                >
                  {formatMoney(tick)}
                </text>
              </g>
            ))}

            {/* Vertical Grid lines & X Ticks */}
            {xTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={xScale(tick)}
                  y1={margin.top}
                  x2={xScale(tick)}
                  y2={height - margin.bottom}
                  stroke="#f8fafc"
                  strokeWidth={1}
                />
                <text
                  x={xScale(tick)}
                  y={height - margin.bottom + 20}
                  textAnchor="middle"
                  className="text-xs text-gray-400 font-medium fill-current font-sans"
                >
                  {formatMoney(tick)}
                </text>
              </g>
            ))}

            {/* Area Plots (Drawn in stack order: back-to-front) */}
            {/* 1. Company Cost Area */}
            <path d={paths.companyCost} fill="url(#companyCostGrad)" stroke="#a855f7" strokeWidth={1} />
            
            {/* 2. Gross Salary / Tax Area */}
            <path d={paths.gross} fill="url(#taxGrad)" stroke="#ef4444" strokeWidth={1} />

            {/* 3. Personal Fund Area */}
            <path d={paths.personalFund} fill="url(#personalFundGrad)" stroke="#3b82f6" strokeWidth={1} />

            {/* 4. Take-Home Pay Area */}
            <path d={paths.afterTax} fill="url(#afterTaxGrad)" stroke="#22c55e" strokeWidth={1.5} />

            {/* Guide line & dots on hover */}
            {hoveredPoint && (
              <g>
                <line
                  x1={xScale(hoveredPoint.salaryBase)}
                  y1={margin.top}
                  x2={xScale(hoveredPoint.salaryBase)}
                  y2={height - margin.bottom}
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
                
                {/* Dots at intersections */}
                <circle cx={xScale(hoveredPoint.salaryBase)} cy={yScale(hoveredPoint.totalCompanyCost)} r={4} fill="#a855f7" stroke="#fff" strokeWidth={1.5} />
                <circle cx={xScale(hoveredPoint.salaryBase)} cy={yScale(hoveredPoint.salaryBase)} r={4} fill="#ef4444" stroke="#fff" strokeWidth={1.5} />
                <circle cx={xScale(hoveredPoint.salaryBase)} cy={yScale(hoveredPoint.salaryAfterTaxAvg + hoveredPoint.employeeFund)} r={4} fill="#3b82f6" stroke="#fff" strokeWidth={1.5} />
                <circle cx={xScale(hoveredPoint.salaryBase)} cy={yScale(hoveredPoint.salaryAfterTaxAvg)} r={5} fill="#22c55e" stroke="#fff" strokeWidth={1.5} />
              </g>
            )}
          </svg>
        </div>

        {/* Tooltip Box overlay */}
        <AnimatePresenceAny>
          {hoveredPoint && mousePos && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute pointer-events-none bg-white/95 backdrop-blur-md shadow-xl border border-gray-100 rounded-xl p-4 text-xs w-64 space-y-2.5 z-40 font-sans"
              style={{
                left: `${mousePos.x + 230 > width ? mousePos.x - 250 : mousePos.x + 20}px`,
                top: `${Math.min(height - 180, Math.max(10, mousePos.y - 80))}px`,
              }}
            >
              <div className="border-b border-gray-100 pb-1.5 flex justify-between items-center">
                <span className="font-bold text-gray-900">税前月薪</span>
                <span className="font-bold text-indigo-600 text-sm">{formatMoney(hoveredPoint.salaryBase)}</span>
              </div>
              <div className="space-y-1.5 text-gray-600">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-green-500"></span>
                    <span>税后拿手工资:</span>
                  </div>
                  <span className="font-semibold text-green-600">{formatMoney(hoveredPoint.salaryAfterTaxAvg)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-blue-500"></span>
                    <span>个人五险一金:</span>
                  </div>
                  <span className="font-semibold text-blue-600">{formatMoney(hoveredPoint.employeeFund)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-red-500"></span>
                    <span>个人所得税:</span>
                  </div>
                  <span className="font-semibold text-red-500">{formatMoney(hoveredPoint.tax)}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-purple-500"></span>
                    <span>企业五险一金:</span>
                  </div>
                  <span className="font-semibold text-purple-500">{formatMoney(hoveredPoint.companyFund)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-gray-900 pt-1">
                  <span>公司支出成本:</span>
                  <span className="text-purple-700">{formatMoney(hoveredPoint.totalCompanyCost)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresenceAny>
      </div>

      {/* Legend Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-2.5">
          <div className="w-3.5 h-3.5 rounded-md bg-green-500"></div>
          <div>
            <div className="text-xs text-gray-500">税后可支配</div>
            <div className="text-sm font-bold text-gray-800">拿手纯现金</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-3.5 h-3.5 rounded-md bg-blue-500"></div>
          <div>
            <div className="text-xs text-gray-500">个人统筹</div>
            <div className="text-sm font-bold text-gray-800">个人五险一金</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-3.5 h-3.5 rounded-md bg-red-500"></div>
          <div>
            <div className="text-xs text-gray-500">国家税收</div>
            <div className="text-sm font-bold text-gray-800">个人所得税</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-3.5 h-3.5 rounded-md bg-purple-500"></div>
          <div>
            <div className="text-xs text-gray-500">企业额外支出</div>
            <div className="text-sm font-bold text-gray-800">公司五险一金</div>
          </div>
        </div>
      </div>
    </div>
  );
};
