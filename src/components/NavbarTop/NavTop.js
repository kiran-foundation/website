import React, { useContext, useState } from "react"
import { Link } from "gatsby"
import MenuContext from "../MenuContext"
import { motion } from "framer-motion"
import { menuItems } from "./NavTopConstants"
import { UseSiteMetadata } from "../../hooks/useSiteMetadata"
import useFeaturedProduct from "../../hooks/use-featured-product"
import { FiChevronDown as Chevron } from "react-icons/fi"
import {
  NavbarStyles,
  NavTopLevel,
  SubNavStyles,
  LogoStyles,
} from "./NavTopStyles"
import {
  subMenuNavVariants,
} from "../NavModule/NavAnim"

function Navbar() {

    const featuredProduct = useFeaturedProduct()

    const [isOpen, setNav] = useContext(MenuContext)
    const [subNavIsOpen, setSubNav] = useState(false)
  
    const toggleNav = () => {
      setNav((isOpen) => !isOpen)
    }
  
    const toggleSubNav = () => {
      setSubNav((subNavIsOpen) => !subNavIsOpen)
    }
  
    const { title } = UseSiteMetadata()  

  return (
    <NavbarStyles>
        {/* <div className="nav">
            <div className="container">
                {title && (
                <LogoStyles>
                <Link to="/">
                    {title}
                    <span>.</span>
                </Link>
                </LogoStyles>
            )}
            </div>
        </div> */}
        <NavTopLevel>
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                onClick={toggleNav}
                onKeyDown={toggleNav}
                to={item.path}
                activeClassName="menu__item--active"
              >
                {item.text}
                <span>.</span>
              </Link>
            </li>
          ))}
          {featuredProduct && (
            <li className={subNavIsOpen ? "open" : "closed"}>
              <button
                type="button"
                onClick={toggleSubNav}
                onKeyDown={toggleSubNav}
              >
                Products<span>.</span>
                <Chevron />
              </button>

              <SubNavStyles
                initial="closed"
                animate={subNavIsOpen ? "open" : "closed"}
                variants={subMenuNavVariants}
              >
                <li>
                  <Link
                    onClick={toggleNav}
                    onKeyDown={toggleNav}
                    to="/products"
                  >
                    All Products<span>.</span>
                  </Link>
                </li>
                <hr />
                {featuredProduct.map((item, index) => {
                  const { gatsbyPath, title } = item
                  return (
                    <li key={index}>
                      <Link
                        onClick={toggleNav}
                        onKeyDown={toggleNav}
                        to={gatsbyPath}
                      >
                        {title}
                        <span>.</span>
                      </Link>
                    </li>
                  )
                })}
              </SubNavStyles>
            </li>
          )}
        </NavTopLevel>
    </NavbarStyles>
  )
}

export default Navbar