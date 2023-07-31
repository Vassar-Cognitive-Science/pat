import "./style.css";

interface ChatMessageProps {
  message: string;
  sender: "You" | "Pat";
  loading?: boolean;
}

export default function ChatMessage({
  message,
  sender,
  loading = false,
}: ChatMessageProps) {
  const bg = sender === "You" ? "bg-pat-purple" : "bg-transparent";
  const border =
    sender === "You" ? "border-0" : "border-2 border-pat-highlight";
  const textColor = sender === "You" ? "text-white" : "text-pat-highlight";
  const font = sender === "You" ? "font-you" : "font-pat";
  const align = sender === "You" ? "justify-end" : "justify-start";
  const paragraphs = message.split("\n");
  return (
    <div className={`flex flex-row ${align}`}>
      <div className={`flex flex-row w-11/12 ${align}`}>
        {sender === "Pat" && (
          <div className="mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
            >
              <g clip-path="url(#clip0_5_205)">
                <g filter="url(#filter0_b_5_205)">
                  <path
                    d="M18 33.6098C26.621 33.6098 33.6098 26.621 33.6098 18C33.6098 9.37897 26.621 2.39024 18 2.39024C9.37898 2.39024 2.39026 9.37897 2.39026 18C2.39026 26.621 9.37898 33.6098 18 33.6098Z"
                    fill="#FCE5B9"
                  />
                </g>
                <path
                  d="M20.5366 15.6585C23.1229 15.6585 25.2195 13.5619 25.2195 10.9756C25.2195 8.3893 23.1229 6.29268 20.5366 6.29268C17.9503 6.29268 15.8536 8.3893 15.8536 10.9756C15.8536 13.5619 17.9503 15.6585 20.5366 15.6585Z"
                  fill="#151422"
                />
                <path
                  d="M27.0167 30.7423C26.9639 30.3397 26.9366 29.9291 26.9366 29.5122C26.9366 28.9429 26.9874 28.3855 27.0847 27.8443L27.1708 26.5854C27.1708 21.4127 22.9775 17.2195 17.8049 17.2195C13.9059 17.2195 10.5823 19.6104 9.17271 22.999L9.17254 22.9984C8.3451 24.7355 6.99843 26.1776 5.33325 27.124"
                  fill="#151422"
                />
                <path
                  d="M27.0167 30.7423C26.9639 30.3397 26.9366 29.9291 26.9366 29.5122C26.9366 28.9429 26.9874 28.3855 27.0847 27.8443L27.1708 26.5854C27.1708 21.4127 22.9775 17.2195 17.8049 17.2195C13.9059 17.2195 10.5823 19.6104 9.17271 22.999L9.17254 22.9984C8.3451 24.7355 6.99843 26.1776 5.33325 27.124"
                  stroke="#151422"
                  stroke-miterlimit="10"
                />
                <path
                  d="M5.33301 27.1241C8.16779 31.0527 12.7853 33.6098 18 33.6098C21.3592 33.6098 24.4706 32.5486 27.0173 30.7433L27.0166 30.7423"
                  fill="#151422"
                />
                <path
                  d="M23.8023 9.53354C23.9013 9.73358 23.9859 9.95371 24.0487 10.1951C24.4135 11.5962 23.5895 12.9079 23.4634 13.122"
                  fill="#FCE5B9"
                />
                <path
                  d="M23.8023 9.53354C23.9013 9.73358 23.9859 9.95371 24.0487 10.1951C24.4135 11.5962 23.5895 12.9079 23.4634 13.122"
                  stroke="#FCE5B9"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                />
                <path
                  d="M22.0975 7.85365C22.1743 7.89007 22.4352 8.01845 22.7472 8.26035L22.0975 7.85365Z"
                  fill="#FCE5B9"
                />
                <path
                  d="M22.0975 7.85365C22.1743 7.89007 22.4352 8.01845 22.7472 8.26035"
                  stroke="#FCE5B9"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                />
                <path
                  d="M23.6586 22.2927C24.1302 22.8877 24.8293 23.6778 24.8293 25.4146C24.8293 26.1951 24.7908 26.8935 24.6342 28.1463C24.4391 29.7073 24.806 30.854 24.8293 31.6585"
                  fill="#FCE5B9"
                />
                <path
                  d="M23.6586 22.2927C24.1302 22.8877 24.8293 23.6778 24.8293 25.4146C24.8293 26.1951 24.7908 26.8935 24.6342 28.1463C24.4391 29.7073 24.806 30.854 24.8293 31.6585"
                  stroke="#FCE5B9"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                />
                <path
                  d="M18 35C27.3888 35 35 27.3888 35 18C35 8.61116 27.3888 1 18 1C8.61116 1 1 8.61116 1 18C1 27.3888 8.61116 35 18 35Z"
                  stroke="#FCE5B9"
                  stroke-miterlimit="10"
                />
              </g>
              <defs>
                <filter
                  id="filter0_b_5_205"
                  x="-1.60974"
                  y="-1.60976"
                  width="39.2195"
                  height="39.2195"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feGaussianBlur in="BackgroundImageFix" stdDeviation="2" />
                  <feComposite
                    in2="SourceAlpha"
                    operator="in"
                    result="effect1_backgroundBlur_5_205"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_backgroundBlur_5_205"
                    result="shape"
                  />
                </filter>
                <clipPath id="clip0_5_205">
                  <rect width="36" height="36" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        )}
        <div
          className={`${bg} ${textColor} ${border} p-3 rounded-md mb-2 chat-message print:text-black print:border-black`}
        >
          {loading && (
            <div
              className="dot-elastic mt-3 mb-3"
              style={{ marginLeft: "15px" }}
            ></div>
          )}
          {!loading &&
            paragraphs.map((paragraph, index) => (
              <p key={index} className={`text-md mb-2 ${font}`}>
                {paragraph}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}
