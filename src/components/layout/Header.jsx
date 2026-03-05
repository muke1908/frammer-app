import '../../styles/components/Header.css';

export default function Header({ leftAction, rightAction }) {
  return (
    <header className="header">
      <div className="header__slot header__slot--left">
        {leftAction}
      </div>
      <h1 className="header__title">Frammer</h1>
      <div className="header__slot header__slot--right">
        {rightAction}
      </div>
    </header>
  );
}
