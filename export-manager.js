// Export functionality for Trader Visualization Dashboard

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

    exportContainer.innerHTML = '';

    this.createDownloadPdfButton(exportContainer);
    this.addExportEventListeners();
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
}
