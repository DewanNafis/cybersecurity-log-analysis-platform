import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Activity,
  Clock,
  Globe,
  Server
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useLogs } from '../contexts/LogContext';
import { format } from 'date-fns';

export default function Dashboard() {
  const { filteredLogs, threats, loading } = useLogs();

  // Generate sample data for charts
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date();
    hour.setHours(i, 0, 0, 0);
    const logsInHour = filteredLogs.filter(log => 
      log.timestamp.getHours() === i
    ).length;
    
    return {
      time: format(hour, 'HH:mm'),
      logs: logsInHour,
      threats: threats.filter(t => t.timestamp.getHours() === i).length
    };
  });

  const threatLevelData = [
    { name: 'Low', value: threats.filter(t => t.threatLevel === 'low').length, color: '#10B981' },
    { name: 'Medium', value: threats.filter(t => t.threatLevel === 'medium').length, color: '#F59E0B' },
    { name: 'High', value: threats.filter(t => t.threatLevel === 'high').length, color: '#EF4444' },
    { name: 'Critical', value: threats.filter(t => t.threatLevel === 'critical').length, color: '#DC2626' }
  ];

  const topSources = filteredLogs.reduce((acc, log) => {
    acc[log.source] = (acc[log.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sourceData = Object.entries(topSources)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([source, count]) => ({ source, count }));

  const stats = [
    {
      name: 'Total Logs',
      value: filteredLogs.length.toLocaleString(),
      icon: BarChart3,
      change: '+12%',
      changeType: 'increase' as const,
      color: 'blue'
    },
    {
      name: 'Active Threats',
      value: threats.length.toString(),
      icon: AlertTriangle,
      change: '-8%',
      changeType: 'decrease' as const,
      color: 'red'
    },
    {
      name: 'Critical Alerts',
      value: threats.filter(t => t.threatLevel === 'critical').length.toString(),
      icon: Shield,
      change: '+3%',
      changeType: 'increase' as const,
      color: 'orange'
    },
    {
      name: 'System Health',
      value: '98.5%',
      icon: Activity,
      change: '+0.2%',
      changeType: 'increase' as const,
      color: 'green'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Security Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Last updated: {format(new Date(), 'HH:mm:ss')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className={`h-4 w-4 ${stat.changeType === 'increase' ? 'text-green-400' : 'text-red-400'}`} />
              <span className={`text-sm ml-1 ${stat.changeType === 'increase' ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-400 ml-1">from last hour</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Log Activity Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Log Activity (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Line type="monotone" dataKey="logs" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="threats" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Threat Level Distribution */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Threat Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={threatLevelData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {threatLevelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {threatLevelData.map((item) => (
              <div key={item.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-300">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Log Sources */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Top Log Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="source" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Critical Threats */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Critical Threats</h3>
          <div className="space-y-3">
            {threats
              .filter(t => t.threatLevel === 'critical')
              .slice(0, 5)
              .map((threat) => (
                <div key={threat.id} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-xs">
                        {threat.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(threat.timestamp, 'HH:mm:ss')} • {threat.sourceIp}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                    CRITICAL
                  </span>
                </div>
              ))}
            {threats.filter(t => t.threatLevel === 'critical').length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No critical threats detected</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <Server className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-white">Log Ingestion</p>
              <p className="text-xs text-green-400">Operational</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Globe className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-white">Threat Detection</p>
              <p className="text-xs text-green-400">Active</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Activity className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-white">Real-time Monitoring</p>
              <p className="text-xs text-green-400">Connected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}