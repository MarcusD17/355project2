'use client'; // Ensure it's a client-side component

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from "@/app/firebase-context";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarController,
    BarElement,
    PieController,
    DoughnutController,
    LineController,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarController,
    BarElement,
    PieController,
    DoughnutController,
    LineController,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

// Interface for budget categories
interface BudgetCategory {
    name: string;
    amount: number;
    color: string;
}

const BudgetVisualizer = () => {
    const { user, loading } = useAuth(); // Get user and loading state from Firebase context
    const [income, setIncome] = useState<number>(0);
    const [expenditures, setExpenditures] = useState<number>(0);
    const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);

    const barChartRef = useRef<HTMLCanvasElement | null>(null);
    const pieChartRef = useRef<HTMLCanvasElement | null>(null);
    const doughnutChartRef = useRef<HTMLCanvasElement | null>(null);
    const lineChartRef = useRef<HTMLCanvasElement | null>(null);
    const horizontalBarChartRef = useRef<HTMLCanvasElement | null>(null);

    const chartInstances = useRef<{
        bar?: ChartJS,
        pie?: ChartJS,
        doughnut?: ChartJS,
        line?: ChartJS,
        horizontalBar?: ChartJS
    }>({});

    const generateRandomCategories = () => {
        const categories: BudgetCategory[] = [
            { name: 'Dorming', amount: 0, color: '#FF6384' },
            { name: 'Tuition', amount: 0, color: '#36A2EB' },
            { name: 'Food', amount: 0, color: '#FFCE56' },
            { name: 'Utilities', amount: 0, color: '#4BC0C0' },
            { name: 'Entertainment', amount: 0, color: '#9966FF' }
        ];

        const totalExpenditures = Math.floor(Math.random() * 4000000) + 1000000;
        setExpenditures(totalExpenditures);

        let remainingAmount = totalExpenditures;
        categories.forEach((category, index) => {
            if (index === categories.length - 1) {
                category.amount = remainingAmount;
            } else {
                const categoryAmount = Math.floor(Math.random() * (remainingAmount * 0.4));
                category.amount = categoryAmount;
                remainingAmount -= categoryAmount;
            }
        });

        setBudgetCategories(categories);
    };

    const generateRandomData = () => {
        const generatedIncome = Math.floor(Math.random() * 5000000) + 1000000;
        setIncome(generatedIncome);
        generateRandomCategories();
    };

    const renderCharts = () => {
        Object.values(chartInstances.current).forEach(chart => chart?.destroy());

        if (barChartRef.current) {
            chartInstances.current.bar = new ChartJS(barChartRef.current, {
                type: 'bar',
                data: {
                    labels: ['Income', 'Expenditures'],
                    datasets: [{
                        label: 'Amount ($)',
                        data: [income, expenditures],
                        backgroundColor: ['#4caf50', '#f44336'],
                        borderColor: ['#388e3c', '#d32f2f'],
                        borderWidth: 1,
                    }],
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: { display: true, text: 'Income vs Expenditures' },
                    },
                },
            });
        }

        if (pieChartRef.current) {
            chartInstances.current.pie = new ChartJS(pieChartRef.current, {
                type: 'pie',
                data: {
                    labels: budgetCategories.map(cat => cat.name),
                    datasets: [{
                        label: 'Expenditure Categories',
                        data: budgetCategories.map(cat => cat.amount),
                        backgroundColor: budgetCategories.map(cat => cat.color),
                    }],
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: { display: true, text: 'Expenditure by Category' },
                    },
                },
            });
        }

        if (doughnutChartRef.current) {
            chartInstances.current.doughnut = new ChartJS(doughnutChartRef.current, {
                type: 'doughnut',
                data: {
                    labels: budgetCategories.map(cat => cat.name),
                    datasets: [{
                        label: 'Expenditure Categories',
                        data: budgetCategories.map(cat => cat.amount),
                        backgroundColor: budgetCategories.map(cat => cat.color),
                    }],
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: { display: true, text: 'Budget Allocation' },
                    },
                },
            });
        }

        if (lineChartRef.current) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            const trendData = months.map(() => Math.floor(Math.random() * 1000) + income);

            chartInstances.current.line = new ChartJS(lineChartRef.current, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [
                        {
                            label: 'Monthly Income',
                            data: trendData,
                            borderColor: '#4caf50',
                            backgroundColor: 'rgba(76, 175, 80, 0.2)',
                            fill: true,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: { display: true, text: 'Income Trend' },
                    },
                },
            });
        }

        if (horizontalBarChartRef.current) {
            chartInstances.current.horizontalBar = new ChartJS(horizontalBarChartRef.current, {
                type: 'bar',
                data: {
                    labels: budgetCategories.map(cat => cat.name),
                    datasets: [{
                        label: 'Expenditure Amount',
                        data: budgetCategories.map(cat => cat.amount),
                        backgroundColor: budgetCategories.map(cat => cat.color),
                    }],
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    plugins: {
                        title: { display: true, text: 'Expenditure by Category' },
                    },
                },
            });
        }
    };

    useEffect(() => {
        if (!loading && !user) {
            // Redirect to login if not authenticated
            window.location.href = '/authentication/login';
        } else {
            renderCharts();
        }
    }, [income, expenditures, budgetCategories, user, loading]);

    useEffect(() => {
        generateRandomData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 mt-20 mb-20">
            <h2 className="text-3xl font-semibold text-center mb-8">University Budget Report</h2>

            <div className="grid md:grid-cols-2 gap-6 text-gray-600">
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h3 className="text-xl font-semibold mb-4">Budget Overview</h3>
                    <p>Income: ${income}</p>
                    <p>Total Expenditures: ${expenditures}</p>
                </div>

                <div className="bg-white shadow-md rounded-lg p-4 text-center">
                    <button
                        onClick={generateRandomData}
                        className="px-6 py-3 mt-5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                        Regenerate Budget Data
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white shadow-md rounded-lg p-4">
                    <canvas ref={barChartRef}></canvas>
                </div>
                <div className="bg-white shadow-md rounded-lg p-4">
                    <canvas ref={pieChartRef}></canvas>
                </div>
                <div className="bg-white shadow-md rounded-lg p-4">
                    <canvas ref={doughnutChartRef}></canvas>
                </div>
                <div className="bg-white shadow-md rounded-lg p-4">
                    <canvas ref={lineChartRef}></canvas>
                </div>
                <div className="col-span-full bg-white shadow-md rounded-lg p-4">
                    <canvas ref={horizontalBarChartRef}></canvas>
                </div>
            </div>
        </div>
    );
};

export default BudgetVisualizer;
