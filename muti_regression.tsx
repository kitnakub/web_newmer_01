import React, { useState } from "react";
import { lusolve, round, squeeze } from "mathjs";
import Plot from "react-plotly.js";

const MultipleLinearDynamic: React.FC = () => {
  const [nPoints, setNPoints] = useState(0);
  const [nX, setNX] = useState(0);
  const [showInputForm, setShowInputForm] = useState(true);
  const [showTableInput, setShowTableInput] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [matrixAnswer, setMatrixAnswer] = useState<number[] | null>(null);

  // สร้าง table input
  const createTableInput = () => {
    const table: any[] = [];
    for (let i = 0; i < nPoints; i++) {
      const xRow = Array.from({ length: nX }, () => ({ value: 0 }));
      table.push({ no: i + 1, x: xRow, y: 0 });
    }
    setTableData(table);
    setShowInputForm(false);
    setShowTableInput(true);
    setMatrixAnswer(null);
  };

  // handle input changes
  const handleXChange = (rowIndex: number, colIndex: number, value: string) => {
    const val = parseFloat(value) || 0;
    const newData = [...tableData];
    newData[rowIndex].x[colIndex].value = val;
    setTableData(newData);
  };

  const handleYChange = (rowIndex: number, value: string) => {
    const val = parseFloat(value) || 0;
    const newData = [...tableData];
    newData[rowIndex].y = val;
    setTableData(newData);
  };

  // คำนวณ Multiple Linear Regression
  const calculateRegression = () => {
    const n = nPoints;
    const p = nX;

    const regressionMatrixX: number[][] = Array.from({ length: p + 1 }, () => Array(p + 1).fill(0));
    const regressionMatrixY: number[] = Array(p + 1).fill(0);

    const xVals = tableData.map(row => row.x.map((cell: any) => cell.value));
    const yVals = tableData.map(row => row.y);

    const summation = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const summationOfTwo = (a: number[], b: number[]) => a.reduce((acc, val, i) => acc + val * b[i], 0);

    for (let i = 0; i <= p; i++) {
      for (let j = i; j <= p; j++) {
        if (i === 0 && j === 0) regressionMatrixX[i][j] = n;
        else if (i === 0) regressionMatrixX[i][j] = regressionMatrixX[j][i] = summation(xVals.map(row => row[j - 1]));
        else if (j === 0) regressionMatrixX[i][j] = regressionMatrixX[j][i] = summation(xVals.map(row => row[i - 1]));
        else regressionMatrixX[i][j] = regressionMatrixX[j][i] = summationOfTwo(xVals.map(row => row[i - 1]), xVals.map(row => row[j - 1]));
      }
    }

    for (let j = 0; j <= p; j++) {
      if (j === 0) regressionMatrixY[j] = summation(yVals);
      else regressionMatrixY[j] = summationOfTwo(xVals.map(row => row[j - 1]), yVals);
    }

    const matrixA = regressionMatrixX.map(row => [...row]);
    const matrixB = [...regressionMatrixY];
    const answer = squeeze(round(lusolve(matrixA, matrixB), 6)) as number[];
    setMatrixAnswer(answer);
  };

  
    // Plot regression function 
  const plotData = () => {
    if (!matrixAnswer) return [];

    const xVals = tableData.map(row => row.x.map((cell: any) => cell.value));
    const yVals = tableData.map(row => row.y);

    // สำหรับกรณี 1 ตัวแปร -> plot x vs y และเส้นฟังก์ชัน
    if (nX === 1) {
      const x = xVals.map(row => row[0]);
      const yPred = x.map(xi => matrixAnswer![0] + matrixAnswer![1] * xi);

      return [
        {
          x,
          y: yVals,
          type: "scatter",
          mode: "markers",
          marker: { color: "red", size: 8 },
          name: "Data Points"
        },
        {
          x: [...x].sort((a, b) => a - b),
          y: [...x].sort((a, b) => a - b).map(xi => matrixAnswer![0] + matrixAnswer![1] * xi),
          type: "scatter",
          mode: "lines",
          line: { color: "blue", width: 3 },
          name: "Regression Function"
        }
      ];
    }

    // สำหรับกรณี 2 ตัวแปร -> plot X1 กับ Y (fix X2 = ค่าเฉลี่ย)
    if (nX === 2) {
      const x1 = xVals.map(row => row[0]);
      const x2 = xVals.map(row => row[1]);
      const meanX2 = x2.reduce((a, b) => a + b, 0) / x2.length;

      const xSorted = [...x1].sort((a, b) => a - b);
      const yPred = xSorted.map(xi => matrixAnswer![0] + matrixAnswer![1] * xi + matrixAnswer![2] * meanX2);

      return [
        {
          x: x1,
          y: yVals,
          type: "scatter",
          mode: "markers",
          marker: { color: "orange", size: 8 },
          name: "Data Points"
        },
        {
          x: xSorted,
          y: yPred,
          type: "scatter",
          mode: "lines",
          line: { color: "blue", width: 3 },
          name: `Regression (X2 = ${meanX2.toFixed(2)})`
        }
      ];
    }

    return [];
  };


  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-10 px-4 text-white">
      <div className="w-full max-w-6xl bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-400">Multiple Linear Regression</h2>

        {showInputForm && (
          <div className="space-y-4">
            <div>
              <label className="block text-blue-300 font-semibold mb-1">Number of X</label>
              <input type="number" value={nX} onChange={e => setNX(Number(e.target.value))} className="w-full p-3 rounded-xl text-center text-white bg-slate-700/70" />
            </div>
            <div>
              <label className="block text-blue-300 font-semibold mb-1">Number of Points (n)</label>
              <input type="number" value={nPoints} onChange={e => setNPoints(Number(e.target.value))} className="w-full p-3 rounded-xl text-center text-white bg-slate-700/70" />
            </div>
            <button onClick={createTableInput} className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold transition">Generate Table</button>
          </div>
        )}

        {showTableInput && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border border-gray-400">
              <thead>
                <tr className="bg-slate-700">
                  <th className="border px-3 py-2">No.</th>
                  {Array.from({ length: nX }, (_, j) => <th key={j} className="border px-3 py-2">X{j + 1}</th>)}
                  <th className="border px-3 py-2">Y</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr key={i} className="text-center">
                    <td className="border px-2 py-2">{row.no}</td>
                    {row.x.map((cell: any, j: number) => (
                      <td key={j} className="border px-2 py-2">
                        <input type="number" value={cell.value} onChange={e => handleXChange(i, j, e.target.value)} className="w-16 p-1 border rounded text-center text-white bg-slate-700/70" />
                      </td>
                    ))}
                    <td className="border px-2 py-2">
                      <input type="number" value={row.y} onChange={e => handleYChange(i, e.target.value)} className="w-16 p-1 border rounded text-center text-white bg-slate-700/70" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={calculateRegression} className="mt-4 w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl font-bold transition">Calculate Regression</button>
          </div>
        )}

        {matrixAnswer && (
          <div className="mt-6 bg-slate-700 p-4 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-2 text-blue-300">Regression Coefficients</h3>
            {matrixAnswer.map((val, i) => <p key={i} className="text-white font-bold">b{i}: {val}</p>)}
          </div>
        )}

        {matrixAnswer && (nX === 1 || nX === 2) && (
          <div className="mt-6">
            <Plot
              data={plotData()}
              layout={{
                width: 700,
                height: 500,
                title: "Regression Plot",
                scene: { xaxis: { title: "X1" }, yaxis: { title: nX === 2 ? "X2" : "Y" }, zaxis: { title: "Y" } }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MultipleLinearDynamic;
