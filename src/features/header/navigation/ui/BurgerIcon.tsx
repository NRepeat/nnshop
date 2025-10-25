const BurgerIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="18"
    fill="none"
    viewBox="0 0 28 18"
    className={className}
  >
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeWidth="1.5"
      d="M26.75.75h-26M18.75 8.75h-18M13.75 16.75h-13"
    ></path>
  </svg>
);

export default BurgerIcon;
