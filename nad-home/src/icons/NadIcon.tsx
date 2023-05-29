import { SVGAttributes } from 'react';

export const NadIcon = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      version='1.1'
      viewBox='0 0 1024 1024'
      {...props}
    >
      <polygon points='432,915 649,630 271,699 467,427 125,507 271,213 19,282 0,205 0,1024 972,1024 918,828' />
      <polygon points='461,58 309,361 705,269 497,556 885,485 667,771 990,713 1024,834 1024,0 51,0 91,159' />
    </svg>
  );
};
