import React, { FC } from 'react'
import { BiSearch } from 'react-icons/bi';

type Props = {}

const HeroSecond: FC<Props> = (props: Props) => {
  return (
    <div className='h-screen flex flex-col items-center justify-center'>
      <div className='mb-14 font-Poppins tracking-widest text-2xl text-center 1100px:mx-auto md:mx-6 mx-4 text-stone-900 dark:text-white'>
        Search courses for yourself such as Web Development or Artifical Intelligence
      </div>
        <div className='flex gap-4'>
        <BiSearch className='dark:text-white text-gray-950 m-1' size={30}/>
        <input
        type='search'
        placeholder='Search Courses...'
        className='bg-transparent border dark:border-none rounded-[5px] dark:bg-[#575757] dark:placeholder:text-[#ffffffdd] p-2 w-full h-full outline-none shadow'
        />
        </div>
    </div>
  )
}
export default HeroSecond;