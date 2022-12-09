import React from "react";
import { Rnd, RndResizeCallback } from "react-rnd";
import SiderHandle from "./Handle";

interface Props {
  width: number;
  setWidth: (width: number) => void;
}

export function Sider(props: Props) {
  const onResize: RndResizeCallback = (e, dir, elementRef, delta, position) => {
    e.stopPropagation();
    e.preventDefault();
    props.setWidth(elementRef.offsetWidth);
  };

  return (
    <Rnd
      position={{ x: 0, y: 0 }}
      size={{ width: props.width, height: "100%" }}
      disableDragging
      className="overflow-hidden"
      minWidth={200}
      maxWidth="50%"
      onResize={onResize}
      resizeHandleComponent={{ right: <SiderHandle /> }}
      resizeHandleStyles={{ right: { width: "16px" } }}
    >
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 bg-neutral-800"></div>
    </Rnd>
  );
}
