// Export functionality for Trader Visualization Dashboard

/**
 * Class to handle export capabilities for the dashboard
 */
class ExportManager {
  constructor(dataProcessor, chartVisualizer) {
    this.dataProcessor = dataProcessor;
    this.chartVisualizer = chartVisualizer;
  }

  /**
   * Initialize export UI elements
   */
  initializeExport() {
    const exportContainer = document.getElementById('export-container');
    if (!exportContainer) return;
    
    // Clear previous export options
    exportContainer.innerHTML = '';
    
    // Create export buttons
    this.createExportDataButton(exportContainer);
    this.createExportVisualizationsButton(exportContainer);
    this.createExportReportButton(exportContainer);
    
    // Add event listeners
    this.addExportEventListeners();
  }

  /**
   * Create export data button
   * @param {HTMLElement} container - Container element
   */
  createExportDataButton(container) {
    const exportDataButton = document.createElement('button');
    exportDataButton.id = 'export-data-btn';
    exportDataButton.className = 'btn btn-primary export-btn';
    exportDataButton.innerHTML = '<i class="fas fa-file-csv"></i> Export Data';
    
    container.appendChild(exportDataButton);
  }

  /**
   * Create export visualizations button
   * @param {HTMLElement} container - Container element
   */
  createExportVisualizationsButton(container) {
    const exportVisButton = document.createElement('button');
    exportVisButton.id = 'export-vis-btn';
    exportVisButton.className = 'btn btn-primary export-btn';
    exportVisButton.innerHTML = '<i class="fas fa-image"></i> Export Charts';
    
    container.appendChild(exportVisButton);
  }

  /**
   * Create export report button
   * @param {HTMLElement} container - Container element
   */
  createExportReportButton(container) {
    const exportReportButton = document.createElement('button');
    exportReportButton.id = 'export-report-btn';
    exportReportButton.className = 'btn btn-primary export-btn';
    exportReportButton.innerHTML = '<i class="fas fa-file-pdf"></i> Export Report';
    
    container.appendChild(exportReportButton);
  }

  /**
   * Add event listeners to export elements
   */
  addExportEventListeners() {
    // Export data button
    const exportDataBtn = document.getElementById('export-data-btn');
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', () => this.exportData());
    }
    
    // Export visualizations button
    const exportVisBtn = document.getElementById('export-vis-btn');
    if (exportVisBtn) {
      exportVisBtn.addEventListener('click', () => this.exportVisualizations());
    }
    
