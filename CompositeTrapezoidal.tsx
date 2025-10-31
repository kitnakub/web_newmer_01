import { useState, useEffect } from "react";
import { create, all } from "mathjs";
import createPlotlyComponent from "react-plotly.js/factory";
// @ts-ignore
import Plotly from "plotly.js-basic-dist";
import type { Data, Layout } from "plotly.js";

const Plot = createPlotlyComponent(Plotly);
const math = create(all);

const func = (fx: string, x: number): number => {
  try { return math.evaluate(fx, { x }); }
  catch { return NaN; }
};

interface EquationItem {
  id: number;
  equation: string;
}

const CompositeTrapezoidal = () => {
  const [fx, setFx] = useState<string>("x^3 - 2*x + 1");
  const [a, setA] = useState<number>(-1);
  const [b, setB] = useState<number>(2);
  const [n, setN] = useState<number>(4);

  const [I, setI] = useState<number>(0);
  const [exact, setExact] = useState<number>(0);
  const [error, setError] = useState<number>(0);
  const [showOutput, setShowOutput] = useState(false);

  const [xCurve, setXCurve] = useState<number[]>([]);
  const [yCurve, setYCurve] = useState<number[]>([]);
  const [xi, setXi] = useState<number[]>([]);
  const [yi, setYi] = useState<number[]>([]);
  const [trapezoidGraph, setTrapezoidGraph] = useState<Data[]>([]);
  const [allEquations, setAllEquations] = useState<EquationItem[]>([]);

  useEffect(() => {
      fetch("http://localhost:3000/equation/composite_Trapezoidal")
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            setAllEquations(data);
            setFx(data[0].equation);
          }
        })
        .catch(err => console.error("Error fetching equations:", err));
    }, []);

  const compositeTrapezoid = () => {
    if (n < 1) { alert("N must be at least 1!"); return; }

    const h = (b - a) / n;
    let sum = 0;
    for (let i = 1; i < n; i++) sum += func(fx, a + i * h);
    const Ivalue = (h / 2) * (func(fx, a) + func(fx, b) + 2 * sum);
    setI(Ivalue);

    // Numeric exact (fine Simpson for approximation)
    const nFine = 1000;
    const hFine = (b - a) / nFine;
    let sumFine = func(fx, a) + func(fx, b);
    for (let i = 1; i < nFine; i++) sumFine += 2 * func(fx, a + i * hFine);
    const exactVal = (hFine / 2) * sumFine;
    setExact(exactVal);
    setError(Math.abs((exactVal - Ivalue) / exactVal) * 100);
    setShowOutput(true);

    // Curve
    const xcurve: number[] = [], ycurve: number[] = [];
    for (let xi = a; xi <= b; xi += 0.01) { xcurve.push(xi); ycurve.push(func(fx, xi)); }
    setXCurve(xcurve); setYCurve(ycurve);

    // Nodes
    const xiArr: number[] = [], yiArr: number[] = [];
    for (let i = 0; i <= n; i++) { const xVal = a + i * h; xiArr.push(xVal); yiArr.push(func(fx, xVal)); }
    setXi(xiArr); setYi(yiArr);

    // Trapezoid plot
    const trapezoidPlot: Data[] = xiArr
      .map((_,i) => i===0?null:{
        x:[xiArr[i-1], xiArr[i], xiArr[i], xiArr[i-1]],
        y:[0, 0, yiArr[i], yiArr[i-1]],
        type:"scatter",
        mode:"lines",
        fill:"toself",
        fillcolor:"rgba(255,255,0,0.3)",
        line:{color:"yellow"},
        name:`Trapezoid ${i}`
      })
      .filter(Boolean) as Data[];
    setTrapezoidGraph(trapezoidPlot);
  };

  const plotData: Data[] = [
    { x: xCurve, y: yCurve, type: "scatter", mode: "lines", line: { color: "white" }, name: "f(x)" },
    { x: xi, y: yi, type: "scatter", mode: "lines+markers", marker: { color: "cyan" }, line: { color: "gray" }, name: "Nodes" },
    ...trapezoidGraph
  ];

  const plotLayout: Partial<Layout> = {
    autosize: true,
    title: { text: "Composite Trapezoidal Graph", font:{color:"white"} },
    xaxis: { title: { text: "X", font:{color:"white"} }, tickfont:{color:"white"}, gridcolor:"#555" },
    yaxis: { title: { text: "f(X)", font:{color:"white"} }, tickfont:{color:"white"}, gridcolor:"#555" },
    plot_bgcolor: "#1e293b",
    paper_bgcolor: "#1e293b",
    font: { color: "white" }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6 py-10 text-white">
      <div className="w-full max-w-5xl bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-6">
          Composite Trapezoidal Rule
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold text-blue-300">f(x)</label>
            <input
              type="text"
              value={fx}
              onChange={(e) => setFx(e.target.value)}
              className="w-full p-3 bg-slate-700/70 rounded-xl text-center text-white outline-none focus:ring-2 focus:ring-blue-400/40"
              placeholder="เช่น x^3 - 2*x + 1"
            />
            <button
              onClick={() => allEquations.length > 0 && setFx(allEquations[Math.floor(Math.random() * allEquations.length)].equation)}>
               Random Equation
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-blue-300">(A)</label>
              <input type="number" value={a} onChange={(e)=>setA(Number(e.target.value))} className="w-full p-3 bg-slate-700/70 rounded-xl text-center text-white outline-none focus:ring-2 focus:ring-blue-400/40" />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-blue-300">(B)</label>
              <input type="number" value={b} onChange={(e)=>setB(Number(e.target.value))} className="w-full p-3 bg-slate-700/70 rounded-xl text-center text-white outline-none focus:ring-2 focus:ring-blue-400/40" />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-blue-300">N</label>
            <input type="number" value={n} onChange={(e)=>setN(Number(e.target.value))} className="w-full p-3 bg-slate-700/70 rounded-xl text-center text-white outline-none focus:ring-2 focus:ring-blue-400/40" />
          </div>
          <button onClick={compositeTrapezoid} className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold transition">
            Calculate
          </button>
        </div>

        {showOutput && (
          <div className="mt-6 bg-slate-700/70 rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-xl font-bold text-blue-300 mb-2">Output</h3>
            <p className="text-lg font-semibold text-white">
              Approximate = {I.toFixed(6)}<br />
              Exact (Numeric) = {exact.toFixed(6)}<br />
              Error = {error.toFixed(6)}%
            </p>
          </div>
        )}

        {showOutput && (
          <div className="mt-6">
            <Plot data={plotData} layout={plotLayout} useResizeHandler style={{ width: "100%", height: "500px" }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CompositeTrapezoidal;
