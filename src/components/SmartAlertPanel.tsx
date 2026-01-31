import React from 'react';
import { AlertTriangle, Shield, Scale, Info, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';

interface RefundPolicy {
  category: string;
  eligible: boolean | string;
  window?: string;
  conditions?: string[];
  note?: string;
  reason?: string;
  alternatives?: string[];
  legalNote?: string;
  warning?: string;
}

interface LegalNotice {
  type: string;
  severity: string;
  message: string;
  regulation: string;
  action: string;
}

interface Disclaimer {
  type: string;
  text: string;
}

interface Consultation {
  type: string;
  priority: string;
  message: string;
  helpline: string;
  info: string;
}

interface PolicyInfo {
  refundPolicy: RefundPolicy;
  legalNotices: LegalNotice[];
  disclaimers: Disclaimer[];
  consultations: Consultation[];
}

interface FraudInfo {
  riskScore: number;
  flagged: boolean;
  reasons: Array<{ code: string; message: string; weight?: number }>;
}

interface SmartAlertPanelProps {
  fraud?: FraudInfo;
  policy?: PolicyInfo;
  amount: number;
  category: string;
  onClose?: () => void;
}

const SmartAlertPanel: React.FC<SmartAlertPanelProps> = ({
  fraud,
  policy,
  amount,
  category,
  onClose
}) => {
  if (!fraud && !policy) return null;

  const riskScore = fraud?.riskScore || 0;
  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-400 bg-red-500/20 border-red-500/40';
    if (score >= 40) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
    return 'text-green-400 bg-green-500/20 border-green-500/40';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Review Required';
    return 'Safe';
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 mb-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">Transaction Intelligence</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Fraud Score */}
      {fraud && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Security Analysis
            </h4>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRiskColor(riskScore)}`}>
              {getRiskLevel(riskScore)} ({riskScore}/100)
            </span>
          </div>
          
          {fraud.reasons && fraud.reasons.length > 0 && (
            <div className="bg-black/30 rounded-lg p-4 space-y-2">
              {fraud.reasons.map((reason, idx) => (
                <div key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>{reason.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Refund Policy */}
      {policy?.refundPolicy && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-blue-400" />
            Refund Policy
          </h4>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            {policy.refundPolicy.eligible === true ? (
              <>
                <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
                  <CheckCircle className="w-5 h-5" />
                  Refundable within {policy.refundPolicy.window}
                </div>
                {policy.refundPolicy.conditions && policy.refundPolicy.conditions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-300 font-semibold mb-2">Conditions:</p>
                    <ul className="space-y-1">
                      {policy.refundPolicy.conditions.map((condition, idx) => (
                        <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                          <span>•</span>
                          <span>{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {policy.refundPolicy.note && (
                  <p className="text-xs text-gray-400 mt-3 italic">
                    💡 {policy.refundPolicy.note}
                  </p>
                )}
              </>
            ) : policy.refundPolicy.eligible === 'partial' || policy.refundPolicy.eligible === 'limited' || policy.refundPolicy.eligible === 'depends' ? (
              <>
                <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-2">
                  <Info className="w-5 h-5" />
                  {policy.refundPolicy.window}
                </div>
                {policy.refundPolicy.conditions && (
                  <ul className="space-y-1 mt-2">
                    {policy.refundPolicy.conditions.map((condition, idx) => (
                      <li key={idx} className="text-sm text-gray-400">• {condition}</li>
                    ))}
                  </ul>
                )}
                {policy.refundPolicy.note && (
                  <p className="text-xs text-gray-400 mt-3 italic">💡 {policy.refundPolicy.note}</p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                  <XCircle className="w-5 h-5" />
                  Non-refundable
                </div>
                {policy.refundPolicy.reason && (
                  <p className="text-sm text-gray-400 mb-2">Reason: {policy.refundPolicy.reason}</p>
                )}
                {policy.refundPolicy.alternatives && policy.refundPolicy.alternatives.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-300 font-semibold mb-1">Alternatives:</p>
                    <ul className="space-y-1">
                      {policy.refundPolicy.alternatives.map((alt, idx) => (
                        <li key={idx} className="text-sm text-gray-400">• {alt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            {policy.refundPolicy.warning && (
              <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded text-sm text-red-300">
                ⚠️ {policy.refundPolicy.warning}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legal Notices */}
      {policy?.legalNotices && policy.legalNotices.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
            <Scale className="w-5 h-5 text-purple-400" />
            Legal & Compliance
          </h4>
          <div className="space-y-3">
            {policy.legalNotices.map((notice, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-4 border ${
                  notice.severity === 'high'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                <p className="text-sm font-semibold text-white mb-1">{notice.message}</p>
                <p className="text-xs text-gray-400 mb-2">📜 {notice.regulation}</p>
                <p className="text-xs text-gray-300">
                  <strong>Action:</strong> {notice.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consultation Recommendations */}
      {policy?.consultations && policy.consultations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
            <Phone className="w-5 h-5 text-green-400" />
            Recommended Consultations
          </h4>
          <div className="space-y-3">
            {policy.consultations.map((consultation, idx) => (
              <div
                key={idx}
                className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
              >
                <p className="text-sm font-semibold text-green-300 mb-1">
                  {consultation.message}
                </p>
                <p className="text-xs text-gray-400 mb-2">{consultation.info}</p>
                <p className="text-xs text-green-400 font-mono">📞 {consultation.helpline}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimers */}
      {policy?.disclaimers && policy.disclaimers.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-gray-400" />
            Important Information
          </h4>
          <div className="space-y-2">
            {policy.disclaimers.map((disclaimer, idx) => (
              <details key={idx} className="group">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-white transition-colors">
                  {disclaimer.type.replace(/_/g, ' ')}
                </summary>
                <p className="text-xs text-gray-500 mt-2 pl-4 italic">
                  {disclaimer.text}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartAlertPanel;
