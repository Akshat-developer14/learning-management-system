"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiFillGithub,
} from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  setRoute: (route: string) => void;
};

const schema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .required("Please enter your email"),
  password: Yup.string().required("Please enter your password").min(6),
});

const Login: React.FC<Props> = ({ setRoute, setOpen }) => {
  const [show, setShow] = useState(false);
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: schema,
    onSubmit: async ({ email, password }) => {
      console.log( email, password);
    },
  });

  const { errors, touched, values, handleChange, handleSubmit } = formik;

  return (
    <div className="w-full">
      <h1 className="text-[25px] text-black dark:text-white font-[500] font-Poppins text-center py-2 rounded">Login with E-Learning</h1>
      <form onSubmit={handleSubmit}>
        <label className={`text-[16px] font-Poppins text-black dark:text-white`} htmlFor="email">
          Enter your email
        </label>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          id="email"
          placeholder="example@mail.com"
          className={`${errors.email && touched.email && "border-red-500"} w-full text-black dark:text-white bg-transparent border rounded h-[40px] px-2 outline-none mt-[10px] font-Poppins`}
        />
        {errors.email && touched.email && (
          <span className="text-red-500 pt-2 block">{errors.email}</span>
        )}
        <div className="w-full mt-5 relative mb-1">
          <label className={`text-[16px] font-Poppins text-black dark:text-white`} htmlFor="email">
            Enter your password
          </label>
          <input
            type={!show ? "password" : "text"}
            name="password"
            value={values.password}
            onChange={handleChange}
            id="password"
            placeholder="******"
            className={`${
              errors.password && touched.password && "border-red-500"
            } w-full text-black dark:text-white bg-transparent border rounded h-[40px] px-2 outline-none mt-[10px] font-Poppins`}
          />
          {!show ? (
            <AiOutlineEyeInvisible
              className="absolute bottom-2.5 right-2 z-1 cursor-pointer text-black dark:text-white"
              size={20}
              onClick={() => setShow(true)}
            />
          ) : (
            <AiOutlineEye
              className="absolute bottom-2.5 right-2 z-1 cursor-pointer text-black dark:text-white"
              size={20}
              onClick={() => setShow(false)}
            />
          )}
        </div>
          {errors.password && touched.password && (
            <span className="text-red-500 pt-2 block">{errors.password}</span>
          )}
        <div className={`w-full mt-5`}>
          <input type="submit" value="Login" className={`flex flex-row justify-center items-center py-3 px-6 rounded-full cursor-pointer min-h-[45px] w-full text-[16px] font-Poppins font-semibold bg-[#2190ff]`} />
        </div>
        <br />
        <h5 className="text-center pt-4 font-Poppins text-[14px] text-black dark:text-white">
          Or join with
        </h5>
        <div className="flex items-center justify-center my-3">
          <FcGoogle size={30} className="cursor-pointer mr-2" />
          <AiFillGithub size={30} className="cursor-pointer ml-2" />
        </div>
        <h5 className="text-center pt-4 font-Poppins text-[14px]">
          Don't have an account?{" "}
          <Link href="/signup"
            className="text-[#2190ff] pl-1 cursor-pointer"
          >
            Sign Up
          </Link>
        </h5>
      </form>
      <br />
    </div>
  );
};
export default Login;
