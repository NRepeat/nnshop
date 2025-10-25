const Logo = (props: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="50"
    height="50"
    fill="none"
    viewBox="0 0 50 50"
    className={props.className}
  >
    <path fill="#D9D9D9" d="m25 0 25 25-25 25L0 25z"></path>
    <path
      fill="#000"
      stroke="#060606"
      strokeWidth="0.5"
      d="M49.647 25 25.25 49.397V.604z"
    ></path>
  </svg>
);

export default Logo;
