
// import Plot from 'react-plotly.js';

// const PlotComponent = ({ result }) => {
//     // Extract data for plotting
//     const dates = result.map(entry => entry.Date);
//     const stepCounts = result.map(entry => entry['Step count']);
//     const caloriesBurned = result.map(entry => entry['Calories (kcal)']);

//     return (
//         <div>
//             {/* Plot for Step Count */}
//             <Plot
//                 data={[
//                     {
//                         x: dates,
//                         y: stepCounts,
//                         type: 'bar',
//                         marker: { color: 'green' },
//                         name: 'Step Count',
//                     }
//                 ]}
//                 layout={{ width: 800, height: 400, title: 'Step Count Over Time' }}
//             />

//             {/* Plot for Calories Burned */}
//             <Plot
//                 data={[
//                     {
//                         x: dates,
//                         y: caloriesBurned,
//                         type: 'scatter',
//                         mode: 'lines+markers',
//                         marker: { color: 'blue' },
//                         name: 'Calories Burned (kcal)',
//                     }
//                 ]}
//                 layout={{ width: 800, height: 400, title: 'Calories Burned Over Time' }}
//             />
//         </div>
//     );
// };

// export default PlotComponent;

