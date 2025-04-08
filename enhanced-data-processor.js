// Enhanced data processing functions for Trader Visualization Dashboard

/**
 * Enhanced data processing class with time-to-convert and device path analysis
 */
class EnhancedDataProcessor extends DataProcessor {
  constructor() {
    super();
    this.devicePaths = {};
    this.timeToConvertData = {};
    this.sitePerformance = {
      firstImpressionSites: {},
      lastImpressionSites: {}
    };
  }

  /**
   * Process CSV file and prepare enhanced data for visualizations
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

  /**
   * Extract all possible filter values from the data including new filters
   */
  extractFilters() {
    // Call the parent method first
    super.extractFilters();
    
    // Add new filters
    const filters = {
      attributionModels: new Set(),
      firstImpressionSites: new Set(),
      lastImpressionSites: new Set()
    };

    this.rawData.forEach(row => {
      // Attribution models
      if (row['Cross Device Attribution Model']) {
        filters.attributionModels.add(row['Cross Device Attribution Model']);
      }
      
      // First impression site (not directly available in the data, may need to be derived)
      // For now, we'll use a placeholder approach
      
      // Last impression site
      if (row['Last Impression Site']) {
        filters.lastImpressionSites.add(row['Last Impression Site']);
      }
    });

    // Add new filters to the existing filters object
    this.filters = {
      ...this.filters,
      attributionModels: Array.from(filters.attributionModels).filter(Boolean).sort(),
      lastImpressionSites: Array.from(filters.lastImpressionSites).filter(Boolean).sort()
    };
  }

  /**
   * Prepare all enhanced datasets needed for visualizations
   */
  prepareEnhancedDatasets() {
    this.processedData = {
      ...this.processedData,
      timeToConvert: this.prepareTimeToConvertAnalysis(),
      devicePathAnalysis: this.prepareDevicePathAnalysis(),
      sitePerformance: this.prepareSitePerformanceAnalysis()
    };
  }

  /**
   * Apply filters to the data including new filters
   * @param {Object} filters - Object containing filter criteria
   * @returns {Array} - Filtered data array
   */
  applyFilters(filters) {
    // Start with the basic filtering from the parent class
    let filteredData = super.applyFilters(filters);
    
    // Apply additional filters
    if (filters.attributionModel) {
      filteredData = filteredData.filter(row => row['Cross Device Attribution Model'] === filters.attributionModel);
    }
    
    if (filters.lastImpressionSite) {
      filteredData = filteredData.filter(row => row['Last Impression Site'] === filters.lastImpressionSite);
    }
    
    // Recalculate all datasets with filtered data
    const tempProcessor = new EnhancedDataProcessor();
    tempProcessor.rawData = filteredData;
    tempProcessor.prepareDatasets();
    tempProcessor.prepareEnhancedDatasets();
    
    return tempProcessor.processedData;
  }

  /**
   * Calculate time to convert in days
   * @param {string} firstImpressionTime - First impression timestamp
   * @param {string} lastImpressionTime - Last impression timestamp
   * @returns {number} - Time to convert in days
   */
  calculateTimeToConvert(firstImpressionTime, lastImpressionTime) {
    if (!firstImpressionTime || !lastImpressionTime) return null;
    
    const firstDate = new Date(firstImpressionTime);
    const lastDate = new Date(lastImpressionTime);
    
    if (isNaN(firstDate.getTime()) || isNaN(lastDate.getTime())) return null;
    
    // Calculate difference in milliseconds
    const diffTime = Math.abs(lastDate - firstDate);
    // Convert to days
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    return parseFloat(diffDays.toFixed(2));
  }

  /**
   * Determine device path
   * @param {string} firstImpressionDevice - First impression device type
   * @param {string} conversionDevice - Conversion device type
   * @returns {string} - Device path string
   */
  determineDevicePath(firstImpressionDevice, conversionDevice) {
    if (!firstImpressionDevice || !conversionDevice) return 'Unknown';
    
    if (firstImpressionDevice === conversionDevice) {
      return `${firstImpressionDevice} Only`;
    } else {
      return `${firstImpressionDevice} → ${conversionDevice}`;
    }
  }

