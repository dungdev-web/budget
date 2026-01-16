import { useEffect, useState } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider, db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function App() {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState("food");
  const [selectedMonth, setSelectedMonth] = useState("2026-01");
  const [loading, setLoading] = useState(false);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadTransactions(currentUser.uid);
      } else {
        setTransactions([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadTransactions = async (uid) => {
    if (!uid) return;
    try {
      const q = query(collection(db, "transactions"), where("uid", "==", uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  // useEffect(() => {
  //   if (user) {
  //     loadTransactions(user.uid);
  //   }
  // }, []);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Login error:", error);
      alert("Đăng nhập thất bại: " + error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setTransactions([]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const addTransaction = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập trước");
      return;
    }

    if (!text.trim()) {
      alert("Vui lòng nhập mô tả giao dịch");
      return;
    }

    if (!amount || isNaN(amount)) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    const newAmount = parseFloat(amount);
    const newTransaction = {
      text: text.trim(),
      amount: newAmount,
      category,
      date: selectedMonth,
      uid: user.uid,
      createdAt: new Date(),
    };

    try {
      setLoading(true);
      const docRef = await addDoc(
        collection(db, "transactions"),
        newTransaction
      );

      // Cập nhật state ngay lập tức thay vì đợi reload
      setTransactions((prev) => [
        { id: docRef.id, ...newTransaction },
        ...prev,
      ]);

      setText("");
      setAmount("");
      setCategory("food");
      setLoading(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Lỗi khi thêm giao dịch: " + error.message);
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      // Xóa khỏi state ngay lập tức
      setTransactions(transactions.filter((t) => t.id !== id));

      // Xóa từ database
      await deleteDoc(doc(db, "transactions", id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Lỗi khi xóa giao dịch: " + error.message);
      // Reload lại nếu có lỗi
      await loadTransactions(user.uid);
    }
  };

  const exportExcel = () => {
    if (transactions.length === 0) {
      alert("Không có giao dịch để xuất");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([buf]), "budget.xlsx");
  };

  const total = transactions.reduce((acc, t) => acc + t.amount, 0);
  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const formatCurrency = (num) => {
    return Math.abs(num).toLocaleString("vi-VN");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <button
          onClick={login}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-xl font-bold transition-all"
        >
          🔐 Đăng nhập bằng Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Budget Tracker
              </h1>
            </div>
            <p className="text-slate-400">
              Quản lý chi tiêu thông minh của bạn
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt="avatar"
                className="w-10 h-10 rounded-full border border-blue-400"
              />
            )}
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold transition-all"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Balance */}
          <div className="bg-linear-to-br from-slate-700 to-slate-800 rounded-2xl p-6 border border-slate-600 hover:border-blue-500 transition-all shadow-lg">
            <p className="text-slate-400 text-sm font-semibold mb-2">
              Tổng số dư
            </p>
            <p
              className={`text-3xl font-bold ${
                total >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {total >= 0 ? "+" : ""}
              {formatCurrency(total)} đ
            </p>
            <div className="mt-4 h-1 bg-slate-600 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  total >= 0 ? "bg-green-500" : "bg-red-500"
                }`}
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>

          {/* Income */}
          <div className="bg-linear-to-br from-emerald-900 to-emerald-800 rounded-2xl p-6 border border-emerald-700 hover:border-emerald-500 transition-all shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-emerald-300 text-sm font-semibold">Thu nhập</p>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-300">
              +{formatCurrency(income)} đ
            </p>
          </div>

          {/* Expense */}
          <div className="bg-linear-to-br from-red-900 to-red-800 rounded-2xl p-6 border border-red-700 hover:border-red-500 transition-all shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-red-300 text-sm font-semibold">Chi tiêu</p>
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-red-300">
              {formatCurrency(expense)} đ
            </p>
          </div>
        </div>

        {/* Export Button */}
        <div className="mb-8">
          <button
            onClick={exportExcel}
            className="w-full bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
          >
            📥 Xuất Excel
          </button>
        </div>

        {/* Add Transaction */}
        <div className="bg-linear-to-br from-slate-700 to-slate-800 rounded-2xl p-6 border border-slate-600 shadow-lg mb-8">
          <h2 className="text-lg font-bold text-white mb-4">
            Thêm giao dịch mới
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Mô tả giao dịch..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !loading && addTransaction()
              }
              className="w-full px-4 py-3 rounded-xl bg-slate-600 border border-slate-500 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
            />
            <input
              type="number"
              placeholder="Số tiền (dương: thu, âm: chi)..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !loading && addTransaction()
              }
              className="w-full px-4 py-3 rounded-xl bg-slate-600 border border-slate-500 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-600 border border-slate-500 text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
            >
              <option value="food">🍜 Ăn uống</option>
              <option value="travel">🚗 Đi lại</option>
              <option value="shopping">🛍 Mua sắm</option>
              <option value="other">📦 Khác</option>
            </select>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-600 border border-slate-500 text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
            />

            <button
              onClick={addTransaction}
              disabled={loading}
              className="w-full bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50"
            >
              <Plus className="w-5 h-5" />
              {loading ? "Đang thêm..." : "Thêm giao dịch"}
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-linear-to-br from-slate-700 to-slate-800 rounded-2xl p-6 border border-slate-600 shadow-lg">
          <h2 className="text-lg font-bold text-white mb-4">
            Lịch sử giao dịch ({transactions.length})
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
              <p className="text-slate-400">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-lg ${
                    t.amount > 0
                      ? "bg-emerald-900/30 border-emerald-600/50 hover:border-emerald-500"
                      : "bg-red-900/30 border-red-600/50 hover:border-red-500"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        t.amount > 0 ? "bg-emerald-400" : "bg-red-400"
                      }`}
                    ></div>
                    <div>
                      <span className="text-white font-medium block">
                        {t.text}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {t.date} • {t.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-bold text-lg ${
                        t.amount > 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {t.amount > 0 ? "+" : ""}
                      {formatCurrency(t.amount)} đ
                    </span>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-all duration-200 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
