import React, { useState, useEffect } from 'react';

// 1. Define the interface for a single crypto item
interface CryptoItem {
  symbol: string;
  name: string;
  logo_url: string | null; // Can be string or null if missing
  price_usd: number | null; // Can be number or null
  // Add other potential fields if they exist, e.g., marketCap?: number;
}

// 2. Define the interface for the component props
interface CryptoBalanceProps {
  cryptoData: CryptoItem[] | null; // Prop is an array of CryptoItem or null
}

// Default Icon (can be an SVG component or an imported image)
const DefaultIcon: React.FC = () => ( // Typed as Functional Component
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#808080"/>
    <text x="12" y="16" fontSize="10" fill="white" textAnchor="middle" dominantBaseline="middle">?</text>
  </svg>
);

// 3. Use the Props interface and type the component
const CryptoBalance: React.FC<CryptoBalanceProps> = ({ cryptoData }) => {

  // State type inferred correctly (string | null)
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false); // Explicitly boolean

  // Set initial selected crypto when data loads
  useEffect(() => {
    // Ensure cryptoData is not null and not empty before accessing
    if (cryptoData && cryptoData.length > 0 && !selectedCryptoSymbol) {
      // Ensure the first item has a symbol before setting
      if (cryptoData[0]?.symbol) {
         setSelectedCryptoSymbol(cryptoData[0].symbol.toLowerCase());
      }
    }
    // Reset if cryptoData becomes null or empty
    else if ((!cryptoData || cryptoData.length === 0) && selectedCryptoSymbol) {
        setSelectedCryptoSymbol(null);
    }
  }, [cryptoData, selectedCryptoSymbol]); // Add selectedCryptoSymbol to dependencies if logic depends on it


  // Format price with appropriate decimal places
  const formatPrice = (price: number | null | undefined): string => { // Typed parameter
    if (price === null || price === undefined) return 'N/A'; // Handle null/undefined price
    const priceNum = Number(price);
    if (isNaN(priceNum)) return 'N/A';

    // Use Intl.NumberFormat for better localization and currency formatting
    const formatter = (options: Intl.NumberFormatOptions) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', ...options });

    if (priceNum >= 1000) return formatter({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(priceNum);
    if (priceNum >= 0.01) return formatter({ minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(priceNum);
    return formatter({ minimumFractionDigits: 2, maximumFractionDigits: 8 }).format(priceNum); // More digits for small prices
  };

  // Find the full data object for the selected crypto symbol
  // Type for selectedCrypto will be CryptoItem | undefined
  const selectedCrypto = cryptoData && selectedCryptoSymbol
    ? cryptoData.find(c => c.symbol.toLowerCase() === selectedCryptoSymbol)
    : undefined; // Use undefined for clarity when not found

  // Default values if no crypto is selected or found
  // Type for displayData is CryptoItem or a compatible structure
  const displayData: Partial<CryptoItem> & { symbol: string; name: string } = selectedCrypto || {
    name: 'N/A',
    symbol: '---',
    price_usd: null,
    logo_url: null,
  };

  // Render the logo: Use img tag with logo_url, fallback to DefaultIcon
  const renderLogo = (url: string | null | undefined, alt: string | undefined) => { // Typed parameters
    if (url) {
      // Added error handling for image loading
      return <img
                src={url}
                alt={alt || 'logo'}
                className="w-full h-full object-contain"
                onError={(e) => (e.currentTarget.style.display = 'none')} // Hide broken image icon
             />;
    }
    // Render DefaultIcon component correctly
    return <DefaultIcon />;
  };


  // Handle loading or empty state
  if (!cryptoData) {
      return (
          <div className="bg-zinc-900 rounded-xl p-4 text-gray-400 w-full">
              Loading crypto data...
          </div>
      );
  }
   if (cryptoData.length === 0) {
        return (
            <div className="bg-zinc-900 rounded-xl p-4 text-gray-400 w-full">
                No crypto data available.
            </div>
        );
    }


  return (
    <div className="bg-zinc-900 rounded-xl p-4 w-full max-w-full">
      <div className="flex items-center gap-3">
        {/* Crypto Logo */}
        <div className="bg-zinc-800 rounded-full p-1 w-8 h-8 flex items-center justify-center overflow-hidden text-white flex-shrink-0"> 
          {renderLogo(displayData.logo_url, displayData.name)}
        </div>

        {/* Cryptocurrency Details */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center">
            <span className="text-white font-medium text-base truncate">
              {displayData.name} / {displayData.symbol?.toUpperCase()}
            </span>
          </div>
          <div className="text-gray-400 text-sm">
            {formatPrice(displayData.price_usd)}
          </div>
        </div>
      </div>

      {/* Dropdown */}
      <div className="relative mt-3">
        <div
          className="bg-zinc-800 rounded-lg p-3 flex items-center justify-between cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {/* Use optional chaining in case displayData is the default */}
          <span className="text-white text-sm truncate pr-2">
            {displayData.name} ({displayData.symbol?.toUpperCase()}) - Coins
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-gray-400 transition-transform flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        {/* Dropdown Menu - Iterate over the cryptoData array */}
        {/* cryptoData is guaranteed to be an array here due to checks above */}
        {dropdownOpen && (
          <div className="absolute mt-1 w-full bg-zinc-800 rounded-lg p-2 z-10 max-h-48 overflow-y-auto">
            {cryptoData.map((cryptoItem: CryptoItem) => ( // Explicit type for cryptoItem
              <div
                // Use index as part of the key if symbols might not be unique (unlikely but safer)
                key={`${cryptoItem.symbol}-${cryptoItem.name}`}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-zinc-700 ${selectedCryptoSymbol === cryptoItem.symbol.toLowerCase() ? 'bg-zinc-700' : ''}`}
                onClick={() => {
                  setSelectedCryptoSymbol(cryptoItem.symbol.toLowerCase());
                  setDropdownOpen(false);
                }}
              >
                <div className="bg-zinc-900 rounded-full p-0.5 w-6 h-6 flex items-center justify-center overflow-hidden text-white flex-shrink-0"> 
                  {renderLogo(cryptoItem.logo_url, cryptoItem.name)}
                </div>
                <span className="text-white text-sm truncate">{cryptoItem.name} ({cryptoItem.symbol.toUpperCase()})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoBalance;