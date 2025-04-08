// Filter and sorting functionality for Trader Visualization Dashboard

/**
 * Class to handle filtering and sorting capabilities for the dashboard
 */
class FilterManager {
  constructor(dataProcessor, chartVisualizer) {
    this.dataProcessor = dataProcessor;
    this.chartVisualizer = chartVisualizer;
    this.activeFilters = {};
    this.filterElements = {};
  }

  /**
   * Initialize filter UI elements
   */
  initializeFilters() {
    const filterContainer = document.getElementById('filter-panel');
    if (!filterContainer) return;
    
    // Clear previous filters
    filterContainer.innerHTML = '';
    
    // Get available filter options
    const filters = this.dataProcessor.getFilters();
    
    // Create date range filter
    this.createDateRangeFilter(filterContainer);
    
    // Create dropdown filters
    this.createDropdownFilter(filterContainer, 'conversionType', 'Conversion Type', filters.conversionTypes);
    this.createDropdownFilter(filterContainer, 'campaign', 'Campaign', filters.campaigns);
    this.createDropdownFilter(filterContainer, 'adGroup', 'Ad Group', filters.adGroups);
    this.createDropdownFilter(filterContainer, 'creative', 'Creative', filters.creatives);
    this.createDropdownFilter(filterContainer, 'deviceType', 'Device Type', filters.deviceTypes);
    this.createDropdownFilter(filterContainer, 'country', 'Country', filters.countries);
    this.createDropdownFilter(filterContainer, 'region', 'Region', filters.regions);
    this.createDropdownFilter(filterContainer, 'metro', 'Metro', filters.metros);
    this.createDropdownFilter(filterContainer, 'adEnvironment', 'Ad Environment', filters.adEnvironments);
    
    // Create reset button
    this.createResetButton(filterContainer);
    
    // Add event listeners
    this.addFilterEventListeners();
  }

  /**
   * Create date range filter
   * @param {HTMLElement} container - Container element
   */
  createDateRangeFilter(container) {
    const dateRangeGroup = document.createElement('div');
    dateRangeGroup.className = 'filter-group';
    
    const dateRangeLabel = document.createElement('label');
    dateRangeLabel.textContent = 'Date Range';
    dateRangeGroup.appendChild(dateRangeLabel);
    
    const startDateInput = document.createElement('input');
    startDateInput.type = 'date';
    startDateInput.id = 'filter-date-start';
    startDateInput.className = 'filter-input';
    dateRangeGroup.appendChild(startDateInput);
    
    const endDateInput = document.createElement('input');
    endDateInput.type = 'date';
    endDateInput.id = 'filter-date-end';
    endDateInput.className = 'filter-input';
    dateRangeGroup.appendChild(endDateInput);
    
    container.appendChild(dateRangeGroup);
    
    // Store references
    this.filterElements.dateStart = startDateInput;
    this.filterElements.dateEnd = endDateInput;
    
    // Set initial date range based on data
    const summary = this.dataProcessor.processedData.summary;
    if (summary && summary.dateRange) {
      if (summary.dateRange.start) {
        const startDate = summary.dateRange.start.toISOString().split('T')[0];
        startDateInput.value = startDate;
      }
      
      if (summary.dateRange.end) {
        const endDate = summary.dateRange.end.toISOString().split('T')[0];
        endDateInput.value = endDate;
      }
    }
  }

  /**
   * Create dropdown filter
   * @param {HTMLElement} container - Container element
   * @param {string} id - Filter ID
   * @param {string} label - Filter label
   * @param {Array} options - Filter options
   */
  createDropdownFilter(container, id, label, options) {
    if (!options || options.length === 0) return;
    
    const filterGroup = document.createElement('div');
    filterGroup.className = 'filter-group';
    
    const filterLabel = document.createElement('label');
    filterLabel.textContent = label;
    filterLabel.htmlFor = `filter-${id}`;
    filterGroup.appendChild(filterLabel);
    
    const select = document.createElement('select');
    select.id = `filter-${id}`;
    select.className = 'filter-select';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = `All ${label}s`;
    select.appendChild(defaultOption);
    
    // Add options
    options.forEach(option => {
      if (option) {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
      }
    });
    
    filterGroup.appendChild(select);
    container.appendChild(filterGroup);
    
    // Store reference
    this.filterElements[id] = select;
  }

  /**
   * Create reset button
   * @param {HTMLElement} container - Container element
   */
  createResetButton(container) {
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'filter-group button-group';
    
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-filters';
    resetButton.className = 'btn btn-secondary';
    resetButton.textContent = 'Reset Filters';
    
    buttonGroup.appendChild(resetButton);
    container.appendChild(buttonGroup);
    
    // Store reference
    this.filterElements.resetButton = resetButton;
  }

  /**
   * Add event listeners to filter elements
   */
  addFilterEventListeners() {
    // Date range filter
    if (this.filterElements.dateStart) {
      this.filterElements.dateStart.addEventListener('change', () => this.applyFilters());
    }
    
    if (this.filterElements.dateEnd) {
      this.filterElements.dateEnd.addEventListener('change', () => this.applyFilters());
    }
    
    // Dropdown filters
    const dropdownIds = [
      'conversionType', 'campaign', 'adGroup', 'creative', 
      'deviceType', 'country', 'region', 'metro', 'adEnvironment'
    ];
    
    dropdownIds.forEach(id => {
      const element = this.filterElements[id];
      if (element) {
        element.addEventListener('change', () => this.applyFilters());
      }
    });
    
    // Reset button
    if (this.filterElements.resetButton) {
      this.filterElements.resetButton.addEventListener('click', () => this.resetFilters());
    }
  }

