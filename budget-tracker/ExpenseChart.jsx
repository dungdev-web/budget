import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenseChart({ transactions }) {
  const categories = ["food", "travel", "shopping", "other"];

  const data = categories.map(cat =>
    Math.abs(
      transactions
        .filter(t => t.category === cat && t.amount < 0)
        .reduce((a, b) => a + b.amount, 0)
    )
  );

  return (
    <Pie
      data={{
        labels: ["Ăn uống", "Đi lại", "Mua sắm", "Khác"],
        datasets: [
          {
            data,
            backgroundColor: ["#22c55e", "#3b82f6", "#f97316", "#a855f7"],
          },
        ],
      }}
    />
  );
}
