import React, { useState, useRef, useEffect } from "react";
import { getResult, getBeforeTextSalary } from "../salaryUtils";
import SalaryResultDisplay from "./SalaryResultDisplay";
import { motion } from "framer-motion";

export const AfterTaxCalculator: React.FC = () => {
  const [afterTaxSalary, setAfterTaxSalary] = useState<number>(10000);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAfterTaxSalary(isNaN(value) ? 0 : value);
  };

  const result1 = getResult(
    getBeforeTextSalary(afterTaxSalary, 0.07, 0),
    0.07,
    0,
  );
  const result2 = getResult(
    getBeforeTextSalary(afterTaxSalary, 0.05, 0.05),
    0.05,
    0.05,
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Input Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md mx-auto bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center"
      >
        <label className="text-sm font-bold text-gray-700 mb-3 text-center">
          输入您的期望税后工资 (RMB)
        </label>
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-bold text-lg">
            ¥
          </span>
          <input
            ref={inputRef}
            type="number"
            value={afterTaxSalary || ""}
            onChange={handleInputChange}
            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-lg font-bold text-gray-800 transition-all"
            placeholder="例如: 10000"
          />
        </div>
      </motion.div>

      {/* Comparison Grid (Side by side on desktop, stacked on mobile) */}
      {afterTaxSalary > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Option 1: No Supplementary */}
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <h2 className="text-lg font-bold text-gray-800">无补充公积金方案</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">公积金 7%</span>
            </div>
            <SalaryResultDisplay data={result1} />
          </motion.div>

          {/* Option 2: With Supplementary */}
          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <h2 className="text-lg font-bold text-gray-800">有补充公积金方案</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-600">公积金 5% + 5%</span>
            </div>
            <SalaryResultDisplay data={result2} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
