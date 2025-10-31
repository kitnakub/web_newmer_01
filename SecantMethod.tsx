import { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { evaluate } from "mathjs";

interface Iteration {
  iter: number;
  xk: number;
  yk: number;
  error: number;
}

interface EquationItem {
  id: number;
  equation: string;
}

const SecantMethod: React.FC = () => {
  const [fx, setFx] = useState("x^2 - 7");
  const [x0, setX0] = useState("1");
  const [x1, setX1] = useState("1.5");
  const [tol, setTol] = useState("0.000001");
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [root, setRoot] = useState<number | null>(null);
  const [allEquations, setAllEquations] = useState<EquationItem[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/equation/secant")
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setAllEquations(data);
          setFx(data[0].equation); // <-- แก้จาก setEquation
        }
      })
      .catch(err => console.error("Error fetching equations:", err));
  }, []);

  const evaluateFunction = (x: number, expr: string): number => {
    try {
      return evaluate(expr, { x });
    } catch {
      return NaN;
    }
  };

  const calculate = () => {
    let xPrev = parseFloat(x0);
    let xCurr = parseFloat(x1);
    const tolNum = parseFloat(tol);
    let iterCount = 0;
    let error = Infinity;
    const result: Iteration[] = [];

    while (error > tolNum) {
      const yPrev = evaluateFunction(xPrev, fx);
      const yCurr = evaluateFunction(xCurr, fx);

      const xNext = xCurr - (yCurr * (xPrev - xCurr)) / (yPrev - yCurr);
      error = Math.abs((xNext - xCurr) / xNext) * 100;

      result.push({
        iter: iterCount,
        xk: xCurr,
        yk: yCurr,
        error: iterCount === 0 ? Math.abs(yCurr) * 100 : error,
      });

      xPrev = xCurr;
      xCurr = xNext;
      iterCount++;
      if (error === 0) break;
    }

    setIterations(result);
    setRoot(xCurr);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Secant Method
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded"></div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-slate-700">
        <h3 className="text-2xl font-semibold mb-6 text-purple-300">Input Parameters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Function f(x)</label>
            <input
              type="text"
              value={fx}
              onChange={(e) => setFx(e.target.value)}
              placeholder="e.g., x^2 - 7"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all text-white placeholder-gray-400"
            />
            <button
              onClick={() => allEquations.length > 0 && setFx(allEquations[Math.floor(Math.random() * allEquations.length)].equation)}>
               Random Equation
            </button>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Initial x₀</label>
            <input
              type="text"
              value={x0}
              onChange={(e) => setX0(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all text-white"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Initial x₁</label>
            <input
              type="text"
              value={x1}
              onChange={(e) => setX1(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all text-white"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Tolerance</label>
            <input
              type="text"
              value={tol}
              onChange={(e) => setTol(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all text-white"
            />
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={calculate}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Calculate Root
          </button>
        </div>
      </div>

      {/* Results - Root and Iterations Combined */}
      {root !== null && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <span className="text-gray-300 font-medium">Root:</span>
              <span className="text-2xl font-bold text-green-400">{root.toFixed(6)}</span>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <span className="text-gray-300 font-medium">Iterations:</span>
              <span className="text-2xl font-bold text-blue-400">{iterations.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Graph - Full Width */}
      {iterations.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-slate-700">
          <h3 className="text-2xl font-semibold mb-4 text-purple-300">Convergence to Zero</h3>
          <Plot
            data={[
              {
                x: iterations.map((p) => p.iter),
                y: iterations.map((p) => p.error),
                type: "scatter",
                mode: "lines+markers",
                name: "f(x) values",
                line: { color: "#06b6d4", width: 3 },
                marker: { color: "#06b6d4", size: 6 },
              },
            ]}
            layout={{
              height: 400,
              plot_bgcolor: "#1e293b",
              paper_bgcolor: "transparent",
              font: { color: "#cbd5e1" },
              margin: { t: 20, r: 20, b: 50, l: 60 },
              xaxis: { 
                title: "Iteration",
                gridcolor: "#334155" 
              },
              yaxis: { 
                title: "f(x)",
                gridcolor: "#334155" 
              },
              showlegend: false
            }}
            config={{ responsive: true }}
            className="w-full"
          />
        </div>
      )}

      {/* Iterations Table */}
      {iterations.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-2xl font-semibold mb-6 text-purple-300">Iteration Details</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-700/50">
                  <th className="border border-slate-600 px-4 py-3 text-left text-sm font-medium text-white-300">Iteration</th>
                  <th className="border border-slate-600 px-4 py-3 text-left text-sm font-medium text-white-300">xₖ</th>
                  <th className="border border-slate-600 px-4 py-3 text-left text-sm font-medium text-white-300">f(xₖ)</th>
                </tr>
              </thead>
              <tbody>
                {iterations.map((item) => (
                  <tr key={item.iter} className="hover:bg-slate-700/30 transition-colors">
                    <td className="border border-slate-600 px-4 py-3 text-sm text-center text-white-300">{item.iter}</td>
                    <td className="border border-slate-600 px-4 py-3 text-sm text-center text-white-400 font-medium">{item.xk.toFixed(6)}</td>
                    <td className="border border-slate-600 px-4 py-3 text-sm text-center text-white-300">{item.yk.toFixed(6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecantMethod;