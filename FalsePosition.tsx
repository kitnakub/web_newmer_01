import React from "react";
import Plot from "react-plotly.js";
import { evaluate } from "mathjs";

interface IterationData {
  iteration: number;
  a: number;
  b: number;
  x1: number;
  fx1: number;
  error: number; 
}

interface Result {
  root: number;
  fx1: number;
  iterations: number;
  finalError: number;
  iterationData: IterationData[];
}

interface EquationItem {
  id: number;
  equation: string;
}

class FalsePositionSolver {
  equation: string;
  a: number;
  b: number;
  tolerance: number;
  maxIterations: number;

  constructor(
    equation: string,
    a: number,
    b: number,
    tolerance: number = 1e-6,
    maxIterations: number = 100
  ) {
    this.equation = equation;
    this.a = a;
    this.b = b;
    this.tolerance = tolerance;
    this.maxIterations = maxIterations;
  }

  private f(x: number): number {
    try {
      return evaluate(this.equation, { x });
    } catch {
      return NaN;
    }
  }

  
  run(): Result {
    const iterationData: IterationData[] = [];

    let a = this.a;
    let b = this.b;
    let fa = this.f(a);
    let fb = this.f(b);

    if (!isFinite(fa) || !isFinite(fb)) {
      throw new Error("Invalid function evaluation at endpoints. Check your equation.");
    }

    if (fa * fb > 0) {
      throw new Error("f(a) and f(b) must have opposite signs");
    }

    let x1 = a;
    let fx1 = fa;
    let prevX1 = Number.NaN;
    let error = Number.POSITIVE_INFINITY;
    let iteration = 0;

    while (
      iteration < this.maxIterations &&
      (Math.abs(fx1) > this.tolerance || error > this.tolerance)
    ) {
      fa = this.f(a);
      fb = this.f(b);

      const denom = fb - fa;
      if (denom === 0) {
        throw new Error("Zero division encountered (f(b) - f(a) == 0)");
      }

      x1 = (a * fb - b * fa) / denom;
      fx1 = this.f(x1);

      iteration += 1;

      if (!Number.isNaN(prevX1)) {
        error = Math.abs((x1 - prevX1) / x1);
      } else {
        error = Math.abs(x1);
      }

      iterationData.push({
        iteration,
        a,
        b,
        x1,
        fx1,
        error,
      });

      // Update bracket
      if (fa * fx1 < 0) {
        b = x1;
      } else {
        a = x1;
      }

      prevX1 = x1;
    }

    return {
      root: x1,
      fx1,
      iterations: iteration,
      finalError: error,
      iterationData,
    };
  }
}


type State = {
  equation: string;
  a: number;
  b: number;
  tolerance: number;
  result: Result | null;
  isCalculating: boolean;
  allEquations: EquationItem[];
};

export default class FalsePosition extends React.Component<{}, State> {
  state: State = {
    equation: "x^3 - x - 2",
    a: -2,
    b: 3,
    tolerance: 0.000001,
    result: null,
    isCalculating: false,
    allEquations: [],
  };

