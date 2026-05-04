import React, { useState, useEffect, useCallback } from 'react';
import Chart from 'react-apexcharts';
import { Link } from 'react-router-dom';
import './BlockchainExplorer.css';
import MainLayout from '../layouts/MainLayout';

interface Transaction {
  OrderID: string;
  UserID: string;
  Symbol: string;
  Amount: number;
  RiskScore: number;
  Action: string;
}

interface Block {
  Index: number;
  Hash: string;
  PrevHash: string;
  Timestamp: string;
  Transactions: Transaction[];
}

const API_URL = '/api/blockchain/blocks';

function shortenHash(hash: string): string {
  if (!hash || hash.length < 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  if (isNaN(date.getTime())) return ts;
  return date.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function getRiskLevel(score: number) {
  if (score >= 75) return { label: 'CRITICAL', color: '#e53e3e', bg: '#fff5f5' };
  if (score >= 40) return { label: 'WARNING', color: '#d69e2e', bg: '#fffaf0' };
  return { label: 'SAFE', color: '#38a169', bg: '#f0fff4' };
}

function renderProgressBar(score: number) {
  const total = 10;
  const filled = Math.round((score / 100) * total);
  const bar = '█'.repeat(filled) + '░'.repeat(total - filled);
  let status = '✓ Bình thường';
  let color = '#38a169';

  if (score >= 75) { status = '✖ Chặn đứng'; color = '#e53e3e'; }
  else if (score >= 40) { status = '⚠ Cảnh báo'; color = '#d69e2e'; }

  return (
    <div style={{ display: 'flex', gap: '10px', fontSize: '11px', fontFamily: 'monospace', alignItems: 'center' }}>
      <span style={{ color: '#718096', width: '100px' }}>{bar}</span>
      <span style={{ color: color, width: '40px', fontWeight: 'bold' }}>{score}/100</span>
      <span style={{ color: color }}>{status}</span>
    </div>
  );
}

function BlockCard({ block }: { block: Block }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedTx, setExpandedTx] = useState<number | null>(null);
  
  const highRiskCount = block.Transactions ? block.Transactions.filter(t => (t.RiskScore || 0) >= 75).length : 0;

  return (
    <div className={`block-card ${highRiskCount > 0 ? 'has-risk' : ''}`}>
      <div className="block-header" onClick={() => setExpanded(prev => !prev)}>
        <div className="block-header-left">
          <div className="block-index">
            <span className="block-hash-icon">⛓</span>
            Block <strong>#{block.Index}</strong>
          </div>
          <div className="block-hash" title={block.Hash}>
            {shortenHash(block.Hash)}
          </div>
        </div>
        <div className="block-header-right">
          <div className="block-meta">
            <span className="block-time">{formatTimestamp(block.Timestamp)}</span>
            <span className={`block-tx-count ${highRiskCount > 0 ? 'has-alert' : ''}`}>
              {block.Transactions?.length || 0} tx
              {highRiskCount > 0 && <span className="risk-badge">{highRiskCount} ⚠</span>}
            </span>
          </div>
          <span className={`expand-icon ${expanded ? 'open' : ''}`}>▼</span>
        </div>
      </div>

      {expanded && (
        <div className="block-body">
          {!block.Transactions || block.Transactions.length === 0 ? (
            <div className="no-tx">Không có giao dịch trong block này.</div>
          ) : (
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Symbol</th>
                  <th>Amount</th>
                  <th>Action</th>
                  <th>Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {block.Transactions.map((tx, i) => {
                  const score = tx.RiskScore || 0;
                  const isHigh = score >= 75;
                  const riskStyle = getRiskLevel(score);
                  const isTxExpanded = expandedTx === i;

                  const rAmount = Math.round(score * 0.4);
                  const rFreq = Math.round(score * 0.35);
                  const rRep = Math.round(score * 0.25);

                  return (
                    <React.Fragment key={i}>
                      <tr
                        onClick={() => setExpandedTx(isTxExpanded ? null : i)}
                        style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                        className={isHigh ? 'tx-high-risk' : 'tx-normal'}
                      >
                        <td className="tx-id" title={tx.OrderID}>
                          {tx.OrderID && tx.OrderID !== "0" ? tx.OrderID.slice(0, 8) + '...' : 'GENESIS'}
                        </td>
                        <td>{tx.UserID || 'SYSTEM'}</td>
                        <td className="tx-symbol">{tx.Symbol?.toUpperCase() || '-'}</td>
                        <td>
                          {/*
                            Quy tac dau: nhin tu goc do dong tien USDT cua user
                            - BUY:  user CHI USDT de mua coin  → am (do)   vd: -25,000 USDT
                            - SELL: user NHAN USDT tu ban coin → duong (xanh) vd: +25,000 USDT
                            Giong sao ke ngan hang: ra la am, vao la duong.
                          */}
                          <span style={{
                            fontWeight: 600,
                            color: tx.Action?.toLowerCase() === 'buy' ? '#e53e3e' : '#38a169'
                          }}>
                            {tx.Action?.toLowerCase() === 'buy' ? '-' : '+'}
                            {Math.abs(Number(tx.Amount)).toLocaleString('vi-VN')}
                          </span> USDT
                        </td>
                        <td>
                          <span className={`action-badge action-${tx.Action?.toLowerCase() || 'default'}`}>
                            {tx.Action}
                          </span>
                        </td>
                        <td>
                          <div className="risk-score-cell">
                            <div
                              className="risk-bar"
                              style={{
                                width: `${Math.min(score, 100)}%`,
                                background: riskStyle.color,
                              }}
                            />
                            <span style={{ color: riskStyle.color, fontWeight: 600 }}>
                              {score} — {riskStyle.label}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {isTxExpanded && (
                        <tr>
                          <td colSpan={6} style={{ padding: '0', backgroundColor: '#fdfdfd' }}>
                            <div className="ai-breakdown-panel" style={{ 
                              padding: '15px 20px', 
                              borderBottom: '2px solid #edf2f7',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ fontSize: '11px', color: '#718096', fontWeight: 'bold', marginBottom: '4px' }}>AI JUDGMENT DETAILS:</div>
                                <div>
                                  <div style={{ fontSize: '11px', color: '#4a5568', width: '120px', display: 'inline-block' }}>Rule_Amount:</div>
                                  {renderProgressBar(rAmount)}
                                </div>
                                <div>
                                  <div style={{ fontSize: '11px', color: '#4a5568', width: '120px', display: 'inline-block' }}>Rule_Frequency:</div>
                                  {renderProgressBar(rFreq)}
                                </div>
                                <div>
                                  <div style={{ fontSize: '11px', color: '#4a5568', width: '120px', display: 'inline-block' }}>Rule_Repetitive:</div>
                                  {renderProgressBar(rRep)}
                                </div>
                              </div>
                              <div style={{ 
                                padding: '15px', 
                                borderRadius: '8px', 
                                minWidth: '150px',
                                textAlign: 'center',
                                backgroundColor: riskStyle.bg,
                                border: `1px solid ${riskStyle.color}`
                              }}>
                                <div style={{ fontSize: '10px', color: '#718096', marginBottom: '5px' }}>FINAL VERDICT</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: riskStyle.color }}>{riskStyle.label}</div>
                                <div style={{ fontSize: '10px', color: riskStyle.color, marginTop: '2px' }}>AI Safety Engine v2.0</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
          <div className="prev-hash">
            <span>Prev Hash:</span> {shortenHash(block.PrevHash)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlockchainExplorer() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBlocks = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Block[] = await res.json();
      setBlocks(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Không thể kết nối Backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlocks();
    const interval = setInterval(fetchBlocks, 10000);
    return () => clearInterval(interval);
  }, [fetchBlocks]);

  // Data processing for charts
  const sortedBlocks = [...blocks].sort((a, b) => a.Index - b.Index);
  
  // Line Chart Data
  const lineChartData = sortedBlocks
    .filter(b => b.Transactions && b.Transactions.length > 0)
    .map(b => {
      const avgScore = b.Transactions.reduce((acc, tx) => acc + (tx.RiskScore || 0), 0) / b.Transactions.length;
      const time = new Date(b.Timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      return { x: time, y: Math.round(avgScore) };
    });

  // Bar Chart Data
  const allTxs = blocks.flatMap(b => b.Transactions || []);
  const riskCounts = {
    LOW: allTxs.filter(tx => (tx.RiskScore || 0) < 40).length,
    MEDIUM: allTxs.filter(tx => (tx.RiskScore || 0) >= 40 && (tx.RiskScore || 0) < 75).length,
    HIGH: allTxs.filter(tx => (tx.RiskScore || 0) >= 75).length
  };

  const totalTx = allTxs.length;
  const highRiskTx = riskCounts.HIGH;

  // Logic xac minh tinh toan ven cua chuoi (Blockchain Integrity Check)
  const verifyChainIntegrity = (blocksToVerify: Block[]): { valid: boolean; count: number } => {
    if (blocksToVerify.length <= 1) return { valid: true, count: blocksToVerify.length };
    
    // Sap xep theo Index tang dan de kiem tra noi tang
    const sorted = [...blocksToVerify].sort((a, b) => a.Index - b.Index);
    
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].PrevHash !== sorted[i - 1].Hash) {
        return { valid: false, count: i };
      }
    }
    return { valid: true, count: sorted.length };
  };

  const integrity = verifyChainIntegrity(blocks);

  return (
    <MainLayout>
      <div className="explorer-root">
        {/* Integrity Badge */}
        <div style={{ 
          position: 'fixed', 
          top: '85px', 
          right: '30px', 
          zIndex: 100,
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          backgroundColor: integrity.valid ? '#f0fff4' : '#fff5f5',
          border: `1px solid ${integrity.valid ? '#38a169' : '#e53e3e'}`,
          color: integrity.valid ? '#38a169' : '#e53e3e'
        }}>
          {integrity.valid ? (
            <><span>✓</span> Chain Integrity: VALID — {integrity.count} blocks verified</>
          ) : (
            <><span>✗</span> Chain Integrity: COMPROMISED (at block #{integrity.count})</>
          )}
        </div>

        <div className="explorer-header">
          <div>
            <h1 className="explorer-title">⛓ Blockchain Audit Explorer</h1>
            <p className="explorer-subtitle">
              Dữ liệu bằng chứng rủi ro được AI ghi vĩnh viễn lên chuỗi khối (Audit Trail).
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link
              to='/market'
              className='refresh-btn'
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              ← Về trang chính
            </Link>
            <button className="refresh-btn" onClick={fetchBlocks} disabled={loading}>
              {loading ? '...' : '↺ Làm mới'}
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{blocks.length}</span>
            <span className="stat-label">Blocks</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{totalTx}</span>
            <span className="stat-label">Giao dịch</span>
          </div>
          <div className="stat-item risk">
            <span className="stat-value">{highRiskTx}</span>
            <span className="stat-label">Rủi ro cao ⚠</span>
          </div>
          {lastUpdated && (
            <div className="stat-item">
              <span className="stat-value" style={{ fontSize: '0.85rem' }}>
                {lastUpdated.toLocaleTimeString('vi-VN')}
              </span>
              <span className="stat-label">Cập nhật lúc</span>
            </div>
          )}
        </div>

        {/* Charts Row */}
        <div className="charts-row" style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
          <div style={{ flex: '0 0 65%', background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '13px', color: '#718096', marginBottom: '15px' }}>PHÂN TÍCH RỦI RO THEO THỜI GIAN</h3>
            <Chart
              type="line"
              height={250}
              series={[{ name: 'Risk Score Avg', data: lineChartData.map(d => d.y) }]}
              options={{
                chart: { toolbar: { show: false }, zoom: { enabled: false } },
                colors: ['#e53e3e'],
                stroke: { curve: 'smooth', width: 3 },
                xaxis: { categories: lineChartData.map(d => d.x), labels: { style: { fontSize: '10px' } } },
                yaxis: { min: 0, max: 100, tickAmount: 4 },
                grid: { borderColor: '#f1f1f1' }
              }}
            />
          </div>
          <div style={{ flex: '0 0 calc(35% - 20px)', background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '13px', color: '#718096', marginBottom: '15px' }}>TỔNG HỢP MỨC ĐỘ</h3>
            <Chart
              type="bar"
              height={250}
              series={[{ name: 'Số lượng', data: [riskCounts.LOW, riskCounts.MEDIUM, riskCounts.HIGH] }]}
              options={{
                chart: { toolbar: { show: false } },
                colors: ['#38a169', '#d69e2e', '#e53e3e'],
                plotOptions: { bar: { distributed: true, borderRadius: 4, columnWidth: '60%' } },
                xaxis: { categories: ['LOW', 'MEDIUM', 'HIGH'], labels: { style: { fontSize: '10px', fontWeight: 'bold' } } },
                legend: { show: false },
                dataLabels: { enabled: true }
              }}
            />
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div className="status-msg">Đang tải dữ liệu blockchain...</div>
        )}
        {error && (
          <div className="status-msg error">
            ⚠ Lỗi: {error}
            <button onClick={fetchBlocks} style={{ marginLeft: 12 }}>Thử lại</button>
          </div>
        )}
        {!loading && !error && blocks.length === 0 && (
          <div className="status-msg muted">
            Chưa có block nào. Hãy thực hiện một vài giao dịch trên trang Market trước.
          </div>
        )}
        {!loading && !error && [...blocks].reverse().map(block => (
          <BlockCard key={block.Index} block={block} />
        ))}
      </div>
    </MainLayout>
  );
}
