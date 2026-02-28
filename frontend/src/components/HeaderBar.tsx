import React from "react";

type HeaderBarProps = {
  onBack?: () => void;
};

const HeaderBar: React.FC<HeaderBarProps> = ({ onBack }) => {
  return (
    <header className="header-bar">
      <div>
        <p className="eyebrow">MusicAgent • 和弦工作台</p>
        <h1 className="title">和弦查询</h1>
      </div>
      {onBack ? (
        <div className="header-actions">
          <button className="button ghost" type="button" onClick={onBack}>
            返回首页
          </button>
        </div>
      ) : null}
    </header>
  );
};

export default HeaderBar;
