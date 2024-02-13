import React, { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false, })

const FitbitDataAnalysis = () => {
    // Sample data
    const dates = ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'];
    const steps = [5000, 6000, 7000, 5500, 8000];
    const heartRates = [70, 72, 75, 78, 80];
    const sleepHours = [7, 6.5, 8, 7.5, 6];
    const distances = [3.5, 4.2, 5.1, 4.7, 6.0];
    const caloriesBurned = [300, 350, 400, 320, 380];
    const stress = [50,35,40,65,70];
    useEffect(() => {
        // Fetch Fitbit data and update state if necessary
    }, []);

    return (
        <div>
            <div>
            <Analytics />
                <h2>Daily Steps</h2>
                <Plot
                    data={[
                        {
                            x: dates,
                            y: steps,
                            type: 'bar',
                            name: 'Steps',
                            marker: { color: 'rgba(255, 153, 51, 0.6)' },
                        }
                    ]}
                    layout={{
                        title: 'Daily Steps',
                        xaxis: { title: 'Date' },
                        yaxis: { title: 'Steps' }
                    }}
                />
            </div>
            <div>
                <h2>Heart Rate Variation</h2>
                <Plot
                    data={[
                        {
                            x: dates,
                            y: heartRates,
                            type: 'scatter',
                            mode: 'lines+markers',
                            name: 'Heart Rate',
                            line: { color: '#17BECF' },
                            marker: { size: 10 }
                        }
                    ]}
                    layout={{
                        title: 'Heart Rate Variation',
                        xaxis: { title: 'Date' },
                        yaxis: { title: 'Heart Rate (bpm)' }
                    }}
                />
            </div>
            <div>
                <h2>Daily Sleep Hours</h2>
                <Plot
                    data={[
                        {
                            labels: dates,
                            values: sleepHours,
                            type: 'pie',
                            name: 'Sleep Hours',
                            marker: { colors: ['#7F7F7F', '#2CA02C', '#D62728', '#9467BD', '#FF7F0E'] }
                        }
                    ]}
                    layout={{
                        title: 'Daily Sleep Hours',
                    }}
                />
            </div>
            <div>
                <h2>Daily Distances</h2>
                <Plot
                    data={[
                        {
                            x: dates,
                            y: distances,
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Distance',
                            line: { color: '#FF5733' }
                        }
                    ]}
                    layout={{
                        title: 'Daily Distances',
                        xaxis: { title: 'Date' },
                        yaxis: { title: 'Distance (km)' }
                    }}
                />
            </div>
            <div>
                <h2>Stress Monitoring</h2>
                <Plot
                    data={[
                        {
                            labels: heartRates,
                            values: stress,
                            type: 'pie',
                            name: 'Stess Level',
                            marker: { colors: ['#2CA02C', '#D62728', '#7F7F7F' ,'#9467BD', '#FF7F0E'] }
                        }
                    ]}
                    layout={{
                        title: 'Daily Sleep Hours',
                    }}
                />
            </div>
            <div>
                <h2>Calories Burned</h2>
                <Plot
                    data={[
                        {
                            x: dates,
                            y: caloriesBurned,
                            type: 'bar',
                            name: 'Calories Burned',
                            marker: { color: 'rgba(255, 99, 132, 0.6)' },
                        }
                    ]}
                    layout={{
                        title: 'Calories Burned',
                        xaxis: { title: 'Date' },
                        yaxis: { title: 'Calories' }
                    }}
                />
            </div>
        </div>
    );
};

export default FitbitDataAnalysis;