  /**
   * Prepare time to convert analysis data
   * @returns {Object} - Time to convert datasets
   */
  prepareTimeToConvertAnalysis() {
    // Time to convert distribution
    const timeDistribution = {
      '0-1': 0,
      '1-3': 0,
      '3-7': 0,
      '7-14': 0,
      '14-30': 0,
      '30+': 0
    };
    
    // Time to convert by device
    const timeByDevice = {};
    
    // Time to convert by ad format
    const timeByAdFormat = {};
    
    // Time to convert by channel
    const timeByChannel = {};
    
    // Time vs. conversion percentage data
    const timeVsConversionPct = [];
    
    // Process each row
    let totalTimeToConvert = 0;
    let validTimeCount = 0;
    let maxTimeToConvert = 0;
    let minTimeToConvert = Infinity;
    
    const conversionsByDay = {};
    
    this.rawData.forEach(row => {
      const firstImpressionTime = row['First Impression Time'];
      const lastImpressionTime = row['Last Impression Time'];
      
      const timeToConvert = this.calculateTimeToConvert(firstImpressionTime, lastImpressionTime);
      
      if (timeToConvert !== null) {
        // Add to total for average calculation
        totalTimeToConvert += timeToConvert;
        validTimeCount++;
        
        // Update min/max
        if (timeToConvert > maxTimeToConvert) maxTimeToConvert = timeToConvert;
        if (timeToConvert < minTimeToConvert) minTimeToConvert = timeToConvert;
        
        // Add to distribution
        if (timeToConvert <= 1) timeDistribution['0-1']++;
        else if (timeToConvert <= 3) timeDistribution['1-3']++;
        else if (timeToConvert <= 7) timeDistribution['3-7']++;
        else if (timeToConvert <= 14) timeDistribution['7-14']++;
        else if (timeToConvert <= 30) timeDistribution['14-30']++;
        else timeDistribution['30+']++;
        
        // Round to nearest day for conversion percentage calculation
        const dayRounded = Math.round(timeToConvert);
        if (!conversionsByDay[dayRounded]) {
          conversionsByDay[dayRounded] = 0;
        }
        conversionsByDay[dayRounded]++;
        
        // Add to device analysis
        const device = row['Last Impression Device Type'] || 'Unknown';
        if (!timeByDevice[device]) {
          timeByDevice[device] = {
            totalTime: 0,
            count: 0,
            conversions: 0
          };
        }
        timeByDevice[device].totalTime += timeToConvert;
        timeByDevice[device].count++;
        timeByDevice[device].conversions++;
        
        // Add to ad format analysis
        const adFormat = row['Last Impression Ad Format'] || 'Unknown';
        if (!timeByAdFormat[adFormat]) {
          timeByAdFormat[adFormat] = {
            totalTime: 0,
            count: 0,
            conversions: 0
          };
        }
        timeByAdFormat[adFormat].totalTime += timeToConvert;
        timeByAdFormat[adFormat].count++;
        timeByAdFormat[adFormat].conversions++;
        
        // Add to channel analysis (using ad environment as channel)
        const channel = row['Last Impression Ad Environment'] || 'Unknown';
        if (!timeByChannel[channel]) {
          timeByChannel[channel] = {
            totalTime: 0,
            count: 0,
            conversions: 0
          };
        }
        timeByChannel[channel].totalTime += timeToConvert;
        timeByChannel[channel].count++;
        timeByChannel[channel].conversions++;
      }
    });
    
    // Calculate average time to convert
    const avgTimeToConvert = validTimeCount > 0 ? totalTimeToConvert / validTimeCount : 0;
    
    // Calculate average time by device
    Object.keys(timeByDevice).forEach(device => {
      timeByDevice[device].avgTime = timeByDevice[device].count > 0 ? 
        timeByDevice[device].totalTime / timeByDevice[device].count : 0;
    });
    
    // Calculate average time by ad format
    Object.keys(timeByAdFormat).forEach(format => {
      timeByAdFormat[format].avgTime = timeByAdFormat[format].count > 0 ? 
        timeByAdFormat[format].totalTime / timeByAdFormat[format].count : 0;
    });
    
    // Calculate average time by channel
    Object.keys(timeByChannel).forEach(channel => {
      timeByChannel[channel].avgTime = timeByChannel[channel].count > 0 ? 
        timeByChannel[channel].totalTime / timeByChannel[channel].count : 0;
    });
    
    // Calculate time vs. conversion percentage
    const totalConversions = validTimeCount;
    Object.entries(conversionsByDay).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([day, count]) => {
      const percentage = (count / totalConversions) * 100;
      timeVsConversionPct.push({
        day: parseInt(day),
        conversions: count,
        percentage: parseFloat(percentage.toFixed(2))
      });
    });
    
