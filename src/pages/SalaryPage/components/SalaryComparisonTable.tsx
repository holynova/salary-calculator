import React, { useState } from "react";
import { getResultByStep } from "../salaryUtils";
import { SalaryResultDisplay } from "./SalaryResultDisplay";
import { motion } from "framer-motion";

export const SalaryComparisonTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const resultList = getResultByStep({
    start: 3000,
    end: 60000,
    step: 1000,
    housingFund: 0.07,
    supplementaryFund: 0,
  });

  const supplementaryFundResultList = getResultByStep({
    start: 3000,
    end: 60000,
    step: 1000,
    housingFund: 0.05,
    supplementaryFund: 0.05,
  });

  const tabs = [
    { id: 0, label: "无补充公积金 (7%)", list: resultList },
    { id: 1, label: "有补充公积金 (5%+5%)", list: supplementaryFundResultList }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Sub Tab Navigation */}
      <div className="flex justify-start">
        <div className="flex bg-gray-50 border border-gray-100 p-1.5 rounded-lg shadow-sm relative">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors duration-200 z-10 w-36 sm:w-44 text-center focus:outline-none"
              style={{
                color: activeTab === tab.id ? "#4f46e5" : "#4b5563",
              }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="subTabUnderline"
                  className="absolute inset-0 bg-white rounded-md shadow-sm border border-gray-100"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-20">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* List Container with fade-in and page transition */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {tabs[activeTab].list.map((x, index) => (
          <SalaryResultDisplay
            key={index}
            data={x}
            compact
            showChart={false}
          />
        ))}
      </motion.div>
    </div>
  );
};
