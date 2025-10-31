import React from "react";
import Plot from "react-plotly.js";
import { evaluate } from "mathjs";

interface Iteration {
  iter: number;
  x: number;
  fx: number;
  errorPercent: number;
}

interface EquationItem {
  id: number;
  equation: string;
}

type State = {
  fx: string;
  start: string;
  end: string;
  tol: string;
  iterations: Iteration[];
  root: number | null;
  errorMsg: string;
  allEquations: EquationItem[];
};

export default class GraphicalMethod extends React.Component<{}, State> {
  state: State = {
    fx: "x^2 - 7",
    start: "1",
    end: "4",
    tol: "0.000001",
    iterations: [],
    root: null,
    errorMsg: "",
    allEquations: [],
  };

  componentDidMount(): void {
    fetch("http://localhost:3000/equation/graphicalEquations")
      .then((res) => res.json())
      .then((data: EquationItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          this.setState({ allEquations: data, fx: data[0].equation });
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

      const { fx, start, end, tol } = this.state;
      const startVal = parseFloat(start);
      const endVal = parseFloat(end);
      const epsilon = parseFloat(tol);

      if (isNaN(startVal) || isNaN(endVal) || isNaN(epsilon) || !fx.trim()) {
        this.setState({ errorMsg: "กรุณากรอกข้อมูลให้ครบและถูกต้อง" });
        return;
      }

      if (startVal >= endVal) {
        this.setState({ errorMsg: "Start ต้องน้อยกว่า End" });
        return;
      }

      const history: Iteration[] = [];
      let h = (endVal - startVal) / 10; // เริ่ม step จากช่วงทั้งหมด / 10
      const reduction_factor = 10;

      let bracket_left = startVal;
      let bracket_right = endVal;
      let x = bracket_left;
      let fxVal = this.evaluateFunction(x, fx);

      history.push({ iter: 0, x, fx: fxVal, errorPercent: 0 });

      let iter = 0;
      const maxIter = 1000;
      let foundRoot = false;

      while (h > epsilon && iter < maxIter) {
        iter++;
        let nextX = x + h;
        if (nextX > bracket_right) nextX = bracket_right;

        const nextFX = this.evaluateFunction(nextX, fx);
        history.push({ iter, x: nextX, fx: nextFX, errorPercent: 0 });

        // ถ้าพบ sign change
        if (fxVal * nextFX < 0) {
          bracket_left = x;
          bracket_right = nextX;
          h /= reduction_factor; // ลด step
          x = bracket_left;
          fxVal = this.evaluateFunction(x, fx);
          continue;
        }

        x = nextX;
        fxVal = nextFX;

        // ถ้าช่วงเล็กพอ ให้ถือว่าเจอ root
        if (Math.abs(bracket_right - bracket_left) < epsilon) {
          foundRoot = true;
          break;
        }

        // ถ้า x ถึงจุดสุดท้าย
        if (x >= bracket_right) break;
      }

      const finalRoot = (bracket_left + bracket_right) / 2;

      // คำนวณ error percent
      for (let i = 0; i < history.length; i++) {
        const item = history[i];
        item.errorPercent = Math.abs((item.x - finalRoot) / finalRoot) * 100;
      }

      if (!foundRoot && iter >= maxIter) {
        this.setState({ errorMsg: "ไม่ลู่เข้าในจำนวนรอบที่กำหนด" });
        return;
      }

      this.setState({ iterations: history, root: finalRoot });
    } catch (err) {
      this.setState({ errorMsg: "เกิดข้อผิดพลาดในการคำนวณ กรุณาตรวจสอบฟังก์ชัน f(x)" });
    }
  };

  render() {
    const { fx, start, end, tol, iterations, root, errorMsg, allEquations } = this.state;

    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Graphical Method
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
                onChange={(e) => this.setState({ fx: e.target.value })}
                placeholder="e.g., x^2 - 7"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all text-white placeholder-gray-400"
              />
              <button
                onClick={() =>
                  allEquations.length > 0 &&
                  this.setState({ fx: allEquations[Math.floor(Math.random() * allEquations.length)].equation })
                }
              >
                Random Equation
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Start (xₗ)</label>
              <input
                type="text"
                value={start}
                onChange={(e) => this.setState({ start: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">End (xᵣ)</label>
              <input
                type="text"
                value={end}
                onChange={(e) => this.setState({ end: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Tolerance</label>
              <input
                type="text"
                value={tol}
                onChange={(e) => this.setState({ tol: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all text-white"
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
          <div className="grid grid-cols-1 md-grid-cols-2 md:grid-cols-2 gap-8 mb-8">
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
            <h3 className="text-2xl font-semibold mb-4 text-purple-300">Convergence Graph</h3>
            <Plot
              data={[
                {
                  x: iterations.map((p) => p.iter),
                  y: iterations.map((p) => Math.abs(p.fx)),
                  type: "scatter",
                  mode: "lines+markers",
                  name: "|f(x)| values",
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
                  gridcolor: "#334155",
                },
                yaxis: {
                  title: "|f(x)|",
                  gridcolor: "#334155",
                  type: "log",
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
            <h3 className="text-2xl font-semibold mb-6 text-purple-300">Iteration Details</h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-700/50">
                    <th className="border border-slate-600 px-4 py-3 text-left text-sm font-medium text-white-300">Iteration</th>
                    <th className="border border-slate-600 px-4 py-3 text-left text-sm font-medium text-white-300">x</th>
                    <th className="border border-slate-600 px-4 py-3 text-left text-sm font-medium text-white-300">f(x)</th>
                  </tr>
                </thead>
                <tbody>
                  {iterations.map((item) => (
                    <tr key={item.iter} className="hover:bg-slate-700/30 transition-colors">
                      <td className="border border-slate-600 px-4 py-3 text-sm text-center text-white-300">{item.iter}</td>
                      <td className="border border-slate-600 px-4 py-3 text-sm text-center text-white-400 font-medium">{item.x.toFixed(6)}</td>
                      <td className="border border-slate-600 px-4 py-3 text-sm text-center text-white-300">{item.fx.toFixed(6)}</td>
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

// import React, { useState, useEffect } from "react";
// import Plot from "react-plotly.js";
// import { evaluate } from "mathjs";



// interface Iteration {
//   iter: number;
//   x: number;
//   fx: number;
//   errorPercent: number;
// }

// interface EquationItem {
//   id: number;
//   equation: string;
// }

// const GraphicalMethod: React.FC = () => {
//   const [fx, setFx] = useState("x^2 - 7");
//   const [start, setStart] = useState("1");
//   const [end, setEnd] = useState("4");
//   const [tol, setTol] = useState("0.000001");
//   const [iterations, setIterations] = useState<Iteration[]>([]);
//   const [root, setRoot] = useState<number | null>(null);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [allEquations, setAllEquations] = useState<EquationItem[]>([]);

//   useEffect(() => {
//       fetch("http://localhost:3000/equation/graphicalEquations")
//         .then(res => res.json())
//         .then(data => {
//           if (data.length > 0) {
//             setAllEquations(data);
//             setFx(data[0].equation);
//           }
//         })
//         .catch(err => console.error("Error fetching equations:", err));
//     }, []);
  

//   const evaluateFunction = (x: number, expr: string): number => {
//       try {
//         return evaluate(expr, { x });
//       } catch {
//         return NaN;
//       }
//     };

//     const calculate = () => {
//   try {
//     setErrorMsg("");
//     const startVal = parseFloat(start);
//     const endVal = parseFloat(end);
//     const epsilon = parseFloat(tol);

//     if (isNaN(startVal) || isNaN(endVal) || isNaN(epsilon) || !fx.trim()) {
//       setErrorMsg("กรุณากรอกข้อมูลให้ครบและถูกต้อง");
//       return;
//     }

//     if (startVal >= endVal) {
//       setErrorMsg("Start ต้องน้อยกว่า End");
//       return;
//     }

//     const history: Iteration[] = [];
//     let h = (endVal - startVal) / 10; // เริ่ม step จากช่วงทั้งหมด / 10
//     const reduction_factor = 10;

//     let bracket_left = startVal;
//     let bracket_right = endVal;
//     let x = bracket_left;
//     let fxVal = evaluateFunction(x, fx);

//     history.push({ iter: 0, x, fx: fxVal, errorPercent: 0 });

//     let iter = 0;
//     const maxIter = 1000;
//     let foundRoot = false;

//     while (h > epsilon && iter < maxIter) {
//       iter++;
//       let nextX = x + h;
//       if (nextX > bracket_right) nextX = bracket_right;

//       const nextFX = evaluateFunction(nextX, fx);
//       history.push({ iter, x: nextX, fx: nextFX, errorPercent: 0 });

//       // ถ้าพบ sign change
//       if (fxVal * nextFX < 0) {
//         bracket_left = x;
//         bracket_right = nextX;
//         h /= reduction_factor; // ลด step
//         x = bracket_left;
//         fxVal = evaluateFunction(x, fx);
//         continue;
//       }

//       x = nextX;
//       fxVal = nextFX;

//       // ถ้าช่วงเล็กพอ ให้ถือว่าเจอ root
//       if (Math.abs(bracket_right - bracket_left) < epsilon) {
//         foundRoot = true;
//         break;
//       }

//       // ถ้า x ถึงจุดสุดท้าย
//       if (x >= bracket_right) break;
//     }

//     const finalRoot = (bracket_left + bracket_right) / 2;

//     // คำนวณ error percent
//     history.forEach((item) => {
//       item.errorPercent = Math.abs((item.x - finalRoot) / finalRoot) * 100;
//     });

//     if (!foundRoot && iter >= maxIter) {
//       setErrorMsg("ไม่ลู่เข้าในจำนวนรอบที่กำหนด");
//       return;
//     }

//     setIterations(history);
//     setRoot(finalRoot);
//   } catch (err) {
//     setErrorMsg("เกิดข้อผิดพลาดในการคำนวณ กรุณาตรวจสอบฟังก์ชัน f(x)");
//   }
// };


//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="text-center mb-8">
//         <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
//           Graphical Method
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
//               value={fx}
//               onChange={(e) => setFx(e.target.value)}
//               placeholder="e.g., x^2 - 7"
//               className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all text-white placeholder-gray-400"
//             />
//             <button
//               onClick={() => allEquations.length > 0 && setFx(allEquations[Math.floor(Math.random() * allEquations.length)].equation)}>
//                Random Equation
//             </button>
//           </div>
          
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-300">Start (xₗ)</label>
//             <input
//               type="text"
//               value={start}
//               onChange={(e) => setStart(e.target.value)}
//               className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all text-white"
//             />
//           </div>
          
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-300">End (xᵣ)</label>
//             <input
//               type="text"
//               value={end}
//               onChange={(e) => setEnd(e.target.value)}
//               className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all text-white"
//             />
//           </div>
          
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-300">Tolerance</label>
//             <input
//               type="text"
//               value={tol}
//               onChange={(e) => setTol(e.target.value)}
//               className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all text-white"
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
//           <h3 className="text-2xl font-semibold mb-4 text-purple-300">Convergence Graph</h3>
//           <Plot
//             data={[
//               {
//                 x: iterations.map((p) => p.iter),
//                 y: iterations.map((p) => Math.abs(p.fx)),
//                 type: "scatter",
//                 mode: "lines+markers",
//                 name: "|f(x)| values",
//                 line: { color: "#06b6d4", width: 3 },
//                 marker: { color: "#06b6d4", size: 6 },
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
//                 title: "|f(x)|",
//                 gridcolor: "#334155",
//                 type: "log"
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
//           <h3 className="text-2xl font-semibold mb-6 text-purple-300">Iteration Details</h3>
          
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-slate-700/50">
//                   <th className="border border-slate-600 px-4 py-3 text-left text-sm font-medium text-white-300">Iteration</th>
//                   <th className="border border-slate-600 px-4 py-3 text-left text-sm font-medium text-white-300">x</th>
//                   <th className="border border-slate-600 px-4 py-3 text-left text-sm font-medium text-white-300">f(x)</th>
                  
//                 </tr>
//               </thead>
//               <tbody>
//                 {iterations.map((item) => (
//                   <tr key={item.iter} className="hover:bg-slate-700/30 transition-colors">
//                     <td className="border border-slate-600 px-4 py-3 text-sm text-center text-white-300">{item.iter}</td>
//                     <td className="border border-slate-600 px-4 py-3 text-sm text-center text-white-400 font-medium">{item.x.toFixed(6)}</td>
//                     <td className="border border-slate-600 px-4 py-3 text-sm text-center text-white-300">{item.fx.toFixed(6)}</td>
                    
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

// export default GraphicalMethod;

// import React, { useState } from "react";
// import Plot from "react-plotly.js";
// import { evaluate } from "mathjs";

// interface Iteration { iter: number; x: number; fx: number; }

// const GraphicalMethod: React.FC = () => {
//   const [fx, setFx] = useState("x^2 - 7");
//   const [start, setStart] = useState("1");
//   const [end, setEnd] = useState("4");
//   const [tol, setTol] = useState("0.000001");
//   const [iterations, setIterations] = useState<Iteration[]>([]);
//   const [root, setRoot] = useState<number | null>(null);
//   const [errorMsg, setErrorMsg] = useState("");

//   const evaluateFunction = (x: number) => evaluate(fx, { x });

//   const calculate = () => {
//     try {
//       const a = parseFloat(start), b = parseFloat(end), eps = parseFloat(tol);
//       if (a >= b) { setErrorMsg("Start < End"); return; }

//       const hist: Iteration[] = [];
//       let x = a, h = (b - a)/10, iter = 0, found = false;
//       hist.push({ iter, x, fx: evaluateFunction(x) });

//       while (h > eps && iter < 1000) {
//         iter++;
//         let nextX = Math.min(x + h, b);
//         const nextFX = evaluateFunction(nextX);
//         hist.push({ iter, x: nextX, fx: nextFX });

//         if (hist[iter-1].fx * nextFX < 0) { x = x; h /= 10; continue; }
//         x = nextX;
//         if (Math.abs(b - a) < eps) { found = true; break; }
//       }

//       const finalRoot = (a + b)/2;
//       hist.forEach(i => i.fx = Math.abs(i.fx));
//       setIterations(hist);
//       setRoot(finalRoot);
//       setErrorMsg(found ? "" : "ไม่ลู่เข้า");
//     } catch { setErrorMsg("Error in f(x)"); }
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Graphical Method</h2>
//       <div className="mb-4">
//         <input value={fx} onChange={e=>setFx(e.target.value)} placeholder="f(x)" />
//         <input value={start} onChange={e=>setStart(e.target.value)} placeholder="Start" />
//         <input value={end} onChange={e=>setEnd(e.target.value)} placeholder="End" />
//         <input value={tol} onChange={e=>setTol(e.target.value)} placeholder="Tolerance" />
//         <button onClick={calculate}>Calculate</button>
//       </div>

//       {errorMsg && <p className="text-red-500">{errorMsg}</p>}
//       {root !== null && <p>Root ≈ {root.toFixed(6)}</p>}

//       {iterations.length > 0 && (
//         <>
//           <Plot
//             data={[{ x: iterations.map(i=>i.iter), y: iterations.map(i=>i.fx), type:"scatter", mode:"lines+markers" }]}
//             layout={{ height:300, title:"|f(x)| vs Iteration" }}
//           />
//           <table>
//             <thead><tr><th>Iter</th><th>x</th><th>|f(x)|</th></tr></thead>
//             <tbody>
//               {iterations.map(i=>(
//                 <tr key={i.iter}><td>{i.iter}</td><td>{i.x.toFixed(6)}</td><td>{i.fx.toFixed(6)}</td></tr>
//               ))}
//             </tbody>
//           </table>
//         </>
//       )}
//     </div>
//   );
// };

// export default GraphicalMethod;


