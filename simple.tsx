import React, { useState } from "react";
import Plot from "react-plotly.js";

const SimpleRegression: React.FC = () => {
  const [nPoints, setNPoints] = useState("");
  const [xValues, setXValues] = useState<number[]>([]);
  const [yValues, setYValues] = useState<number[]>([]);
  const [X, setX] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  

  const generateInputs = () => {
    const n = parseInt(nPoints);
    if (!n) return;
    setXValues(Array(n).fill(0));
    setYValues(Array(n).fill(0));
    setShowTable(true);
  };

  const handleChange = (index: number, type: "x" | "y", value: string) => {
    const val = parseFloat(value) || 0;
    if (type === "x") {
      const newX = [...xValues];
      newX[index] = val;
      setXValues(newX);
    } else {
      const newY = [...yValues];
      newY[index] = val;
      setYValues(newY);
    }
  };

  const calculateRegression = () => {
    const n = xValues.length;
    if (n === 0 || X === "") return;

    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
    const sumX2 = xValues.reduce((acc, x) => acc + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const xVal = parseFloat(X);
    const yVal = intercept + slope * xVal;
    setResult(yVal);

    // สร้าง regression line points สำหรับ plot
    const regLineY = xValues.map((xi) => intercept + slope * xi);


    // เก็บค่า regression line สำหรับ plot
    setRegressionLine({
      x: xValues,
      y: regLineY,
      slope,
      intercept
    });
  };

  const [regressionLine, setRegressionLine] = useState<{ x: number[]; y: number[]; slope: number; intercept: number } | null>(null);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6 py-10 text-white">
      <div className="w-full max-w-5xl bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-400 mb-6">
          Simple Linear Regression with Plot
        </h1>

        {!showTable && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold text-blue-300">Number of points (n)</label>
              <input
                type="number"
                className="w-full p-3 bg-slate-700/70 rounded-xl text-white text-center outline-none focus:ring-2 focus:ring-blue-400/40"
                value={nPoints}
                onChange={(e) => setNPoints(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-blue-300">Extrapolation X</label>
              <input
                type="number"
                className="w-full p-3 bg-slate-700/70 rounded-xl text-white text-center outline-none focus:ring-2 focus:ring-blue-400/40"
                value={X}
                onChange={(e) => setX(e.target.value)}
              />
            </div>
            <button
              onClick={generateInputs}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 transition rounded-xl font-semibold text-white"
            >
              Generate Input Table
            </button>
          </div>
        )}

        {showTable && (
          <div className="mt-6 space-y-6">
            <h2 className="text-xl font-semibold text-blue-300 text-center mb-3">
              Input X and Y
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {xValues.map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <input
                    type="number"
                    placeholder={`x${i + 1}`}
                    className="w-full p-3 bg-slate-700/70 rounded-xl text-center outline-none focus:ring-2 focus:ring-blue-400/40"
                    onChange={(e) => handleChange(i, "x", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder={`y${i + 1}`}
                    className="w-full p-3 bg-slate-700/70 rounded-xl text-center outline-none focus:ring-2 focus:ring-blue-400/40"
                    onChange={(e) => handleChange(i, "y", e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4 mt-4">
              <button
                onClick={calculateRegression}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold transition"
              >
                Calculate & Plot
              </button>
              {result !== null && (
                <div className="mt-4 bg-slate-700/70 px-6 py-4 rounded-xl shadow-lg text-center">
                  <p className="text-lg font-semibold text-blue-300">Extrapolated Result:</p>
                  <p className="text-3xl font-bold text-white">{result.toFixed(6)}</p>
                </div>
              )}
            </div>

            {/* Plot 1: Data + Regression + Extrapolated Point */}
            {result !== null && regressionLine && (
               <Plot
               data={[
                    {
                    x: xValues,
                    y: yValues,
                    mode: "markers",
                    type: "scatter",
                    name: "Data Points",
                    marker: { color: "red", size: 10 },
                    },
                    {
                    x: [...xValues, parseFloat(X)],
                    y: [...regressionLine.y, result],
                    mode: "lines+markers",
                    type: "scatter",
                    name: "Regression Line + Extrapolated",
                    line: { color: "blue" },
                    marker: { color: "blue", size: 8 },
                    },
                    {
                    // จุดคำตอบ (Predicted Point)
                    x: [parseFloat(X)],
                    y: [result],
                    mode: "markers+text",
                    type: "scatter",
                    name: "Predicted Point",
                    marker: { color: "lime", size: 12, symbol: "star" },
                    text: [`(${parseFloat(X)}, ${result.toFixed(3)})`],
                    textposition: "top center",
                    },
               ]}
               layout={{
                    width: 700,
                    height: 500,
                    title: "Data Points & Regression Line",
                    xaxis: { title: "X" },
                    yaxis: { title: "Y" },
                    plot_bgcolor: "#0f172a",
                    paper_bgcolor: "#0f172a",
                    font: { color: "white" },
               }}
               />
               )}


          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleRegression;



