// Data processing functions for Trader Visualization Dashboard

/**
 * Main data processing class for the dashboard
 */
class DataProcessor {
  constructor() {
    this.rawData = [];
    this.processedData = {};
    this.filters = {};
    this.activeFilters = {};
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
          resolve(this.processedData);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * Extract all possible filter values from the data
   */
  extractFilters() {
    const filters = {
      conversionTypes: new Set(),
      campaigns: new Set(),
      adGroups: new Set(),
      creatives: new Set(),
      deviceTypes: new Set(),
      countries: new Set(),
      regions: new Set(),
      metros: new Set(),
      adEnvironments: new Set()
    };

    this.rawData.forEach(row => {
      // Conversion types
      if (row['Tracking Tag Name']) {
        filters.conversionTypes.add(row['Tracking Tag Name']);
      }
      
      // Campaigns
      if (row['Last Impression Campaign Name']) {
        filters.campaigns.add(row['Last Impression Campaign Name']);
      }
      if (row['First Impression Campaign Name']) {
        filters.campaigns.add(row['First Impression Campaign Name']);
      }
      
      // Ad Groups
      if (row['Last Impression Ad Group Name']) {
        filters.adGroups.add(row['Last Impression Ad Group Name']);
      }
      if (row['First Impression Ad Group Name']) {
        filters.adGroups.add(row['First Impression Ad Group Name']);
      }
      
      // Creatives
      if (row['Last Impression Creative Name']) {
        filters.creatives.add(row['Last Impression Creative Name']);
      }
      if (row['First Impression Creative Name']) {
        filters.creatives.add(row['First Impression Creative Name']);
      }
      
      // Device Types
      if (row['Conversion Device Type']) {
        filters.deviceTypes.add(row['Conversion Device Type']);
      }
      if (row['Last Impression Device Type']) {
        filters.deviceTypes.add(row['Last Impression Device Type']);
      }
      
      // Geographic data
      if (row['Last Impression Country']) {
        filters.countries.add(row['Last Impression Country']);
      }
      if (row['Last Impression Region']) {
        filters.regions.add(row['Last Impression Region']);
      }
      if (row['Last Impression Metro Name']) {
        filters.metros.add(row['Last Impression Metro Name']);
      }
      
      // Ad Environments
      if (row['Last Impression Ad Environment']) {
        filters.adEnvironments.add(row['Last Impression Ad Environment']);
      }
    });

    // Convert Sets to Arrays
    this.filters = {
      conversionTypes: Array.from(filters.conversionTypes).filter(Boolean).sort(),
      campaigns: Array.from(filters.campaigns).filter(Boolean).sort(),
      adGroups: Array.from(filters.adGroups).filter(Boolean).sort(),
      creatives: Array.from(filters.creatives).filter(Boolean).sort(),
      deviceTypes: Array.from(filters.deviceTypes).filter(Boolean).sort(),
      countries: Array.from(filters.countries).filter(Boolean).sort(),
      regions: Array.from(filters.regions).filter(Boolean).sort(),
      metros: Array.from(filters.metros).filter(Boolean).sort(),
      adEnvironments: Array.from(filters.adEnvironments).filter(Boolean).sort()
    };
  }

  /**
   * Prepare all datasets needed for visualizations
   */
  prepareDatasets() {
    this.processedData = {
      summary: this.prepareSummaryMetrics(),
      conversionAnalysis: this.prepareConversionAnalysis(),
      mediaPerformance: this.prepareMediaPerformance(),
      channelAnalysis: this.prepareChannelAnalysis(),
      creativePerformance: this.prepareCreativePerformance(),
      geoInsights: this.prepareGeoInsights(),
      frequencyAnalysis: this.prepareFrequencyAnalysis(),
      tableData: this.prepareTableData()
    };
  }

  /**
   * Apply filters to the data
   * @param {Object} filters - Object containing filter criteria
   * @returns {Array} - Filtered data array
   */
  applyFilters(filters) {
    this.activeFilters = filters;
    let filteredData = [...this.rawData];
    
    // Apply each filter if it exists
    if (filters.conversionType) {
      filteredData = filteredData.filter(row => row['Tracking Tag Name'] === filters.conversionType);
    }
    
    if (filters.campaign) {
      filteredData = filteredData.filter(row => 
        row['Last Impression Campaign Name'] === filters.campaign || 
        row['First Impression Campaign Name'] === filters.campaign
      );
    }
    
    if (filters.adGroup) {
      filteredData = filteredData.filter(row => 
        row['Last Impression Ad Group Name'] === filters.adGroup || 
        row['First Impression Ad Group Name'] === filters.adGroup
      );
    }
    
    if (filters.creative) {
      filteredData = filteredData.filter(row => 
        row['Last Impression Creative Name'] === filters.creative || 
        row['First Impression Creative Name'] === filters.creative
      );
    }
    
    if (filters.deviceType) {
      filteredData = filteredData.filter(row => 
        row['Conversion Device Type'] === filters.deviceType || 
        row['Last Impression Device Type'] === filters.deviceType
      );
    }
    
    if (filters.country) {
      filteredData = filteredData.filter(row => row['Last Impression Country'] === filters.country);
    }
    
    if (filters.region) {
      filteredData = filteredData.filter(row => row['Last Impression Region'] === filters.region);
    }
    
    if (filters.metro) {
      filteredData = filteredData.filter(row => row['Last Impression Metro Name'] === filters.metro);
    }
    
    if (filters.adEnvironment) {
      filteredData = filteredData.filter(row => row['Last Impression Ad Environment'] === filters.adEnvironment);
    }
    
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      filteredData = filteredData.filter(row => {
        const convDate = new Date(row['Conversion Time']);
        return convDate >= startDate && convDate <= endDate;
      });
    }
    
    // Recalculate all datasets with filtered data
    const tempProcessor = new DataProcessor();
    tempProcessor.rawData = filteredData;
    tempProcessor.prepareDatasets();
    
    return tempProcessor.processedData;
  }

