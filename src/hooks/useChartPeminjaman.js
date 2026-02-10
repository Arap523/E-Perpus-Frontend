import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

export const useChartPeminjaman = () => {
  const currentYear = new Date().getFullYear()
  const startYear = 2024
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [chartData, setChartData] = useState({ labels: [], datasets: [] })
  const [loading, setLoading] = useState(true)
  const [totalPeminjaman, setTotalPeminjaman] = useState(0)
  const chartRef = useRef(null)

  // Generate Year Options
  const yearOptions = []
  for (let i = startYear; i <= currentYear; i++) {
    yearOptions.push(i)
  }

  // Helper Gradient
  const createGradient = (ctx, area) => {
    const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top)
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)')
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0.9)')
    return gradient
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(
          `https://apiprawira.my.id/api/peminjaman/chart-stats?year=${selectedYear}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        // Safety Check & Defaults
        if (!response.data || !response.data.data) {
          setChartData({ labels: [], datasets: [] })
          setLoading(false)
          return
        }

        const rawData = response.data.data
        const defaultLabels = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ]

        const labels =
          rawData.labels && Array.isArray(rawData.labels)
            ? rawData.labels
            : defaultLabels
        const values =
          rawData.values && Array.isArray(rawData.values)
            ? rawData.values
            : new Array(12).fill(0)

        const total = values.reduce((acc, curr) => acc + curr, 0)
        setTotalPeminjaman(total)

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Peminjaman',
              data: values,
              backgroundColor: (context) => {
                const chart = context.chart
                const { ctx, chartArea } = chart
                if (!chartArea) return null
                return createGradient(ctx, chartArea)
              },
              borderColor: 'rgb(37, 99, 235)',
              borderWidth: 0,
              borderRadius: 4,
              barThickness: 'flex',
              maxBarThickness: 32,
              hoverBackgroundColor: 'rgb(29, 78, 216)',
            },
          ],
        })
        setLoading(false)
      } catch (error) {
        console.error('ERROR FETCHING CHART:', error)
        setLoading(false)
        setTotalPeminjaman(0)
        setChartData({ labels: [], datasets: [] })
      }
    }

    fetchData()
  }, [selectedYear])

  // Chart Options Config (Dipindah kesini biar rapi)
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 0, right: 0, top: 10, bottom: 0 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 14, weight: 'bold' },
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: '#f1f5f9', borderDash: [5, 5] },
        ticks: { stepSize: 10, color: '#64748b', font: { size: 10 } },
      },
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: {
          color: '#64748b',
          font: { size: 10 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
    },
  }

  return {
    chartData,
    loading,
    totalPeminjaman,
    selectedYear,
    setSelectedYear,
    yearOptions,
    options,
    chartRef,
  }
}
