import React, { useState , useEffect} from "react";
import { evaluate, derivative } from "mathjs";

// ฟังก์ชันคำนวณค่า f(x)
const func = (fx: string, x: number): number => {
  try { return evaluate(fx, { x }); }
  catch { return NaN; }
};

// ฟังก์ชันคำนวณอนุพันธ์ลำดับ n
const funcDiffDegreeN = (fx: string, x: number, degree: number): number => {
  try {
    let df = fx;
    for (let i = 0; i < degree; i++) {
      df = derivative(df, "x").toString();
    }
    return evaluate(df, { x });
  } catch { return NaN; }
};

interface EquationItem {
  id: number;
  equation: string;
}

const Centralh: React.FC = () => {
  const [fx, setFx] = useState<string>("");
  const [x, setX] = useState<number>(0);
  const [h, setH] = useState<number>(0);
  const [degree, setDegree] = useState<number>(1);

  const [approx, setApprox] = useState<number>(0);
  const [exact, setExact] = useState<number>(0);
  const [error, setError] = useState<number>(0);
  const [showOutput, setShowOutput] = useState(false);
  const [allEquations, setAllEquations] = useState<EquationItem[]>([]);

  useEffect(() => {
            fetch("http://localhost:3000/equation/Differentiation")
              .then(res => res.json())
              .then(data => {
                if (data.length > 0) {
                  setAllEquations(data);
                  setFx(data[0].equation);
                }
              })
              .catch(err => console.error("Error fetching equations:", err));
       }, []);

  const centralh = () => {
    let y: number = 0;
    switch (degree) {
      case 1:
        y = (func(fx, x + h) - func(fx, x - h)) / (2 * h);
        break;
      case 2:
        y = (func(fx, x - h) - 2*func(fx, x) + func(fx, x + h)) / (h*h);
        break;
      case 3:
        y = (func(fx, x + 2*h) - 2*func(fx, x + h) + 2*func(fx, x - h) - func(fx, x - 2*h)) / (2*h*h*h);
        break;
      case 4:
        y = (func(fx, x - 2*h) - 4*func(fx, x - h) + 6*func(fx, x) - 4*func(fx, x + h) + func(fx, x + 2*h)) / (h**4);
        break;
      default:
        alert("Degree must be 1-4");
        return;
    }

    const exactVal = funcDiffDegreeN(fx, x, degree);
    const err = Math.abs((y - exactVal)/y) * 100;

    setApprox(y);
    setExact(exactVal);
    setError(err);
    setShowOutput(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6 py-10 text-white">
      <div className="w-full max-w-4xl bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-6">
          Central Divided-Differences O(h)
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold text-blue-300">f(x)</label>
            <input
              type="text"
              value={fx}
              onChange={(e)=>setFx(e.target.value)}
              placeholder="เช่น x^3 - 2*x + 1"
              className="w-full p-3 bg-slate-700/70 rounded-xl text-center text-white outline-none focus:ring-2 focus:ring-blue-400/40"
            />
            <button
              onClick={() => allEquations.length > 0 && setFx(allEquations[Math.floor(Math.random() * allEquations.length)].equation)}>
               Random Equation
          </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-blue-300">X</label>
              <input
                type="number"
                value={x}
                onChange={(e)=>setX(Number(e.target.value))}
                className="w-full p-3 bg-slate-700/70 rounded-xl text-center text-white outline-none focus:ring-2 focus:ring-blue-400/40"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-blue-300">H</label>
              <input
                type="number"
                value={h}
                onChange={(e)=>setH(Number(e.target.value))}
                className="w-full p-3 bg-slate-700/70 rounded-xl text-center text-white outline-none focus:ring-2 focus:ring-blue-400/40"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-blue-300">Order derivative</label>
              <input
                type="number"
                value={degree}
                onChange={(e)=>setDegree(Number(e.target.value))}
                className="w-full p-3 bg-slate-700/70 rounded-xl text-center text-white outline-none focus:ring-2 focus:ring-blue-400/40"
              />
            </div>
          </div>

          <button
            onClick={centralh}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold transition"
          >
            Calculate
          </button>
        </div>

        {showOutput && (
          <div className="mt-6 bg-slate-700/70 rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-xl font-bold text-blue-300 mb-2">Output</h3>
            <p className="text-lg font-semibold text-white">
              Result = {approx.toFixed(8)}<br />
              Error = {error.toFixed(4)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Centralh;
