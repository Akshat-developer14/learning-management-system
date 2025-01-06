import Image from "next/image";
import React, { FC } from "react";

type Props = {};

const Hero: FC<Props> = (props: Props) => {
  return (
    <div className="w-full lg:flex items-center">
      <div className="flex justify-center items-center w-full lg:text-8xl md:text-5xl text-3xl tracking-wider h-screen text-slate-950 font-Poppins text-center dark:text-white 1100px:px-44 md:px-14 px-4 relative">
        <span className="text-gradient">
          Make yourself UpSkill through our E-Learning platform.
        </span>
      </div>
      <br />
      <br />
    </div>
  );
};
export default Hero;