    // Export report button
    const exportReportBtn = document.getElementById('export-report-btn');
    if (exportReportBtn) {
      exportReportBtn.addEventListener('click', () => this.exportReport());
    }
  }

  /**
   * Export data to CSV
   */
  exportData() {
    // Get current data (filtered if filters are applied)
    const data = this.dataProcessor.processedData.tableData;
    
    // Convert to CSV
    const csv = this.dataProcessor.exportToCsv(data);
    
    // Create download link
    this.downloadFile(csv, 'trader_dashboard_data.csv', 'text/csv');
  }

  /**
   * Export visualizations as images
   */
  exportVisualizations() {
    // Create export modal
    this.showExportVisualizationsModal();
  }

  /**
   * Show export visualizations modal
   */
  showExportVisualizationsModal() {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    modalContainer.id = 'export-vis-modal';
    
    // Create modal content
    modalContainer.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Export Visualizations</h2>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="export-options">
            <div class="export-option">
              <input type="checkbox" id="export-conversion-charts" checked>
              <label for="export-conversion-charts">Conversion Analysis Charts</label>
            </div>
            <div class="export-option">
              <input type="checkbox" id="export-media-charts" checked>
              <label for="export-media-charts">Media Performance Charts</label>
            </div>
            <div class="export-option">
              <input type="checkbox" id="export-channel-charts" checked>
              <label for="export-channel-charts">Channel Analysis Charts</label>
            </div>
            <div class="export-option">
              <input type="checkbox" id="export-creative-charts" checked>
              <label for="export-creative-charts">Creative Performance Charts</label>
            </div>
            <div class="export-option">
              <input type="checkbox" id="export-geo-charts" checked>
              <label for="export-geo-charts">Geographic Insights Charts</label>
            </div>
            <div class="export-option">
              <input type="checkbox" id="export-frequency-charts" checked>
              <label for="export-frequency-charts">Frequency Analysis Charts</label>
            </div>
          </div>
          <div class="export-format">
            <h3>Export Format</h3>
            <div class="format-options">
              <div class="format-option">
                <input type="radio" id="format-png" name="format" value="png" checked>
                <label for="format-png">PNG</label>
              </div>
              <div class="format-option">
                <input type="radio" id="format-jpg" name="format" value="jpg">
                <label for="format-jpg">JPG</label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button id="export-selected-btn" class="btn btn-primary">Export Selected</button>
          <button id="cancel-export-btn" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    `;
    
    // Add modal to document
    document.body.appendChild(modalContainer);
    
    // Add event listeners
    const closeBtn = modalContainer.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.body.removeChild(modalContainer);
      });
    }
    
    const cancelBtn = modalContainer.querySelector('#cancel-export-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modalContainer);
      });
    }
    
    const exportSelectedBtn = modalContainer.querySelector('#export-selected-btn');
    if (exportSelectedBtn) {
      exportSelectedBtn.addEventListener('click', () => {
        this.exportSelectedVisualizations(modalContainer);
      });
    }
  }

  /**
   * Export selected visualizations
   * @param {HTMLElement} modalContainer - Modal container element
   */
  exportSelectedVisualizations(modalContainer) {
    // Get selected options
    const exportConversionCharts = document.getElementById('export-conversion-charts').checked;
    const exportMediaCharts = document.getElementById('export-media-charts').checked;
    const exportChannelCharts = document.getElementById('export-channel-charts').checked;
    const exportCreativeCharts = document.getElementById('export-creative-charts').checked;
    const exportGeoCharts = document.getElementById('export-geo-charts').checked;
    const exportFrequencyCharts = document.getElementById('export-frequency-charts').checked;
    
    // Get selected format
    const formatPng = document.getElementById('format-png').checked;
    const format = formatPng ? 'png' : 'jpg';
    
    // Create a zip file containing all selected chart images
    this.exportChartsAsZip({
      conversionCharts: exportConversionCharts,
      mediaCharts: exportMediaCharts,
      channelCharts: exportChannelCharts,
      creativeCharts: exportCreativeCharts,
      geoCharts: exportGeoCharts,
      frequencyCharts: exportFrequencyCharts
    }, format);
    
    // Close modal
    document.body.removeChild(modalContainer);
  }

  /**
   * Export charts as zip file
   * @param {Object} selectedCharts - Selected chart groups
   * @param {string} format - Image format (png or jpg)
   */
  exportChartsAsZip(selectedCharts, format) {
    // In a real implementation, this would:
    // 1. Convert each selected chart to an image using Chart.js toBase64Image()
    // 2. Create a zip file containing all images
    // 3. Trigger download of the zip file
    
    // For this example, we'll simulate the process with a message
    alert('In a real implementation, this would export selected charts as a zip file.');
    
    // Example of how to export a single chart as an image
    this.exportSingleChart('conversion-type-chart', 'conversion_type', format);
  }

  /**
   * Export a single chart as an image
   * @param {string} chartId - Chart canvas ID
   * @param {string} filename - Output filename (without extension)
   * @param {string} format - Image format (png or jpg)
   */
  exportSingleChart(chartId, filename, format) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    // Get chart instance from Chart.js registry
    const chartInstance = Chart.getChart(canvas);
    if (!chartInstance) return;
    
    // Convert chart to image
    const imageData = chartInstance.toBase64Image(`image/${format}`);
    
    // Create download link
    this.downloadFile(imageData, `${filename}.${format}`, `image/${format}`);
  }

  /**
   * Export dashboard as PDF report
   */
  exportReport() {
    // In a real implementation, this would:
    // 1. Generate a PDF containing all charts and summary data
    // 2. Trigger download of the PDF file
    
    // For this example, we'll simulate the process with a message
    alert('In a real implementation, this would generate a PDF report of the dashboard.');
    
    // Example of how this might work using a library like jsPDF
    this.generatePdfReport();
  }

  /**
   * Generate PDF report
   */
  generatePdfReport() {
    // This is a simplified example
    // In a real implementation, you would use a library like jsPDF
    
    // Example code (not functional without jsPDF):
    /*
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(22);
    doc.text('Trader Visualization Dashboard Report', 20, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    
    // Add summary metrics
    doc.setFontSize(16);
    doc.text('Summary Metrics', 20, 45);
    
    const summary = this.dataProcessor.processedData.summary;
    doc.setFontSize(12);
    doc.text(`Total Conversions: ${summary.totalConversions}`, 25, 55);
    doc.text(`Average Impressions: ${summary.avgImpressions.toFixed(2)}`, 25, 65);
    doc.text(`Total Value: $${summary.totalValue.toFixed(2)}`, 25, 75);
    
    // Add charts
    // For each chart, convert to image and add to PDF
    let yPosition = 90;
    
    // Example for one chart
    const conversionTypeCanvas = document.getElementById('conversion-type-chart');
    if (conversionTypeCanvas) {
      const chartInstance = Chart.getChart(conversionTypeCanvas);
      if (chartInstance) {
        const imgData = chartInstance.toBase64Image();
        doc.addImage(imgData, 'PNG', 20, yPosition, 170, 100);
        yPosition += 110;
      }
    }
    
    // Add more charts...
    
    // Save PDF
    doc.save('trader_dashboard_report.pdf');
    */
  }

  /**
   * Download file
   * @param {string} content - File content
   * @param {string} filename - Output filename
   * @param {string} contentType - MIME type
   */
  downloadFile(content, filename, contentType) {
    // Create download link
    const link = document.createElement('a');
    
    // Handle different content types
    if (contentType === 'text/csv') {
      // For CSV, create a Blob
      const blob = new Blob([content], { type: contentType });
      link.href = URL.createObjectURL(blob);
    } else if (contentType.startsWith('image/')) {
      // For images, use the data URL directly
      link.href = content;
    }
    
    // Set download attributes
    link.download = filename;
    link.style.display = 'none';
    
    // Add to document, trigger click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
