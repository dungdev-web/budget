import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function MonthlyTrendChart({ transactions }) {
  // Group transactions by month
  const monthlyData = {};

  transactions.forEach((t) => {
    const month = t.date || "2026-01";
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expense: 0 };
    }
    if (t.amount > 0) {
      monthlyData[month].income += t.amount;
    } else {
      monthlyData[month].expense += Math.abs(t.amount);
    }
  });

  // Sort months chronologically
  const months = Object.keys(monthlyData).sort();

  // Format month labels (YYYY-MM to MM/YYYY)
  const formatMonthLabel = (month) => {
    const [year, monthNum] = month.split("-");
    return `${monthNum}/${year}`;
  };

  const chartData = {
    labels: months.map(formatMonthLabel),
    datasets: [
      {
        label: "Thu nhập",
        data: months.map((m) => monthlyData[m].income),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#22c55e",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: "#ffffff",
        pointHoverBorderColor: "#22c55e",
        pointHoverBorderWidth: 3,
      },
      {
        label: "Chi tiêu",
        data: months.map((m) => monthlyData[m].expense),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#ef4444",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: "#ffffff",
        pointHoverBorderColor: "#ef4444",
        pointHoverBorderWidth: 3,
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
              const balance = income - expense;
              return `\nSố dư: ${balance.toLocaleString("vi-VN")} đ`;
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
            size: 11,
          },
        },
        grid: {
          color: "rgba(148, 163, 184, 0.05)",
          drawBorder: false,
        },
      },
    },
  };

  if (months.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📈</div>
        <p className="text-slate-400 text-lg">Chưa có dữ liệu</p>
        <p className="text-slate-500 text-sm mt-2">
          Thêm giao dịch để xem xu hướng theo tháng
        </p>
      </div>
    );
  }

  return (
    <div>
      <Line data={chartData} options={options} />
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">Tháng nhiều nhất</p>
          <p className="text-white font-bold text-sm">{months.length}</p>
        </div>
        <div className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-700">
          <p className="text-emerald-400 text-xs mb-1">TB Thu/tháng</p>
          <p className="text-emerald-300 font-bold text-sm">
            {(
              months.reduce((sum, m) => sum + monthlyData[m].income, 0) /
              months.length
            ).toLocaleString("vi-VN")}{" "}
            đ
          </p>
        </div>
        <div className="bg-red-900/20 rounded-lg p-3 border border-red-700">
          <p className="text-red-400 text-xs mb-1">TB Chi/tháng</p>
          <p className="text-red-300 font-bold text-sm">
            {(
              months.reduce((sum, m) => sum + monthlyData[m].expense, 0) /
              months.length
            ).toLocaleString("vi-VN")}{" "}
            đ
          </p>
        </div>
        <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-700">
          <p className="text-purple-400 text-xs mb-1">TB Tiết kiệm</p>
          <p className="text-purple-300 font-bold text-sm">
            {(
              months.reduce(
                (sum, m) =>
                  sum + (monthlyData[m].income - monthlyData[m].expense),
                0
              ) / months.length
            ).toLocaleString("vi-VN")}{" "}
            đ
          </p>
        </div>
      </div>
    </div>
  );
}