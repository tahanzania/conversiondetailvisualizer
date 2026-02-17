// Export functionality for Trader Visualization Dashboard

class ExportManager {
  constructor(dataProcessor, chartVisualizer) {
    this.dataProcessor = dataProcessor;
    this.chartVisualizer = chartVisualizer;

    // Define TTD Brand Colors
    this.brandColors = {
      primary: '0096D6', // TTD Blue
      navy: '003B5C',    // TTD Navy
      aqua: '5CC8D9',    // TTD Aqua
      peach: 'F0503F',   // TTD Peach
      yellow: 'F6B73D',  // TTD Mustard
      green: '77C258',   // TTD Grass
      gray: 'A7A9AC',    // TTD Grey
      lightGray: 'F5F7FA'
    };
  }

  /**
   * Initialize export UI elements
   */
  initializeExport() {
    const exportContainer = document.getElementById('export-container');
    if (!exportContainer) return;

    // Define TTD Brand Colors
    this.brandColors = {
      primary: '0096D6', // TTD Blue
      navy: '003B5C',    // TTD Navy
      aqua: '5CC8D9',    // TTD Aqua
      peach: 'F0503F',   // TTD Peach
      yellow: 'F6B73D',  // TTD Mustard
      green: '77C258',   // TTD Grass
      gray: 'A7A9AC',    // TTD Grey
      lightGray: 'F5F7FA'
    };

    exportContainer.innerHTML = '';

    this.createDownloadPdfButton(exportContainer);
    this.createDownloadPptButton(exportContainer);
    this.addExportEventListeners();
  }

  /**
   * Create a single PPT download button
   * @param {HTMLElement} container
   */
  createDownloadPptButton(container) {
    const downloadButton = document.createElement('button');
    downloadButton.id = 'download-ppt-btn';
    downloadButton.className = 'btn btn-success export-btn';
    downloadButton.innerHTML = '<i class="fas fa-file-powerpoint"></i> Download Dashboard PPT';
    container.appendChild(downloadButton);
  }

  /**
   * Create a single PDF download button
   * @param {HTMLElement} container
   */
  createDownloadPdfButton(container) {
    const downloadButton = document.createElement('button');
    downloadButton.id = 'download-pdf-btn';
    downloadButton.className = 'btn btn-primary export-btn';
    downloadButton.innerHTML = '<i class="fas fa-file-pdf"></i> Download Dashboard PDF';

    container.appendChild(downloadButton);
  }

  /**
   * Register event listeners for the export UI
   */
  addExportEventListeners() {
    const pdfButton = document.getElementById('download-pdf-btn');
    if (pdfButton) {
      pdfButton.addEventListener('click', () => this.exportDashboardPdf());
    }

    const pptButton = document.getElementById('download-ppt-btn');
    if (pptButton) {
      pptButton.addEventListener('click', () => this.exportDashboardPpt());
    }
  }