  /**
   * Prepare summary metrics
   * @returns {Object} - Summary metrics
   */
  prepareSummaryMetrics() {
    const totalConversions = this.rawData.length;
    
    // Count unique conversion types
    const conversionTypes = {};
    this.rawData.forEach(row => {
      const type = row['Tracking Tag Name'];
      if (type) {
        conversionTypes[type] = (conversionTypes[type] || 0) + 1;
      }
    });
    
    // Calculate average impressions per conversion
    const totalImpressions = this.rawData.reduce((sum, row) => {
      return sum + (row['Impression Count'] || 0);
    }, 0);
    
    const avgImpressions = totalConversions > 0 ? totalImpressions / totalConversions : 0;
    
    // Calculate total monetary value if available
    const totalValue = this.rawData.reduce((sum, row) => {
      return sum + (row['Monetary Value'] || 0);
    }, 0);
    
    // Get date range
    let minDate = null;
    let maxDate = null;
    
    this.rawData.forEach(row => {
      const convDate = row['Conversion Time'] ? new Date(row['Conversion Time']) : null;
      if (convDate) {
        if (!minDate || convDate < minDate) minDate = convDate;
        if (!maxDate || convDate > maxDate) maxDate = convDate;
      }
    });
    
    return {
      totalConversions,
      conversionsByType: conversionTypes,
      totalImpressions,
      avgImpressions,
      totalValue,
      dateRange: {
        start: minDate,
        end: maxDate
      }
    };
  }

  /**
   * Prepare conversion analysis data
   * @returns {Object} - Conversion analysis datasets
   */
  prepareConversionAnalysis() {
    // Conversion by type
    const conversionsByType = {};
    this.rawData.forEach(row => {
      const type = row['Tracking Tag Name'];
      if (type) {
        conversionsByType[type] = (conversionsByType[type] || 0) + 1;
      }
    });
    
    // Conversion by device type
    const conversionsByDevice = {};
    this.rawData.forEach(row => {
      const device = row['Conversion Device Type'];
      if (device) {
        conversionsByDevice[device] = (conversionsByDevice[device] || 0) + 1;
      }
    });
    
    // Conversion timeline (by day)
    const conversionTimeline = {};
    this.rawData.forEach(row => {
      if (row['Conversion Time']) {
        const date = new Date(row['Conversion Time']).toISOString().split('T')[0];
        conversionTimeline[date] = (conversionTimeline[date] || 0) + 1;
      }
    });
    
    // Sort timeline by date
    const sortedTimeline = Object.entries(conversionTimeline)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
    
    return {
      conversionsByType,
      conversionsByDevice,
      conversionTimeline: sortedTimeline
    };
  }

