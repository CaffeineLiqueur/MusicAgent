import React from "react";

type HeaderBarProps = {
  onBack?: () => void;
};

const HeaderBar: React.FC<HeaderBarProps> = ({ onBack }) => {
  return (
    <header className="header-bar">
      <div className="header-brand">
        <img className="header-logo" src="/icons/icon-gemini.png" alt="SelahFlow" />
        <div>
          <h1 className="header-title">SelahFlow</h1>
        </div>
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
