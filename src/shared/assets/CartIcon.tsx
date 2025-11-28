import * as React from 'react';

const CartIcon = (props: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="50"
    height="50"
    fill="none"
    viewBox="0 0 50 50"
    className={props.className}
  >
    <circle cx="25" cy="25" r="25" fill="#000"></circle>
    <circle cx="25" cy="25" r="18.518" fill="#eeeeee"></circle>
    <path
      stroke="#000"
      strokeWidth="1.5"
      d="M18.916 30.826C19.848 32 21.583 32 25.053 32h.56c3.47 0 5.205 0 6.137-1.174m-12.834 0c-.932-1.175-.612-2.958.027-6.524.455-2.536.682-3.804 1.546-4.553m-1.573 11.077Zm12.834 0c.933-1.175.613-2.958-.026-6.524-.455-2.536-.683-3.804-1.546-4.553m1.572 11.077Zm-1.572-11.077C29.315 19 28.081 19 25.614 19h-.56c-2.468 0-3.702 0-4.565.75m9.69 0Zm-9.69 0Z"
    ></path>
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeWidth="1.5"
      d="M23.333 22c.292 1.165 1.077 2 2 2 .924 0 1.71-.835 2-2"
    ></path>
  </svg>
);

export default CartIcon;
