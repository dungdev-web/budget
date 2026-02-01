import { TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react";

import { getCategoryMeta } from "../utils/category";
export default function AnalyticsPanel({ transactions }) {
  const formatCurrency = (num) => {
    return Math.abs(num).toLocaleString("vi-VN");
  };

  // Calculate statistics
  const incomeTransactions = transactions.filter((t) => t.amount > 0);
  const expenseTransactions = transactions.filter((t) => t.amount < 0);

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = Math.abs(
    expenseTransactions.reduce((sum, t) => sum + t.amount, 0),
  );

  const avgExpensePerDay = totalExpense / 30;
  const avgIncomePerTransaction =
    incomeTransactions.length > 0 ? totalIncome / incomeTransactions.length : 0;
  const avgExpensePerTransaction =
    expenseTransactions.length > 0
      ? totalExpense / expenseTransactions.length
      : 0;

  const largestIncome =
    incomeTransactions.length > 0
      ? Math.max(...incomeTransactions.map((t) => t.amount))
      : 0;
  const largestExpense =
    expenseTransactions.length > 0
      ? Math.abs(Math.min(...expenseTransactions.map((t) => t.amount)))
      : 0;

  // Category breakdown
  const categories = [
    "food",
    "travel",
    "shopping",
    "entertainment",
    "health",
    "education",
    "bills",
    "other",
  ];

  const categoryData = categories.map((cat) => {
    const catExpense = Math.abs(
      expenseTransactions
        .filter((t) => t.category === cat)
        .reduce((sum, t) => sum + t.amount, 0),
    );
    const catIncome = incomeTransactions
      .filter((t) => t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0);
    const percentage = totalExpense > 0 ? (catExpense / totalExpense) * 100 : 0;
    return {
      category: cat,
      expense: catExpense,
      income: catIncome,
      percentage,
    };
  });

  // Savings rate
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // Monthly projection
  const monthlyProjectedExpense = avgExpensePerDay * 30;
  const monthlyProjectedIncome = totalIncome; // Simplified

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-slate-400 text-lg">Chưa có dữ liệu phân tích</p>
        <p className="text-slate-500 text-sm mt-2">
          Thêm giao dịch để xem phân tích chi tiết
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div>
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-400" />
          Chỉ số quan trọng
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600">
            <p className="text-slate-400 text-xs mb-1">TB chi/ngày</p>
            <p className="text-white font-bold text-lg">
              {formatCurrency(avgExpensePerDay)} đ
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600">
            <p className="text-slate-400 text-xs mb-1">Thu lớn nhất</p>
            <p className="text-green-400 font-bold text-lg">
              +{formatCurrency(largestIncome)} đ
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600">
            <p className="text-slate-400 text-xs mb-1">Chi lớn nhất</p>
            <p className="text-red-400 font-bold text-lg">
              {formatCurrency(largestExpense)} đ
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600">
            <p className="text-slate-400 text-xs mb-1">Tổng giao dịch</p>
            <p className="text-purple-400 font-bold text-lg">
              {transactions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Savings Rate */}
      <div className="bg-linear-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">Tỷ lệ tiết kiệm</h3>
          <div className="text-3xl">
            {savingsRate >= 30 ? "🏆" : savingsRate >= 15 ? "🎯" : "📊"}
          </div>
        </div>
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">
              {savingsRate >= 0 ? "Tốt" : "Cần cải thiện"}
            </span>
            <span className="text-2xl font-bold text-purple-300">
              {savingsRate.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                savingsRate >= 30
                  ? "bg-linear-to-r from-green-500 to-emerald-400"
                  : savingsRate >= 15
                    ? "bg-linear-to-r from-yellow-500 to-orange-400"
                    : "bg-linear-to-r from-red-500 to-pink-500"
              }`}
              style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
            ></div>
          </div>
        </div>
        <p className="text-slate-400 text-xs">
          {savingsRate >= 30
            ? "Xuất sắc! Bạn đang tiết kiệm rất tốt"
            : savingsRate >= 15
              ? "Tốt! Tiếp tục duy trì"
              : savingsRate >= 0
                ? "Có thể cải thiện thêm"
                : "Nên giảm chi tiêu"}
        </p>
      </div>

      {/* Average Transactions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-900/20 rounded-xl p-5 border border-emerald-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <p className="text-emerald-400 text-xs font-semibold">
              TB Thu nhập/giao dịch
            </p>
          </div>
          <p className="text-emerald-300 font-bold text-xl">
            {formatCurrency(avgIncomePerTransaction)} đ
          </p>
          <p className="text-emerald-500 text-xs mt-1">
            {incomeTransactions.length} giao dịch
          </p>
        </div>
        <div className="bg-red-900/20 rounded-xl p-5 border border-red-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <p className="text-red-400 text-xs font-semibold">
              TB Chi tiêu/giao dịch
            </p>
          </div>
          <p className="text-red-300 font-bold text-xl">
            {formatCurrency(avgExpensePerTransaction)} đ
          </p>
          <p className="text-red-500 text-xs mt-1">
            {expenseTransactions.length} giao dịch
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Chi tiêu theo danh mục
        </h3>
        <div className="space-y-3">
          {categoryData
            .filter((item) => item.expense > 0)
            .sort((a, b) => b.expense - a.expense)
            .map((item) => {
              const {
                name,
                icon: Icon,
                color,
              } = getCategoryMeta(item.category);

              return (
                <div
                  key={item.category}
                  className="bg-slate-900/30 rounded-lg p-4 border border-slate-700 hover:border-purple-600 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800">
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <span className="text-white font-medium">{name}</span>
                    </div>

                    <span className="text-slate-300 font-bold">
                      {formatCurrency(item.expense)} đ
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-slate-400 text-xs font-semibold min-w-11.5 text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>

                  {item.income > 0 && (
                    <p className="text-emerald-400 text-xs mt-2">
                      Thu nhập: +{formatCurrency(item.income)} đ
                    </p>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Monthly Projection */}
      <div className="bg-linear-to-br from-blue-900/20 to-cyan-900/20 rounded-xl p-6 border border-blue-700">
        <h3 className="text-white font-semibold text-lg mb-4">
          Dự báo tháng này
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-cyan-400 text-xs mb-1">Dự kiến thu</p>
            <p className="text-cyan-300 font-bold text-xl">
              {formatCurrency(monthlyProjectedIncome)} đ
            </p>
          </div>
          <div>
            <p className="text-blue-400 text-xs mb-1">Dự kiến chi</p>
            <p className="text-blue-300 font-bold text-xl">
              {formatCurrency(monthlyProjectedExpense)} đ
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-800">
          <div className="flex items-center justify-between">
            <p className="text-slate-300 text-sm">Số dư dự kiến cuối tháng</p>
            <p
              className={`font-bold text-xl ${
                monthlyProjectedIncome - monthlyProjectedExpense >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {monthlyProjectedIncome - monthlyProjectedExpense >= 0 ? "+" : ""}
              {formatCurrency(
                monthlyProjectedIncome - monthlyProjectedExpense,
              )}{" "}
              đ
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
        <h3 className="text-white font-semibold text-lg mb-4">💡 Gợi ý</h3>
        <div className="space-y-3">
          {savingsRate < 10 && (
            <div className="flex items-start gap-3 bg-orange-900/20 rounded-lg p-3 border border-orange-700">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-orange-300 font-semibold text-sm">
                  Tỷ lệ tiết kiệm thấp
                </p>
                <p className="text-orange-200 text-xs mt-1">
                  Cân nhắc cắt giảm chi tiêu không cần thiết
                </p>
              </div>
            </div>
          )}
          {avgExpensePerDay > avgIncomePerTransaction && (
            <div className="flex items-start gap-3 bg-red-900/20 rounded-lg p-3 border border-red-700">
              <span className="text-xl">🚨</span>
              <div>
                <p className="text-red-300 font-semibold text-sm">
                  Chi tiêu cao hơn thu nhập
                </p>
                <p className="text-red-200 text-xs mt-1">
                  Hãy xem xét các khoản chi tiêu lớn
                </p>
              </div>
            </div>
          )}
          {savingsRate >= 30 && (
            <div className="flex items-start gap-3 bg-green-900/20 rounded-lg p-3 border border-green-700">
              <span className="text-xl">🎉</span>
              <div>
                <p className="text-green-300 font-semibold text-sm">
                  Quản lý tài chính xuất sắc!
                </p>
                <p className="text-green-200 text-xs mt-1">
                  Bạn đang tiết kiệm rất tốt, tiếp tục duy trì
                </p>
              </div>
            </div>
          )}
          {transactions.length > 50 && (
            <div className="flex items-start gap-3 bg-blue-900/20 rounded-lg p-3 border border-blue-700">
              <span className="text-xl">📊</span>
              <div>
                <p className="text-blue-300 font-semibold text-sm">
                  Dữ liệu phong phú
                </p>
                <p className="text-blue-200 text-xs mt-1">
                  Bạn có {transactions.length} giao dịch - dữ liệu đủ để phân
                  tích xu hướng
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
