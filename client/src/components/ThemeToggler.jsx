import { useTheme } from '../context/ThemeContext';
import './ThemeToggler.css';

function ThemeToggler() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button className="theme-toggler" onClick={toggleTheme} aria-label="Toggle theme">
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
}

export default ThemeToggler;
