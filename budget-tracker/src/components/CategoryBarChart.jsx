import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);
import { getCategoryMeta } from "../utils/category";

export default function CategoryBarChart({ transactions }) {
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

  // Calculate income and expense by category
  const incomeData = categories.map((cat) =>
    transactions
      .filter((t) => t.category === cat && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0),
  );

  const expenseData = categories.map((cat) =>
    Math.abs(
      transactions
        .filter((t) => t.category === cat && t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0),
    ),
  );

  const chartData = {
    labels: categories.map((cat) => getCategoryMeta(cat).name),
    datasets: [
      {
        label: "Thu nhập",
        data: incomeData,
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "#22c55e",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: "Chi tiêu",
        data: expenseData,
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "#ef4444",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#cbd5e1",
          padding: 15,
          font: {
            size: 13,
            weight: "600",
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#cbd5e1",
        bodyColor: "#ffffff",
        borderColor: "rgba(139, 92, 246, 0.5)",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y || 0;
            return `${label}: ${value.toLocaleString("vi-VN")} đ`;
          },
          afterBody: function (context) {
            if (context.length === 2) {
              const income = context[0].parsed.y;
              const expense = context[1].parsed.y;
              const net = income - expense;
              return `\nChênh lệch: ${net.toLocaleString("vi-VN")} đ`;
            }
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#94a3b8",
          font: {
            size: 11,
          },
          callback: function (value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + "M đ";
            } else if (value >= 1000) {
              return (value / 1000).toFixed(0) + "K đ";
            }
            return value.toLocaleString("vi-VN") + " đ";
          },
        },
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          color: "#94a3b8",
          font: {
            size: 10,
          },
        },
        grid: {
          display: false,
          drawBorder: false,
        },
      },
    },
  };

  const totalIncome = incomeData.reduce((a, b) => a + b, 0);
  const totalExpense = expenseData.reduce((a, b) => a + b, 0);
  const netAmount = totalIncome - totalExpense;

  if (totalIncome === 0 && totalExpense === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-slate-400 text-lg">Chưa có dữ liệu</p>
        <p className="text-slate-500 text-sm mt-2">
          Thêm giao dịch để xem so sánh theo danh mục
        </p>
      </div>
    );
  }

  return (
    <div>
      <Bar data={chartData} options={options} />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-emerald-900/20 rounded-xl p-4 border border-emerald-700">
          <p className="text-emerald-400 text-xs mb-1">Tổng thu</p>
          <p className="text-emerald-300 font-bold text-lg">
            {totalIncome.toLocaleString("vi-VN")} đ
          </p>
        </div>
        <div className="bg-red-900/20 rounded-xl p-4 border border-red-700">
          <p className="text-red-400 text-xs mb-1">Tổng chi</p>
          <p className="text-red-300 font-bold text-lg">
            {totalExpense.toLocaleString("vi-VN")} đ
          </p>
        </div>
        <div
          className={`rounded-xl p-4 border ${
            netAmount >= 0
              ? "bg-green-900/20 border-green-700"
              : "bg-orange-900/20 border-orange-700"
          }`}
        >
          <p
            className={`text-xs mb-1 ${
              netAmount >= 0 ? "text-green-400" : "text-orange-400"
            }`}
          >
            Chênh lệch
          </p>
          <p
            className={`font-bold text-lg ${
              netAmount >= 0 ? "text-green-300" : "text-orange-300"
            }`}
          >
            {netAmount >= 0 ? "+" : ""}
            {netAmount.toLocaleString("vi-VN")} đ
          </p>
        </div>
      </div>

      {/* Top Categories */}
      <div className="mt-6">
        <h4 className="text-white font-semibold text-sm mb-3">
          Top 3 danh mục chi tiêu
        </h4>
        <div className="space-y-2">
          {categories
            .map((cat, idx) => ({
              category: cat,
              amount: expenseData[idx],
            }))
            .filter((item) => item.amount > 0)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3)
            .map((item, rank) => {
              const {
                name,
                icon: Icon,
                color,
              } = getCategoryMeta(item.category);

              return (
                <div
                  key={item.category}
                  className="flex items-center justify-between bg-slate-900/30 rounded-lg p-3 border border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      #{rank + 1}
                    </div>

                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-white font-medium">{name}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-red-400 font-bold">
                      {item.amount.toLocaleString("vi-VN")} đ
                    </p>
                    <p className="text-slate-500 text-xs">
                      {((item.amount / totalExpense) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
