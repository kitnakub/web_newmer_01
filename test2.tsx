
import { useState ,useEffect} from "react";
import * as math from "mathjs";
import Plot from "react-plotly.js";

interface EquationItem {
  id: number;
  equation: string;
}

const Test2: React.FC = () => {
  const [fx, setfx] = useState("x^3 - 2*x + 1");
  const [a, seta] = useState("-1");
  const [b, setb] = useState("2");
  const [n, setn] = useState("4");
  const [showoutput, setshowoutput] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const [xC, setxC] = useState<number[]>([]);
  const [yC, setyC] = useState<number[]>([]);
  const [xsim_c, setxsim_c] = useState<number[]>([]);
  const [ysim_c, setysim_c] = useState<number[]>([]);
  const [simGraph, setsimGraph] = useState<any[]>([]);
  const [simGraph2, setsimGraph2] = useState<any[]>([]);
  const [allEquations, setAllEquations] = useState<EquationItem[]>([]);


    useEffect(()=>{
          fetch("http://localhost:3000/equation/composite_Trapezoidal")
          .then(res =>res.json())
          .then(data =>{
               setAllEquations(data)
               setfx(data[0].equation)
          })
          .catch()
    })
 

  const func = (fx: string, x: number) => {
    try {
      return math.evaluate(fx, { x });
    } catch {
      return NaN;
    }
  };

  const cla = () => {
    const A = parseFloat(a);
    const B = parseFloat(b);
    const N = parseInt(n);

    if (N < 2) return;

    const H = (B - A) / N;
    let sumx = 0;
    let sumy = 0;

    for (let i = 1; i < N; i++) {
          const xvalu_sim = A + i * H;
          const yval = func(fx, xvalu_sim);
          if (i % 2 === 0){
               sumx += yval;
          }
          else {
             sumy += yval;  
          }
    }

    const integral = (H / 3) * (func(fx, A) + func(fx, B) + 2 * sumx + 4 * sumy);
    setAnswer(integral);

    const xCtemp: number[] = [];
    const yCtemp: number[] = [];
    for (let i = A; i <= B; i += 0.01) {
      xCtemp.push(i);
      yCtemp.push(func(fx, i));
    }
    setxC(xCtemp);
    setyC(yCtemp);

    const xsim: number[] = [];
    const ysim: number[] = [];
    for (let i = 0; i <= N; i++) {
      const xsim_valu = A + i * H;
      xsim.push(xsim_valu);
      ysim.push(func(fx, xsim_valu));
    }
    setxsim_c(xsim);
    setysim_c(ysim);


    const simgraph = xsim
      .map((_, i) =>
        i === 0
          ? null
          : {
              x: [xsim[i - 1], xsim[i - 1], xsim[i], xsim[i], xsim[i - 1]],
              y: [0, ysim[i - 1], ysim[i], 0, 0],
              mode: "lines",
              fill: "toself",
              line: { color: "any", width: 1 },
              name: "Sim " + i,
            }
      )
      .filter(Boolean);

      const sim_2graph = xsim
          .map((_, i) => {
          if (i === 0) return null; 

          const x1 = xsim[i - 1];
          const x2 = xsim[i];
          const y1 = ysim[i - 1];
          const y2 = ysim[i];
          const width = x2 - x1;
          const hig = y2 - y1;

          const new_x1 = x1 + width * 0.5;
          const new_x2 = x1 + width * 0.5;
          const new_y1 = y1 + hig * 0.5
          const new_y2 = y1 + hig * 0.5;


          return {
               x: [new_x1, new_x1, new_x2, new_x2, new_x1],
               y: [0, new_y1, new_y2, 0, 0],
               mode: "lines",
               fill: "toself",
               line: { color: "red", width: 1.2 },
               name: "Sim mid " + i,
          };
          })
          .filter(Boolean);


    setsimGraph(simgraph);
    setsimGraph2(sim_2graph);
    setshowoutput(true);
  };

  return (
    <div>
      <h2>Composite Simpson’s Rule</h2>
      <div>
        <label>f(x): </label>
        <input
          type="text"
          value={fx}
          onChange={(e) => setfx(e.target.value)}
        />
        <button
              onClick={() => allEquations.length > 0 && setfx(allEquations[Math.floor(Math.random() * allEquations.length)].equation)}>
               Random Equation
            </button>
      </div>
      <div>
        <label>A: </label>
        <input
          type="number"
          step="any"
          value={a}
          onChange={(e) => seta(e.target.value)}
        />
      </div>   
      <div>
        <label>B: </label>
        <input
          type="number"
          step="any"
          value={b}
          onChange={(e) => setb(e.target.value)}
        />
      </div>
      <div>
        <label>N: </label>
        <input
          type="number"
          value={n}
          onChange={(e) => setn(e.target.value)}
        />
      </div>
      <button onClick={cla}>SUBMIT</button>

      {showoutput && (
        <div>
          <p>Answer = {answer?.toFixed(6)}</p>
          <Plot
            data={[
              ...simGraph,
              ...simGraph2,
              {
                x: xC,
                y: yC,
                type: "scatter",
                mode: "lines",
                line: { color: "red", width: 2 },
                name: "f(x)",
              },
              {
                x: xsim_c,
                y: ysim_c,
                type: "scatter",
                mode: "markers",
                marker: { color: "red", size: 6 },
                name: "Point",
              },
            ]}
            layout={{
              autosize: true,
              title: "Sim",
              xaxis: {
                title: "a to b",
                range: [parseFloat(a), parseFloat(b)], 
              },
              yaxis: {
                title: "f(x)",
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Test2;