  /**
   * Prepare media performance data
   * @returns {Object} - Media performance datasets
   */
  prepareMediaPerformance() {
    // Campaign performance
    const campaignPerformance = {};
    this.rawData.forEach(row => {
      const campaign = row['Last Impression Campaign Name'];
      if (campaign) {
        if (!campaignPerformance[campaign]) {
          campaignPerformance[campaign] = {
            conversions: 0,
            impressions: 0,
            monetaryValue: 0
          };
        }
        
        campaignPerformance[campaign].conversions += 1;
        campaignPerformance[campaign].impressions += (row['Impression Count'] || 0);
        campaignPerformance[campaign].monetaryValue += (row['Monetary Value'] || 0);
      }
    });
    
    // Calculate conversion rate and cost per conversion
    Object.keys(campaignPerformance).forEach(campaign => {
      const data = campaignPerformance[campaign];
      data.conversionRate = data.impressions > 0 ? (data.conversions / data.impressions) * 100 : 0;
    });
    
    // Ad Group performance
    const adGroupPerformance = {};
    this.rawData.forEach(row => {
      const adGroup = row['Last Impression Ad Group Name'];
      if (adGroup) {
        if (!adGroupPerformance[adGroup]) {
          adGroupPerformance[adGroup] = {
            conversions: 0,
            impressions: 0,
            monetaryValue: 0
          };
        }
        
        adGroupPerformance[adGroup].conversions += 1;
        adGroupPerformance[adGroup].impressions += (row['Impression Count'] || 0);
        adGroupPerformance[adGroup].monetaryValue += (row['Monetary Value'] || 0);
      }
    });
    
    // Calculate conversion rate for ad groups
    Object.keys(adGroupPerformance).forEach(adGroup => {
      const data = adGroupPerformance[adGroup];
      data.conversionRate = data.impressions > 0 ? (data.conversions / data.impressions) * 100 : 0;
    });
    
    return {
      campaignPerformance,
      adGroupPerformance
    };
  }

  /**
   * Prepare channel analysis data
   * @returns {Object} - Channel analysis datasets
   */
  prepareChannelAnalysis() {
    // Performance by device type
    const devicePerformance = {};
    this.rawData.forEach(row => {
      const device = row['Last Impression Device Type'];
      if (device) {
        if (!devicePerformance[device]) {
          devicePerformance[device] = {
            conversions: 0,
            impressions: 0
          };
        }
        
        devicePerformance[device].conversions += 1;
        devicePerformance[device].impressions += (row['Impression Count'] || 0);
      }
    });
    
    // Calculate conversion rate for devices
    Object.keys(devicePerformance).forEach(device => {
      const data = devicePerformance[device];
      data.conversionRate = data.impressions > 0 ? (data.conversions / data.impressions) * 100 : 0;
    });
    
    // Performance by ad environment
    const environmentPerformance = {};
    this.rawData.forEach(row => {
      const environment = row['Last Impression Ad Environment'];
      if (environment) {
        if (!environmentPerformance[environment]) {
          environmentPerformance[environment] = {
            conversions: 0,
            impressions: 0
          };
        }
        
        environmentPerformance[environment].conversions += 1;
        environmentPerformance[environment].impressions += (row['Impression Count'] || 0);
      }
    });
    
    // Calculate conversion rate for environments
    Object.keys(environmentPerformance).forEach(environment => {
      const data = environmentPerformance[environment];
      data.conversionRate = data.impressions > 0 ? (data.conversions / data.impressions) * 100 : 0;
    });
    
    return {
      devicePerformance,
      environmentPerformance
    };
  }

  /**
   * Prepare creative performance data
   * @returns {Object} - Creative performance datasets
   */
  prepareCreativePerformance() {
    // Creative performance
    const creativePerformance = {};
    this.rawData.forEach(row => {
      const creative = row['Last Impression Creative Name'];
      if (creative) {
        if (!creativePerformance[creative]) {
          creativePerformance[creative] = {
            conversions: 0,
            impressions: 0,
            monetaryValue: 0,
            format: row['Last Impression Ad Format'] || 'Unknown'
          };
        }
        
        creativePerformance[creative].conversions += 1;
        creativePerformance[creative].impressions += (row['Impression Count'] || 0);
        creativePerformance[creative].monetaryValue += (row['Monetary Value'] || 0);
      }
    });
    
    // Calculate conversion rate for creatives
    Object.keys(creativePerformance).forEach(creative => {
      const data = creativePerformance[creative];
      data.conversionRate = data.impressions > 0 ? (data.conversions / data.impressions) * 100 : 0;
    });
    
    // Creative format analysis
    const formatPerformance = {};
    this.rawData.forEach(row => {
      const format = row['Last Impression Ad Format'];
      if (format) {
        if (!formatPerformance[format]) {
          formatPerformance[format] = {
            conversions: 0,
            impressions: 0
          };
        }
        
        formatPerformance[format].conversions += 1;
        formatPerformance[format].impressions += (row['Impression Count'] || 0);
      }
    });
    
    // Calculate conversion rate for formats
    Object.keys(formatPerformance).forEach(format => {
      const data = formatPerformance[format];
      data.conversionRate = data.impressions > 0 ? (data.conversions / data.impressions) * 100 : 0;
    });
    
    return {
      creativePerformance,
      formatPerformance
    };
  }

