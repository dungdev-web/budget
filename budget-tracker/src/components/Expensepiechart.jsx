import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpensePieChart({ transactions }) {
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

  const getCategoryName = (cat) => {
    const names = {
      food: "Ăn uống",
      travel: "Đi lại",
      shopping: "Mua sắm",
      entertainment: "Giải trí",
      health: "Sức khỏe",
      education: "Giáo dục",
      bills: "Hóa đơn",
      other: "Khác",
    };
    return names[cat] || cat;
  };

  // Calculate expense by category
  const data = categories.map((cat) =>
    Math.abs(
      transactions
        .filter((t) => t.category === cat && t.amount < 0)
        .reduce((a, b) => a + b.amount, 0)
    )
  );

  const chartData = {
    labels: categories.map(getCategoryName),
    datasets: [
      {
        data,
        backgroundColor: [
          "#22c55e", // food - green
          "#3b82f6", // travel - blue
          "#f97316", // shopping - orange
          "#a855f7", // entertainment - purple
          "#ec4899", // health - pink
          "#eab308", // education - yellow
          "#06b6d4", // bills - cyan
          "#64748b", // other - slate
        ],
        borderWidth: 2,
        borderColor: "#1e293b",
        hoverBorderWidth: 3,
        hoverBorderColor: "#ffffff",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#cbd5e1",
          padding: 15,
          font: {
            size: 12,
            weight: "500",
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#cbd5e1",
        bodyColor: "#ffffff",
        borderColor: "rgba(139, 92, 246, 0.5)",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value.toLocaleString("vi-VN")} đ (${percentage}%)`;
          },
        },
      },
    },
  };

  const totalExpense = data.reduce((a, b) => a + b, 0);

  if (totalExpense === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-slate-400 text-lg">Chưa có chi tiêu nào</p>
        <p className="text-slate-500 text-sm mt-2">
          Thêm giao dịch chi tiêu để xem biểu đồ
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-md mx-auto">
        <Pie data={chartData} options={options} />
      </div>
      <div className="mt-6 text-center">
        <p className="text-slate-400 text-sm">Tổng chi tiêu</p>
        <p className="text-2xl font-bold text-red-400">
          {totalExpense.toLocaleString("vi-VN")} đ
        </p>
      </div>
    </div>
  );
}