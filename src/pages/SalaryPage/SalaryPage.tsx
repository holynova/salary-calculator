import React, { useState } from "react";
import { AfterTaxCalculator } from "./components/AfterTaxCalculator";
import { SalaryComparisonTable } from "./components/SalaryComparisonTable";
import { SalaryCurveChart } from "./components/SalaryCurveChart";
import { motion } from "framer-motion";

const TABS = [
  { id: 0, label: "税后工资倒推", component: <AfterTaxCalculator /> },
  { id: 1, label: "累计构成曲线", component: <SalaryCurveChart /> },
  { id: 2, label: "工资对照参考", component: <SalaryComparisonTable /> },
];

export const SalaryPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Title Header Section */}
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          工资计算与构成可视化
        </h1>
        <p className="mt-2 text-sm text-gray-500 max-w-md text-center">
          输入您的税后工资，快速计算您的各项税前比例、五险一金扣除额度以及企业实际支出的总成本。
        </p>
      </div>

      {/* Modern sliding pill navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-100/50 shadow-sm relative">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 z-10 w-28 sm:w-36 text-center focus:outline-none"
              style={{
                color: activeTab === tab.id ? "#4f46e5" : "#4b5563",
              }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute inset-0 bg-white rounded-lg shadow border border-gray-100"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-20">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Animated content wrapper */}
      <div className="relative min-h-[500px]">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {TABS[activeTab].component}
        </motion.div>
      </div>
    </div>
  );
};
