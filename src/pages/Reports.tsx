import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Clock,
  Filter,
  Mail,
  Settings
} from 'lucide-react';
import { useLogs } from '../contexts/LogContext';
import { format, subDays, subWeeks, subMonths } from 'date-fns';

export default function Reports() {
  const { filteredLogs, threats } = useLogs();
  const [reportType, setReportType] = useState('summary');
  const [timeRange, setTimeRange] = useState('7d');
  const [generating, setGenerating] = useState(false);

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case '24h': return { start: subDays(now, 1), end: now };
      case '7d': return { start: subDays(now, 7), end: now };
      case '30d': return { start: subDays(now, 30), end: now };
      case '90d': return { start: subDays(now, 90), end: now };
      default: return { start: subDays(now, 7), end: now };
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { start, end } = getDateRange();
    const reportData = {
      period: `${format(start, 'yyyy-MM-dd')} to ${format(end, 'yyyy-MM-dd')}`,
      totalLogs: filteredLogs.length,
      threats: threats.length,
      criticalThreats: threats.filter(t => t.threatLevel === 'critical').length,
      topSources: getTopSources(),
      threatTrends: getThreatTrends()
    };

    downloadReport(reportData);
    setGenerating(false);
  };

  const getTopSources = () => {
    const sources = filteredLogs.reduce((acc, log) => {
      acc[log.source] = (acc[log.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sources)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([source, count]) => ({ source, count }));
  };

  const getThreatTrends = () => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayThreats = threats.filter(t => 
        format(t.timestamp, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      ).length;
      
      return {
        date: format(date, 'MMM dd'),
        threats: dayThreats
      };
    });

    return days;
  };

  const downloadReport = (data: any) => {
    let content = '';
    
    if (reportType === 'summary') {
      content = generateSummaryReport(data);
    } else if (reportType === 'detailed') {
      content = generateDetailedReport(data);
    } else if (reportType === 'threats') {
      content = generateThreatReport(data);
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${reportType}-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateSummaryReport = (data: any) => {
    return `
CYBERSECURITY SUMMARY REPORT
============================

Report Period: ${data.period}
Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}

EXECUTIVE SUMMARY
-----------------
Total Log Entries: ${data.totalLogs.toLocaleString()}
Total Threats Detected: ${data.threats}
Critical Threats: ${data.criticalThreats}

TOP LOG SOURCES
---------------
${data.topSources.map((s: any, i: number) => `${i + 1}. ${s.source}: ${s.count} logs`).join('\n')}

THREAT TRENDS (Last 7 Days)
---------------------------
${data.threatTrends.map((t: any) => `${t.date}: ${t.threats} threats`).join('\n')}

RECOMMENDATIONS
---------------
${data.criticalThreats > 0 ? '• Immediate attention required for critical threats' : '• No critical threats detected'}
• Continue monitoring for suspicious activity
• Review and update security policies as needed
• Ensure all systems are up to date with security patches
    `.trim();
  };

  const generateDetailedReport = (data: any) => {
    return `
DETAILED CYBERSECURITY REPORT
=============================

Report Period: ${data.period}
Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}

LOG ANALYSIS
------------
Total Entries: ${data.totalLogs.toLocaleString()}

Log Level Breakdown:
${['info', 'warning', 'error', 'critical'].map(level => {
  const count = filteredLogs.filter(l => l.level === level).length;
  return `• ${level.toUpperCase()}: ${count} (${((count / data.totalLogs) * 100).toFixed(1)}%)`;
}).join('\n')}

THREAT ANALYSIS
---------------
Total Threats: ${data.threats}
Threat Level Distribution:
${['low', 'medium', 'high', 'critical'].map(level => {
  const count = threats.filter(t => t.threatLevel === level).length;
  return `• ${level.toUpperCase()}: ${count}`;
}).join('\n')}

DETAILED THREAT LIST
-------------------
${threats.slice(0, 20).map((threat, i) => `
${i + 1}. ${threat.message}
   Level: ${threat.threatLevel?.toUpperCase()}
   Source: ${threat.source} (${threat.sourceIp})
   Time: ${format(threat.timestamp, 'yyyy-MM-dd HH:mm:ss')}
`).join('')}

${threats.length > 20 ? `... and ${threats.length - 20} more threats` : ''}
    `.trim();
  };

  const generateThreatReport = (data: any) => {
    return `
THREAT INTELLIGENCE REPORT
==========================

Report Period: ${data.period}
Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}

THREAT OVERVIEW
---------------
Total Threats Detected: ${data.threats}
Critical Threats: ${data.criticalThreats}
Risk Level: ${data.criticalThreats > 0 ? 'HIGH' : data.threats > 10 ? 'MEDIUM' : 'LOW'}

CRITICAL THREATS
----------------
${threats.filter(t => t.threatLevel === 'critical').map((threat, i) => `
${i + 1}. ${threat.message}
   Source IP: ${threat.sourceIp}
   Detection Time: ${format(threat.timestamp, 'yyyy-MM-dd HH:mm:ss')}
   MITRE ATT&CK: ${threat.mitreAttack?.join(', ') || 'N/A'}
   Recommended Action: Immediate isolation and investigation required
`).join('')}

ATTACK PATTERNS
---------------
${Array.from(new Set(threats.flatMap(t => t.mitreAttack || []))).map(tactic => `
• ${tactic}: ${threats.filter(t => t.mitreAttack?.includes(tactic)).length} occurrences`).join('')}

RECOMMENDATIONS
---------------
• Implement immediate containment for critical threats
• Review and strengthen security controls
• Update threat detection rules based on observed patterns
• Consider additional monitoring for identified attack vectors
    `.trim();
  };

  const reportTypes = [
    { value: 'summary', label: 'Executive Summary', icon: BarChart3 },
    { value: 'detailed', label: 'Detailed Analysis', icon: FileText },
    { value: 'threats', label: 'Threat Intelligence', icon: TrendingUp }
  ];

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Security Reports</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Last updated: {format(new Date(), 'HH:mm:ss')}</span>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Generate Report</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Report Type</label>
            <div className="space-y-2">
              {reportTypes.map(type => (
                <label key={type.value} className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                  <input
                    type="radio"
                    name="reportType"
                    value={type.value}
                    checked={reportType === type.value}
                    onChange={(e) => setReportType(e.target.value)}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <type.icon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-white font-medium">{type.label}</p>
                    <p className="text-sm text-gray-400">
                      {type.value === 'summary' && 'High-level overview for executives'}
                      {type.value === 'detailed' && 'Comprehensive analysis with full data'}
                      {type.value === 'threats' && 'Focus on threat intelligence and IOCs'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            <div className="mt-6">
              <button
                onClick={generateReport}
                disabled={generating}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating Report...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Generate & Download Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Logs</p>
              <p className="text-2xl font-bold text-white">{filteredLogs.length.toLocaleString()}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Threats</p>
              <p className="text-2xl font-bold text-white">{threats.length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Critical Alerts</p>
              <p className="text-2xl font-bold text-white">
                {threats.filter(t => t.threatLevel === 'critical').length}
              </p>
            </div>
            <PieChart className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Report Types</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Scheduled Reports</h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Calendar className="h-4 w-4" />
            <span>Schedule New</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-4">
              <Mail className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Daily Executive Summary</p>
                <p className="text-sm text-gray-400">Sent to security@company.com at 08:00 UTC</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Active</span>
              <button className="text-gray-400 hover:text-white">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-4">
              <Mail className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Weekly Threat Intelligence</p>
                <p className="text-sm text-gray-400">Sent to soc@company.com every Monday at 09:00 UTC</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Active</span>
              <button className="text-gray-400 hover:text-white">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-4">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-white font-medium">Monthly Compliance Report</p>
                <p className="text-sm text-gray-400">Sent to compliance@company.com on 1st of each month</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">Paused</span>
              <button className="text-gray-400 hover:text-white">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Reports</h2>
        
        <div className="space-y-3">
          {[
            { name: 'Executive Summary - Weekly', date: new Date(), size: '2.3 MB', type: 'PDF' },
            { name: 'Threat Intelligence Report', date: subDays(new Date(), 1), size: '5.7 MB', type: 'PDF' },
            { name: 'Detailed Log Analysis', date: subDays(new Date(), 3), size: '12.1 MB', type: 'CSV' },
            { name: 'Monthly Security Overview', date: subDays(new Date(), 7), size: '8.4 MB', type: 'PDF' }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-white font-medium">{report.name}</p>
                  <p className="text-sm text-gray-400">
                    {format(report.date, 'MMM dd, yyyy HH:mm')} • {report.size} • {report.type}
                  </p>
                </div>
              </div>
              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                <Download className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}