  /**
   * Prepare geographic insights data
   * @returns {Object} - Geographic insights datasets
   */
  prepareGeoInsights() {
    // Country performance
    const countryPerformance = {};
    this.rawData.forEach(row => {
      const country = row['Last Impression Country'];
      if (country) {
        if (!countryPerformance[country]) {
          countryPerformance[country] = {
            conversions: 0,
            impressions: 0,
            monetaryValue: 0
          };
        }
        
        countryPerformance[country].conversions += 1;
        countryPerformance[country].impressions += (row['Impression Count'] || 0);
        countryPerformance[country].monetaryValue += (row['Monetary Value'] || 0);
      }
    });
    
    // Region performance
    const regionPerformance = {};
    this.rawData.forEach(row => {
      const region = row['Last Impression Region'];
      const country = row['Last Impression Country'];
      if (region && country) {
        const key = `${country}-${region}`;
        if (!regionPerformance[key]) {
          regionPerformance[key] = {
            country,
            region,
            conversions: 0,
            impressions: 0
          };
        }
        
        regionPerformance[key].conversions += 1;
        regionPerformance[key].impressions += (row['Impression Count'] || 0);
      }
    });
    
    // Metro performance
    const metroPerformance = {};
    this.rawData.forEach(row => {
      const metro = row['Last Impression Metro Name'];
      const region = row['Last Impression Region'];
      if (metro && region) {
        const key = `${region}-${metro}`;
        if (!metroPerformance[key]) {
          metroPerformance[key] = {
            region,
            metro,
            conversions: 0,
            impressions: 0
          };
        }
        
        metroPerformance[key].conversions += 1;
        metroPerformance[key].impressions += (row['Impression Count'] || 0);
      }
    });
    
    return {
      countryPerformance,
      regionPerformance,
      metroPerformance
    };
  }

  /**
   * Prepare frequency analysis data
   * @returns {Object} - Frequency analysis datasets
   */
  prepareFrequencyAnalysis() {
    // Impression count distribution
    const impressionDistribution = {};
    this.rawData.forEach(row => {
      const impressions = row['Impression Count'] || 0;
      // Group by ranges
      let range;
      if (impressions === 0) range = '0';
      else if (impressions <= 5) range = '1-5';
      else if (impressions <= 10) range = '6-10';
      else if (impressions <= 20) range = '11-20';
      else if (impressions <= 50) range = '21-50';
      else range = '50+';
      
      impressionDistribution[range] = (impressionDistribution[range] || 0) + 1;
    });
    
    // Frequency vs conversion rate
    const frequencyConversionRate = {};
    
    // Group conversions by impression count
    const frequencyGroups = {};
    this.rawData.forEach(row => {
      const impressions = row['Impression Count'] || 0;
      // Group by ranges
      let range;
      if (impressions === 0) range = '0';
      else if (impressions <= 5) range = '1-5';
      else if (impressions <= 10) range = '6-10';
      else if (impressions <= 20) range = '11-20';
      else if (impressions <= 50) range = '21-50';
      else range = '50+';
      
      if (!frequencyGroups[range]) {
        frequencyGroups[range] = {
          conversions: 0,
          totalValue: 0
        };
      }
      
      frequencyGroups[range].conversions += 1;
      frequencyGroups[range].totalValue += (row['Monetary Value'] || 0);
    });
    
    // Calculate average value per conversion for each frequency group
    Object.keys(frequencyGroups).forEach(range => {
      const data = frequencyGroups[range];
      frequencyConversionRate[range] = {
        conversions: data.conversions,
        avgValue: data.conversions > 0 ? data.totalValue / data.conversions : 0
      };
    });
    
    return {
      impressionDistribution,
      frequencyConversionRate
    };
  }

  /**
   * Prepare data for table view
   * @returns {Array} - Processed data for table view
   */
  prepareTableData() {
    // Return a simplified version of the data for table view
    return this.rawData.map(row => {
      return {
        conversionId: row['Conversion ID'],
        conversionTime: row['Conversion Time'],
        conversionType: row['Tracking Tag Name'],
        deviceType: row['Conversion Device Type'],
        campaign: row['Last Impression Campaign Name'],
        adGroup: row['Last Impression Ad Group Name'],
        creative: row['Last Impression Creative Name'],
        impressions: row['Impression Count'],
        clicks: row['Display Click Count'],
        monetaryValue: row['Monetary Value'],
        country: row['Last Impression Country'],
        region: row['Last Impression Region'],
        metro: row['Last Impression Metro Name']
      };
    });
  }

  /**
   * Export data to CSV
   * @param {Array} data - Data to export
   * @returns {string} - CSV string
   */
  exportToCsv(data) {
    return Papa.unparse(data);
  }

  /**
   * Get all available filters
   * @returns {Object} - Filter options
   */
  getFilters() {
    return this.filters;
  }
}
