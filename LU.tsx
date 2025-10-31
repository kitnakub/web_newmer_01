import React, { useState } from "react";
import { lusolve } from "mathjs";

interface Solution {
  variable: string;
  value: number;
}

const LU: React.FC = () => {
  const [row, setRow] = useState("");
  const [column, setColumn] = useState("");
  const [matrixA, setMatrixA] = useState<number[][]>([]);
  const [vectorB, setVectorB] = useState<number[]>([]);
  const [showMatrixForm, setShowMatrixForm] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [solutions, setSolutions] = useState<Solution[]>([]);
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
    setMatrixA(Array(r).fill(0).map(() => Array(c).fill(0)));
    setVectorB(Array(r).fill(0));
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

  const calculateLU = () => {
  try {
    setErrorMsg("");
    const result = lusolve(matrixA, vectorB) as number[][];
    const n = matrixA.length;

    const outputSolutions: Solution[] = [];
    for (let i = 0; i < n; i++) {
      outputSolutions.push({
        variable: `X${i + 1}`,
        value: Math.round(result[i][0]), // ตอนนี้ TypeScript เข้าใจแล้วว่าเป็น number
      });
    }

    setSolutions(outputSolutions);
    setShowOutput(true);
  } catch (error) {
    setErrorMsg("ไม่สามารถแก้สมการได้ (Matrix อาจเป็น singular)");
  }
};


  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          LU Decomposition
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded"></div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-6">
        {!showMatrixForm && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-300">Row</label>
              <input
                type="number"
                value={row}
                onChange={(e) => setRow(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-green-400/20 outline-none transition-all text-white text-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-300">Column</label>
              <input
                type="number"
                value={column}
                onChange={(e) => setColumn(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-green-400/20 outline-none transition-all text-white text-lg"
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

        {showMatrixForm && (
          <div className="space-y-6">
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
                        placeholder={`a${i + 1}${j + 1}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

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
                    placeholder={`b${i + 1}`}
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
              onClick={calculateLU}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-white"
            >
              Submit
            </button>
          </div>
        )}
      </div>

      {showOutput && solutions.length > 0 && (
        <div className="bg-emerald-800/50 backdrop-blur-sm rounded-xl p-6 border border-emerald-700 mt-6">
          <h3 className="text-2xl font-semibold mb-6 text-white">Output</h3>
          <div className="space-y-4">
            {solutions.map((sol, index) => (
              <div key={index} className="text-white text-2xl font-bold">
                {sol.variable} = {sol.value}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LU;
