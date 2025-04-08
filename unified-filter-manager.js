/**
 * Unified filter manager with multi-select capabilities for Trader Visualization Dashboard
 */
class UnifiedFilterManager {
  constructor(dataProcessor, chartVisualizer) {
    this.dataProcessor = dataProcessor;
    this.chartVisualizer = chartVisualizer;
    this.activeFilters = {};
    this.pendingFilters = {}; // Store filters before applying
    this.filterElements = {};
  }

  /**
   * Initialize filter UI elements including multi-select capabilities
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
    
    // Create multi-select filters
    this.createMultiSelectFilter(filterContainer, 'conversionType', 'Conversion Type', filters.conversionTypes);
    this.createMultiSelectFilter(filterContainer, 'campaign', 'Campaign', filters.campaigns);
    this.createMultiSelectFilter(filterContainer, 'adGroup', 'Ad Group', filters.adGroups);
    this.createMultiSelectFilter(filterContainer, 'creative', 'Creative', filters.creatives);
    this.createMultiSelectFilter(filterContainer, 'deviceType', 'Device Type', filters.deviceTypes);
    this.createMultiSelectFilter(filterContainer, 'country', 'Country', filters.countries);
    this.createMultiSelectFilter(filterContainer, 'region', 'Region', filters.regions);
    this.createMultiSelectFilter(filterContainer, 'metro', 'Metro', filters.metros);
    this.createMultiSelectFilter(filterContainer, 'adEnvironment', 'Ad Environment', filters.adEnvironments);
    
    // Create attribution model filter
    if (filters.attributionModels && filters.attributionModels.length > 0) {
      this.createMultiSelectFilter(filterContainer, 'attributionModel', 'Attribution Model', filters.attributionModels);
    }
    
    // Create site filter
    if (filters.lastImpressionSites && filters.lastImpressionSites.length > 0) {
      this.createMultiSelectFilter(filterContainer, 'lastImpressionSite', 'Last Impression Site', filters.lastImpressionSites);
    }
    
    // Create apply button
    this.createApplyButton(filterContainer);
    
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
   * Create multi-select filter
   * @param {HTMLElement} container - Container element
   * @param {string} id - Filter ID
   * @param {string} label - Filter label
   * @param {Array} options - Filter options
   */
  createMultiSelectFilter(container, id, label, options) {
    if (!options || options.length === 0) return;
    
    const filterGroup = document.createElement('div');
    filterGroup.className = 'filter-group';
    
    const filterLabel = document.createElement('label');
    filterLabel.textContent = label;
    filterLabel.htmlFor = `filter-${id}`;
    filterGroup.appendChild(filterLabel);
    
    // Create select element with multiple attribute
    const select = document.createElement('select');
    select.id = `filter-${id}`;
    select.className = 'filter-select multi-select';
    select.multiple = true;
    select.size = Math.min(5, options.length + 1); // Show 5 options at once or fewer if there are fewer options
    
    // Add options
    options.forEach(option => {
      if (option) {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
      }
    });
    
    // Add search box for large option lists
    if (options.length > 10) {
      const searchBox = document.createElement('input');
      searchBox.type = 'text';
      searchBox.className = 'filter-search';
      searchBox.placeholder = `Search ${label}...`;
      searchBox.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        Array.from(select.options).forEach(option => {
          const optionText = option.textContent.toLowerCase();
          option.style.display = optionText.includes(searchTerm) ? '' : 'none';
        });
      });
      
