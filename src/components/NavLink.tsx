import { useMemo, useState, type FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export interface Props {
  title: string;
  href: string;
}

export const NavLink: FC<Props> = ({ title, href }: Props) => {
  const path = useMemo(
    () => (typeof window !== "undefined" ? window.location.pathname : ""),
    []
  );

  const [currentHover, setCurrentHover] = useState<string>("");
  return (
    <motion.li
      onMouseEnter={() => {
        setCurrentHover(href);
      }}
      className="flex flex-col"
      onMouseLeave={() => {
        setCurrentHover("");
      }}
    >
      <motion.a href={href}>{title}</motion.a>

      {(href === path || currentHover === href) && (
        <AnimatePresence>
          <motion.span
            id="yxyx"
            animate={{
              x: [-10, -5, 0, 2.5, 0],
              opacity: [0, 0.5, 0.7, 0.9, 1],
            }}
            className={clsx("h-0.5 rounded-lg w-full bg-white", {})}
          />
        </AnimatePresence>
      )}
    </motion.li>
  );
};
