"use client";
import { useTheme } from "./Theme-Provider";
import { useState, useEffect } from "react";
import { BiMoon, BiSun } from "react-icons/bi";


export const ThemeSwitcher = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, toggleTheme } = useTheme();
  
    useEffect(() => {
      setMounted(true);
    }, []);
  
    if (!mounted) return null;

    return(
        <div className="flex items-center justify-center mx-4">
            {
                theme === "light" ? (
                    <BiMoon 
                    className="cursor-pointer"
                    fill="black"
                    size={20}
                    onClick={() => toggleTheme()}
                    />
                ) : (
                    <BiSun 
                    className="cursor-pointer"
                    size={20}
                    onClick={() => toggleTheme()}
                    />
                )
            }
        </div>
    );

}