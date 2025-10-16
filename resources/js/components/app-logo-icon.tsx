import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
    <img 
      src="/images/logo.png" 
      alt="App Logo" 
      className="h-10 w-10"
    />
    );
}