  /**
   * Export the dashboard (without the filter sidebar) as a multi-page PDF
   */
  async exportDashboardPdf() {
    if (typeof html2canvas === 'undefined' || !window.jspdf) {
      alert('PDF export requires html2canvas and jsPDF to be loaded.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const sourceContainer = document.querySelector('.dashboard-container');
    if (!sourceContainer) {
      alert('Unable to locate dashboard content for export.');
      return;
    }

    const clone = sourceContainer.cloneNode(true);

    // Remove the filter panel to honor the "without filters" requirement
    const filterPanel = clone.querySelector('.filter-panel');
    if (filterPanel) {
      filterPanel.remove();
    }

    // Remove export controls from the snapshot to avoid duplicating the button
    const exportContainer = clone.querySelector('#export-container');
    if (exportContainer) {
      exportContainer.remove();
    }

    // Ensure all collapsible sections are expanded for the export
    clone.querySelectorAll('.collapse').forEach(section => {
      section.classList.add('show');
      section.style.height = 'auto';
    });

    // Reset sticky nav behavior for a cleaner export image
    const nav = clone.querySelector('.section-nav');
    if (nav) {
      nav.style.position = 'static';
      nav.style.top = 'auto';
      nav.style.boxShadow = 'none';
    }

    const tempWrapper = document.createElement('div');
    tempWrapper.style.position = 'fixed';
    tempWrapper.style.left = '-9999px';
    tempWrapper.style.top = '0';
    tempWrapper.style.width = `${sourceContainer.offsetWidth}px`;
    tempWrapper.appendChild(clone);
    document.body.appendChild(tempWrapper);

    try {
      // Allow layout to settle before rendering
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        windowWidth: sourceContainer.scrollWidth,
        windowHeight: sourceContainer.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, pdfHeight);

      let heightLeft = pdfHeight - pageHeight;
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('trader_dashboard.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    } finally {
      document.body.removeChild(tempWrapper);
    }
  }


  async exportDashboardPpt() {
    if (typeof PptxGenJS === 'undefined') {
      alert('PPT export requires PptxGenJS to be loaded.');
      return;
    }

    const pptButton = document.getElementById('download-ppt-btn');
    const originalText = pptButton.innerHTML;
    pptButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PPT...';
    pptButton.disabled = true;

    try {
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';
      pptx.author = 'The Trade Desk';
      pptx.company = 'The Trade Desk';
      pptx.subject = 'Trader Visualization Dashboard Export';
      pptx.title = 'Trader Visualization Dashboard Report';

      // Define Master Slide with TTD Branding
      pptx.defineSlideMaster({
        title: 'MASTER_SLIDE',
        background: { color: this.brandColors.lightGray },
        slideNumber: { x: 9.0, y: 5.3, w: 0.5, h: 0.3, fontSize: 10, color: this.brandColors.gray },
        objects: [
          // Footer Line
          { rect: { x: 0, y: 5.45, w: '100%', h: 0.05, fill: this.brandColors.primary } },
          { rect: { x: 0, y: 5.5, w: '100%', h: 0.125, fill: this.brandColors.navy } },
          // Footer Text
          { text: { text: 'The Trade Desk - Confidential', options: { x: 0.5, y: 5.3, w: 4, h: 0.3, fontSize: 10, color: this.brandColors.gray } } }
        ]
      });

      const data = this.dataProcessor.processedData;

      // 1. Title Slide
      this.addTitleSlide(pptx);

      // 2. Summary Slide
      if (data.summary) {
        this.addSummarySlide(pptx, data.summary);
      }

      // 3. Time To Convert Analysis
      const timeValues = data.timeToConvert;
      if (timeValues) {
        pptx.addSection({ title: 'Time to Convert' });

        // Distribution
        this.addBarChartSlide(
          pptx,
          'Time to Convert Distribution',
          timeValues.distribution,
          { title: 'Conversions by Days', color: this.brandColors.primary }
        );

        // By Device
        const deviceData = {};
        Object.entries(timeValues.byDevice).forEach(([k, v]) => deviceData[k] = v.avgTime);
        this.addBarChartSlide(
          pptx,
          'Avg Time to Convert by Device',
          deviceData,
          { title: 'Days', color: this.brandColors.aqua }
        );
      }

      // 4. Device Path Analysis
      const devicePathData = data.devicePathAnalysis;
      if (devicePathData) {
        pptx.addSection({ title: 'Device Path Analysis' });

        // Device Path Sankey (Screenshot)
        await this.addImageSlide(
          pptx,
          'Device Path Flow',
          'device-sankey-container',
          'Visualizes the flow of users across devices from first impression to conversion.'
        );

        // Conversions by Path
        this.addBarChartSlide(
          pptx,
          'Conversions by Device Path',
          devicePathData.paths,
          { title: 'Conversions', color: this.brandColors.navy, limit: 10 }
        );
      }

      // 3. Conversion Analysis
      const conversionSection = pptx.addSection({ title: 'Conversion Analysis' });

      if (data.conversionAnalysis) {
        // Conversions by Type
        this.addBarChartSlide(
          pptx,
          'Conversions by Type',
          data.conversionAnalysis.conversionsByType,
          { title: 'Conversions by Type', color: '4e79a7' }
        );

        // Conversions by Device
        this.addDoughnutChartSlide(
          pptx,
          'Conversions by Device',
          data.conversionAnalysis.conversionsByDevice,
          { title: 'Conversions by Device Type' }
        );

        // Conversion Timeline
        this.addLineChartSlide(
          pptx,
          'Conversion Timeline',
          data.conversionAnalysis.conversionTimeline,
          { title: 'Daily Conversions' }
        );
      }

      // 4. Media Performance
      const mediaSection = pptx.addSection({ title: 'Media Performance' });

      if (data.mediaPerformance) {
        // Campaign Performance
        this.addComboChartSlide(
          pptx,
          'Campaign Performance',
          data.mediaPerformance.campaignPerformance,
          'conversions',
          'conversionRate',
          { title: 'Conversions vs. Conversion Rate by Campaign', limit: 10 }
        );

        // Ad Group Performance
        this.addComboChartSlide(
          pptx,
          'Ad Group Performance',
          data.mediaPerformance.adGroupPerformance,
          'conversions',
          'impressions',
          { title: 'Conversions vs. Impressions by Ad Group', limit: 10, secondaryType: 'bar' }
        );
      }

      // 5. Creative Performance
      if (data.creativePerformance) {
        // Creative Performance
        this.addComboChartSlide(
          pptx,
          'Creative Performance',
          data.creativePerformance.creativePerformance,
          'conversions',
          'conversionRate',
          { title: 'Top Creatives Performance', limit: 10 }
        );

        // Format Performance
        this.addComboChartSlide(
          pptx,
          'Format Performance',
          data.creativePerformance.formatPerformance,
          'conversions',
          'conversionRate',
          { title: 'Conversions vs. Rate by Format' }
        );
      }

      // 6. Channel Analysis
      if (data.channelAnalysis) {
        // Device Performance
        this.addComboChartSlide(
          pptx,
          'Device Performance',
          data.channelAnalysis.devicePerformance,
          'conversions',
          'conversionRate',
          { title: 'Device Performance Metrics' }
        );

        // Environment Performance
        this.addComboChartSlide(
          pptx,
          'Environment Performance',
          data.channelAnalysis.environmentPerformance,
          'conversions',
          'conversionRate',
          { title: 'Environment Performance Metrics' }
        );
      }

      // 7. Geographic Insights (New Section)
      if (data.geoInsights) {
        // Map (Screenshot)
        await this.addImageSlide(
          pptx,
          'Geographic Distribution',
          'geo-map',
          'Map showing global distribution of conversions.'
        );
      }

      // 7. Site Performance (if available)
      if (data.sitePerformance && data.sitePerformance.lastImpressionSites) {
        this.addComboChartSlide(
          pptx,
          'Site Performance',
          data.sitePerformance.lastImpressionSites,
          'conversions',
          'conversionRate',
          { title: 'Top Sites Performance', limit: 15 }
        );
      }

      // 8. Data Table
      if (data.tableData && data.tableData.length > 0) {
        this.addTableSlide(pptx, data.tableData);
      }

      // Save file
      const fileName = `Trader_Dashboard_Report_${new Date().toISOString().split('T')[0]}.pptx`;
      await pptx.writeFile({ fileName: fileName });

    } catch (error) {
      console.error('Error creating native PPT:', error);
      alert('Failed to generate PowerPoint presentation. See console for details.');
    } finally {
      pptButton.innerHTML = originalText;
      pptButton.disabled = false;
    }
  }

  /**
   * Helper to add a slide with an image captured from a DOM element
   */
  async addImageSlide(pptx, slideTitle, elementId, description = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
      slide.addText(slideTitle, { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: this.brandColors.navy });

      if (description) {
        slide.addText(description, { x: 0.5, y: 0.9, w: '90%', fontSize: 12, color: this.brandColors.gray });
      }

      // Temporarily ensure element is visible/sized correctly if needed
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');

      // Calculate aspect ratio to fit within 9x4 area
      // pptx.getImageProperties doesn't exist in all versions, use canvas dimensions directly
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const targetW = 9;
      const targetH = 4;

      let w = targetW;
      let h = (imgHeight / imgWidth) * targetW;

      if (h > targetH) {
        h = targetH;
        w = (imgWidth / imgHeight) * targetH;
      }

      slide.addImage({
        data: imgData,
        x: (10 - w) / 2, // center horizontally
        y: 1.3,
        w: w,
        h: h
      });

    } catch (e) {
      console.error(`Failed to capture image for ${slideTitle}:`, e);
    }
  }

  /**
   * Add Title Slide
   */
  addTitleSlide(pptx) {
    const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });

    // TTD Logo (Text representation for robust export)
    slide.addText('The Trade Desk', {
      x: 0.5, y: 0.5, w: '30%', fontSize: 24, bold: true, color: this.brandColors.primary, fontFace: 'Arial'
    });

    slide.addText('Trader Visualization Dashboard Report', {
      x: 0.5, y: 2.2, w: '90%', fontSize: 40, align: 'center', bold: true, color: this.brandColors.navy
    });

    slide.addText(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, {
      x: 0.5, y: 3.5, w: '90%', fontSize: 18, align: 'center', color: this.brandColors.gray
    });
  }

  /**
   * Add Summary Slide
   */
  addSummarySlide(pptx, summary) {
    const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide.addText('Global Overview', { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: this.brandColors.navy });

    const metrics = [
      { label: 'Total Conversions', value: summary.totalConversions.toLocaleString(), color: this.brandColors.primary },
      { label: 'Avg Impressions/Conv', value: summary.avgImpressions.toFixed(2), color: this.brandColors.peach },
      { label: 'Total Value', value: summary.totalValue ? `$${summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '$0', color: this.brandColors.green },
      { label: 'Data Rows', value: this.dataProcessor.rawData ? this.dataProcessor.rawData.length.toLocaleString() : '0', color: this.brandColors.aqua }
    ];

    let xPos = 0.5;
    const yPos = 2.0;
    const cardWidth = 2.2;
    const gap = 0.25;

    metrics.forEach((metric) => {
      // Card box
      slide.addShape(pptx.ShapeType.rect, {
        x: xPos, y: yPos, w: cardWidth, h: 1.5,
        fill: 'ffffff',
        line: { color: 'e0e0e0', width: 1 },
        shadow: { type: 'outer', color: '000000', opacity: 0.1, blur: 5 }
      });

      // Accent bar
      slide.addShape(pptx.ShapeType.rect, {
        x: xPos, y: yPos, w: 0.1, h: 1.5,
        fill: metric.color
      });

      // Label
      slide.addText(metric.label, {
        x: xPos + 0.3, y: yPos + 0.3, w: cardWidth - 0.5, h: 0.3,
        fontSize: 12, color: this.brandColors.gray
      });

      // Value
      slide.addText(metric.value, {
        x: xPos + 0.3, y: yPos + 0.6, w: cardWidth - 0.5, h: 0.6,
        fontSize: 24, bold: true, color: this.brandColors.navy
      });

      xPos += cardWidth + gap;
    });

    // Add date range text
    if (summary.dateRange && summary.dateRange.start && summary.dateRange.end) {
      slide.addText(`Date Range: ${summary.dateRange.start.toLocaleDateString()} - ${summary.dateRange.end.toLocaleDateString()}`, {
        x: 0.5, y: 4.0, w: '90%', fontSize: 14, color: this.brandColors.gray, italic: true
      });
    }
  }

  /**
   * Helper to format object data for simple charts
   */
  formatSimpleChartData(dataMap, limit = 0) {
    let entries = Object.entries(dataMap || {});

    // Sort slightly to make charts look better (descending by value)
    entries.sort((a, b) => b[1] - a[1]);

    if (limit > 0) {
      entries = entries.slice(0, limit);
    }

    return {
      labels: entries.map(e => e[0]),
      values: entries.map(e => e[1])
    };
  }

  /**
   * Add Bar Chart Slide
   */
  addBarChartSlide(pptx, slideTitle, dataMap, options = {}) {
    const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide.addText(slideTitle, { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: this.brandColors.navy });

    const formatted = this.formatSimpleChartData(dataMap, options.limit || 15);

    // Ensure all labels are strings to avoid pptxgen errors
    const stringLabels = formatted.labels.map(l => String(l));

    if (formatted.labels.length === 0) {
      slide.addText('No data available', { x: 0.5, y: 2, fontSize: 14, color: '999999' });
      return;
    }

    const pptChartData = [{
      name: options.title || 'Data',
      labels: stringLabels,
      values: formatted.values
    }];

    slide.addChart(pptx.ChartType.bar, pptChartData, {
      x: 0.5, y: 1.2, w: 9, h: 4,
      barDir: 'col',
      barGapWidthPct: 30,
      chartColors: [options.color || this.brandColors.primary],
      valAxisLabelFormatCode: '#,##0',
      showValue: true
    });
  }

  /**
   * Add Doughnut Chart Slide
   */
  addDoughnutChartSlide(pptx, slideTitle, dataMap, options = {}) {
    const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide.addText(slideTitle, { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: this.brandColors.navy });

    const formatted = this.formatSimpleChartData(dataMap, 10); // Limit pie slices

    if (formatted.labels.length === 0) {
      slide.addText('No data available', { x: 0.5, y: 2, fontSize: 14, color: '999999' });
      return;
    }

    const pptChartData = [{
      name: options.title || 'Data',
      labels: formatted.labels,
      values: formatted.values
    }];

    slide.addChart(pptx.ChartType.doughnut, pptChartData, {
      x: 2.5, y: 1.2, w: 5, h: 4,
      chartColors: [this.brandColors.primary, this.brandColors.peach, this.brandColors.aqua, this.brandColors.green, this.brandColors.yellow, this.brandColors.navy],
      dataLabelFormatCode: '0%',
      showLabel: true,
      showPercent: true,
      showLegend: true,
      legendPos: 'r'
    });
  }

  /**
   * Add Line Chart Slide
   */
  addLineChartSlide(pptx, slideTitle, dataMap, options = {}) {
    const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide.addText(slideTitle, { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: this.brandColors.navy });

    // Ensure chronological order
    const entries = Object.entries(dataMap || {}).sort((a, b) => new Date(a[0]) - new Date(b[0]));

    if (entries.length === 0) {
      slide.addText('No data available', { x: 0.5, y: 2, fontSize: 14, color: '999999' });
      return;
    }

    // Downsample if too many data points (PPT struggles with hundreds of points sometimes)
    // Simple approach: show all for now, assuming typical campaign length
    const labels = entries.map(e => String(e[0])); // Dates
    const values = entries.map(e => e[1]);

    const pptChartData = [{
      name: options.title || 'Data',
      labels: labels,
      values: values
    }];

    slide.addChart(pptx.ChartType.line, pptChartData, {
      x: 0.5, y: 1.2, w: 9, h: 4,
      chartColors: [this.brandColors.primary],
      lineSmooth: true,
      lineSize: 2,
      showLegend: false,
      valAxisLabelFormatCode: '#,##0'
    });
  }

  /**
   * Add Combo Chart Slide (Bar + Line/Bar)
   */
  addComboChartSlide(pptx, slideTitle, dataObj, primaryKey, secondaryKey, options = {}) {
    const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide.addText(slideTitle, { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: this.brandColors.navy });

    let entries = Object.entries(dataObj || {});

    // Sort by primary key desc
    entries.sort((a, b) => (b[1][primaryKey] || 0) - (a[1][primaryKey] || 0));

    if (options.limit && options.limit > 0) {
      entries = entries.slice(0, options.limit);
    }

    if (entries.length === 0) {
      slide.addText('No data available', { x: 0.5, y: 2, fontSize: 14, color: '999999' });
      return;
    }

    const labels = entries.map(e => String(e[0]));
    const primaryValues = entries.map(e => e[1][primaryKey] || 0);
    const secondaryValues = entries.map(e => e[1][secondaryKey] || 0);

    const pptChartData = [
      {
        name: primaryKey === 'conversions' ? 'Conversions' : 'Primary',
        labels: labels,
        values: primaryValues,
        chartType: pptx.ChartType.bar
      },
      {
        name: secondaryKey === 'conversionRate' ? 'Conv. Rate %' : (secondaryKey === 'impressions' ? 'Impressions' : 'Secondary'),
        labels: labels,
        values: secondaryValues,
        chartType: options.secondaryType === 'bar' ? pptx.ChartType.bar : pptx.ChartType.line
      }
    ];

    // Configure secondary axis if needed
    const chartOpts = {
      x: 0.5, y: 1.2, w: 9, h: 4,
      barDir: 'col',
      chartColors: [this.brandColors.primary, this.brandColors.peach], // Blue bars, Orange line
      showLegend: true,
      legendPos: 'b'
    };

    // If using Line for secondary, assume different scale usually
    if (options.secondaryType !== 'bar') {
      // PptxGenJS handles secondary axes automatically if values diverge significantly, 
      // but explicitly:
      // Note: PptxGenJS combo charts setup is a bit specific, usually passing an array of types works.
      // We'll trust the simple setup for now.
    }

    slide.addChart(pptx.ChartType.bar, pptChartData, chartOpts);
  }

  /**
   * Add Data Table Slide
   */
  addTableSlide(pptx, tableData) {
    const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide.addText('Top Conversion Data', { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: this.brandColors.navy });

    if (!tableData || tableData.length === 0) return;

    // slice first 15 rows
    const rows = tableData.slice(0, 15);

    // Define columns
    // conversionTime, conversionType, campaign, adGroup, creative, timeToConvert
    const headers = [
      'Time', 'Type', 'Campaign', 'Ad Group', 'Device', 'Time to Convert'
    ];

    const pptRows = [];

    // Add Header Row
    pptRows.push(headers.map(h => ({ text: String(h), options: { bold: true, fill: this.brandColors.lightGray, color: this.brandColors.navy } })));

    // Add Data Rows
    rows.forEach(row => {
      pptRows.push([
        { text: String(row.conversionTime ? new Date(row.conversionTime).toLocaleDateString() : '-') },
        { text: String(row.conversionType || '-') },
        { text: String(row.campaign || '-') },
        { text: String(row.adGroup || '-') },
        { text: String(row.deviceType || '-') },
        { text: String(row.timeToConvert !== undefined ? row.timeToConvert + ' days' : '-') }
      ]);
    });

    slide.addTable(pptRows, {
      x: 0.5, y: 1.2, w: 9,
      fontSize: 10,
      border: { type: 'solid', color: 'eaeaea', pt: 1 },
      fill: 'ffffff'
    });
  }
}
