import * as React from "react"
import { useState,useEffect } from "react"
import NavModule from "./NavModule/NavModule"
import NavTop from "./NavbarTop/NavTop"
import AnimMain from "./AnimMain/AnimMain"
import Footer from "./Footer/Footer"
import { motion } from "framer-motion"
import { GlobalStyle } from "../styles/GlobalStyles"

const Layout = ({ children }) => {

  const [width, setWidth] = useState(window.innerWidth);

  const updateDimensions = () => {
      setWidth(window.innerWidth);
  }

  useEffect(() => {
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <>
      <GlobalStyle />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.75 }}
      >
        
        <NavModule/>

        <AnimMain>
          {children}
          <Footer />
        </AnimMain>
      </motion.div>
    </>
  )
}

export default Layout
