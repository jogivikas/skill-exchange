export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`card-lg ${className}`} {...props}>
      {children}
    </div>
  );
}
