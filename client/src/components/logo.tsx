import logoImage from "@assets/ender logo 2png_1757583368492.png";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* New Logo */}
      <div className="relative">
        <img 
          src={logoImage} 
          alt="Ender Outlet Logo" 
          className="w-12 h-12 object-contain"
        />
      </div>
      
      {/* Logo Text */}
      <div className="flex flex-col">
        <span className={`text-2xl font-bold leading-tight ${className.includes('text-white') ? 'text-white' : 'text-primary'}`}>
          ender
        </span>
        <span className={`text-base font-medium leading-tight -mt-1 ${className.includes('text-white') ? 'text-gray-300' : 'text-gray-600'}`}>
          outlet
        </span>
      </div>
    </div>
  );
}