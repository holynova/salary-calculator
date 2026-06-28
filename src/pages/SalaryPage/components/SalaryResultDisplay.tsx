import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ICalculateResult } from "easy-salary";
import { motion, AnimatePresence } from "framer-motion";

const AnimatePresenceAny = AnimatePresence as any;

interface SalaryResultDisplayProps {
  data: ICalculateResult;
  compact?: boolean; // true为单行模式，false为多行模式
  showChart?: boolean; // 是否显示工资构成比例图
}

export const SalaryResultDisplay: React.FC<SalaryResultDisplayProps> = ({
  data,
  compact = false,
  showChart = true,
}) => {
  const [expandedPersonal, setExpandedPersonal] = useState(false);
  const [expandedCompany, setExpandedCompany] = useState(false);

  // 格式化金额显示
  const formatMoney = (amount: number) => {
    return `¥${amount.toLocaleString("zh-CN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // 计算平均值工具函数
  const getAvg = (arr: number[] | undefined): number => {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };

  // 保险和公积金详情组件 (Refactored for mobile and premium grid aesthetics)
  const InsuranceDetails = ({
    data: fundData,
    title,
  }: {
    data: ICalculateResult["insuranceAndFund"];
    title: string;
  }) => (
    <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl mt-2 mb-4 mx-4 space-y-2 text-sm text-gray-600">
      <div className="font-bold text-gray-800 border-b border-gray-200/50 pb-1.5">{title}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 pt-1">
        <div className="flex justify-between border-b border-gray-150 pb-1">
          <span className="text-gray-500">养老保险</span>
          <span className="font-semibold text-gray-700">{formatMoney(fundData.pension)}</span>
        </div>
        <div className="flex justify-between border-b border-gray-150 pb-1">
          <span className="text-gray-500">医疗保险</span>
          <span className="font-semibold text-gray-700">{formatMoney(fundData.medicalInsurance)}</span>
        </div>
        <div className="flex justify-between border-b border-gray-150 pb-1">
          <span className="text-gray-500">失业保险</span>
          <span className="font-semibold text-gray-700">{formatMoney(fundData.unemploymentInsurance)}</span>
        </div>
        <div className="flex justify-between border-b border-gray-150 pb-1">
          <span className="text-gray-500">工伤保险</span>
          <span className="font-semibold text-gray-700">{formatMoney(fundData.injuryInsurance)}</span>
        </div>
        <div className="flex justify-between border-b border-gray-150 pb-1">
          <span className="text-gray-500">生育保险</span>
          <span className="font-semibold text-gray-700">{formatMoney(fundData.maternityInsurance)}</span>
        </div>
        <div className="flex justify-between border-b border-gray-150 pb-1">
          <span className="text-gray-500">住房公积金</span>
          <span className="font-semibold text-gray-700">{formatMoney(fundData.housingFund)}</span>
        </div>
        <div className="flex justify-between border-b border-gray-150 pb-1">
          <span className="text-gray-500">补充公积金</span>
          <span className="font-semibold text-gray-700">{formatMoney(fundData.supplementaryFund)}</span>
        </div>
        <div className="flex justify-between border-b border-gray-150 pb-1">
          <span className="text-indigo-600 font-semibold">总住房公积金</span>
          <span className="font-bold text-indigo-600">{formatMoney(fundData?.totalHousingFund)}</span>
        </div>
      </div>
      <div className="font-bold text-red-600 pt-2 flex justify-between items-center text-xs sm:text-sm">
        <span>五险一金总支出:</span>
        <span className="text-sm sm:text-base">{formatMoney(fundData?.totalFund)}</span>
      </div>
    </div>
  );

  // 工资构成比例图组件 (Refactored for mobile and aesthetic details)
  const SalaryCompositionChart = ({ data }: { data: ICalculateResult }) => {
    const total = data.salaryBase;
    const afterTax = data.salaryAfterTaxAvg;
    const tax = getAvg(data.salaryTax);
    const housingFund = data.insuranceAndFund?.housingFund || 0;
    const insurance = Math.max(0, (data.insuranceAndFund?.totalFund || 0) - housingFund);

    const getPercentage = (value: number) => (value / total) * 100;

    return (
      <div className="mt-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
        <div className="text-xs font-semibold text-gray-500 mb-2">工资构成比率</div>
        <div className="h-5 bg-gray-200/60 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="bg-emerald-500 hover:brightness-105 transition-all"
            style={{ width: `${getPercentage(afterTax)}%` }}
            title={`税后工资: ${formatMoney(afterTax)}`}
          />
          <div
            className="bg-rose-500 hover:brightness-105 transition-all"
            style={{ width: `${getPercentage(tax)}%` }}
            title={`个人所得税: ${formatMoney(tax)}`}
          />
          <div
            className="bg-sky-500 hover:brightness-105 transition-all"
            style={{ width: `${getPercentage(housingFund)}%` }}
            title={`公积金: ${formatMoney(housingFund)}`}
          />
          <div
            className="bg-amber-500 hover:brightness-105 transition-all"
            style={{ width: `${getPercentage(insurance)}%` }}
            title={`保费: ${formatMoney(insurance)}`}
          />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5 text-[10px] sm:text-xs font-medium text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div>
            <span>税后拿手 ({getPercentage(afterTax).toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></div>
            <span>个税 ({getPercentage(tax).toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-sky-500 rounded-sm"></div>
            <span>公积金 ({getPercentage(housingFund).toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></div>
            <span>五险 ({getPercentage(insurance).toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    );
  };

  if (compact) {
    // 紧凑单行模式 (Refactored for cleaner look and alignment)
    return (
      <div className="bg-white border border-gray-150 rounded-xl p-4 shadow-sm space-y-3 font-sans">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-y-3 gap-x-6 text-sm">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">税前工资:</span>
              <span className="font-bold text-gray-800">{formatMoney(data.salaryBase)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">平均税后:</span>
              <span className="font-bold text-emerald-600">{formatMoney(data.salaryAfterTaxAvg)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">个税:</span>
              <span className="font-bold text-rose-500">{formatMoney(getAvg(data.salaryTax))}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setExpandedPersonal(!expandedPersonal)}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all focus:outline-none"
            >
              {expandedPersonal ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span>个人五险一金: {formatMoney(data.insuranceAndFund?.totalFund)}</span>
            </button>

            <button
              onClick={() => setExpandedCompany(!expandedCompany)}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-100 hover:bg-purple-50/30 transition-all focus:outline-none"
            >
              {expandedCompany ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span>公司支出: {formatMoney(data.insuranceAndFundOfCompany?.totalFund)}</span>
            </button>
          </div>
        </div>

        {showChart && <SalaryCompositionChart data={data} />}

        {/* Expandable details with smooth height animations */}
        <AnimatePresenceAny initial={false}>
          {expandedPersonal && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <InsuranceDetails data={data.insuranceAndFund} title="个人承担明细" />
            </motion.div>
          )}
        </AnimatePresenceAny>

        <AnimatePresenceAny initial={false}>
          {expandedCompany && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <InsuranceDetails data={data.insuranceAndFundOfCompany} title="公司承担明细" />
            </motion.div>
          )}
        </AnimatePresenceAny>
      </div>
    );
  }

  // 舒适多行模式
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5 font-sans">
      {/* Three major cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50/50 border border-emerald-100/50 p-4 rounded-xl">
          <div className="text-xs font-semibold text-emerald-700 mb-1">倒推税前工资</div>
          <div className="text-2xl font-black text-emerald-600">{formatMoney(data.salaryBase)}</div>
        </div>
        <div className="bg-indigo-50/50 border border-indigo-100/50 p-4 rounded-xl">
          <div className="text-xs font-semibold text-indigo-700 mb-1">平均税后月薪</div>
          <div className="text-2xl font-black text-indigo-600">{formatMoney(data.salaryAfterTaxAvg)}</div>
        </div>
        <div className="bg-rose-50/50 border border-rose-100/50 p-4 rounded-xl">
          <div className="text-xs font-semibold text-rose-700 mb-1">个人应纳所得税</div>
          <div className="text-2xl font-black text-rose-600">{formatMoney(getAvg(data.salaryTax))}</div>
        </div>
      </div>

      {showChart && <SalaryCompositionChart data={data} />}

      {/* Accordions */}
      <div className="space-y-3">
        <div className="border border-gray-150 rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => setExpandedPersonal(!expandedPersonal)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-55/30 transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
              <div>
                <div className="font-bold text-gray-800 text-sm sm:text-base">个人扣缴五险一金</div>
                <div className="text-xs text-gray-400 mt-0.5">从月度税前工资中直接扣除的部分</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-600 text-sm sm:text-base">
                {formatMoney(data.insuranceAndFund?.totalFund)}
              </span>
              {expandedPersonal ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
            </div>
          </button>

          <AnimatePresenceAny initial={false}>
            {expandedPersonal && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <InsuranceDetails data={data.insuranceAndFund} title="个人承担明细" />
              </motion.div>
            )}
          </AnimatePresenceAny>
        </div>

        <div className="border border-gray-150 rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => setExpandedCompany(!expandedCompany)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-55/30 transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
              <div>
                <div className="font-bold text-gray-800 text-sm sm:text-base">公司额外承担保险</div>
                <div className="text-xs text-gray-400 mt-0.5">企业聘用除税前薪资外额外需缴纳部分</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-purple-600 text-sm sm:text-base">
                {formatMoney(data.insuranceAndFundOfCompany?.totalFund)}
              </span>
              {expandedCompany ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
            </div>
          </button>

          <AnimatePresenceAny initial={false}>
            {expandedCompany && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <InsuranceDetails data={data.insuranceAndFundOfCompany} title="企业承担明细" />
              </motion.div>
            )}
          </AnimatePresenceAny>
        </div>
      </div>
    </div>
  );
};

export default SalaryResultDisplay;
