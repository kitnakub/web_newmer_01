import React, { useState } from "react";

interface IterationData {
  iteration: number;
  x: number[];
  error: number[];
}

const Jacobi: React.FC = () => {
  const [row, setRow] = useState("");
  const [column, setColumn] = useState("");
  const [matrixA, setMatrixA] = useState<number[][]>([]);
  const [vectorB, setVectorB] = useState<number[]>([]);
  const [initialX, setInitialX] = useState<number[]>([]);
  const [iterations, setIterations] = useState<IterationData[]>([]);
  const [showMatrixForm, setShowMatrixForm] = useState(false);
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

    setMatrixA(Array(r).fill(0).map(() => Array(c).fill(0)));
    setVectorB(Array(r).fill(0));
    setInitialX(Array(r).fill(0));
    setShowMatrixForm(true);
    setErrorMsg("");
    setShowOutput(false);
    setIterations([]);
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

  const handleInitialChange = (i: number, value: string) => {
    const newInit = [...initialX];
    newInit[i] = parseFloat(value) || 0;
    setInitialX(newInit);
  };

  const calculateJacobi = () => {
    const n = matrixA.length;
    let xOld = [...initialX];
    let xNew = Array(n).fill(0);
    const eps = 1e-6;
    const maxIter = 100;
    let iterationData: IterationData[] = [];
    let count = 0;

    while (count < maxIter) {
      count++;
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
          if (i !== j) sum += matrixA[i][j] * xOld[j];
        }
        xNew[i] = (vectorB[i] - sum) / matrixA[i][i];
      }

      const errors = xNew.map((val, i) =>
        Math.abs((val - xOld[i]) / (val || 1))
      );
      iterationData.push({
        iteration: count,
        x: [...xNew],
        error: [...errors],
      });

      if (errors.every((e) => e < eps)) break;
      xOld = [...xNew];
    }

    setIterations(iterationData);
    setShowOutput(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Jacobi Iteration Method
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded"></div>
      </div>

      {/* Input Card */}
      <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-blue-700 mb-6">
        {!showMatrixForm ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-300">
                Row
              </label>
              <input
                type="number"
                value={row}
                onChange={(e) => setRow(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-blue-700 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-white text-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-300">
                Column
              </label>
              <input
                type="number"
                value={column}
                onChange={(e) => setColumn(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-blue-700 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-white text-lg"
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
        ) : (
          <div className="space-y-6">
            {/* Matrix A */}
            <div>
              <h4 className="text-xl font-semibold mb-4 text-white">
                Matrix [A]
              </h4>
              <div className="space-y-3">
                {matrixA.map((row, i) => (
                  <div key={i} className="flex gap-2">
                    {row.map((_, j) => (
                      <input
                        key={`${i}-${j}`}
                        type="number"
                        step="any"
                        value={matrixA[i][j] ?? ""}
                        onChange={(e) =>
                          handleMatrixChange(i, j, e.target.value)
                        }
                        placeholder={`a${i + 1}${j + 1}`}
                        className="flex-1 px-3 py-3 bg-blue-900/30 border border-blue-700 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-white text-center font-medium"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Vector B */}
            <div>
              <h4 className="text-xl font-semibold mb-4 text-white">
                Vector [B]
              </h4>
              <div className="space-y-3">
                {vectorB.map((_, i) => (
                  <input
                    key={i}
                    type="number"
                    step="any"
                    value={vectorB[i] ?? ""}
                    onChange={(e) => handleVectorChange(i, e.target.value)}
                    placeholder={`b${i + 1}`}
                    className="w-full px-3 py-3 bg-slate-800 border border-blue-700 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-white text-center font-medium"
                  />
                ))}
              </div>
            </div>

            {/* Initial X */}
            <div>
              <h4 className="text-xl font-semibold mb-4 text-white">
                Initial X
              </h4>
              <div className="space-y-3">
                {initialX.map((_, i) => (
                  <input
                    key={i}
                    type="number"
                    step="any"
                    value={initialX[i] ?? ""}
                    onChange={(e) => handleInitialChange(i, e.target.value)}
                    placeholder={`x${i + 1}`}
                    className="w-full px-3 py-3 bg-slate-800 border border-blue-700 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-white text-center font-medium"
                  />
                ))}
              </div>
            </div>

            <button
              onClick={calculateJacobi}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-white"
            >
              Submit
            </button>
          </div>
        )}
      </div>

      {/* Output */}
      {showOutput && iterations.length > 0 && (
        <div className="bg-blue-900/40 backdrop-blur-sm rounded-xl p-6 border border-blue-700 mt-6 overflow-x-auto">
          <h3 className="text-2xl font-semibold mb-6 text-white">Iterations</h3>
          <table className="min-w-full text-white border border-blue-700 rounded-lg">
            <thead>
              <tr className="bg-blue-900/60">
                <th className="px-4 py-2 text-left">Iteration</th>
                {iterations[0].x.map((_, i) => (
                  <th key={`x${i}`} className="px-4 py-2 text-center">
                    X{i + 1}
                  </th>
                ))}
                
              </tr>
            </thead>
            <tbody>
              {iterations.map((it) => (
                <tr key={it.iteration} className="border-t border-blue-700">
                  <td className="px-4 py-2">{it.iteration}</td>
                  {it.x.map((val, i) => (
                    <td key={`vx${i}`} className="px-4 py-2 text-center">
                      {val.toFixed(6)}
                    </td>
                  ))}
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Jacobi;
