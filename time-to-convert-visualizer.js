// Time to Convert Visualization components for Trader Dashboard

/**
 * Class to handle time-to-convert visualizations
 */
class TimeToConvertVisualizer {
  constructor(dataProcessor, chartVisualizer) {
    this.dataProcessor = dataProcessor;
    this.chartVisualizer = chartVisualizer;
    this.charts = {};
    this.colorPalette = [
      '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', 
      '#59a14f', '#edc949', '#af7aa1', '#ff9da7', 
      '#9c755f', '#bab0ab'
    ];
  }

  /**
   * Initialize time to convert visualizations
   * @param {Object} data - Processed data from EnhancedDataProcessor
   */
  initializeVisualizations(data) {
    if (!data || !data.timeToConvert) return;
    
    this.createTimeToConvertDistribution(data.timeToConvert.distribution, data.timeToConvert.stats);
    this.createTimeToConvertByDevice(data.timeToConvert.byDevice);
    this.createTimeToConvertByAdFormat(data.timeToConvert.byAdFormat);
    this.createTimeToConvertByChannel(data.timeToConvert.byChannel);
    this.createTimeVsConversionChart(data.timeToConvert.timeVsConversionPct);
  }

  /**
   * Update time to convert visualizations with new data
   * @param {Object} data - New processed data
   */
  updateVisualizations(data) {
    // Destroy existing charts to prevent memory leaks
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    
    // Reinitialize with new data
    this.initializeVisualizations(data);
  }