  componentDidMount(): void {
  
    fetch("http://localhost:3000/equation/Bisection")
      .then((res) => res.json())
      .then((data: EquationItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          this.setState({ allEquations: data, equation: data[0].equation });
        }
      })
      .catch((err) => console.error("Error fetching equations:", err));
  }

  handleChange = (
    field: keyof Pick<State, "equation" | "a" | "b" | "tolerance">,
    value: string
  ) => {
    if (field === "equation") {
      this.setState({ equation: value });
      return;
    }

    // numeric fields
    const parsed = value === "" ? NaN : parseFloat(value);
    this.setState((prev) => ({ ...prev, [field]: isNaN(parsed) ? (prev as any)[field] : parsed }));
  };

  handleRandomEquation = () => {
    const { allEquations } = this.state;
    if (allEquations.length > 0) {
      const rand = allEquations[Math.floor(Math.random() * allEquations.length)].equation;
      this.setState({ equation: rand });
    }
  };

  calculate = () => {
    const { equation, a, b, tolerance } = this.state;
    this.setState({ isCalculating: true }, () => {
      try {
        const solver = new FalsePositionSolver(equation, a, b, tolerance, 100);
        const result = solver.run();
        this.setState({ result, isCalculating: false });
      } catch (err: any) {
        alert(err?.message ?? "Unknown error");
        this.setState({ isCalculating: false });
      }
    });
  };

  render() {
    const { equation, a, b, tolerance, result, isCalculating } = this.state;

    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            False Position Method
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
                value={equation}
                onChange={(e) => this.handleChange("equation", e.target.value)}
                placeholder="e.g., x^3 - x - 2"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all text-white placeholder-gray-400"
              />
              <button
                onClick={this.handleRandomEquation}
                className="mt-2 px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm"
              >
                Random Equation
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Initial a</label>
              <input
                type="number"
                step="any"
                value={a}
                onChange={(e) => this.handleChange("a", e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Initial b</label>
              <input
                type="number"
                step="any"
                value={b}
                onChange={(e) => this.handleChange("b", e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Tolerance</label>
              <input
                type="number"
                step="0.000001"
                value={tolerance}
                onChange={(e) => this.handleChange("tolerance", e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all text-white"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={this.calculate}
              disabled={isCalculating}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {isCalculating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Calculating...</span>
                </div>
              ) : (
                "Calculate Root"
              )}
            </button>
          </div>
        </div>

        {/* Results and Convergence Graph */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Results Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 className="text-2xl font-semibold mb-6 text-purple-300">Results</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <span className="text-gray-300 font-medium">Root:</span>
                  <span className="text-2xl font-bold text-green-400">{result.root.toFixed(6)}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <span className="text-gray-300 font-medium">f(root):</span>
                  <span className="text-xl font-semibold text-cyan-400">{result.fx1.toExponential(6)}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <span className="text-gray-300 font-medium">Iterations:</span>
                  <span className="text-2xl font-bold text-blue-400">{result.iterations}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <span className="text-gray-300 font-medium">Final Relative Error:</span>
                  <span className="text-xl font-semibold text-yellow-300">{result.finalError.toExponential(6)}</span>
                </div>
              </div>
            </div>

            {/* Convergence (Relative Error) */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 className="text-2xl font-semibold mb-4 text-purple-300">Convergence (Relative Error)</h3>
              <Plot
                data={[
                  {
                    x: result.iterationData.map((p) => p.iteration),
                    y: result.iterationData.map((p) => p.error),
                    type: "scatter",
                    mode: "lines+markers",
                    name: "Relative Error",
                    line: { width: 3 },
                    marker: { size: 6 },
                  },
                ]}
                layout={{
                  height: 350,
                  plot_bgcolor: "#1e293b",
                  paper_bgcolor: "transparent",
                  font: { color: "#cbd5e1" },
                  margin: { t: 20, r: 20, b: 50, l: 60 },
                  xaxis: {
                    title: "Iteration",
                    gridcolor: "#334155",
                  },
                  yaxis: {
                    title: "Relative Error",
                    type: "log",
                    gridcolor: "#334155",
                  },
                  showlegend: false,
                }}
                config={{ responsive: true, displayModeBar: false }}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Iterations Table */}
        {result && result.iterationData.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-2xl font-semibold mb-6 text-purple-300">Iteration Details</h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-700/50">
                    <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-purple-300">Iteration</th>
                    <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-purple-300">a</th>
                    <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-purple-300">b</th>
                    <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-purple-300">x₁</th>
                    <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-purple-300">f(x₁)</th>
                    <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-purple-300">Rel. Error</th>
                  </tr>
                </thead>
                <tbody>
                  {result.iterationData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                      <td className="border border-slate-600 px-4 py-3 text-sm text-center text-gray-300">{row.iteration}</td>
                      <td className="border border-slate-600 px-4 py-3 text-sm text-center text-gray-300">{row.a.toFixed(6)}</td>
                      <td className="border border-slate-600 px-4 py-3 text-sm text-center text-gray-300">{row.b.toFixed(6)}</td>
                      <td className="border border-slate-600 px-4 py-3 text-sm text-center text-gray-400 font-medium">{row.x1.toFixed(6)}</td>
                      <td className="border border-slate-600 px-4 py-3 text-sm text-center text-gray-300">{row.fx1.toExponential(8)}</td>
                      <td className="border border-slate-600 px-4 py-3 text-sm text-center text-gray-300">{row.error.toExponential(6)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
}




// import React, { useState, useEffect } from 'react';
// import Plot from 'react-plotly.js';
// import { evaluate } from "mathjs";

// interface IterationData {
//   iteration: number;
//   a: number;
//   b: number;
//   x1: number;
//   fx1: number;
//   error: number;
// }

// interface Result {
//   root: number;
//   fx1: number;
//   iterations: number;
//   finalError: number;
//   iterationData: IterationData[];
// }

// interface EquationItem {
//   id: number;
//   equation: string;
// }

// const FalsePosition: React.FC = () => {
//   const [equation, setEquation] = useState<string>("x^3 - x - 2");
//   const [a, setA] = useState<number>(-2);
//   const [b, setB] = useState<number>(3);
//   const [tolerance, setTolerance] = useState<number>(0.000001);
//   const [result, setResult] = useState<Result | null>(null);
//   const [isCalculating, setIsCalculating] = useState<boolean>(false);
//   const [allEquations, setAllEquations] = useState<EquationItem[]>([]);

//   useEffect(() => {
//     fetch("http://localhost:3000/equation/Bisection")
//       .then(res => res.json())
//       .then(data => {
//         if (data.length > 0) {
//           setAllEquations(data);
//           setEquation(data[0].equation);
//         }
//       })
//       .catch(err => console.error("Error fetching equations:", err));
//   }, []);

//   const evaluateFunction = (x: number, expr: string): number => {
//     try {
//       return evaluate(expr, { x });
//     } catch {
//       return NaN;
//     }
//   };

//   const falsePositionMethod = (): void => {
//     setIsCalculating(true);
//     const iterationData: IterationData[] = [];
//     let aVal = parseFloat(a.toString());
//     let bVal = parseFloat(b.toString());
//     let tol = parseFloat(tolerance.toString());
//     let iteration = 0;
//     let prevX1 = 0;
    
//     try {
//       const fa = evaluateFunction(aVal, equation);
//       const fb = evaluateFunction(bVal, equation);
      
//       if (fa * fb > 0) {
//         throw new Error('f(a) and f(b) must have opposite signs');
//       }

//       let x1: number = aVal;
//       let fx1: number = fa;
//       let error: number = Infinity;

//       do {
//         const faVal = evaluateFunction(aVal, equation);
//         const fbVal = evaluateFunction(bVal, equation);
        
//         x1 = (aVal * fbVal - bVal * faVal) / (fbVal - faVal);
//         fx1 = evaluateFunction(x1, equation);
        
//         iteration++;
        
//         if (iteration > 1) {
//           error = Math.abs((x1 - prevX1) / x1);
//         } else {
//           error = Math.abs(x1);
//         }
        
//         iterationData.push({
//           iteration: iteration,
//           a: aVal,
//           b: bVal,
//           x1: x1,
//           fx1: fx1,
//           error: error
//         });

//         if (faVal * fx1 < 0) {
//           bVal = x1;
//         } else {
//           aVal = x1;
//         }
        
//         prevX1 = x1;
        
//       } while (Math.abs(fx1) > tol && error > tol && iteration < 100);

//       setResult({
//         root: x1,
//         iterations: iteration,
//         fx1: fx1,
//         finalError: error,
//         iterationData: iterationData
//       });
      
//     } catch (error) {
//       alert((error as Error).message);
//     }
//     setIsCalculating(false);
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="text-center mb-8">
//         <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
//           False Position Method 
//         </h2>
//         <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded"></div>
//       </div>

//       {/* Input Section */}
//       <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-slate-700">
//         <h3 className="text-2xl font-semibold mb-6 text-purple-300">Input Parameters</h3>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-300">Function f(x)</label>
//             <input
//               type="text"
//               step = "any"
//               value={equation}
//               onChange={(e) => setEquation(e.target.value)}
//               placeholder="e.g., x^3 - x - 2"
//               className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all text-white placeholder-gray-400"
//             />
//             <button
//               onClick={() => allEquations.length > 0 && setEquation(allEquations[Math.floor(Math.random() * allEquations.length)].equation)}>
//                Random Equation
//             </button>
//           </div>
          
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-300">Initial a</label>
//             <input
//               type="number"
//               step = "any"
//               value={a}
//               onChange={(e) => {
//                     const value = e.target.value;
                    
//                     if (value === '') {
//                          return; 
//                     } else {
//                          setA(parseFloat(value));
//                     }
//                }}
//               className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all text-white"
//             />
//           </div>
          
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-300">Initial b</label>
//             <input
//               type="number"
//               value={b}
//               onChange={(e) => setB(parseFloat(e.target.value) || 0)}
//               className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all text-white"
//             />
//           </div>
          
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-300">Tolerance</label>
//             <input
//               type="number"
//               step="0.000001"
//               value={tolerance}
//               onChange={(e) => setTolerance(parseFloat(e.target.value) || 0.000001)}
//               className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all text-white"
//             />
//           </div>
//         </div>
        
//         <div className="flex justify-center">
//           <button
//             onClick={falsePositionMethod}
//             disabled={isCalculating}
//             className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
//           >
//             {isCalculating ? (
//               <div className="flex items-center space-x-2">
//                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                 <span>Calculating...</span>
//               </div>
//             ) : (
//               'Calculate Root'
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Results and Convergence Graph */}
//       {result && (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//           {/* Results Card */}
//           <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
//             <h3 className="text-2xl font-semibold mb-6 text-purple-300">Results</h3>
            
//             <div className="space-y-4">
//               <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
//                 <span className="text-gray-300 font-medium">Root:</span>
//                 <span className="text-2xl font-bold text-green-400">{result.root.toFixed(6)}</span>
//               </div>
              
//               <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
//                 <span className="text-gray-300 font-medium">Iterations:</span>
//                 <span className="text-2xl font-bold text-blue-400">{result.iterations}</span>
//               </div>
//             </div>
//           </div>

//           {/* Convergence to Zero */}
//           <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
//             <h3 className="text-2xl font-semibold mb-4 text-purple-300">Convergence to Zero</h3>
//             <Plot
//               data={[
//                 {
//                   x: result.iterationData.map((p) => p.iteration),
//                   y: result.iterationData.map((p) => p.error),
//                   type: "scatter",
//                   mode: "lines+markers",
//                   name: "f(x₁)",
//                   line: { color: "#06b6d4", width: 3 },
//                   marker: { color: "#06b6d4", size: 6 },
//                 },
//               ]}
//               layout={{
//                 height: 350,
//                 plot_bgcolor: "#1e293b",
//                 paper_bgcolor: "transparent",
//                 font: { color: "#cbd5e1" },
//                 margin: { t: 20, r: 20, b: 50, l: 60 },
//                 xaxis: { 
//                   title: "Iteration",
//                   gridcolor: "#334155" 
//                 },
//                 yaxis: { 
//                   title: "f(x₁)",
//                   gridcolor: "#334155",
                  
//                 },
//                 showlegend: false
//               }}
//               config={{ responsive: true, displayModeBar: false }}
//               className="w-full"
//             />
//           </div>
//         </div>
//       )}

//       {/* Iterations Table */}
//       {result && result.iterationData.length > 0 && (
//         <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
//           <h3 className="text-2xl font-semibold mb-6 text-purple-300">Iteration Details</h3>
          
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-slate-700/50">
//                   <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-purple-300">Iteration</th>
//                   <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-purple-300">a</th>
//                   <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-purple-300">b</th>
//                   <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-purple-300">x₁</th>
//                   <th className="border border-slate-600 px-4 py-3 text-center text-sm font-medium text-purple-300">f(x₁)</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {result.iterationData.map((row, index) => (
//                   <tr key={index} className="hover:bg-slate-700/30 transition-colors">
//                     <td className="border border-slate-600 px-4 py-3 text-sm text-center text-gray-300">{row.iteration}</td>
//                     <td className="border border-slate-600 px-4 py-3 text-sm text-center text-gray-300">{row.a.toFixed(6)}</td>
//                     <td className="border border-slate-600 px-4 py-3 text-sm text-center text-gray-300">{row.b.toFixed(6)}</td>
//                     <td className="border border-slate-600 px-4 py-3 text-sm text-center text-gray-400 font-medium">{row.x1.toFixed(6)}</td>
//                     <td className="border border-slate-600 px-4 py-3 text-sm text-center text-gray-300">{row.fx1.toFixed(8)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FalsePosition;

