import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useData } from '../../context/DataContext';
import type { AppContext } from '../../App';

export default function Layout() {
  const data = useData();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-56">
        <main className="flex-1 overflow-y-auto">
          <Outlet context={data satisfies AppContext} />
        </main>
      </div>
    </div>
  );
}
