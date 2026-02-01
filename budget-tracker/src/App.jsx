import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Download,
  Edit2,
  Save,
  X,
  BarChart3,
  PieChart,
  LineChart,
  LogOut
} from "lucide-react";

import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider, db } from "./lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import CategorySelect from "./components/CategorySelectFilter";
import CategorySelectAdd from "./components/CategorySelectAdd";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getCategoryMeta } from "./utils/category";

// Import chart components
import ExpensePieChart from "./components/Expensepiechart";
import MonthlyTrendChart from "./components/Monthlytrendchart";
import CategoryBarChart from "./components/CategoryBarchart";
import AnalyticsPanel from "./components/AnalyticsPanel";

export default function App() {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState("food");
  const [selectedMonth, setSelectedMonth] = useState("2026-01");
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [viewMode, setViewMode] = useState("list"); // list, pie, line, bar, analytics

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
      data.sort(
        (a, b) =>
          new Date(b.createdAt?.toDate?.() || b.createdAt) -
          new Date(a.createdAt?.toDate?.() || a.createdAt),
      );
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

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
        newTransaction,
      );

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
      setTransactions(transactions.filter((t) => t.id !== id));
      await deleteDoc(doc(db, "transactions", id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Lỗi khi xóa giao dịch: " + error.message);
      await loadTransactions(user.uid);
    }
  };

  const startEdit = (transaction) => {
    setEditingId(transaction.id);
    setEditText(transaction.text);
    setEditAmount(transaction.amount.toString());
  };

  const saveEdit = async (id) => {
    try {
      const updatedTransaction = {
        text: editText.trim(),
        amount: parseFloat(editAmount),
      };

      await updateDoc(doc(db, "transactions", id), updatedTransaction);

      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updatedTransaction } : t)),
      );

      setEditingId(null);
      setEditText("");
      setEditAmount("");
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Lỗi khi cập nhật giao dịch: " + error.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setEditAmount("");
  };

  const exportExcel = () => {
    if (transactions.length === 0) {
      alert("Không có giao dịch để xuất");
      return;
    }
    const exportData = transactions.map((t) => ({
      "Mô tả": t.text,
      "Số tiền": t.amount,
      "Danh mục": getCategoryMeta(t.category).name,
      Tháng: t.date,
      "Ngày tạo": new Date(
        t.createdAt?.toDate?.() || t.createdAt,
      ).toLocaleDateString("vi-VN"),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(
      new Blob([buf]),
      `budget-tracker-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesCategory =
      filterCategory === "all" || t.category === filterCategory;
    const matchesSearch = t.text
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const total = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
  const income = filteredTransactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);
  const expense = filteredTransactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const formatCurrency = (num) => {
    return Math.abs(num).toLocaleString("vi-VN");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="mb-8">
            <Wallet className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h1 className="text-5xl font-bold text-white mb-2">
              Budget Tracker Pro
            </h1>
            <p className="text-slate-300 text-lg">
              Quản lý tài chính thông minh
            </p>
          </div>
          <button
            onClick={login}
            className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-2xl text-xl font-bold transition-all shadow-lg hover:shadow-purple-500/50 text-white"
          >
            🔐 Đăng nhập bằng Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl h-11.25 font-bold bg-linear-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Budget Tracker 
              </h1>
            </div>
            <p className="text-slate-400 ml-1">
              Quản lý chi tiêu thông minh của bạn
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt="avatar"
                className="w-12 h-12 rounded-full border-2 border-purple-400 shadow-lg"
              />
            )}
            <div className="text-left mr-3">
              <p className="text-white font-semibold text-sm">
                {user.displayName}
              </p>
              <p className="text-slate-400 text-xs">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="bg-linear-to-r flex gap-2.5 from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-4 py-2 rounded-xl font-bold transition-all shadow-lg text-white"
            >
              <LogOut /> Đăng xuất
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Balance */}
          <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-600 hover:border-purple-500 transition-all shadow-xl hover:shadow-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-sm font-semibold">Tổng số dư</p>
              <Wallet className="w-5 h-5 text-slate-400" />
            </div>
            <p
              className={`text-4xl font-bold mb-2 ${
                total >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {total >= 0 ? "+" : ""}
              {formatCurrency(total)} đ
            </p>
            <div className="mt-4 h-2 bg-slate-600 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  total >= 0
                    ? "bg-linear-to-r from-green-500 to-emerald-400"
                    : "bg-linear-to-r from-red-500 to-pink-500"
                }`}
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>

          {/* Income */}
          <div className="bg-linear-to-br from-emerald-900/50 to-emerald-800/50 rounded-2xl p-6 border border-emerald-600 hover:border-emerald-400 transition-all shadow-xl hover:shadow-emerald-500/20">
            <div className="flex items-center justify-between mb-3">
              <p className="text-emerald-300 text-sm font-semibold">Thu nhập</p>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-4xl font-bold text-emerald-300">
              +{formatCurrency(income)} đ
            </p>
            <p className="text-emerald-400/70 text-xs mt-2">
              {filteredTransactions.filter((t) => t.amount > 0).length} giao
              dịch
            </p>
          </div>

          {/* Expense */}
          <div className="bg-linear-to-br from-red-900/50 to-red-800/50 rounded-2xl p-6 border border-red-600 hover:border-red-400 transition-all shadow-xl hover:shadow-red-500/20">
            <div className="flex items-center justify-between mb-3">
              <p className="text-red-300 text-sm font-semibold">Chi tiêu</p>
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-4xl font-bold text-red-300">
              {formatCurrency(expense)} đ
            </p>
            <p className="text-red-400/70 text-xs mt-2">
              {filteredTransactions.filter((t) => t.amount < 0).length} giao
              dịch
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Add Transaction */}
            <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-600 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
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
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                />
                <input
                  type="number"
                  placeholder="Số tiền (dương: thu, âm: chi)..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !loading && addTransaction()
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                />

                <CategorySelectAdd value={category} onChange={setCategory} />

                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                />

                <button
                  onClick={addTransaction}
                  disabled={loading}
                  className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50"
                >
                  <Plus className="w-5 h-5" />
                  {loading ? "Đang thêm..." : "Thêm giao dịch"}
                </button>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={exportExcel}
              className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Xuất Excel
            </button>

            {/* View Mode Tabs */}
            <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-2xl p-2 border border-slate-600 shadow-xl">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`py-2.5 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
                    viewMode === "list"
                      ? "bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Danh sách
                </button>
                <button
                  onClick={() => setViewMode("pie")}
                  className={`py-2.5 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
                    viewMode === "pie"
                      ? "bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <PieChart className="w-4 h-4" />
                  Pie
                </button>
                <button
                  onClick={() => setViewMode("line")}
                  className={`py-2.5 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
                    viewMode === "line"
                      ? "bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <LineChart className="w-4 h-4" />
                  Trend
                </button>
                <button
                  onClick={() => setViewMode("bar")}
                  className={`py-2.5 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
                    viewMode === "bar"
                      ? "bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Bar
                </button>
              </div>
              <button
                onClick={() => setViewMode("analytics")}
                className={`w-full mt-2 py-2.5 rounded-lg font-semibold transition-all text-sm ${
                  viewMode === "analytics"
                    ? "bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📊 Phân tích chi tiết
              </button>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            {viewMode === "list" && (
              <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-600 shadow-xl h-full overflow-y-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    Lịch sử giao dịch ({filteredTransactions.length})
                  </h2>

                  <div className="flex gap-2 w-full md:w-auto">
                    <input
                      type="text"
                      placeholder="Tìm kiếm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 md:w-48 px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-400 transition-all"
                    />
                    <CategorySelect
                      value={filterCategory}
                      onChange={setFilterCategory}
                    />
                  </div>
                </div>

                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-16">
                    <Wallet className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-400 text-lg">
                      Chưa có giao dịch nào
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                      Bắt đầu thêm giao dịch đầu tiên của bạn!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
                    {filteredTransactions.map((t) => (
                      <div
                        key={t.id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-lg ${
                          t.amount > 0
                            ? "bg-emerald-900/20 border-emerald-600/50 hover:border-emerald-500 hover:bg-emerald-900/30"
                            : "bg-red-900/20 border-red-600/50 hover:border-red-500 hover:bg-red-900/30"
                        }`}
                      >
                        {editingId === t.id ? (
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white text-sm"
                            />
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-32 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-600 text-white text-sm"
                            />
                            <button
                              onClick={() => saveEdit(t.id)}
                              className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            {(() => {
                              const {
                                name,
                                icon: Icon,
                                color,
                              } = getCategoryMeta(t.category);

                              return (
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800">
                                    <Icon className={`w-4 h-4 ${color}`} />
                                  </div>

                                  <div>
                                    <span className="text-white font-semibold block text-base">
                                      {t.text}
                                    </span>
                                    <span className="text-slate-400 text-xs flex items-center gap-2">
                                      <Calendar className="w-3 h-3" />
                                      {t.date} • {name}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}

                            <div className="flex items-center gap-3">
                              <span
                                className={`font-bold text-lg ${
                                  t.amount > 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {t.amount > 0 ? "+" : ""}
                                {formatCurrency(t.amount)} đ
                              </span>
                              <button
                                onClick={() => startEdit(t)}
                                className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all duration-200"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteTransaction(t.id)}
                                className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {viewMode === "pie" && (
              <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-600 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-400" />
                  Chi tiêu theo danh mục
                </h2>
                <ExpensePieChart transactions={filteredTransactions} />
              </div>
            )}

            {viewMode === "line" && (
              <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-600 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-purple-400" />
                  Xu hướng theo tháng
                </h2>
                <MonthlyTrendChart transactions={filteredTransactions} />
              </div>
            )}

            {viewMode === "bar" && (
              <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-600 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  So sánh thu chi theo danh mục
                </h2>
                <CategoryBarChart transactions={filteredTransactions} />
              </div>
            )}

            {viewMode === "analytics" && (
              <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-600 shadow-xl">
                <AnalyticsPanel transactions={filteredTransactions} />
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
}
