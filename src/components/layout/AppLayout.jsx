import '../../styles/components/AppLayout.css';
import Header from './Header';

export default function AppLayout({ children, headerLeft, headerRight }) {
  return (
    <div className="app-layout">
      <Header leftAction={headerLeft} rightAction={headerRight} />
      <main className="app-layout__main">
        {children}
      </main>
    </div>
  );
}
