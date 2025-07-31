import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  Target, 
  Clock, 
  MapPin,
  ExternalLink,
  Filter,
  Search,
  ChevronDown,
  Eye,
  XCircle
} from 'lucide-react';
import { useLogs } from '../contexts/LogContext';
import { format } from 'date-fns';

export default function ThreatDetection() {
  const { threats, loading } = useLogs();
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThreats = threats.filter(threat => {
    const matchesLevel = filterLevel === 'all' || threat.threatLevel === filterLevel;
    const matchesSearch = !searchQuery || 
      threat.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.sourceIp.includes(searchQuery) ||
      threat.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesLevel && matchesSearch;
  });

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getThreatIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-400" />;
      case 'medium': return <Shield className="h-5 w-5 text-yellow-400" />;
      case 'low': return <Shield className="h-5 w-5 text-green-400" />;
      default: return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  const getMitreAttackInfo = (tactics: string[]) => {
    const mitreMap: Record<string, { name: string; description: string }> = {
      'T1190': { name: 'Exploit Public-Facing Application', description: 'Adversaries may attempt to take advantage of a weakness in an Internet-facing computer or program' },
      'T1078': { name: 'Valid Accounts', description: 'Adversaries may obtain and abuse credentials of existing accounts' },
      'T1110': { name: 'Brute Force', description: 'Adversaries may use brute force techniques to gain access to accounts' },
      'T1021': { name: 'Remote Services', description: 'Adversaries may use valid accounts to log into a service specifically designed to accept remote connections' },
      'T1055': { name: 'Process Injection', description: 'Adversaries may inject code into processes in order to evade process-based defenses' }
    };

    return tactics.map(tactic => mitreMap[tactic] || { name: tactic, description: 'Unknown tactic' });
  };

  const threatStats = {
    total: threats.length,
    critical: threats.filter(t => t.threatLevel === 'critical').length,
    high: threats.filter(t => t.threatLevel === 'high').length,
    medium: threats.filter(t => t.threatLevel === 'medium').length,
    low: threats.filter(t => t.threatLevel === 'low').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Threat Detection</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Last scan: {format(new Date(), 'HH:mm:ss')}</span>
        </div>
      </div>

      {/* Threat Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Threats</p>
              <p className="text-2xl font-bold text-white">{threatStats.total}</p>
            </div>
            <Target className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Critical</p>
              <p className="text-2xl font-bold text-red-400">{threatStats.critical}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">High</p>
              <p className="text-2xl font-bold text-orange-400">{threatStats.high}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Medium</p>
              <p className="text-2xl font-bold text-yellow-400">{threatStats.medium}</p>
            </div>
            <Shield className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Low</p>
              <p className="text-2xl font-bold text-green-400">{threatStats.low}</p>
            </div>
            <Shield className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search threats by message, IP, or source..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Threats List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        ) : filteredThreats.length > 0 ? (
          filteredThreats.map((threat) => (
            <div key={threat.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getThreatIcon(threat.threatLevel!)}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getThreatColor(threat.threatLevel!)}`}>
                      {threat.threatLevel?.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-400">
                      {format(threat.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{threat.message}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Source</p>
                      <p className="text-white">{threat.source}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Source IP</p>
                      <p className="text-white font-mono">{threat.sourceIp}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Event Type</p>
                      <p className="text-white">{threat.eventType}</p>
                    </div>
                  </div>

                  {threat.mitreAttack && threat.mitreAttack.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-2">MITRE ATT&CK Tactics</p>
                      <div className="flex flex-wrap gap-2">
                        {getMitreAttackInfo(threat.mitreAttack).map((tactic, index) => (
                          <div key={index} className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
                            <p className="text-sm font-medium text-purple-400">{tactic.name}</p>
                            <p className="text-xs text-gray-400">{tactic.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {threat.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {threat.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedThreat(selectedThreat === threat.id ? null : threat.id)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">Recommended Actions</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {threat.threatLevel === 'critical' && (
                    <>
                      <li>• Immediately isolate affected systems</li>
                      <li>• Block source IP address</li>
                      <li>• Escalate to security team</li>
                      <li>• Begin incident response procedures</li>
                    </>
                  )}
                  {threat.threatLevel === 'high' && (
                    <>
                      <li>• Monitor affected systems closely</li>
                      <li>• Consider blocking source IP</li>
                      <li>• Review security logs for related activity</li>
                      <li>• Notify security team</li>
                    </>
                  )}
                  {threat.threatLevel === 'medium' && (
                    <>
                      <li>• Continue monitoring</li>
                      <li>• Review system configurations</li>
                      <li>• Update security rules if needed</li>
                    </>
                  )}
                  {threat.threatLevel === 'low' && (
                    <>
                      <li>• Log for future reference</li>
                      <li>• Monitor for patterns</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No threats found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Threat Detail Modal */}
      {selectedThreat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Threat Analysis</h3>
              <button
                onClick={() => setSelectedThreat(null)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            {(() => {
              const threat = filteredThreats.find(t => t.id === selectedThreat);
              if (!threat) return null;
              
              return (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    {getThreatIcon(threat.threatLevel!)}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getThreatColor(threat.threatLevel!)}`}>
                      {threat.threatLevel?.toUpperCase()} THREAT
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Threat Description</h4>
                    <p className="text-gray-300 bg-gray-700 p-4 rounded-lg">{threat.message}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Technical Details</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-400">Timestamp</p>
                          <p className="text-white">{format(threat.timestamp, 'yyyy-MM-dd HH:mm:ss.SSS')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Source</p>
                          <p className="text-white">{threat.source}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Source IP</p>
                          <p className="text-white font-mono">{threat.sourceIp}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Destination IP</p>
                          <p className="text-white font-mono">{threat.destinationIp || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Protocol</p>
                          <p className="text-white">{threat.protocol || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Port</p>
                          <p className="text-white">{threat.port || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Risk Assessment</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-400">Severity Score</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  threat.severity >= 8 ? 'bg-red-500' :
                                  threat.severity >= 6 ? 'bg-orange-500' :
                                  threat.severity >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${(threat.severity / 10) * 100}%` }}
                              />
                            </div>
                            <span className="text-white font-medium">{threat.severity}/10</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Event Type</p>
                          <p className="text-white">{threat.eventType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Threat Level</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getThreatColor(threat.threatLevel!)}`}>
                            {threat.threatLevel?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {threat.mitreAttack && threat.mitreAttack.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">MITRE ATT&CK Framework</h4>
                      <div className="grid gap-3">
                        {getMitreAttackInfo(threat.mitreAttack).map((tactic, index) => (
                          <div key={index} className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-purple-400">{tactic.name}</h5>
                              <ExternalLink className="h-4 w-4 text-purple-400" />
                            </div>
                            <p className="text-sm text-gray-300">{tactic.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Raw Log Data</h4>
                    <pre className="text-sm text-gray-300 bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      {threat.rawLog}
                    </pre>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}