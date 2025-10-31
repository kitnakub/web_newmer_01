import React, { useState } from "react";

interface Solution {
  variable: string;
  value: number;
}

const GaussElimination: React.FC = () => {
  const [row, setRow] = useState("");
  const [column, setColumn] = useState("");
  const [showMatrixForm, setShowMatrixForm] = useState(false);
  const [matrixA, setMatrixA] = useState<number[][]>([]);
  const [vectorB, setVectorB] = useState<number[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [showOutput, setShowOutput] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreateMatrix = () => {
    const r = parseInt(row);
    const c = parseInt(column);
    
    if (isNaN(r) || isNaN(c) || r < 2 || r > 6 || c < 2 || c > 6) {
      setErrorMsg("กรุณาใส่ขนาดเมทริกซ์ระหว่าง 2-6");
      return;
    }

    if (r !== c) {
      setErrorMsg("ต้องเป็น Square Matrix (Row = Column)");
      return;
    }
    
    setErrorMsg("");
    const newMatrixA = Array(r).fill(0).map(() => Array(c).fill(0));
    const newVectorB = Array(r).fill(0);
    setMatrixA(newMatrixA);
    setVectorB(newVectorB);
    setShowMatrixForm(true);
    setShowOutput(false);
    setSolutions([]);
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

  const calculateGauss = () => {
    try {
      setErrorMsg("");
      const n = matrixA.length;
      const A = matrixA.map(row => [...row]);
      const B = [...vectorB];

      // Pivoting if needed
      if (A[0][0] === 0) {
        const tempRow = [...A[0]];
        const tempColumn = B[0];
        A[0] = A[1];
        A[1] = tempRow;
        B[0] = B[1];
        B[1] = tempColumn;
      }

      // Forward Elimination
      for (let k = 0; k < n; k++) {
        for (let i = k + 1; i < n; i++) {
          const factor = A[i][k] / A[k][k];
          for (let j = k; j < n; j++) {
            A[i][j] = A[i][j] - factor * A[k][j];
          }
          B[i] = B[i] - factor * B[k];
        }
      }

      // Backward Substitution
      const X: number[] = new Array(n);
      X[n - 1] = B[n - 1] / A[n - 1][n - 1];
      
      for (let i = n - 2; i >= 0; i--) {
        let sum = B[i];
        for (let j = i + 1; j < n; j++) {
          sum = sum - A[i][j] * X[j];
        }
        X[i] = sum / A[i][i];
      }

      // Check for invalid results
      if (X.some(x => !isFinite(x))) {
        setErrorMsg("ระบบสมการไม่มีคำตอบเดียว");
        return;
      }

      const results: Solution[] = X.map((value, index) => ({
        variable: `x${index + 1}`,
        value: value
      }));

      setSolutions(results);
      setShowOutput(true);
    } catch (err) {
      setErrorMsg("เกิดข้อผิดพลาดในการคำนวณ");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Gauss Elimination
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded"></div>
      </div>

      {/* Input Section - Full Width */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-6">
        
        {/* Step 1: Dimension Input */}
        {!showMatrixForm && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-lg font-medium text-gray-300">Row</label>
                <input
                  type="number"
                  value={row}
                  onChange={(e) => setRow(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-white text-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-medium text-gray-300">Column</label>
                <input
                  type="number"
                  value={column}
                  onChange={(e) => setColumn(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-white text-lg"
                />
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleCreateMatrix}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-white"
              >
                Submit
              </button>
            </div>
          )}

          {/* Step 2: Matrix Input */}
          {showMatrixForm && (
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
                          value={matrixA[i][j] !== undefined ? matrixA[i][j] : ""}
                          onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                          className="flex-1 px-3 py-3 bg-blue-900/30 border border-blue-700 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-white text-center font-medium"
                          placeholder={`a${i+1}${j+1}`}
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
                      value={vectorB[i] !== undefined ? vectorB[i] : ""}
                      onChange={(e) => handleVectorChange(i, e.target.value)}
                      className="w-full px-3 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-white text-center font-medium"
                      placeholder={`b${i+1}`}
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
                onClick={calculateGauss}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-white"
              >
                Submit
              </button>
            </div>
          )}
        </div>

        {/* Output Section - Below Submit Button */}
        {showOutput && solutions.length > 0 && (
          <div className="bg-cyan-800/50 backdrop-blur-sm rounded-xl p-6 border border-cyan-700 mt-6">
            <h3 className="text-2xl font-semibold mb-6 text-white">Output</h3>
            
            <div className="space-y-4">
              {solutions.map((sol, index) => (
                <div key={index} className="text-white">
                  <h2 className="text-2xl font-bold">
                    X<sub>{index + 1}</sub> = {sol.value.toFixed(6)}
                  </h2>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};

export default GaussElimination;