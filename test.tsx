import { useState } from "react";
import * as math from "mathjs"
import Plot from "react-plotly.js";
import { parse } from "postcss";


const test:React.FC = () => {

     const [fx,setfx] = useState("2*x^3 - 5*x^2 + 3*x + 1");
     const [a,seta] = useState(""); 
     const [b,setb] = useState("");
     const [n,setn] = useState("");
     const [showOutput, setShowOutput] = useState(false);
     const [answer,setAnswer] = useState<number | null >(null);
     const [xC,setxC] = useState<number[]>([]);
     const [yC,setyC] = useState<number[]>([]);
     const [xtap,setxtap] = useState<number[]>([]);
     const [ytap,setytap] = useState<number[]>([]);
     const [tapGraph, settapGraph] = useState<any[]>([]);

     const func = (fx:string,x:number) => {
          try{
               return math.evaluate(fx,{x});
          }
          catch{
               return NaN
          }
     }

     

     const cla = () => {
          const A = parseFloat(a);
          const B = parseFloat(b);
          const N = parseInt(n);

          if(N < 1) return;
          const H = (B - A) / N;

          const xi:number[] = [];
          const yi:number[] = [];

          let sum = 0;
          for(let i = 1;i < N;i++){
               const xvalu_tap = A + i * H;
               xi.push(xvalu_tap);
               yi.push(func(fx,xvalu_tap));
               sum += func(fx,xvalu_tap)
          }

          const indegrat = (H/2) * (func(fx,A) + func(fx,B) + 2*sum)
          setAnswer(indegrat)

          // curve สำหรับ สมการ เส้นกราฟ
          
          const xCtemp:number[] = [];
          const yCtemp:number[] = [];
          for(let i = A;i <= B;i += 0.01){
               xCtemp.push(i);
               yCtemp.push(func(fx,i))
          }
          setxC(xCtemp);
          setyC(yCtemp);
          
          // กราฟ tap นาจา

          const xtap_temp:number[] = [];
          const ytep_temp:number[] = [];
          for(let i = 0; i <= N;i++){
               const xval = A + i * H;
               xtap_temp.push(xval);
               ytep_temp.push(func(fx,xval));
          }
          setxtap(xtap_temp);
          setytap(ytep_temp);

          // tap สีเหลียมคางหมู
          const tapgraph = xtap_temp
               .map((_,i) => 
                    i === 0 ? null :{
                         x:[xtap_temp[i-1],xtap_temp[i-1],xtap_temp[i],xtap_temp[i],xtap_temp[i-1]],
                         y:[0,ytep_temp[i-1],ytep_temp[i],0,0],
                         mode: "lines",
                         fill: "toself",
                         line: {color:"blue",width : 1.5},
                         name: "tap" + i,
                    }
               )
               .filter(Boolean);
          settapGraph(tapgraph)
          setShowOutput(true)
     };
     

     return(
          <div>
               <h2> composit tap </h2>
               <div>
                    <label> f(x) = </label>
                    <input type="text"
                    value={fx}
                    onChange={(e) => setfx(e.target.value)} />
               </div>
               <div>
                    <label> A: </label>
                    <input type="number"
                    step= "any"
                    value={a}
                    onChange={(e) => seta(e.target.value)} />
               </div>
               <div>
                    <label> B: </label>
                    <input type="number"
                    step= "any"
                    value={b}
                    onChange={(e) => setb(e.target.value)} />
               </div>
               <div>
                    <label> N: </label>
                    <input type="number"
                    value={n}
                    onChange={(e) => setn(e.target.value)} />
               </div>
               <button onClick={cla}>
                    summit
               </button>
               {showOutput && (
                    <div>
                         <p>Ansewer: = {answer?.toFixed(6)}</p>  
                         <Plot 
                         
                         data={[
                         ...tapGraph,
                         { 
                              x: xC,
                              y: yC,
                              type: "scatter",
                              mode: "lines",
                              line: { color: "red", width: 3 }, 
                              name: "f(x)" 
                         },
                         {
                              x: xtap,
                              y: ytap,
                              mode: "markers", 
                              marker: { color: "red", size: 8 }, 
                              name: "Data Points" 
                         },
                         ]}
                         layout={{ 
                              autosize: true, 
                              title: "Composite Trapezoidal Graph", 
                              xaxis: { title: "X" }, 
                              yaxis: { title: "f(X)" } 
                         }}
                    />
                    </div>
               )}
          </div>
     )
}

export default test


