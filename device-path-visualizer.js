// Device Path Analysis Visualizer for Trader Dashboard

/**
 * Class to handle device path analysis visualizations
 */
class DevicePathVisualizer {
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
   * Initialize device path visualizations
   * @param {Object} data - Processed data from EnhancedDataProcessor
   */
  initializeVisualizations(data) {
    if (!data || !data.devicePathAnalysis) return;
    
    this.createDevicePathDistribution(data.devicePathAnalysis.paths);
    this.createDevicePathSankey(data.devicePathAnalysis.flows, data.devicePathAnalysis.nodes);
    this.createDevicePathTimeToConvert(data.devicePathAnalysis.timeToConvert);
  }

  /**
   * Update device path visualizations with new data
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
   * Create device path distribution chart
   * @param {Object} pathData - Device path distribution data
   */
  createDevicePathDistribution(pathData) {
    const ctx = document.getElementById('device-path-chart');
    if (!ctx) return;
    
    // Sort paths by conversion count (descending)
    const sortedPaths = Object.entries(pathData)
      .sort((a, b) => b[1] - a[1]);
    
    const paths = sortedPaths.map(([path]) => path);
    const counts = sortedPaths.map(([, count]) => count);
    
    this.charts.devicePathDistribution = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: paths,
        datasets: [{
          label: 'Conversions',
          data: counts,
          backgroundColor: this.colorPalette.slice(0, paths.length),
          borderColor: this.colorPalette.slice(0, paths.length).map(color => this.adjustColor(color, -20)),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Conversions by Device Path',
            font: {
              size: 16
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const total = counts.reduce((sum, count) => sum + count, 0);
                const percent = (value / total * 100).toFixed(1);
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
              type: 'category',
              title: {
                display: true,
                text: 'Device Path'
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
   * Create device path Sankey diagram
   * @param {Array} flows - Device flow data
   * @param {Array} nodes - Device node data
   */
  createDevicePathSankey(flows, nodes) {
    const container = document.getElementById('device-sankey-container');
    if (!container || !window.d3) {
      // If D3 is not available, show a message
      if (container) {
        container.innerHTML = '<div class="chart-placeholder">Sankey diagram requires D3.js library</div>';
      }
      return;
    }
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create SVG element
    const width = container.clientWidth;
    const height = 400;
    
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    // Create Sankey generator
    const sankey = d3.sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 1], [width - 1, height - 5]]);
    
    // Format data for D3 Sankey
    const nodeMap = {};
    nodes.forEach((node, i) => {
      nodeMap[node.name] = i;
    });
    
    // Remove circular links which D3 Sankey cannot process
    const adjacency = {};
    const filteredFlows = [];

    const createsCycle = (src, tgt, visited = new Set()) => {
      if (src === tgt) return true;
      if (!adjacency[src]) return false;
      if (visited.has(src)) return false;
      visited.add(src);
      return adjacency[src].some(next => createsCycle(next, tgt, visited));
    };

    flows.forEach(flow => {
      const { source, target, value } = flow;
      if (!createsCycle(target, source)) {
        filteredFlows.push({ source, target, value });
        (adjacency[source] = adjacency[source] || []).push(target);
      }
    });

    const sankeyData = {
      nodes: nodes,
      links: filteredFlows.map(flow => ({
        source: nodeMap[flow.source],
        target: nodeMap[flow.target],
        value: flow.value
      }))
    };

    // Generate Sankey layout
    let sankeyNodes, sankeyLinks;
    try {
      ({ nodes: sankeyNodes, links: sankeyLinks } = sankey(sankeyData));
    } catch (err) {
      console.error('Sankey generation error:', err);
      container.innerHTML = '<div class="chart-placeholder">Unable to render Sankey diagram</div>';
      return;
    }
    
    // Draw links
    svg.append('g')
      .selectAll('path')
      .data(sankeyLinks)
      .enter()
      .append('path')
      .attr('d', d3.sankeyLinkHorizontal())
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('stroke', (d, i) => this.colorPalette[i % this.colorPalette.length])
      .attr('stroke-opacity', 0.5)
      .attr('fill', 'none')
      .append('title')
      .text(d => `${d.source.name} → ${d.target.name}\n${d.value} conversions`);
    
    // Draw nodes
    const node = svg.append('g')
      .selectAll('rect')
      .data(sankeyNodes)
      .enter()
      .append('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', (d, i) => this.colorPalette[i % this.colorPalette.length])
      .attr('stroke', '#000')
      .append('title')
      .text(d => `${d.name}\n${d.value} conversions`);
    
    // Add node labels
    svg.append('g')
      .selectAll('text')
      .data(sankeyNodes)
      .enter()
      .append('text')
      .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
      .text(d => d.name)
      .attr('font-size', '10px')
      .attr('font-family', 'sans-serif');
    
    // Store reference to the SVG
    this.charts.deviceSankey = svg;
  }

  /**
   * Create device path time to convert chart
   * @param {Object} timeData - Device path time to convert data
   */
  createDevicePathTimeToConvert(timeData) {
    const ctx = document.getElementById('device-path-time-chart');
    if (!ctx) return;
    
    // Sort paths by average time to convert
    const sortedPaths = Object.entries(timeData)
      .sort((a, b) => b[1].avgTime - a[1].avgTime);
    
    const paths = sortedPaths.map(([path]) => path);
    const avgTimes = sortedPaths.map(([, data]) => data.avgTime.toFixed(2));
    const counts = sortedPaths.map(([, data]) => data.count);
    
    this.charts.devicePathTime = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: paths,
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
            data: counts,
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
            text: 'Time to Convert by Device Path',
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
              type: 'category',
              title: {
                display: true,
                text: 'Device Path'
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
   * Create device path heatmap
   * @param {Object} pathData - Device path data
   * @param {Object} timeData - Time to convert data
   */
  createDevicePathHeatmap(pathData, timeData) {
    const container = document.getElementById('device-heatmap-container');
    if (!container || !window.d3) {
      // If D3 is not available, show a message
      if (container) {
        container.innerHTML = '<div class="chart-placeholder">Heatmap requires D3.js library</div>';
      }
      return;
    }
    
    // This would be a more complex D3 visualization
    // For simplicity, we'll just show a placeholder message
    container.innerHTML = '<div class="chart-placeholder">Device Path Heatmap would be implemented here using D3.js</div>';
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
