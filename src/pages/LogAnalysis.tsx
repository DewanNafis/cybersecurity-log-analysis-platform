import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Calendar,
  AlertCircle,
  Info,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Eye
} from 'lucide-react';
import { useLogs } from '../contexts/LogContext';
import { format } from 'date-fns';

export default function LogAnalysis() {
  const { filteredLogs, filters, setFilters, loading, refreshLogs } = useLogs();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, searchQuery });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setFilters({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: new Date(value)
      }
    });
  };

  const handleLevelFilter = (level: string) => {
    const newLevels = filters.levels.includes(level)
      ? filters.levels.filter(l => l !== level)
      : [...filters.levels, level];
    setFilters({ ...filters, levels: newLevels });
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info': return <Info className="h-4 w-4 text-blue-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-orange-400" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-400" />;
      default: return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'warning': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'error': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Source', 'Source IP', 'Destination IP', 'Message'],
      ...filteredLogs.map(log => [
        format(log.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        log.level,
        log.source,
        log.sourceIp,
        log.destinationIp || '',
        log.message
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Log Analysis</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshLogs}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportLogs}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <form onSubmit={handleSearch} className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs by message, IP, source..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </form>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
              <div className="space-y-2">
                <input
                  type="datetime-local"
                  value={format(filters.dateRange.start, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="datetime-local"
                  value={format(filters.dateRange.end, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Log Levels</label>
              <div className="space-y-2">
                {['info', 'warning', 'error', 'critical'].map(level => (
                  <label key={level} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.levels.includes(level)}
                      onChange={() => handleLevelFilter(level)}
                      className="mr-2 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300 capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Source IP</label>
              <input
                type="text"
                value={filters.sourceIp || ''}
                onChange={(e) => setFilters({ ...filters, sourceIp: e.target.value })}
                placeholder="Filter by source IP"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Showing {filteredLogs.length} logs</span>
        <span>Last updated: {format(new Date(), 'HH:mm:ss')}</span>
      </div>

      {/* Logs Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Source IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {format(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(log.level)}`}>
                        {getLevelIcon(log.level)}
                        <span className="ml-1 capitalize">{log.level}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {log.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                      {log.sourceIp}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-md truncate">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button
                        onClick={() => setSelectedLog(selectedLog === log.id ? null : log.id)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredLogs.length === 0 && !loading && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No logs found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            {(() => {
              const log = filteredLogs.find(l => l.id === selectedLog);
              if (!log) return null;
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Timestamp</label>
                      <p className="text-white">{format(log.timestamp, 'yyyy-MM-dd HH:mm:ss.SSS')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Level</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(log.level)}`}>
                        {getLevelIcon(log.level)}
                        <span className="ml-1 capitalize">{log.level}</span>
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Source</label>
                      <p className="text-white">{log.source}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Event Type</label>
                      <p className="text-white">{log.eventType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Source IP</label>
                      <p className="text-white font-mono">{log.sourceIp}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Destination IP</label>
                      <p className="text-white font-mono">{log.destinationIp || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                    <p className="text-white bg-gray-700 p-3 rounded-lg">{log.message}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Raw Log</label>
                    <pre className="text-white bg-gray-900 p-3 rounded-lg text-xs overflow-x-auto">
                      {log.rawLog}
                    </pre>
                  </div>
                  
                  {log.tags.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {log.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}