  /**
   * Create time to convert distribution chart
   * @param {Object} distribution - Time to convert distribution data
   * @param {Object} stats - Time to convert statistics
   */
  createTimeToConvertDistribution(distribution, stats) {
    const ctx = document.getElementById('time-distribution-chart');
    if (!ctx) return;
    
    const labels = Object.keys(distribution);
    const data = Object.values(distribution);
    
    this.charts.timeDistribution = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Conversions',
          data: data,
          backgroundColor: 'rgba(78, 121, 167, 0.7)',
          borderColor: 'rgba(78, 121, 167, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Time to Convert Distribution (Days)',
            font: {
              size: 16
            }
          },
          subtitle: {
            display: true,
            text: `Avg: ${stats.average} days | Min: ${stats.min} days | Max: ${stats.max} days | Total: ${stats.totalConversions} conversions`,
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const percent = (value / stats.totalConversions * 100).toFixed(1);
                return `Conversions: ${value} (${percent}%)`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Conversions'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Days to Convert'
            }
          }
        }
      }
    });
    
    // Create summary metrics for time to convert
    this.createTimeToConvertSummary(stats);
  }

  /**
   * Create time to convert summary metrics
   * @param {Object} stats - Time to convert statistics
   */
  createTimeToConvertSummary(stats) {
    const summaryContainer = document.getElementById('time-metrics-summary');
    if (!summaryContainer) return;
    
    summaryContainer.innerHTML = '';
    
    // Create metric cards
    const avgTimeCard = this.createMetricCard(
      'Average Time to Convert', 
      `${stats.average} days`, 
      'time-icon'
    );
    
    const minTimeCard = this.createMetricCard(
      'Minimum Time to Convert', 
      `${stats.min} days`, 
      'time-min-icon'
    );
    
    const maxTimeCard = this.createMetricCard(
      'Maximum Time to Convert', 
      `${stats.max} days`, 
      'time-max-icon'
    );
    
    const totalConversionsCard = this.createMetricCard(
      'Conversions with Time Data', 
      stats.totalConversions.toLocaleString(), 
      'conversion-icon'
    );
    
    // Append cards to container
    summaryContainer.appendChild(avgTimeCard);
    summaryContainer.appendChild(minTimeCard);
    summaryContainer.appendChild(maxTimeCard);
    summaryContainer.appendChild(totalConversionsCard);
  }

  /**
   * Create a metric card element
   * @param {string} title - Metric title
   * @param {string} value - Metric value
   * @param {string} iconClass - CSS class for icon
   * @returns {HTMLElement} - Metric card element
   */
  createMetricCard(title, value, iconClass) {
    const card = document.createElement('div');
    card.className = 'metric-card';
    
    card.innerHTML = `
      <div class="metric-icon ${iconClass}"></div>
      <div class="metric-content">
        <div class="metric-value">${value}</div>
        <div class="metric-title">${title}</div>
      </div>
    `;
    
    return card;
  }

  /**
   * Create time to convert by device chart
   * @param {Object} deviceData - Time to convert by device data
   */
  createTimeToConvertByDevice(deviceData) {
    const ctx = document.getElementById('time-by-device-chart');
    if (!ctx) return;
    
    const devices = Object.keys(deviceData);
    const avgTimes = devices.map(device => deviceData[device].avgTime.toFixed(2));
    const conversions = devices.map(device => deviceData[device].conversions);
    
    this.charts.timeByDevice = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: devices,
        datasets: [
          {
            label: 'Avg. Days to Convert',
            data: avgTimes,
            backgroundColor: 'rgba(78, 121, 167, 0.7)',
            borderColor: 'rgba(78, 121, 167, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Conversions',
            data: conversions,
            backgroundColor: 'rgba(242, 142, 44, 0.7)',
            borderColor: 'rgba(242, 142, 44, 1)',
            borderWidth: 1,
            type: 'line',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Time to Convert by Device Type',
            font: {
              size: 16
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Average Days to Convert'
            },
            position: 'left'
          },
          y1: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Conversions'
            },
            position: 'right',
            grid: {
              drawOnChartArea: false
            }
          },
          x: {
            title: {
              display: true,
              text: 'Device Type'
            }
          }
        }
      }
    });
  }

  /**
   * Create time to convert by ad format chart
   * @param {Object} formatData - Time to convert by ad format data
   */
  createTimeToConvertByAdFormat(formatData) {
    const ctx = document.getElementById('time-by-format-chart');
    if (!ctx) return;
    
    const formats = Object.keys(formatData);
    const avgTimes = formats.map(format => formatData[format].avgTime.toFixed(2));
    const conversions = formats.map(format => formatData[format].conversions);
    
    this.charts.timeByFormat = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: formats,
        datasets: [
          {
            label: 'Avg. Days to Convert',
            data: avgTimes,
            backgroundColor: 'rgba(89, 161, 79, 0.7)',
            borderColor: 'rgba(89, 161, 79, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Conversions',
            data: conversions,
            backgroundColor: 'rgba(237, 201, 73, 0.7)',
            borderColor: 'rgba(237, 201, 73, 1)',
            borderWidth: 1,
            type: 'line',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Time to Convert by Ad Format',
            font: {
              size: 16
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Average Days to Convert'
            },
            position: 'left'
          },
          y1: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Conversions'
            },
            position: 'right',
            grid: {
              drawOnChartArea: false
            }
          },
          x: {
            title: {
              display: true,
              text: 'Ad Format'
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    });
  }

  /**
   * Create time to convert by channel chart
   * @param {Object} channelData - Time to convert by channel data
   */
  createTimeToConvertByChannel(channelData) {
    const ctx = document.getElementById('time-by-channel-chart');
    if (!ctx) return;
    
    const channels = Object.keys(channelData);
    const avgTimes = channels.map(channel => channelData[channel].avgTime.toFixed(2));
    const conversions = channels.map(channel => channelData[channel].conversions);
    
    this.charts.timeByChannel = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: channels,
        datasets: [
          {
            label: 'Avg. Days to Convert',
            data: avgTimes,
            backgroundColor: 'rgba(118, 183, 178, 0.7)',
            borderColor: 'rgba(118, 183, 178, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Conversions',
            data: conversions,
            backgroundColor: 'rgba(175, 122, 161, 0.7)',
            borderColor: 'rgba(175, 122, 161, 1)',
            borderWidth: 1,
            type: 'line',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Time to Convert by Channel (Ad Environment)',
            font: {
              size: 16
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Average Days to Convert'
            },
            position: 'left'
          },
          y1: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Conversions'
            },
            position: 'right',
            grid: {
              drawOnChartArea: false
            }
          },
          x: {
            title: {
              display: true,
              text: 'Channel (Ad Environment)'
            }
          }
        }
      }
    });
  }

  /**
   * Create time vs conversion percentage chart
   * @param {Array} timeVsConversionData - Time vs conversion percentage data
   */
  createTimeVsConversionChart(timeVsConversionData) {
    const ctx = document.getElementById('time-vs-conversion-chart');
    if (!ctx) return;
    
    // Sort data by day
    const sortedData = [...timeVsConversionData].sort((a, b) => a.day - b.day);
    
    const days = sortedData.map(item => item.day);
    const percentages = sortedData.map(item => item.percentage);
    const conversions = sortedData.map(item => item.conversions);
    
    this.charts.timeVsConversion = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: '% of Conversions',
            data: sortedData.map(item => ({
              x: item.day,
              y: item.percentage
            })),
            backgroundColor: 'rgba(78, 121, 167, 0.7)',
            borderColor: 'rgba(78, 121, 167, 1)',
            borderWidth: 1,
            pointRadius: 5,
            pointHoverRadius: 7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '% of Conversions vs. Time to Convert',
            font: {
              size: 16
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const day = context.parsed.x;
                const percentage = context.parsed.y;
                const conversions = sortedData.find(item => item.day === day)?.conversions || 0;
                return [
                  `Day: ${day}`,
                  `Percentage: ${percentage}%`,
                  `Conversions: ${conversions}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '% of Conversions'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Days to Convert'
            },
            type: 'linear',
            position: 'bottom'
          }
        }
      }
    });
  }
}
