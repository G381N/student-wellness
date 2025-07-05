import { FiSearch } from 'react-icons/fi';

export default function TopBar() {
  return (
    <div className="fixed top-0 left-0 w-full z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-2xl mx-auto mt-4 px-4 pointer-events-auto">
        <div className="backdrop-blur-xl bg-black/70 border border-gray-800 rounded-full flex items-center px-4 py-2 shadow-lg">
          <FiSearch className="text-gray-400 text-xl mr-3" />
          <input
            type="text"
            placeholder="Search everything..."
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-base"
          />
        </div>
      </div>
    </div>
  );
} 