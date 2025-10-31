import { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { evaluate } from "mathjs";

interface IterationData {
  iteration: number;
  xk: number;
  yk: number;
  errorPercent: number;
}

interface Result {
  root: number;
  iterationData: IterationData[];
}

interface EquationItem {
  id: number;
  equation: string;
}


class BisectionSolver {
  equation: string;
  a: number;
  b: number;
  tolerance: number;
  iterationData: IterationData[] = [];
  root: number | null = null;

  constructor(equation: string, a: number, b: number, tolerance: number = 1e-6) {
    this.equation = equation;
    this.a = a;
    this.b = b;
    this.tolerance = tolerance;
  }

  private evaluate(x: number): number {
    try {
      return evaluate(this.equation, { x });
    } catch {
      return NaN;
    }
  }

  run(): { root: number; iterationData: IterationData[] } | null {
    let aVal = this.a;
    let bVal = this.b;
    let iteration = 0;
    this.iterationData = [];

    let fa = this.evaluate(aVal);
    let fb = this.evaluate(bVal);

    if (fa * fb > 0) {
      throw new Error("f(a) and f(b) must have opposite signs");
    }

    let c = aVal;
    let fc = fa;

    do {
      c = (aVal + bVal) / 2;
      fc = this.evaluate(c);

      if (fa * fc < 0) {
        bVal = c;
        fb = fc;
      } else {
        aVal = c;
        fa = fc;
      }

      const errorPercent = Math.abs(fc) / Math.abs(c) * 100;
      this.iterationData.push({ iteration, xk: c, yk: fc, errorPercent });
      iteration++;
    } while (Math.abs(bVal - aVal) / 2 > this.tolerance || Math.abs(fc) > this.tolerance);

    this.root = c;
    return { root: c, iterationData: this.iterationData };
  }
}


export default function BisectionMethod() {
  const [equation, setEquation] = useState("x*43 - 180");
  const [allEquations, setAllEquations] = useState<EquationItem[]>([]);
  const [a, setA] = useState(0);
  const [b, setB] = useState(10);
  const [tolerance, setTolerance] = useState(0.000001);
  const [result, setResult] = useState<Result | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  
  useEffect(() => {
    fetch("http://localhost:3000/equation/Bisection")
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setAllEquations(data);
          setEquation(data[0].equation);
        }
      })
      .catch(err => console.error("Error fetching equations:", err));
  }, []);

  const runBisection = () => {
    setIsCalculating(true);
    setTimeout(() => {
      try {
        const solver = new BisectionSolver(equation, a, b, tolerance);
        const res = solver.run();
        setResult(res);
      } catch (err: any) {
        alert(err.message);
        setResult(null);
      }
      setIsCalculating(false);
    }, 100);
  };

  const generatePlotData = () => {
    const points: { x: number; y: number }[] = [];
    const start = Math.min(a, b) - 1;
    const end = Math.max(a, b) + 1;
    const step = (end - start) / 200;
    for (let x = start; x <= end; x += step) {
      const y = evaluate(equation, { x });
      if (!isNaN(y) && isFinite(y)) points.push({ x, y });
    }
    return points;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">

      
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Bisection Method Calculator
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded"></div>
        </div>

       
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-slate-700">
          <h3 className="text-2xl font-semibold mb-4 text-purple-300">Equation</h3>
          
          <div className="mb-4">
            <input
              type="text"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              placeholder="Or type your own equation"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white mb-2"
            />
            <button
              onClick={() => allEquations.length > 0 && setEquation(allEquations[Math.floor(Math.random() * allEquations.length)].equation)}>
               Random Equation
            </button>
          </div>

         
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Initial a</label>
              <input
                type="number"
                step="any"
                value={a}
                onChange={(e) => setA(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Initial b</label>
              <input
                type="number"
                step="any"
                value={b}
                onChange={(e) => setB(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Tolerance</label>
              <input
                type="number"
                step={0.0000001}
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none text-white"
              />
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={runBisection} 
              disabled={isCalculating}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {isCalculating ? "Calculating..." : "Calculate Root"}
            </button>
          </div>
        </div>

        
        {result && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-2xl font-semibold mb-6 text-gray-300">Results</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <span className="text-gray-300 font-medium">Root:</span>
                    <span className="text-2xl font-bold text-green-400">{result.root.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <span className="text-gray-300 font-medium">Iterations:</span>
                    <span className="text-xl font-semibold text-blue-400">{result.iterationData.length}</span>
                  </div>
                </div>
              </div>

              {/* Plot */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-2xl font-semibold mb-6 text-purple-300">Function Plot</h3>
                <Plot
                  data={[
                    {
                      x: generatePlotData().map(p => p.x),
                      y: generatePlotData().map(p => p.y),
                      type: "scatter",
                      mode: "lines",
                      name: "f(x)",
                      line: { color: "#7c3aed", width: 3 },
                    },
                    {
                      x: generatePlotData().map(p => p.x),
                      y: generatePlotData().map(() => 0),
                      type: "scatter",
                      mode: "lines",
                      name: "y = 0",
                      line: { color: "#94a3b8", width: 1, dash: "dash" },
                    },
                    {
                      x: result.iterationData.map(p => p.xk),
                      y: result.iterationData.map(p => p.yk),
                      type: "scatter",
                      mode: "markers",
                      name: "Bisection Points",
                      marker: { color: "#f59e0b", size: 8, line: { color: "#92400e", width: 2 } },
                    },
                    {
                      x: [result.root],
                      y: [evaluate(equation, { x: result.root })],
                      type: "scatter",
                      mode: "markers",
                      name: "Root",
                      marker: { color: "#10b981", size: 14, line: { color: "#065f46", width: 2 } },
                    },
                  ]}
                  layout={{
                    autosize: true,
                    height: 400,
                    title: { text: "Bisection Method Visualization", font: { color: "#e2e8f0" } },
                    xaxis: { title: "x", gridcolor: "#334155", color: "#cbd5e1" },
                    yaxis: { title: "f(x)", gridcolor: "#334155", color: "#cbd5e1" },
                    plot_bgcolor: "#1e293b",
                    paper_bgcolor: "transparent",
                    font: { color: "#cbd5e1" },
                    showlegend: true,
                    legend: { x: 0.02, y: 0.98, bgcolor: "rgba(30,41,59,0.8)", bordercolor: "#475569", borderwidth: 1 },
                  }}
                  config={{ responsive: true, displayModeBar: true, displaylogo: false }}
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            {/* Iteration Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mt-8">
              <h3 className="text-2xl font-semibold mb-6 text-gray-300">Iteration Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-700/50">
                      <th className="border border-slate-600 px-4 py-3 text-center text-sm text-gray-300">Iteration</th>
                      <th className="border border-slate-600 px-4 py-3 text-center text-sm text-gray-300">xk</th>
                      <th className="border border-slate-600 px-4 py-3 text-center text-sm text-gray-300">yk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.iterationData.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                        <td className="border border-slate-600 px-4 py-3 text-sm text-center text-gray-300">{row.iteration}</td>
                        <td className="border border-slate-600 px-4 py-3 text-sm text-center text-gray-200 font-medium">{row.xk.toFixed(6)}</td>
                        <td className="border border-slate-600 px-4 py-3 text-sm text-center text-gray-300">{row.yk.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
