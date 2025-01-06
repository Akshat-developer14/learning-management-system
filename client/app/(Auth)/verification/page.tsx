"use client"
import Link from 'next/link';
import React, { useRef, useState } from 'react'
import { VscWorkspaceTrusted } from 'react-icons/vsc';

type VerifyNumber = {
    "0": string;
    "1": string;
    "2": string;
    "3": string;
}

const page = () => {
    const [invalidError, setInvalidError] = useState<boolean>(false)
    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ]

    const [verifyNumber, setVerifyNumber] = useState<VerifyNumber>({
        "0": "",
        "1": "",
        "2": "",
        "3": "",
    })

    const verificationHandler = async () => {
        setInvalidError(true)
    }
    const handleInputChange = (index: number, value: string) => {
        setInvalidError(false)
        const newVerifyNumber = { ...verifyNumber, [index]: value };

        setVerifyNumber(newVerifyNumber)

        if (value === "" && index > 0) {
            inputRefs[index - 1].current?.focus();

        } else if (value.length === 1 && index < 3) {
            inputRefs[index + 1].current?.focus();
        }
    }

    return (
        <div className='h-screen'>
            <h1 className='text-[25px] text-black dark:text-white font-[500] font-Poppins text-center py-2 rounded pt-20'>
                Verify Your Account
            </h1>
            <br />
            <div className='flex justify-center items-center mt-2 w-full'>
                <div className='w-[80px] h-[80px] rounded-full bg-[#497DF2] flex items-center justify-center'>
                    <VscWorkspaceTrusted size={40}/>
                </div>
            </div>
            <br />
            <br />
            <div className='1100px:w-[27%] md:w-[40%] w-[80%] m-auto flex items-center justify-around'>
                {
                    Object.keys(verifyNumber).map((key, index) => (
                        <input
                        type='number'
                        key={key}
                        ref={inputRefs[index]}
                        className={`${invalidError ? "shake border-red-500" : "dark:border-white border-[#0000004a]"} w-[65px] h-[65px] text-black dark:text-white bg-transparent border-[3px] rounded-[10px] px-2 outline-none mt-[10px] font-Poppins text-[18px] text-center  flex items-center justify-center`}
                        placeholder=''
                        maxLength={1}
                        value={verifyNumber[key as keyof VerifyNumber]}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        />
                    ))
                }
            </div>
            <br />
            <br />
            <div className='1100px:w-[27%] md:w-[40%] w-[80%] m-auto flex justify-center'>
                <button className='flex flex-row justify-center items-center py-3 px-6 rounded-full cursor-pointer min-h-[45px] w-full text-[16px] font-Poppins font-semibold bg-[#2190ff]'
                onClick={verificationHandler}
                >
                    Verify OTP
                </button>
            </div>
            <br />
            <h5 className="text-center pt-4 font-Poppins text-[14px] text-black dark:text-white">
                Go back to sign in? <Link href="/signup" className="text-[#2190ff] pl-1 cursor-pointer">SignIn</Link>
            </h5>

        </div>
    )
}

export default page
