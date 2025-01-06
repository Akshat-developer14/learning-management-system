"use client";
import Heading from "@/app/utils/Heading";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HeroSecond from "@/components/HeroSecond";
import React, { FC, useState } from "react";

const Home = () => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);
  const [route, setRoute] = useState("login");
  
  return (
    <div>
      <Heading
        title="E-Learning"
        description="E-Learning is a platform for students to learn and get help from teachers."
        keywords="Programming, MERN, Redux, Machine Learning, Python"
      />
      <Header 
      open={open}
      setOpen={setOpen}
      activeItem={activeItem}
      route={route}
      setRoute={setRoute}
      />
      <Hero />
      <HeroSecond />
    </div>
  );
};

export default Home;