    return {
      distribution: timeDistribution,
      byDevice: timeByDevice,
      byAdFormat: timeByAdFormat,
      byChannel: timeByChannel,
      timeVsConversionPct: timeVsConversionPct,
      stats: {
        average: parseFloat(avgTimeToConvert.toFixed(2)),
        min: minTimeToConvert === Infinity ? 0 : parseFloat(minTimeToConvert.toFixed(2)),
        max: parseFloat(maxTimeToConvert.toFixed(2)),
        totalConversions: validTimeCount
      }
    };
  }

  /**
   * Prepare device path analysis data
   * @returns {Object} - Device path datasets
   */
  prepareDevicePathAnalysis() {
    const devicePaths = {};
    const deviceFlows = [];
    const devicePathTimeToConvert = {};
    
    this.rawData.forEach(row => {
      const firstDevice = row['First Impression Device Type'] || 'Unknown';
      const conversionDevice = row['Conversion Device Type'] || 'Unknown';
      
      const devicePath = this.determineDevicePath(firstDevice, conversionDevice);
      
      // Count device paths
      if (!devicePaths[devicePath]) {
        devicePaths[devicePath] = 0;
      }
      devicePaths[devicePath]++;
      
      // Add to device flows for Sankey diagram
      deviceFlows.push({
        source: firstDevice,
        target: conversionDevice,
        value: 1
      });
      
      // Calculate time to convert for each device path
      const firstImpressionTime = row['First Impression Time'];
      const lastImpressionTime = row['Last Impression Time'];
      
      const timeToConvert = this.calculateTimeToConvert(firstImpressionTime, lastImpressionTime);
      
      if (timeToConvert !== null) {
        if (!devicePathTimeToConvert[devicePath]) {
          devicePathTimeToConvert[devicePath] = {
            totalTime: 0,
            count: 0,
            avgTime: 0
          };
        }
        
        devicePathTimeToConvert[devicePath].totalTime += timeToConvert;
        devicePathTimeToConvert[devicePath].count++;
      }
    });
    
    // Calculate average time to convert for each device path
    Object.keys(devicePathTimeToConvert).forEach(path => {
      const data = devicePathTimeToConvert[path];
      data.avgTime = data.count > 0 ? data.totalTime / data.count : 0;
    });
    
    // Prepare data for device path flow visualization
    const deviceNodes = new Set();
    deviceFlows.forEach(flow => {
      deviceNodes.add(flow.source);
      deviceNodes.add(flow.target);
    });
    
    const nodes = Array.from(deviceNodes).map(name => ({ name }));
    
    // Aggregate flows with the same source and target
    const aggregatedFlows = {};
    deviceFlows.forEach(flow => {
      const key = `${flow.source}-${flow.target}`;
      if (!aggregatedFlows[key]) {
        aggregatedFlows[key] = {
          source: flow.source,
          target: flow.target,
          value: 0
        };
      }
      aggregatedFlows[key].value += flow.value;
    });
    
    return {
      paths: devicePaths,
      flows: Object.values(aggregatedFlows),
      nodes: nodes,
      timeToConvert: devicePathTimeToConvert
    };
  }

  /**
   * Prepare site performance analysis data
   * @returns {Object} - Site performance datasets
   */
  prepareSitePerformanceAnalysis() {
    const lastImpressionSites = {};
    
    this.rawData.forEach(row => {
      const site = row['Last Impression Site'];
      if (site) {
        if (!lastImpressionSites[site]) {
          lastImpressionSites[site] = {
            conversions: 0,
            impressions: 0,
            monetaryValue: 0
          };
        }
        
        lastImpressionSites[site].conversions++;
        lastImpressionSites[site].impressions += (row['Impression Count'] || 0);
        lastImpressionSites[site].monetaryValue += (row['Monetary Value'] || 0);
      }
    });
    
    // Calculate conversion rate for sites
    Object.keys(lastImpressionSites).forEach(site => {
      const data = lastImpressionSites[site];
      data.conversionRate = data.impressions > 0 ? (data.conversions / data.impressions) * 100 : 0;
    });
    
    return {
      lastImpressionSites
    };
  }

  /**
   * Prepare data for table view with enhanced metrics
   * @returns {Array} - Processed data for table view
   */
  prepareTableData() {
    // Return an enhanced version of the data for table view
    return this.rawData.map(row => {
      const firstImpressionTime = row['First Impression Time'];
      const lastImpressionTime = row['Last Impression Time'];
      const timeToConvert = this.calculateTimeToConvert(firstImpressionTime, lastImpressionTime);
      
      const firstDevice = row['First Impression Device Type'] || 'Unknown';
      const conversionDevice = row['Conversion Device Type'] || 'Unknown';
      const devicePath = this.determineDevicePath(firstDevice, conversionDevice);
      
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
        metro: row['Last Impression Metro Name'],
        // Enhanced metrics
        timeToConvert: timeToConvert,
        devicePath: devicePath,
        attributionModel: row['Cross Device Attribution Model'],
        lastImpressionSite: row['Last Impression Site']
      };
    });
  }
}
