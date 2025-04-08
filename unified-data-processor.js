/**
 * Unified data processing class with multi-select filter support and enhanced visualizations
 */
class UnifiedDataProcessor extends EnhancedDataProcessor {
  constructor() {
    super();
  }

  /**
   * Apply filters to the data including multi-select filter support
   * @param {Object} filters - Object containing filter criteria
   * @returns {Object} - Processed data with all visualizations
   */
  applyFilters(filters) {
    let filteredData = [...this.rawData];
    
    // Apply date range filter
    if (filters.dateRange) {
      if (filters.dateRange.start && filters.dateRange.end) {
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        
        filteredData = filteredData.filter(row => {
          const convDate = new Date(row['Conversion Time']);
          return convDate >= startDate && convDate <= endDate;
        });
      } else if (filters.dateRange.start) {
        const startDate = new Date(filters.dateRange.start);
        
        filteredData = filteredData.filter(row => {
          const convDate = new Date(row['Conversion Time']);
          return convDate >= startDate;
        });
      } else if (filters.dateRange.end) {
        const endDate = new Date(filters.dateRange.end);
        
        filteredData = filteredData.filter(row => {
          const convDate = new Date(row['Conversion Time']);
          return convDate <= endDate;
        });
      }
    }
    
    // Apply multi-select filters
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'dateRange') return; // Skip date range, already handled
      
      if (Array.isArray(value)) {
        // Handle multi-select values
        switch (key) {
          case 'conversionType':
            filteredData = filteredData.filter(row => value.includes(row['Tracking Tag Name']));
            break;
            
          case 'campaign':
            filteredData = filteredData.filter(row => 
              value.includes(row['Last Impression Campaign Name']) || 
              value.includes(row['First Impression Campaign Name'])
            );
            break;
            
          case 'adGroup':
            filteredData = filteredData.filter(row => 
              value.includes(row['Last Impression Ad Group Name']) || 
              value.includes(row['First Impression Ad Group Name'])
            );
            break;
            
          case 'creative':
            filteredData = filteredData.filter(row => 
              value.includes(row['Last Impression Creative Name']) || 
              value.includes(row['First Impression Creative Name'])
            );
            break;
            
          case 'deviceType':
            filteredData = filteredData.filter(row => 
              value.includes(row['Conversion Device Type']) || 
              value.includes(row['Last Impression Device Type'])
            );
            break;
            
          case 'country':
            filteredData = filteredData.filter(row => value.includes(row['Last Impression Country']));
            break;
            
          case 'region':
            filteredData = filteredData.filter(row => value.includes(row['Last Impression Region']));
            break;
            
          case 'metro':
            filteredData = filteredData.filter(row => value.includes(row['Last Impression Metro Name']));
            break;
            
          case 'adEnvironment':
            filteredData = filteredData.filter(row => value.includes(row['Last Impression Ad Environment']));
            break;
            
          case 'attributionModel':
            filteredData = filteredData.filter(row => value.includes(row['Cross Device Attribution Model']));
            break;
            
          case 'lastImpressionSite':
            filteredData = filteredData.filter(row => value.includes(row['Last Impression Site']));
            break;
        }
      } else {
        // Handle single value filters (for backward compatibility)
        switch (key) {
          case 'conversionType':
            filteredData = filteredData.filter(row => row['Tracking Tag Name'] === value);
            break;
            
          case 'campaign':
            filteredData = filteredData.filter(row => 
              row['Last Impression Campaign Name'] === value || 
              row['First Impression Campaign Name'] === value
            );
            break;
            
          case 'adGroup':
            filteredData = filteredData.filter(row => 
              row['Last Impression Ad Group Name'] === value || 
              row['First Impression Ad Group Name'] === value
            );
            break;
            
          case 'creative':
            filteredData = filteredData.filter(row => 
              row['Last Impression Creative Name'] === value || 
              row['First Impression Creative Name'] === value
            );
            break;
            
          case 'deviceType':
            filteredData = filteredData.filter(row => 
              row['Conversion Device Type'] === value || 
              row['Last Impression Device Type'] === value
            );
            break;
            
          case 'country':
            filteredData = filteredData.filter(row => row['Last Impression Country'] === value);
            break;
            
          case 'region':
            filteredData = filteredData.filter(row => row['Last Impression Region'] === value);
            break;
            
          case 'metro':
            filteredData = filteredData.filter(row => row['Last Impression Metro Name'] === value);
            break;
            
          case 'adEnvironment':
            filteredData = filteredData.filter(row => row['Last Impression Ad Environment'] === value);
            break;
            
          case 'attributionModel':
            filteredData = filteredData.filter(row => row['Cross Device Attribution Model'] === value);
            break;
            
          case 'lastImpressionSite':
            filteredData = filteredData.filter(row => row['Last Impression Site'] === value);
            break;
        }
      }
    });
    
    // Create a new instance to process the filtered data
    const tempProcessor = new UnifiedDataProcessor();
    tempProcessor.rawData = filteredData;
    
    // Ensure we call the original EnhancedDataProcessor methods to prepare all datasets
    tempProcessor.extractFilters();
    tempProcessor.prepareDatasets();
    tempProcessor.prepareEnhancedDatasets();
    
    return tempProcessor.processedData;
  }

  /**
   * Process CSV file and prepare data for visualizations
   * @param {File} file - The CSV file to process
   * @returns {Promise} - Promise resolving to processed data
   */
  processFile(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(results.errors);
            return;
          }
          
          this.rawData = results.data;
          this.extractFilters();
          this.prepareDatasets();
          this.prepareEnhancedDatasets();
          resolve(this.processedData);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
}