  /**
   * Apply filters to data and update visualizations
   */
  applyFilters() {
    // Collect filter values
    const filters = {};
    
    // Date range
    if (this.filterElements.dateStart && this.filterElements.dateStart.value) {
      if (!filters.dateRange) filters.dateRange = {};
      filters.dateRange.start = this.filterElements.dateStart.value;
    }
    
    if (this.filterElements.dateEnd && this.filterElements.dateEnd.value) {
      if (!filters.dateRange) filters.dateRange = {};
      filters.dateRange.end = this.filterElements.dateEnd.value;
    }
    
    // Dropdown filters
    const dropdownIds = [
      'conversionType', 'campaign', 'adGroup', 'creative', 
      'deviceType', 'country', 'region', 'metro', 'adEnvironment'
    ];
    
    dropdownIds.forEach(id => {
      const element = this.filterElements[id];
      if (element && element.value) {
        filters[id] = element.value;
      }
    });
    
    // Store active filters
    this.activeFilters = filters;
    
    // Apply filters to data
    const filteredData = this.dataProcessor.applyFilters(filters);
    
    // Update visualizations
    this.chartVisualizer.updateCharts(filteredData);
    
    // Update filter dependencies
    this.updateFilterDependencies();
  }

  /**
   * Reset all filters to default values
   */
  resetFilters() {
    // Reset date range
    if (this.filterElements.dateStart) {
      this.filterElements.dateStart.value = '';
    }
    
    if (this.filterElements.dateEnd) {
      this.filterElements.dateEnd.value = '';
    }
    
    // Reset dropdowns
    const dropdownIds = [
      'conversionType', 'campaign', 'adGroup', 'creative', 
      'deviceType', 'country', 'region', 'metro', 'adEnvironment'
    ];
    
    dropdownIds.forEach(id => {
      const element = this.filterElements[id];
      if (element) {
        element.value = '';
      }
    });
    
    // Clear active filters
    this.activeFilters = {};
    
    // Reset data and visualizations
    this.dataProcessor.prepareDatasets();
    this.chartVisualizer.updateCharts(this.dataProcessor.processedData);
    
    // Reset filter dependencies
    this.updateFilterDependencies();
  }

  /**
   * Update filter dependencies based on current selections
   * For example, when a country is selected, update region options
   */
  updateFilterDependencies() {
    // This is a simplified implementation
    // In a real-world scenario, you would dynamically update filter options
    // based on the current selections
    
    // For example, if a country is selected, you would filter regions to only show
    // regions from that country
    
    // This would require additional data processing and UI updates
  }

  /**
   * Get current active filters
   * @returns {Object} - Active filters
   */
  getActiveFilters() {
    return this.activeFilters;
  }
}

/**
 * Class to handle sorting functionality for the dashboard
 */
class SortManager {
  constructor(dataProcessor, chartVisualizer) {
    this.dataProcessor = dataProcessor;
    this.chartVisualizer = chartVisualizer;
    this.currentSort = {
      field: null,
      direction: 'asc'
    };
  }

  /**
   * Initialize sorting UI elements
   */
  initializeSorting() {
    // Sorting is primarily handled by the DataTables library for the data table
    // This method would set up any additional sorting controls if needed
    
    // For example, sort buttons for specific visualizations
    this.addSortButtonsToCharts();
  }

  /**
   * Add sort buttons to chart headers
   */
  addSortButtonsToCharts() {
    // Add sort buttons to relevant chart headers
    const chartHeaders = document.querySelectorAll('.chart-header');
    
    chartHeaders.forEach(header => {
      const chartId = header.dataset.chartId;
      if (!chartId) return;
      
      // Only add sort buttons to charts that support sorting
      const sortableCharts = [
        'campaign-performance', 
        'adgroup-performance', 
        'creative-performance'
      ];
      
      if (sortableCharts.includes(chartId)) {
        const sortButton = document.createElement('button');
        sortButton.className = 'sort-button';
        sortButton.innerHTML = '<i class="fas fa-sort"></i>';
        sortButton.title = 'Sort data';
        
        sortButton.addEventListener('click', () => this.toggleSort(chartId));
        
        header.appendChild(sortButton);
      }
    });
  }

  /**
   * Toggle sort for a specific chart
   * @param {string} chartId - Chart ID
   */
  toggleSort(chartId) {
    // Determine sort field based on chart ID
    let field;
    switch (chartId) {
      case 'campaign-performance':
        field = 'campaign';
        break;
      case 'adgroup-performance':
        field = 'adGroup';
        break;
      case 'creative-performance':
        field = 'creative';
        break;
      default:
        return;
    }
    
    // Toggle sort direction if same field
    if (this.currentSort.field === field) {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort.field = field;
      this.currentSort.direction = 'desc'; // Default to descending (highest first)
    }
    
    // Apply sort
    this.applySort();
  }

  /**
   * Apply current sort to data and update visualizations
   */
  applySort() {
    if (!this.currentSort.field) return;
    
    // This would typically involve re-sorting the data and updating visualizations
    // For simplicity, we'll just log the current sort
    console.log(`Sorting by ${this.currentSort.field} (${this.currentSort.direction})`);
    
    // In a real implementation, you would:
    // 1. Sort the relevant dataset
    // 2. Update the affected visualization
    
    // For example, if sorting campaign performance:
    // const sortedCampaigns = Object.entries(this.dataProcessor.processedData.mediaPerformance.campaignPerformance)
    //   .sort((a, b) => {
    //     const valueA = a[1].conversions;
    //     const valueB = b[1].conversions;
    //     return this.currentSort.direction === 'asc' ? valueA - valueB : valueB - valueA;
    //   });
    
    // Then update the chart with the sorted data
  }

  /**
   * Get current sort settings
   * @returns {Object} - Current sort settings
   */
  getCurrentSort() {
    return this.currentSort;
  }
}
