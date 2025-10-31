import React, { useState } from "react";

const SplineInterpolation: React.FC = () => {
  const [nPoints, setNPoints] = useState("");
  const [X, setX] = useState("");
  const [xValues, setXValues] = useState<number[]>([]);
  const [yValues, setYValues] = useState<number[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  // สร้าง matrix สำหรับระบบสมการ
  const zerosMat = (r: number, c: number) => Array.from({ length: r }, () => Array(c).fill(0));
  const swapRows = (m: number[][], k: number, l: number) => { const p = m[k]; m[k] = m[l]; m[l] = p; };

  const solve = (A: number[][], ks: number[]) => {
    const m = A.length;
    for (let k = 0; k < m; k++) {
      let i_max = k, vali = A[k][k];
      for (let i = k + 1; i < m; i++) if (A[i][k] > vali) { i_max = i; vali = A[i][k]; }
      swapRows(A, k, i_max);
      for (let i = k + 1; i < m; i++) {
        for (let j = k + 1; j < m + 1; j++) A[i][j] -= A[k][j] * (A[i][k] / A[k][k]);
        A[i][k] = 0;
      }
    }
    for (let i = m - 1; i >= 0; i--) {
      const v = A[i][m] / A[i][i]; ks[i] = v;
      for (let j = i - 1; j >= 0; j--) { A[j][m] -= A[j][i] * v; A[j][i] = 0; }
    }
    return ks;
  };

  const getNaturalKs = (xs: number[], ys: number[], ks: number[]) => {
    const n = xs.length - 1;
    const A = zerosMat(n + 1, n + 2);
    for (let i = 1; i < n; i++) {
      A[i][i - 1] = 1 / (xs[i] - xs[i - 1]);
      A[i][i] = 2 * (1 / (xs[i] - xs[i - 1]) + 1 / (xs[i + 1] - xs[i]));
      A[i][i + 1] = 1 / (xs[i + 1] - xs[i]);
      A[i][n + 1] = 3 * ((ys[i] - ys[i - 1]) / ((xs[i] - xs[i - 1]) ** 2) + (ys[i + 1] - ys[i]) / ((xs[i + 1] - xs[i]) ** 2));
    }
    A[0][0] = 2 / (xs[1] - xs[0]); A[0][1] = 1 / (xs[1] - xs[0]); A[0][n + 1] = 3 * (ys[1] - ys[0]) / ((xs[1] - xs[0]) ** 2);
    A[n][n - 1] = 1 / (xs[n] - xs[n - 1]); A[n][n] = 2 / (xs[n] - xs[n - 1]); A[n][n + 1] = 3 * (ys[n] - ys[n - 1]) / ((xs[n] - xs[n - 1]) ** 2);
    return solve(A, ks);
  };

  const spline = (xVal: number, xs: number[], ys: number[]) => {
    let ks = Array(xs.length).fill(0);
    ks = getNaturalKs(xs, ys, ks);
    let i = 1; while (xs[i] < xVal) i++;
    const t = (xVal - xs[i - 1]) / (xs[i] - xs[i - 1]);
    const a = ks[i - 1] * (xs[i] - xs[i - 1]) - (ys[i] - ys[i - 1]);
    const b = -ks[i] * (xs[i] - xs[i - 1]) + (ys[i] - ys[i - 1]);
    const q = (1 - t) * ys[i - 1] + t * ys[i] + t * (1 - t) * (a * (1 - t) + b * t);
    setResult(q);
  };

  const generateInputs = () => {
    const n = parseInt(nPoints);
    if (!n) return;
    setXValues(Array(n).fill(0));
    setYValues(Array(n).fill(0));
    setShowTable(true);
    setResult(null);
  };

  const handleChange = (index: number, type: "x" | "y", value: string) => {
    const val = parseFloat(value) || 0;
    if (type === "x") {
      const newX = [...xValues]; newX[index] = val; setXValues(newX);
    } else {
      const newY = [...yValues]; newY[index] = val; setYValues(newY);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6 py-10 text-white">
      <div className="w-full max-w-4xl bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg shadow-blue-900/40 p-8">
        <h1 className="text-3xl font-bold text-center text-blue-400 mb-6">Spline Interpolation</h1>

        {!showTable && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold text-blue-300">จำนวนจุด (n)</label>
              <input type="number" className="w-full p-3 bg-slate-700/70 rounded-xl text-white text-center" value={nPoints} onChange={e => setNPoints(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-blue-300">ค่า X ที่ต้องการหาผลลัพธ์</label>
              <input type="number" className="w-full p-3 bg-slate-700/70 rounded-xl text-white text-center" value={X} onChange={e => setX(e.target.value)} />
            </div>
            <button onClick={generateInputs} className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold">สร้างตารางกรอกค่า</button>
          </div>
        )}

        {showTable && (
          <div className="mt-6 space-y-6">
            <h2 className="text-xl font-semibold text-blue-300 text-center mb-3">กรอกค่าจุด X และ Y</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {xValues.map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <input type="number" placeholder={`x${i + 1}`} className="w-full p-3 bg-slate-700/70 rounded-xl text-center" onChange={e => handleChange(i, "x", e.target.value)} />
                  <input type="number" placeholder={`y${i + 1}`} className="w-full p-3 bg-slate-700/70 rounded-xl text-center" onChange={e => handleChange(i, "y", e.target.value)} />
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-4 mt-4">
              <button onClick={() => spline(parseFloat(X), xValues, yValues)} className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold">คำนวณค่า f(X)</button>
              {result !== null && (
                <div className="mt-4 bg-slate-700/70 px-6 py-4 rounded-xl shadow-lg text-center">
                  <p className="text-lg font-semibold text-blue-300">ผลลัพธ์:</p>
                  <p className="text-3xl font-bold text-white">{result.toFixed(6)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplineInterpolation;
