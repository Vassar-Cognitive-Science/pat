import { useState } from "react";
import "./modal.css";

export default function ClearButton({
  handleClearClick,
}: {
  handleClearClick: () => void;
}) {
  const [showRestartModal, setShowRestartModal] = useState<boolean>(false);

  const handleRestartClick = () => {
    setShowRestartModal(true);
  };

  const handleRestartConfirmClick = () => {
    setShowRestartModal(false);
    handleClearClick();
  };

  const handleRestartCancelClick = () => {
    setShowRestartModal(false);
  };

  return (
    <>
      <button
        className="text-pat-light font-bold py-2 px-4"
        onClick={handleRestartClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="26"
          viewBox="0 0 24 26"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.2929 1.29287C16.981 0.679258 17.0237 0.695238 17.4142 1.08576L21.7071 5.29287C22.0976 5.68339 22.0976 6.31656 21.7071 6.70708L17.4142 10.9142C17.0237 11.3047 16.6834 11.0976 16.2929 10.7071C15.9024 10.3166 15.6095 9.8905 16 9.49998L19.5858 5.99997L16 2.49998C15.6095 2.10945 15.5 1.99998 16.2929 1.29287Z"
            fill="#FCE5B9"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7 8C6.20435 8 5.44129 8.31607 4.87868 8.87868C4.31607 9.44129 4 10.2044 4 11V13.5C4 14.0523 4 14 3 14C2 14 2 14.0523 2 13.5V11C2 9.67392 2.52678 8.40215 3.46447 7.46447C4.40215 6.52678 5.67392 6 7 6L21 5C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7L7 8Z"
            fill="#FCE5B9"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.70711 15.2929C9.5 16 9.39052 16.1095 9 16.5L5.41421 20L9 23.5C9.39052 23.8905 9.45476 23.9594 8.70711 24.7071C8.08601 25.3282 7.97631 25.3047 7.58579 24.9142L3.29289 20.7071C2.90237 20.3166 2.90237 19.6834 3.29289 19.2929L7.58579 15.0858C7.97631 14.6952 8 14.6623 8.70711 15.2929Z"
            fill="#FCE5B9"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M22 12C23 12 23 11.9477 23 12.5V17C23 18.3261 22.4732 19.5978 21.5355 20.5355C20.5979 21.4732 19.3261 22 18 22L4 21C3.44772 21 3 20.5523 3 20C3 19.4477 3.44772 19 4 19L18 20C18.7956 20 19.5587 19.6839 20.1213 19.1213C20.6839 18.5587 21 17.7956 21 17V12.5C21 11.9477 21 12 22 12Z"
            fill="#FCE5B9"
          />
        </svg>
      </button>
      {showRestartModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed z-5 inset-0 bg-gray-900 bg-opacity-75"></div>
            <div className="modal bg-pat-modal bg-opacity-80 z-10 rounded-lg p-24 relative">
              <p className="mb-4 text-pat-light font-tag">Start a new chat?</p>
              <div className="absolute inset-x-0 bottom-[-20px] text-center">
                <button
                  className="bg-pat-modal hover:bg-pat-purple text-pat-light font-tag font-bold py-2 px-4 rounded-full border-color-pat-light border mr-10"
                  onClick={handleRestartCancelClick}
                >
                  No
                </button>
                <button
                  className="bg-pat-modal hover:bg-pat-purple text-pat-light font-tag font-bold py-2 px-4 rounded-full border-color-pat-light border"
                  onClick={handleRestartConfirmClick}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
