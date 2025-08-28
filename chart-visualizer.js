// Visualization components for Trader Visualization Dashboard

/**
 * Class to handle all chart visualizations for the dashboard
 */
class ChartVisualizer {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
    this.charts = {};
    this.colorPalette = [
      '#4e79a7', '#f28e2c', '#e15759', '#76b7b2',
      '#59a14f', '#edc949', '#af7aa1', '#ff9da7',
      '#9c755f', '#bab0ab'
    ];

    // Apply modern, minimalist defaults to all charts
    if (typeof Chart !== 'undefined') {
      Chart.defaults.font.family = 'Inter, Roboto, "Helvetica Neue", sans-serif';
      Chart.defaults.color = '#1f2937';
      Chart.defaults.borderColor = 'rgba(0,0,0,0.1)';
      Chart.defaults.elements.bar.borderRadius = 6;
      Chart.defaults.elements.bar.borderSkipped = false;
      Chart.defaults.elements.line.tension = 0.3;
      Chart.defaults.plugins.legend.labels.boxWidth = 12;
      Chart.defaults.plugins.legend.labels.usePointStyle = true;
      Chart.defaults.scales.linear = {
        grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
        ticks: { color: '#6b7280', font: { size: 12 } }
      };
      Chart.defaults.scales.category = {
        grid: { display: false, drawBorder: false },
        ticks: {
          color: '#6b7280',
          font: { size: 12 },
          callback: function(value) {
            return this.getLabelForValue(value);
          }
        }
      };
      Chart.defaults.scales.time = {
        grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
        ticks: { color: '#6b7280', font: { size: 12 } }
      };
    }
  }

  /**
   * Initialize all charts
   * @param {Object} data - Processed data from DataProcessor
   */
  initializeCharts(data) {
    this.createSummaryMetrics(data.summary);
    this.createConversionTypeChart(data.conversionAnalysis.conversionsByType);
    this.createConversionTimelineChart(data.conversionAnalysis.conversionTimeline);
    this.createDeviceTypeChart(data.conversionAnalysis.conversionsByDevice);
    this.createCampaignPerformanceChart(data.mediaPerformance.campaignPerformance);
    this.createAdGroupPerformanceChart(data.mediaPerformance.adGroupPerformance);
    this.createChannelAnalysisChart(data.channelAnalysis.devicePerformance, data.channelAnalysis.environmentPerformance);
    this.createCreativePerformanceChart(data.creativePerformance.creativePerformance);
    this.createFormatPerformanceChart(data.creativePerformance.formatPerformance);
    this.createGeoMap(data.geoInsights);
    this.createFrequencyAnalysisChart(data.frequencyAnalysis);
    this.createDataTable(data.tableData);
  }

  /**
   * Update all charts with new data
   * @param {Object} data - New processed data
   */
  updateCharts(data) {
    // Destroy existing charts to prevent memory leaks
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    
    // Reinitialize with new data
    this.initializeCharts(data);
  }

  /**
   * Create summary metrics display
   * @param {Object} summaryData - Summary metrics data
   */
  createSummaryMetrics(summaryData) {
    const summaryContainer = document.getElementById('summary-metrics');
    if (!summaryContainer) return;
    
    summaryContainer.innerHTML = '';
    
    // Create metric cards
    const totalConversionsCard = this.createMetricCard(
      'Total Conversions', 
      summaryData.totalConversions.toLocaleString(), 
      'conversion-icon'
    );
    
    const avgImpressionsCard = this.createMetricCard(
      'Avg. Impressions per Conversion', 
      summaryData.avgImpressions.toFixed(2), 
      'impression-icon'
    );
    
    const totalValueCard = this.createMetricCard(
      'Total Value', 
      summaryData.totalValue ? `$${summaryData.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '$0.00', 
      'value-icon'
    );
    
    const dateRangeCard = this.createMetricCard(
      'Date Range', 
      summaryData.dateRange.start && summaryData.dateRange.end ? 
        `${summaryData.dateRange.start.toLocaleDateString()} - ${summaryData.dateRange.end.toLocaleDateString()}` : 
        'N/A', 
      'date-icon'
    );
    
    // Append cards to container
    summaryContainer.appendChild(totalConversionsCard);
    summaryContainer.appendChild(avgImpressionsCard);
    summaryContainer.appendChild(totalValueCard);
    summaryContainer.appendChild(dateRangeCard);
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
   * Create conversion type chart
   * @param {Object} conversionsByType - Conversion by type data
   */
  createConversionTypeChart(conversionsByType) {
    const ctx = document.getElementById('conversion-type-chart');
    if (!ctx) return;
    
    const labels = Object.keys(conversionsByType);
    const data = Object.values(conversionsByType);
    
    this.charts.conversionType = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Conversions',
          data: data,
          backgroundColor: this.colorPalette,
          borderColor: this.colorPalette.map(color => this.adjustColor(color, -20)),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Conversions by Type',
            font: {
              size: 16
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Conversions: ${context.raw.toLocaleString()}`;
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
              text: 'Conversion Type'
            }
          }
        }
      }
    });
  }

  /**
   * Create conversion timeline chart
   * @param {Object} conversionTimeline - Conversion timeline data
   */
  createConversionTimelineChart(conversionTimeline) {
    const ctx = document.getElementById('conversion-timeline-chart');
    if (!ctx) return;
    
    const labels = Object.keys(conversionTimeline);
    const data = Object.values(conversionTimeline);
    
    this.charts.conversionTimeline = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Conversions',
          data: data,
          backgroundColor: 'rgba(78, 121, 167, 0.2)',
          borderColor: 'rgba(78, 121, 167, 1)',
          borderWidth: 2,
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Conversion Timeline',
            font: {
              size: 16
            }
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                return new Date(context[0].label).toLocaleDateString();
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
              text: 'Date'
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
   * Create device type chart
   * @param {Object} conversionsByDevice - Conversion by device data
   */
  createDeviceTypeChart(conversionsByDevice) {
    const ctx = document.getElementById('device-type-chart');
    if (!ctx) return;
    
    const labels = Object.keys(conversionsByDevice);
    const data = Object.values(conversionsByDevice);
    
    this.charts.deviceType = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: this.colorPalette.slice(0, labels.length),
          borderColor: this.colorPalette.slice(0, labels.length).map(color => this.adjustColor(color, -20)),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Conversions by Device Type',
            font: {
              size: 16
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: ${value.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Create campaign performance chart
   * @param {Object} campaignPerformance - Campaign performance data
   */
  createCampaignPerformanceChart(campaignPerformance) {
    const ctx = document.getElementById('campaign-performance-chart');
    if (!ctx) return;
    
    const campaigns = Object.keys(campaignPerformance);
    const conversions = campaigns.map(campaign => campaignPerformance[campaign].conversions);
    const conversionRates = campaigns.map(campaign => campaignPerformance[campaign].conversionRate);
    
    this.charts.campaignPerformance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: campaigns,
        datasets: [
          {
            label: 'Conversions',
            data: conversions,
            backgroundColor: 'rgba(78, 121, 167, 0.7)',
            borderColor: 'rgba(78, 121, 167, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Conversion Rate (%)',
            data: conversionRates,
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
            text: 'Campaign Performance',
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
              text: 'Number of Conversions'
            },
            position: 'left'
          },
          y1: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Conversion Rate (%)'
            },
            position: 'right',
            grid: {
              drawOnChartArea: false
            }
          },
          x: {
            title: {
              display: true,
              text: 'Campaign'
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
   * Create ad group performance chart
   * @param {Object} adGroupPerformance - Ad group performance data
   */
  createAdGroupPerformanceChart(adGroupPerformance) {
    const ctx = document.getElementById('adgroup-performance-chart');
    if (!ctx) return;
    
    // Sort ad groups by conversions
    const sortedAdGroups = Object.entries(adGroupPerformance)
      .sort((a, b) => b[1].conversions - a[1].conversions)
      .slice(0, 10); // Top 10 ad groups
    
    const adGroups = sortedAdGroups.map(([name]) => name);
    const conversions = sortedAdGroups.map(([, data]) => data.conversions);
    const impressions = sortedAdGroups.map(([, data]) => data.impressions);
    
    this.charts.adGroupPerformance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: adGroups,
        datasets: [
          {
            label: 'Conversions',
            data: conversions,
            backgroundColor: 'rgba(78, 121, 167, 0.7)',
            borderColor: 'rgba(78, 121, 167, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Impressions',
            data: impressions,
            backgroundColor: 'rgba(225, 87, 89, 0.7)',
            borderColor: 'rgba(225, 87, 89, 1)',
            borderWidth: 1,
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
            text: 'Top 10 Ad Group Performance',
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
              text: 'Number of Conversions'
            },
            position: 'left'
          },
          y1: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Impressions'
            },
            position: 'right',
            grid: {
              drawOnChartArea: false
            }
          },
          x: {
            title: {
              display: true,
              text: 'Ad Group'
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
   * Create channel analysis chart
   * @param {Object} devicePerformance - Device performance data
   * @param {Object} environmentPerformance - Ad environment performance data
   */
  createChannelAnalysisChart(devicePerformance, environmentPerformance) {
    // Device performance chart
    const deviceCtx = document.getElementById('device-performance-chart');
    if (deviceCtx) {
      const devices = Object.keys(devicePerformance);
      const deviceConversions = devices.map(device => devicePerformance[device].conversions);
      const deviceConversionRates = devices.map(device => devicePerformance[device].conversionRate);
      
      this.charts.devicePerformance = new Chart(deviceCtx, {
        type: 'bar',
        data: {
          labels: devices,
          datasets: [
            {
              label: 'Conversions',
              data: deviceConversions,
              backgroundColor: 'rgba(78, 121, 167, 0.7)',
              borderColor: 'rgba(78, 121, 167, 1)',
              borderWidth: 1,
              yAxisID: 'y'
            },
            {
              label: 'Conversion Rate (%)',
              data: deviceConversionRates,
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
              text: 'Performance by Device Type',
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
                text: 'Number of Conversions'
              },
              position: 'left'
            },
            y1: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Conversion Rate (%)'
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
    
    // Environment performance chart
    const envCtx = document.getElementById('environment-performance-chart');
    if (envCtx) {
      const environments = Object.keys(environmentPerformance);
      const envConversions = environments.map(env => environmentPerformance[env].conversions);
      const envConversionRates = environments.map(env => environmentPerformance[env].conversionRate);
      
      this.charts.environmentPerformance = new Chart(envCtx, {
        type: 'bar',
        data: {
          labels: environments,
          datasets: [
            {
              label: 'Conversions',
              data: envConversions,
              backgroundColor: 'rgba(89, 161, 79, 0.7)',
              borderColor: 'rgba(89, 161, 79, 1)',
              borderWidth: 1,
              yAxisID: 'y'
            },
            {
              label: 'Conversion Rate (%)',
              data: envConversionRates,
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
              text: 'Performance by Ad Environment',
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
                text: 'Number of Conversions'
              },
              position: 'left'
            },
            y1: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Conversion Rate (%)'
              },
              position: 'right',
              grid: {
                drawOnChartArea: false
              }
            },
            x: {
              title: {
                display: true,
                text: 'Ad Environment'
              }
            }
          }
        }
      });
    }
  }

  /**
   * Create creative performance chart
   * @param {Object} creativePerformance - Creative performance data
   */
  createCreativePerformanceChart(creativePerformance) {
    const ctx = document.getElementById('creative-performance-chart');
    if (!ctx) return;
    
    // Sort creatives by conversions
    const sortedCreatives = Object.entries(creativePerformance)
      .sort((a, b) => b[1].conversions - a[1].conversions)
      .slice(0, 10); // Top 10 creatives
    
    const creatives = sortedCreatives.map(([name]) => name);
    const conversions = sortedCreatives.map(([, data]) => data.conversions);
    const conversionRates = sortedCreatives.map(([, data]) => data.conversionRate);
    
    this.charts.creativePerformance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: creatives,
        datasets: [
          {
            label: 'Conversions',
            data: conversions,
            backgroundColor: 'rgba(78, 121, 167, 0.7)',
            borderColor: 'rgba(78, 121, 167, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Conversion Rate (%)',
            data: conversionRates,
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
            text: 'Top 10 Creative Performance',
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
              text: 'Number of Conversions'
            },
            position: 'left'
          },
          y1: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Conversion Rate (%)'
            },
            position: 'right',
            grid: {
              drawOnChartArea: false
            }
          },
          x: {
            title: {
              display: true,
              text: 'Creative'
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
   * Create format performance chart
   * @param {Object} formatPerformance - Format performance data
   */
  createFormatPerformanceChart(formatPerformance) {
    const ctx = document.getElementById('format-performance-chart');
    if (!ctx) return;
    
    const formats = Object.keys(formatPerformance);
    const conversions = formats.map(format => formatPerformance[format].conversions);
    const conversionRates = formats.map(format => formatPerformance[format].conversionRate);
    
    this.charts.formatPerformance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: formats,
        datasets: [
          {
            label: 'Conversions',
            data: conversions,
            backgroundColor: 'rgba(118, 183, 178, 0.7)',
            borderColor: 'rgba(118, 183, 178, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Conversion Rate (%)',
            data: conversionRates,
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
            text: 'Performance by Ad Format',
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
              text: 'Number of Conversions'
            },
            position: 'left'
          },
          y1: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Conversion Rate (%)'
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
            }
          }
        }
      }
    });
  }

  /**
   * Create geographic insights map
   * @param {Object} geoInsights - Geographic insights data
   */
  createGeoMap(geoInsights) {
    const mapContainer = document.getElementById('geo-map');
    if (!mapContainer) return;
    
    // Clear previous map
    mapContainer.innerHTML = '';
    
    // Create map if Leaflet is available
    if (typeof L !== 'undefined') {
      // Initialize map
      const map = L.map(mapContainer).setView([37.8, -96], 4);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Add country data
      const countryData = geoInsights.countryPerformance;
      
      // Create markers for countries with conversions
      Object.entries(countryData).forEach(([country, data]) => {
        // Use a simple mapping for demo purposes
        // In a real implementation, you would use a geocoding service or a country coordinates database
        let lat, lng;
        
        if (country === 'United States') {
          lat = 37.0902;
          lng = -95.7129;
        } else if (country === 'Canada') {
          lat = 56.1304;
          lng = -106.3468;
        } else if (country === 'United Kingdom') {
          lat = 55.3781;
          lng = -3.4360;
        } else {
          // Default coordinates if country not recognized
          return;
        }
        
        // Create marker with popup
        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`
          <strong>${country}</strong><br>
          Conversions: ${data.conversions}<br>
          Impressions: ${data.impressions}<br>
          ${data.monetaryValue ? `Value: $${data.monetaryValue.toFixed(2)}` : ''}
        `);
      });
      
      // Store map reference
      this.charts.geoMap = map;
    } else {
      // Fallback if Leaflet is not available
      mapContainer.innerHTML = '<div class="map-fallback">Map visualization requires Leaflet.js library</div>';
    }
    
    // Create region performance chart
    const regionCtx = document.getElementById('region-performance-chart');
    if (regionCtx) {
      // Sort regions by conversions
      const sortedRegions = Object.entries(geoInsights.regionPerformance)
        .sort((a, b) => b[1].conversions - a[1].conversions)
        .slice(0, 10); // Top 10 regions
      
      const regions = sortedRegions.map(([, data]) => data.region);
      const regionConversions = sortedRegions.map(([, data]) => data.conversions);
      
      this.charts.regionPerformance = new Chart(regionCtx, {
        type: 'bar',
        data: {
          labels: regions,
          datasets: [{
            label: 'Conversions',
            data: regionConversions,
            backgroundColor: 'rgba(89, 161, 79, 0.7)',
            borderColor: 'rgba(89, 161, 79, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Top 10 Regions by Conversions',
              font: {
                size: 16
              }
            },
            legend: {
              display: false
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
                text: 'Region'
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
  }

  /**
   * Create frequency analysis chart
   * @param {Object} frequencyAnalysis - Frequency analysis data
   */
  createFrequencyAnalysisChart(frequencyAnalysis) {
    // Impression distribution chart
    const distCtx = document.getElementById('impression-distribution-chart');
    if (distCtx) {
      const ranges = Object.keys(frequencyAnalysis.impressionDistribution);
      const counts = Object.values(frequencyAnalysis.impressionDistribution);
      
      this.charts.impressionDistribution = new Chart(distCtx, {
        type: 'bar',
        data: {
          labels: ranges,
          datasets: [{
            label: 'Conversions',
            data: counts,
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
              text: 'Impression Count Distribution',
              font: {
                size: 16
              }
            },
            legend: {
              display: false
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
                text: 'Impression Count Range'
              }
            }
          }
        }
      });
    }
    
    // Frequency vs conversion value chart
    const freqCtx = document.getElementById('frequency-conversion-chart');
    if (freqCtx) {
      const ranges = Object.keys(frequencyAnalysis.frequencyConversionRate);
      const conversions = ranges.map(range => frequencyAnalysis.frequencyConversionRate[range].conversions);
      const avgValues = ranges.map(range => frequencyAnalysis.frequencyConversionRate[range].avgValue);
      
      this.charts.frequencyConversion = new Chart(freqCtx, {
        type: 'bar',
        data: {
          labels: ranges,
          datasets: [
            {
              label: 'Conversions',
              data: conversions,
              backgroundColor: 'rgba(78, 121, 167, 0.7)',
              borderColor: 'rgba(78, 121, 167, 1)',
              borderWidth: 1,
              yAxisID: 'y'
            },
            {
              label: 'Avg. Value',
              data: avgValues,
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
              text: 'Frequency vs. Conversion Value',
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
                text: 'Number of Conversions'
              },
              position: 'left'
            },
            y1: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Average Value'
              },
              position: 'right',
              grid: {
                drawOnChartArea: false
              }
            },
            x: {
              title: {
                display: true,
                text: 'Impression Count Range'
              }
            }
          }
        }
      });
    }
  }

  /**
   * Create data table
   * @param {Array} tableData - Data for table view
   */
  createDataTable(tableData) {
    const tableContainer = document.getElementById('data-table-container');
    if (!tableContainer) return;
    
    // Clear previous table
    tableContainer.innerHTML = '';
    
    // Create table element
    const table = document.createElement('table');
    table.id = 'data-table';
    table.className = 'display responsive nowrap';
    tableContainer.appendChild(table);
    
    // Initialize DataTable if available
    if (typeof $.fn.DataTable !== 'undefined') {
      this.charts.dataTable = $('#data-table').DataTable({
        data: tableData,
        columns: [
          { title: 'Conversion ID', data: 'conversionId' },
          { title: 'Conversion Time', data: 'conversionTime' },
          { title: 'Conversion Type', data: 'conversionType' },
          { title: 'Device Type', data: 'deviceType' },
          { title: 'Campaign', data: 'campaign' },
          { title: 'Ad Group', data: 'adGroup' },
          { title: 'Creative', data: 'creative' },
          { title: 'Impressions', data: 'impressions' },
          { title: 'Clicks', data: 'clicks' },
          { title: 'Value', data: 'monetaryValue' },
          { title: 'Country', data: 'country' },
          { title: 'Region', data: 'region' },
          { title: 'Metro', data: 'metro' }
        ],
        responsive: true,
        dom: 'Bfrtip',
        buttons: [
          'copy', 'csv', 'excel', 'pdf', 'print'
        ],
        pageLength: 10,
        order: [[1, 'desc']] // Sort by conversion time by default
      });
    } else {
      // Fallback if DataTables is not available
      tableContainer.innerHTML = '<div class="table-fallback">Data table requires DataTables library</div>';
    }
  }

  /**
   * Adjust color brightness
   * @param {string} color - Hex color code
   * @param {number} amount - Amount to adjust (-255 to 255)
   * @returns {string} - Adjusted color
   */
  adjustColor(color, amount) {
    let useHash = false;
    if (color.startsWith('#')) {
      color = color.slice(1);
      useHash = true;
    }

    const num = parseInt(color, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00ff) + amount;
    let b = (num & 0x0000ff) + amount;

    r = Math.max(Math.min(255, r), 0);
    g = Math.max(Math.min(255, g), 0);
    b = Math.max(Math.min(255, b), 0);

    const newColor = (b | (g << 8) | (r << 16)).toString(16).padStart(6, '0');
    return (useHash ? '#' : '') + newColor;
  }
}
