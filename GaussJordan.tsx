import React, { useState } from "react";

const GaussJordan: React.FC = () => {
  const [row, setRow] = useState("");
  const [col, setCol] = useState("");
  const [matrixA, setMatrixA] = useState<number[][]>([]);
  const [vectorB, setVectorB] = useState<number[]>([]);
  const [showMatrixForm, setShowMatrixForm] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const createMatrix = () => {
    const r = parseInt(row);
    const c = parseInt(col);
    if (isNaN(r) || isNaN(c) || r < 2 || r > 6 || c < 2 || c > 6) {
      setErrorMsg("กรุณาใส่ขนาดเมทริกซ์ระหว่าง 2–6");
      return;
    }
    if (r !== c) {
      setErrorMsg("ต้องเป็น Square Matrix (Row = Column)");
      return;
    }
    setErrorMsg("");
    setMatrixA(Array(r).fill(0).map(() => Array(c).fill(0)));
    setVectorB(Array(r).fill(0));
    setShowMatrixForm(true);
    setResults([]);
  };

  const handleMatrixChange = (i: number, j: number, value: string) => {
    const newMatrix = [...matrixA];
    newMatrix[i][j] = parseFloat(value) || 0;
    setMatrixA(newMatrix);
  };

  const handleVectorChange = (i: number, value: string) => {
    const newVector = [...vectorB];
    newVector[i] = parseFloat(value) || 0;
    setVectorB(newVector);
  };

  const gaussJordan = () => {
    try {
      setErrorMsg("");
      const n = matrixA.length;
      let A = matrixA.map((r) => [...r]);
      let B = [...vectorB];

      // Pivoting (ถ้าตัวแรกเป็นศูนย์)
      if (A[0][0] === 0 && n > 1) {
        [A[0], A[1]] = [A[1], A[0]];
        [B[0], B[1]] = [B[1], B[0]];
      }

      // Forward elimination
      for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
          if (i !== k) {
            const factor = A[i][k] / A[k][k];
            for (let j = 0; j < n; j++) {
              A[i][j] -= factor * A[k][j];
            }
            B[i] -= factor * B[k];
          }
        }
      }

      // Normalize diagonal
      for (let i = 0; i < n; i++) {
        const div = A[i][i];
        for (let j = 0; j < n; j++) A[i][j] /= div;
        B[i] /= div;
      }

      setResults(B);
    } catch {
      setErrorMsg("เกิดข้อผิดพลาดในการคำนวณ");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Gauss–Jordan Elimination
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded"></div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-6">
        {!showMatrixForm ? (
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-gray-300">Row</label>
              <input
                type="number"
                value={row}
                onChange={(e) => setRow(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-white text-lg"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-300">Column</label>
              <input
                type="number"
                value={col}
                onChange={(e) => setCol(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-white text-lg"
              />
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                {errorMsg}
              </div>
            )}

            <button
              onClick={createMatrix}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-white"
            >
              Submit
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Matrix A */}
            <div>
              <h4 className="text-xl font-semibold mb-4 text-white">Matrix [A]</h4>
              <div className="space-y-3">
                {matrixA.map((row, i) => (
                  <div key={i} className="flex gap-2">
                    {row.map((_, j) => (
                      <input
                        key={`${i}-${j}`}
                        type="number"
                        step="any"
                        value={matrixA[i][j] || 0}
                        onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                        placeholder={`a${i + 1}${j + 1}`}
                        className="flex-1 px-3 py-3 bg-emerald-900/30 border border-emerald-700 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-white text-center font-medium"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Vector B */}
            <div>
              <h4 className="text-xl font-semibold mb-4 text-white">Vector [B]</h4>
              <div className="space-y-3">
                {vectorB.map((_, i) => (
                  <input
                    key={i}
                    type="number"
                    step="any"
                    value={vectorB[i] || 0}
                    onChange={(e) => handleVectorChange(i, e.target.value)}
                    placeholder={`b${i + 1}`}
                    className="w-full px-3 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-white text-center font-medium"
                  />
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                {errorMsg}
              </div>
            )}

            <button
              onClick={gaussJordan}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-white"
            >
              Calculate
            </button>
          </div>
        )}
      </div>

      {/* Output */}
      {results.length > 0 && (
        <div className="bg-emerald-800/50 backdrop-blur-sm rounded-xl p-6 border border-emerald-700 mt-6">
          <h3 className="text-2xl font-semibold mb-6 text-white">Output</h3>
          <div className="space-y-4">
            {results.map((x, i) => (
              <div key={i} className="text-white text-xl font-bold">
                X<sub>{i + 1}</sub> = {x.toFixed(6)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GaussJordan;
