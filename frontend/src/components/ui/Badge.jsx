export default function Badge({ children, variant = 'gray', ...props }) {
  const variantClasses = {
    success: 'badge-success',
    warning: 'badge-warning',
    info: 'badge-info',
    gray: 'badge-gray',
  };

  return (
    <span className={`badge ${variantClasses[variant]}`} {...props}>
      {children}
    </span>
  );
}
