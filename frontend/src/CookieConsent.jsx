import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const consentCookie = cookies.find((row) => row.startsWith("cookieConsent="));
    if (!consentCookie) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    document.cookie = "cookieConsent=true; path=/; max-age=31536000"; // 1 year
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-between items-center z-50">
      <span>We use cookies to enhance your experience. Accept cookies</span>
      <button
        onClick={handleAccept}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Accept
      </button>
    </div>
  );
}
