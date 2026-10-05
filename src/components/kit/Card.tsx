import { forwardRef, type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Chrome band (teal → coral → gold) along the top edge. Off for rows and secondary cards. */
  band?: boolean;
  /** White surface (inputs, mini tiles) instead of porcelain. */
  raised?: boolean;
}

/** Porcelain card: 1px border, radius 18, sm shadow, optional chrome band. */
const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { band = true, raised = false, className = "", children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        "relative rounded-ft-lg border border-ft-border shadow-ft-sm",
        raised ? "bg-ft-surface-raised" : "bg-ft-surface",
        band ? "ft-band" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
});

export default Card;