      filterGroup.appendChild(searchBox);
    }
    
    filterGroup.appendChild(select);
    
    // Add select all/none buttons for convenience
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'select-buttons';
    
    const selectAllBtn = document.createElement('button');
    selectAllBtn.type = 'button';
    selectAllBtn.className = 'btn-sm btn-link';
    selectAllBtn.textContent = 'Select All';
    selectAllBtn.addEventListener('click', () => {
      Array.from(select.options).forEach(option => {
        option.selected = true;
      });
      this.updatePendingFilters(id, select);
    });
    
    const selectNoneBtn = document.createElement('button');
    selectNoneBtn.type = 'button';
    selectNoneBtn.className = 'btn-sm btn-link';
    selectNoneBtn.textContent = 'Clear';
    selectNoneBtn.addEventListener('click', () => {
      Array.from(select.options).forEach(option => {
        option.selected = false;
      });
      this.updatePendingFilters(id, select);
    });
    
    buttonContainer.appendChild(selectAllBtn);
    buttonContainer.appendChild(selectNoneBtn);
    filterGroup.appendChild(buttonContainer);
    
    container.appendChild(filterGroup);
    
    // Store reference
    this.filterElements[id] = select;
  }

  /**
   * Create apply button
   * @param {HTMLElement} container - Container element
   */
  createApplyButton(container) {
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'filter-group button-group';
    
    const applyButton = document.createElement('button');
    applyButton.id = 'apply-filters';
    applyButton.className = 'btn btn-primary';
    applyButton.textContent = 'Apply Filters';
    
    buttonGroup.appendChild(applyButton);
    container.appendChild(buttonGroup);
    
    // Store reference
    this.filterElements.applyButton = applyButton;
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
      this.filterElements.dateStart.addEventListener('change', () => {
        this.updatePendingFilters('dateStart', this.filterElements.dateStart);
      });
    }
    
    if (this.filterElements.dateEnd) {
      this.filterElements.dateEnd.addEventListener('change', () => {
        this.updatePendingFilters('dateEnd', this.filterElements.dateEnd);
      });
    }
    
    // Multi-select filters
    const filterIds = [
      'conversionType', 'campaign', 'adGroup', 'creative', 
      'deviceType', 'country', 'region', 'metro', 'adEnvironment',
      'attributionModel', 'lastImpressionSite'
    ];
    
    filterIds.forEach(id => {
      const element = this.filterElements[id];
      if (element) {
        element.addEventListener('change', () => {
          this.updatePendingFilters(id, element);
        });
      }
    });
    
    // Apply button
    if (this.filterElements.applyButton) {
      this.filterElements.applyButton.addEventListener('click', () => this.applyFilters());
    }
    
    // Reset button
    if (this.filterElements.resetButton) {
      this.filterElements.resetButton.addEventListener('click', () => this.resetFilters());
    }
  }

  /**
   * Update pending filters without applying them
   * @param {string} id - Filter ID
   * @param {HTMLElement} element - Filter element
   */
  updatePendingFilters(id, element) {
    if (id === 'dateStart' || id === 'dateEnd') {
      if (!this.pendingFilters.dateRange) {
        this.pendingFilters.dateRange = {};
      }
      
      if (id === 'dateStart') {
        this.pendingFilters.dateRange.start = element.value;
      } else {
        this.pendingFilters.dateRange.end = element.value;
      }
    } else if (element.multiple) {
      // Handle multi-select elements
      const selectedOptions = Array.from(element.selectedOptions).map(option => option.value);
      if (selectedOptions.length > 0) {
        this.pendingFilters[id] = selectedOptions;
      } else {
        delete this.pendingFilters[id];
      }
    } else {
      // Handle single-select elements
      if (element.value) {
        this.pendingFilters[id] = element.value;
      } else {
        delete this.pendingFilters[id];
      }
    }
  }

  /**
   * Apply filters to data and update visualizations
   */
  applyFilters() {
    // Store active filters
    this.activeFilters = {...this.pendingFilters};
    
    // Apply filters to data
    const filteredData = this.dataProcessor.applyFilters(this.activeFilters);
    
    // Update visualizations
    this.chartVisualizer.updateCharts(filteredData);
    
    // Update time to convert visualizations if available
    if (window.timeToConvertVisualizer) {
      window.timeToConvertVisualizer.updateVisualizations(filteredData);
    }
    
    // Update device path visualizations if available
    if (window.devicePathVisualizer) {
      window.devicePathVisualizer.updateVisualizations(filteredData);
    }
    
    // Highlight apply button to indicate filters have been applied
    if (this.filterElements.applyButton) {
      this.filterElements.applyButton.classList.add('filter-applied');
      setTimeout(() => {
        this.filterElements.applyButton.classList.remove('filter-applied');
      }, 1000);
    }
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
    
    // Reset multi-select filters
    const filterIds = [
      'conversionType', 'campaign', 'adGroup', 'creative', 
      'deviceType', 'country', 'region', 'metro', 'adEnvironment',
      'attributionModel', 'lastImpressionSite'
    ];
    
    filterIds.forEach(id => {
      const element = this.filterElements[id];
      if (element) {
        Array.from(element.options).forEach(option => {
          option.selected = false;
        });
      }
    });
    
    // Clear pending and active filters
    this.pendingFilters = {};
    this.activeFilters = {};
    
    // Reset data and visualizations
    this.dataProcessor.prepareDatasets();
    this.dataProcessor.prepareEnhancedDatasets();
    this.chartVisualizer.updateCharts(this.dataProcessor.processedData);
    
    // Update time to convert visualizations if available
    if (window.timeToConvertVisualizer) {
      window.timeToConvertVisualizer.updateVisualizations(this.dataProcessor.processedData);
    }
    
    // Update device path visualizations if available
    if (window.devicePathVisualizer) {
      window.devicePathVisualizer.updateVisualizations(this.dataProcessor.processedData);
    }
  }

  /**
   * Get current active filters
   * @returns {Object} - Active filters
   */
  getActiveFilters() {
    return this.activeFilters;
  }
}
