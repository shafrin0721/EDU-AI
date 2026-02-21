import React from 'react'
import Chart from 'react-apexcharts'

const AnalyticsChart = ({
  title,
  type = 'line',
  data,
  height = 300,
  colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
}) => {
  const defaultOptions = {
    chart: {
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: false,
          reset: true
        }
      },
      fontFamily: 'Inter, system-ui, sans-serif',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    colors: colors,
    stroke: {
      curve: 'smooth',
      width: 3
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4
    },
    xaxis: {
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '14px',
      markers: {
        radius: 12
      }
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '14px'
      }
    }
  }

  const getChartOptions = () => {
    switch (type) {
      case 'bar':
        return {
          ...defaultOptions,
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '55%',
              borderRadius: 4,
              dataLabels: {
                position: 'top'
              }
            }
          }
        }
      case 'area':
        return {
          ...defaultOptions,
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.45,
              opacityTo: 0.05,
              stops: [0, 90, 100]
            }
          }
        }
      case 'radar':
        return {
          ...defaultOptions,
          stroke: {
            width: 2
          },
          fill: {
            opacity: 0.2
          },
          markers: {
            size: 4
          }
        }
      case 'donut':
        return {
          ...defaultOptions,
          labels: data?.labels || [],
          stroke: {
            width: 2
          },
          dataLabels: {
            enabled: true,
            formatter: (val) => `${val.toFixed(1)}%`
          }
        }
      case 'heatmap':
        return {
          ...defaultOptions,
          plotOptions: {
            heatmap: {
              radius: 4,
              colorScale: {
                ranges: [
                  { from: 0, to: 20, color: '#fee2e2', name: 'Low' },
                  { from: 21, to: 50, color: '#fef3c7', name: 'Medium' },
                  { from: 51, to: 75, color: '#d1fae5', name: 'High' },
                  { from: 76, to: 100, color: '#10b981', name: 'Excellent' }
                ]
              }
            }
          }
        }
      default:
        return defaultOptions
    }
  }

  const renderChartData = () => {
    if (!data) return { series: [], labels: [] }

    if (type === 'donut') {
      return {
        series: data.series || [],
        labels: data.labels || []
      }
    }

    if (type === 'radar') {
      return {
        series: data.series || []
      }
    }

    if (type === 'heatmap') {
      return {
        series: data.series || []
      }
    }

    return {
      series: data.series || []
    }
  }

  const chartData = renderChartData()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      )}
      <Chart
        options={{ ...getChartOptions(), labels: chartData.labels }}
        series={chartData.series}
        type={type}
        height={height}
      />
    </div>
  )
}

export default AnalyticsChart
