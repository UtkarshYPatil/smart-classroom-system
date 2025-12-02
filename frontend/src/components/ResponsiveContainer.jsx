import { containerClasses } from '../utils/responsive';

const ResponsiveContainer = ({ children, className = '' }) => {
  return (
    <div className={`${containerClasses.responsive} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;
