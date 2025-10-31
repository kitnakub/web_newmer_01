import React from "react";
import Plot from "react-plotly.js";
import { evaluate } from "mathjs";

interface Iteration {
  iter: number;
  xOld: number;
  xNew: number;
  error: number;
}

interface EquationItem {
  id: number;
  equation: string;
}

type State = {
  gx: string;
  x0: string;
  tol: string;
  iterations: Iteration[];
  root: number | null;
  errorMsg: string;
  allEquations: EquationItem[];
};

export default class OnePointIteration extends React.Component<{}, State> {
  state: State = {
    gx: "(7 + x) / 4",
    x0: "2",
    tol: "0.000001",
    iterations: [],
    root: null,
    errorMsg: "",
    allEquations: [],
  };

  componentDidMount(): void {
    fetch("http://localhost:3000/equation/Bisection")
      .then((res) => res.json())
      .then((data: EquationItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          this.setState({ allEquations: data, gx: data[0].equation });
        }
      })
      .catch((err) => console.error("Error fetching equations:", err));
  }

  evaluateFunction = (x: number, expr: string): number => {
    try {
      return evaluate(expr, { x });
    } catch {
      return NaN;
    }
  };

  calculate = () => {
    try {
      this.setState({ errorMsg: "" });

      const { gx, x0, tol } = this.state;
      let x = parseFloat(x0);
      const tolerance = parseFloat(tol);
      const maxIter = 1000;

      if (isNaN(x) || isNaN(tolerance) || !gx.trim()) {
        this.setState({ errorMsg: "กรุณากรอกข้อมูลให้ครบและถูกต้อง" });
        return;
      }

      let iter = 0;
      const records: Iteration[] = [];
      let xNew: number = x;
      let error: number = Infinity;
      let text_error: number = Infinity;

      do {
        xNew = this.evaluateFunction(x, gx);
        error = Math.abs(xNew - x) / Math.abs(xNew);
        text_error = (Math.abs((xNew - x) / xNew) * 100);

        records.push({
          iter: iter,
          xOld: x,
          xNew: xNew,
          error: text_error,
        });

        x = xNew;
        iter++;

        if (iter >= maxIter) {
          this.setState({ errorMsg: "ไม่ลู่เข้าในจำนวนรอบที่กำหนด" });
          return;
        }
      } while (error > tolerance);

      this.setState({ iterations: records, root: xNew });
    } catch (err) {
      this.setState({ errorMsg: "เกิดข้อผิดพลาดในการคำนวณ กรุณาตรวจสอบฟังก์ชัน g(x)" });
    }
  };

  render() {
    const { gx, x0, tol, iterations, root, errorMsg, allEquations } = this.state;

    return (
      <div className="p-6 max-w-7xl mx-auto ">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            One Point Iteration Method
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded"></div>
        </div>

        {/* Input Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-slate-700">
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Input Parameters</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Function g(x)
              </label>
              <input
                type="text"
                value={gx}
                onChange={(e) => this.setState({ gx: e.target.value })}
                placeholder="e.g., (7 + x) / 4"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-white placeholder-gray-400"
              />
              <button
                onClick={() =>
                  allEquations.length > 0 &&
                  this.setState({ gx: allEquations[Math.floor(Math.random() * allEquations.length)].equation })
                }
              >
                Random Equation
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Initial x₀</label>
              <input
                type="text"
                value={x0}
                onChange={(e) => this.setState({ x0: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Tolerance</label>
              <input
                type="text"
                value={tol}
                onChange={(e) => this.setState({ tol: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-white"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={this.calculate}
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
            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Convergence Graph</h3>
            <Plot
              data={[
                {
                  x: iterations.map((p) => p.iter),
                  y: iterations.map((p) => p.error),
                  type: "scatter",
                  mode: "lines+markers",
                  name: "Error",
                  line: { color: "#06b6d4", width: 3 },
                  marker: { color: "#06b6d4", size: 8 },
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
                  gridcolor: "#334155",
                },
                yaxis: {
                  title: "Error",
                  gridcolor: "#334155",
                },
                showlegend: false,
              }}
              config={{ responsive: true }}
              className="w-full"
            />
          </div>
        )}

        {/* Iterations Table */}
        {iterations.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-2xl font-semibold mb-6 text-blue-300">Iteration Details</h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-700/50">
                    <th className="border border-slate-600 px-4 py-3 text-left text-sm font-medium text-wigth-300">Iteration</th>
                    <th className="border border-slate-600 px-4 py-3 text-left text-sm font-medium text-wigth-300">x (old)</th>
                    <th className="border border-slate-600 px-4 py-3 text-left text-sm font-medium text-wigth-300">x (new)</th>
                    <th className="border border-slate-600 px-4 py-3 text-left text-sm font-medium text-wigth-300">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {iterations.map((item) => (
                    <tr key={item.iter} className="hover:bg-slate-700/30 transition-colors">
                      <td className="border border-slate-600 px-4 py-3 text-sm text-center text-wigth-300">{item.iter}</td>
                      <td className="border border-slate-600 px-4 py-3 text-sm text-center text-wigth-400 font-medium">{item.xOld.toFixed(6)}</td>
                      <td className="border border-slate-600 px-4 py-3 text-sm text-center text-wigth-400 font-medium">{item.xNew.toFixed(6)}</td>
                      <td className="border border-slate-600 px-4 py-3 text-sm text-center text-wigth-400">{item.error.toFixed(6)} %</td>
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
// import Plot from "react-plotly.js";
// import { evaluate } from "mathjs";

// interface Iteration {
//   iter: number;
//   xOld: number;
//   xNew: number;
//   error: number;
// }

// interface EquationItem {
//   id: number;
//   equation: string;
// }

// const OnePointIteration: React.FC = () => {
//   const [gx, setGx] = useState("(7 + x) / 4");
//   const [x0, setX0] = useState("2");
//   const [tol, setTol] = useState("0.000001");
//   const [iterations, setIterations] = useState<Iteration[]>([]);
//   const [root, setRoot] = useState<number | null>(null);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [allEquations, setAllEquations] = useState<EquationItem[]>([]);

//   useEffect(() => {
//       fetch("http://localhost:3000/equation/Bisection")
//         .then(res => res.json())
//         .then(data => {
//           if (data.length > 0) {
//             setAllEquations(data);
//             setGx(data[0].equation);
//           }
//         })
//         .catch(err => console.error("Error fetching equations:", err));
//     }, []);

//     const evaluateFunction = (x: number, expr: string): number => {
//         try {
//           return evaluate(expr, { x });
//         } catch {
//           return NaN;
//         }
//       };

//   const calculate = () => {
//     try {
//       setErrorMsg("");
//       let x = parseFloat(x0);
//       const tolerance = parseFloat(tol);
//       const maxIter = 1000;

//       if (isNaN(x) || isNaN(tolerance) || !gx.trim()) {
//         setErrorMsg("กรุณากรอกข้อมูลให้ครบและถูกต้อง");
//         return;
//       }

//       let iter = 0;
//       let records: Iteration[] = [];
//       let xNew: number;
//       let error: number;
//       let text_error : number;

//       do {
//         xNew = evaluate(gx, { x });
//         error = Math.abs(xNew - x) / Math.abs(xNew);
//         text_error = error = Math.abs((xNew - x) / xNew) * 100;

//         records.push({
//           iter: iter,
//           xOld: x,
//           xNew: xNew,
//           error: text_error,
//         });

//         x = xNew;
//         iter++;

//         if (iter >= maxIter) {
//           setErrorMsg("ไม่ลู่เข้าในจำนวนรอบที่กำหนด");
//           return;
//         }
//       } while (error > tolerance);

//       setIterations(records);
//       setRoot(xNew);
//     } catch (err) {
//       setErrorMsg("เกิดข้อผิดพลาดในการคำนวณ กรุณาตรวจสอบฟังก์ชัน g(x)");
//     }
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto ">
//       {/* Header */}
//       <div className="text-center mb-8">
//         <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
//           One Point Iteration Method
//         </h2>
//         <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded"></div>
        
//       </div>

//       {/* Input Section */}
//       <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-slate-700">
//         <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Input Parameters</h3>
        
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-300">
//               Function g(x)
//             </label>
//             <input
//               type="text"
//               value={gx}
//               onChange={(e) => setGx(e.target.value)}
//               placeholder="e.g., (7 + x) / 4"
//               className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-white placeholder-gray-400"
//             />
//             <button
//               onClick={() => allEquations.length > 0 && setGx(allEquations[Math.floor(Math.random() * allEquations.length)].equation)}>
//                Random Equation
//             </button>
//           </div>
          
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-300">Initial x₀</label>
//             <input
//               type="text"
//               value={x0}
//               onChange={(e) => setX0(e.target.value)}
//               className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-white"
//             />
//           </div>
          
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-300">Tolerance</label>
//             <input
//               type="text"
//               value={tol}
//               onChange={(e) => setTol(e.target.value)}
//               className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-white"
//             />
//           </div>
//         </div>
        
//         {errorMsg && (
//           <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
//             {errorMsg}
//           </div>
//         )}
        
//         <div className="flex justify-center">
//           <button
//             onClick={calculate}
//             className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
//           >
//             Calculate Root
//           </button>
//         </div>
//       </div>

//       {/* Results - Root and Iterations Combined */}
//       {root !== null && (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
//           <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
//             <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
//               <span className="text-gray-300 font-medium">Root:</span>
//               <span className="text-2xl font-bold text-green-400">{root.toFixed(6)}</span>
//             </div>
//           </div>
          
//           <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
//             <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
//               <span className="text-gray-300 font-medium">Iterations:</span>
//               <span className="text-2xl font-bold text-blue-400">{iterations.length}</span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Graph - Full Width */}
//       {iterations.length > 0 && (
//         <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-slate-700">
//           <h3 className="text-2xl font-semibold mb-4 text-blue-300">Convergence Graph</h3>
//           <Plot
//             data={[
//               {
//                 x: iterations.map((p) => p.iter),
//                 y: iterations.map((p) => p.error),
//                 type: "scatter",
//                 mode: "lines+markers",
//                 name: "Error",
//                 line: { color: "#06b6d4", width: 3 },
//                 marker: { color: "#06b6d4", size: 8 },
//               },
//             ]}
//             layout={{
//               height: 400,
//               plot_bgcolor: "#1e293b",
//               paper_bgcolor: "transparent",
//               font: { color: "#cbd5e1" },
//               margin: { t: 20, r: 20, b: 50, l: 60 },
//               xaxis: { 
//                 title: "Iteration",
//                 gridcolor: "#334155" 
//               },
//               yaxis: { 
//                 title: "Error",
//                 gridcolor: "#334155",
                
//               },
//               showlegend: false
//             }}
//             config={{ responsive: true }}
//             className="w-full"
//           />
//         </div>
//       )}

//       {/* Iterations Table */}
//       {iterations.length > 0 && (
//         <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
//           <h3 className="text-2xl font-semibold mb-6 text-blue-300">Iteration Details</h3>
          
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-slate-700/50">
//                   <th className="border border-slate-600 px-4 py-3 text-left text-sm font-medium text-wigth-300">Iteration</th>
//                   <th className="border border-slate-600 px-4 py-3 text-left text-sm font-medium text-wigth-300">x (old)</th>
//                   <th className="border border-slate-600 px-4 py-3 text-left text-sm font-medium text-wigth-300">x (new)</th>
//                   <th className="border border-slate-600 px-4 py-3 text-left text-sm font-medium text-wigth-300">Error</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {iterations.map((item) => (
//                   <tr key={item.iter} className="hover:bg-slate-700/30 transition-colors">
//                     <td className="border border-slate-600 px-4 py-3 text-sm text-center text-wigth-300">{item.iter}</td>
//                     <td className="border border-slate-600 px-4 py-3 text-sm text-center text-wigth-400 font-medium">{item.xOld.toFixed(6)}</td>
//                     <td className="border border-slate-600 px-4 py-3 text-sm text-center text-wigth-400 font-medium">{item.xNew.toFixed(6)}</td>
//                     <td className="border border-slate-600 px-4 py-3 text-sm text-center text-wigth-400">{item.error.toFixed(6)} %</td>
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

// export default OnePointIteration;

