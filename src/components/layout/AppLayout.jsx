import '../../styles/components/AppLayout.css';
import Header from './Header';

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-layout__main">
        {children}
      </main>
    </div>
  );
}
