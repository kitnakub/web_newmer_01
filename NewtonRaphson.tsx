import { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { evaluate as mathEvaluate, derivative as mathDerivative } from "mathjs";

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

// --- OOP Class ---
class NewtonRaphsonSolver {
  equation: string;
  x0: number;
  tolerance: number;
  iterationData: IterationData[] = [];
  root: number | null = null;
  derivativeExpr: string;

  constructor(equation: string, x0: number, tolerance: number = 1e-6) {
    this.equation = equation;
    this.x0 = x0;
    this.tolerance = tolerance;
    this.derivativeExpr = mathDerivative(this.equation, "x").toString();
  }

  private evaluate(x: number, expr?: string): number {
    try {
      return mathEvaluate(expr || this.equation, { x });
    } catch {
      return NaN;
    }
  }

  run(): { root: number; iterationData: IterationData[] } {
    let xk = this.x0;
    this.iterationData = [];
    let iteration = 0;
    let error = Infinity;

    while (error > this.tolerance && iteration < 100) {
      const fx = this.evaluate(xk);
      const fpx = this.evaluate(xk, this.derivativeExpr);

      if (isNaN(fx) || isNaN(fpx)) throw new Error("Invalid equation or derivative!");
      if (fpx === 0) throw new Error("Derivative = 0, method fails.");

      const xNext = xk - fx / fpx;
      error = Math.abs(xNext - xk);

      this.iterationData.push({
        iteration,
        xk,
        yk: fx,
        errorPercent: iteration === 0 ? Math.abs(fx) * 100 : Math.abs((xNext - xk) / xNext) * 100,
      });

      xk = xNext;
      iteration++;
    }

    this.root = xk;
    return { root: xk, iterationData: this.iterationData };
  }
}

// --- React Component ---
export default function NewtonRaphsonMethod() {
  const [equation, setEquation] = useState("(1+43*x)/86");
  const [allEquations, setAllEquations] = useState<EquationItem[]>([]);
  const [x0, setX0] = useState(2);
  const [tolerance, setTolerance] = useState(1e-6);
  const [result, setResult] = useState<Result | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch equations from backend
  useEffect(() => {
    fetch("http://localhost:3000/equation/NewtonRaphson")
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setAllEquations(data);
        }
      })
      .catch(err => console.error("Error fetching equations:", err));
  }, []);

  const runNewtonRaphson = () => {
    setIsCalculating(true);
    setTimeout(() => {
      try {
        const solver = new NewtonRaphsonSolver(equation, x0, tolerance);
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
    const start = x0 - 10;
    const end = x0 + 10;
    const step = (end - start) / 200;
    for (let x = start; x <= end; x += step) {
      const y = mathEvaluate(equation, { x });
      if (!isNaN(y) && isFinite(y)) points.push({ x, y });
    }
    return points;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Newton–Raphson Method Calculator
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded"></div>
        </div>

        {/* Input */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-slate-700">
          <h3 className="text-2xl font-semibold mb-6 text-purple-300">Input</h3>

          <div className="mb-4">
            <label className="block text-sm text-gray-300">Equation</label>
            <input
              type="text"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white mb-2"
            />
            <button
              onClick={() => allEquations.length > 0 && setEquation(allEquations[Math.floor(Math.random() * allEquations.length)].equation)}>
               Random Equation
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm text-gray-300">X Initial</label>
              <input
                type="number"
                step="any"
                value={x0}
                onChange={(e) => setX0(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">Error threshold ϵ</label>
              <input
                type="number"
                step={1e-6}
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={runNewtonRaphson}
              disabled={isCalculating}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {isCalculating ? "Calculating..." : "Calculate!"}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h3 className="text-2xl font-semibold mb-6">Results</h3>
                <p><strong>Root:</strong> {result.root.toFixed(6)}</p>
                <p><strong>Iterations:</strong> {result.iterationData.length}</p>
                <p className="mt-3 text-sm text-slate-400">
                  f'(x) = {mathDerivative(equation, "x").toString()}
                </p>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h3 className="text-2xl font-semibold mb-6">Function Plot</h3>
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
                      x: result.iterationData.map(p => p.xk),
                      y: result.iterationData.map(p => p.yk),
                      type: "scatter",
                      mode: "markers",
                      name: "Newton Points",
                      marker: { color: "#f59e0b", size: 8 },
                    },
                  ]}
                  layout={{
                    height: 400,
                    title: "Newton–Raphson Visualization",
                    xaxis: { title: "x" },
                    yaxis: { title: "f(x)" },
                    plot_bgcolor: "#1e293b",
                    paper_bgcolor: "transparent",
                    font: { color: "#cbd5e1" },
                  }}
                />
              </div>
            </div>

            {/* Iteration Table */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-2xl font-semibold mb-6">Iteration Details</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-700/50">
                    <th className="border border-slate-600 px-4 py-3">Iteration</th>
                    <th className="border border-slate-600 px-4 py-3">xk</th>
                    <th className="border border-slate-600 px-4 py-3">f(xk)</th>
                    <th className="border border-slate-600 px-4 py-3">Error %</th>
                  </tr>
                </thead>
                <tbody>
                  {result.iterationData.map((row, i) => (
                    <tr key={i}>
                      <td className="border border-slate-600 px-4 py-3 text-center">{row.iteration}</td>
                      <td className="border border-slate-600 px-4 py-3 text-center">{row.xk.toFixed(6)}</td>
                      <td className="border border-slate-600 px-4 py-3 text-center">{row.yk.toFixed(6)}</td>
                      <td className="border border-slate-600 px-4 py-3 text-center">{row.errorPercent.toFixed(6)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
