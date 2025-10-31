import React, { useState } from 'react';
import { format } from 'mathjs';

const NewtonInterpolation: React.FC = () => {
  const [nPoints, setNPoints] = useState('');
  const [xValues, setXValues] = useState<number[]>([]);
  const [yValues, setYValues] = useState<number[]>([]);
  const [interpolatePoint, setInterpolatePoint] = useState('');
  const [X, setX] = useState('');
  const [fx, setFx] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  // ฟังก์ชันคำนวณ divided differences (แก้ index เริ่มจาก 0)
  const C = (n: number, x: number[], y: number[], interpolateIndex: number[]): number => {
    if (n === 0) return 0;
    return ((y[interpolateIndex[n]] - y[interpolateIndex[n - 1]]) /
            (x[interpolateIndex[n]] - x[interpolateIndex[n - 1]])) - C(n - 1, x, y, interpolateIndex);
  };

  const findX = (n: number, Xval: number, x: number[], interpolateIndex: number[]): number => {
    if (n < 0) return 1;
    return (Xval - x[interpolateIndex[n]]) * findX(n - 1, Xval, x, interpolateIndex);
  };

  const calculateNewton = () => {
    const n = parseInt(interpolatePoint);
    if (!n || !X) return;

    const interpolateIndex = Array.from({ length: n }, (_, i) => i); // 0..n-1
    let fxVal = yValues[interpolateIndex[0]];

    if (n === 2) {
      fxVal += ((yValues[interpolateIndex[1]] - yValues[interpolateIndex[0]]) /
                (xValues[interpolateIndex[1]] - xValues[interpolateIndex[0]])) *
               (parseFloat(X) - xValues[interpolateIndex[0]]);
    } else {
      for (let i = 1; i < n; i++) {
        fxVal += (C(i, xValues, yValues, interpolateIndex) /
                  (xValues[interpolateIndex[i]] - xValues[interpolateIndex[0]])) *
                 findX(i - 1, parseFloat(X), xValues, interpolateIndex);
      }
    }

    setFx(format(fxVal, { notation: 'fixed', precision: 6 }));
  };

  const generateInputs = () => {
    const n = parseInt(nPoints);
    if (!n) return;
    setXValues(Array(n).fill(0));
    setYValues(Array(n).fill(0));
    setShowTable(true);
  };

  const handleChange = (index: number, type: string, value: string) => {
    const arr = type === 'x' ? [...xValues] : [...yValues];
    arr[index] = parseFloat(value);
    type === 'x' ? setXValues(arr) : setYValues(arr);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6 py-10 text-white">
      <div className="w-full max-w-4xl bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg shadow-blue-900/40 p-8">
        <h1 className="text-3xl font-bold text-center text-blue-400 mb-6">
          Newton's Divided Differences Interpolation
        </h1>

        {!showTable && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold text-blue-300">จำนวนจุด (n)</label>
              <input
                type="number"
                className="w-full p-3 bg-slate-700/70 rounded-xl text-white text-center focus:ring-2 focus:ring-blue-400/40 outline-none"
                value={nPoints}
                onChange={(e) => setNPoints(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-blue-300">จำนวนจุดที่ใช้ Interpolate</label>
              <input
                type="number"
                className="w-full p-3 bg-slate-700/70 rounded-xl text-white text-center focus:ring-2 focus:ring-blue-400/40 outline-none"
                value={interpolatePoint}
                onChange={(e) => setInterpolatePoint(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-blue-300">ค่า X ที่ต้องการหาผลลัพธ์</label>
              <input
                type="number"
                className="w-full p-3 bg-slate-700/70 rounded-xl text-white text-center focus:ring-2 focus:ring-blue-400/40 outline-none"
                value={X}
                onChange={(e) => setX(e.target.value)}
              />
            </div>

            <button
              onClick={generateInputs}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 transition rounded-xl font-semibold text-white"
            >
              สร้างตารางกรอกค่า
            </button>
          </div>
        )}

        {showTable && (
          <div className="mt-6 space-y-6">
            <h2 className="text-xl font-semibold text-blue-300 text-center mb-3">
              กรอกค่าจุด X และ Y
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {xValues.map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <input
                    type="number"
                    placeholder={`x${i + 1}`}
                    className="w-full p-3 bg-slate-700/70 rounded-xl text-center focus:ring-2 focus:ring-blue-400/40 outline-none"
                    onChange={(e) => handleChange(i, 'x', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder={`y${i + 1}`}
                    className="w-full p-3 bg-slate-700/70 rounded-xl text-center focus:ring-2 focus:ring-blue-400/40 outline-none"
                    onChange={(e) => handleChange(i, 'y', e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4 mt-4">
              <button
                onClick={calculateNewton}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold transition"
              >
                คำนวณค่า f(X)
              </button>

              {fx !== null && (
                <div className="mt-4 bg-slate-700/70 px-6 py-4 rounded-xl shadow-lg text-center">
                  <p className="text-lg font-semibold text-blue-300">ผลลัพธ์:</p>
                  <p className="text-3xl font-bold text-white">{fx}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewtonInterpolation;
