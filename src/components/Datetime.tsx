import { LOCALE } from "@config";

interface DatetimesProps {
  pubDatetime: string | Date;
  modDatetime: string | Date | undefined | null;
}

interface Props extends DatetimesProps {
  size?: "sm" | "lg";
  className?: string;
}

export default function Datetime({
  pubDatetime,
  modDatetime,
  size = "sm",
  className = "",
}: Props) {
  return (
    <div
      className={`flex items-center space-x-2 opacity-80 ${className}`.trim()}
    >
      <PubSvgIcon size={size} />
      <FormattedDatetime
        pubDatetime={pubDatetime}
        modDatetime={modDatetime}
        size={size}
      />
    </div>
  );
}

const PubSvgIcon = ({ size }: { size: "sm" | "lg" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${
      size === "sm" ? "scale-90" : "scale-100"
    } inline-block h-6 w-6 min-w-[1.375rem] fill-skin-base`}
    aria-hidden="true"
  >
    <path d="M19 4h-3V2h-2v2h-4V2H8v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 20V7h14V6l.002 14H5z"></path>
    <path d="M7 10v2h10V9H7z"></path>
  </svg>
);

const ModSvgIcon = ({ size }: { size: "sm" | "lg" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${
      size === "sm" ? "scale-90" : "scale-100"
    } inline-block h-6 w-6 min-w-[1.375rem] fill-skin-base`}
    aria-hidden="true"
  >
    <path d="M19 4h-3V2h-2v2h-4V2H8v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 20V7h14V6l.002 14H5z"></path>
    <path d="m15.628 12.183-1.8-1.799 1.37-1.371 1.8 1.799zm-7.623 4.018V18h1.799l4.976-4.97-1.799-1.799z"></path>
  </svg>
);

const FormattedDatetime = ({
  pubDatetime,
  modDatetime,
  size = "sm",
}: DatetimesProps & { size?: "sm" | "lg" }) => {
  const pubDate = new Date(pubDatetime);
  const modDate = modDatetime ? new Date(modDatetime) : null;

  const pubDateString = pubDate.toLocaleDateString(LOCALE.langTag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const modDateString = modDate?.toLocaleDateString(LOCALE.langTag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <span
      className={`italic ${size === "sm" ? "text-sm" : "text-base"} flex items-center space-x-2`}
    >
      <time dateTime={pubDate.toISOString()}>{pubDateString}</time>
      {modDate && modDate > pubDate && (
        <>
          <ModSvgIcon size={size} />
          <span>Updated:</span>
          <time dateTime={modDate.toISOString()}>{modDateString}</time>
        </>
      )}
    </span>
  );
};
