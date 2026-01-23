import React from "react";

type SampleCachePanelProps = {
  onDownload: () => Promise<void>;
  onClear: () => Promise<void>;
  status: string;
  busy: boolean;
};

const SampleCachePanel: React.FC<SampleCachePanelProps> = ({ onDownload, onClear, status, busy }) => {
  return (
    <div className="card section">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="eyebrow">离线采样</p>
          <h3 style={{ margin: "4px 0" }}>下载/清理音频缓存</h3>
          <p className="muted">预先缓存常用音符，离线播放更完整。</p>
        </div>
        <div className="row">
          <button className="button ghost" onClick={onClear} disabled={busy}>
            清理缓存
          </button>
          <button className="button" onClick={onDownload} disabled={busy}>
            {busy ? "处理中..." : "下载采样"}
          </button>
        </div>
      </div>
      <p className="muted">{status}</p>
    </div>
  );
};

export default SampleCachePanel;
