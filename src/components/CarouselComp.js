import React from 'react'
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Carousel from 'react-bootstrap/Carousel';
import img1 from '../../static//imp/1.jpg';
import img2 from '../../static//imp/2.jpg';
import img3 from '../../static//imp/3.jpg';
import img4 from '../../static//imp/4.jpg';
import img5 from '../../static//imp/5.jpg';
import img6 from '../../static//imp/6.jpg';


function CarouselComp() {

  // const isBrowser = typeof window !== "undefined";
  // const myWidth = isBrowser ? window.innerWidth : 1080;

  // const [width, setWidth] =  useState(myWidth);

  //  const updateDimensions = () => {
  //     setWidth(window.innerWidth);
  //   }   
 
  // useEffect(() => {
  //     window.addEventListener("resize", updateDimensions);
  //     return () => window.removeEventListener("resize", updateDimensions);
  // }, []);

  return (
    <div style={{alignContent:'center' }}>
      <Carousel 
        controls={false} 
        fade={true} 
        pause={false}
        interval={2000}
      >
        <Carousel.Item>
          <img 
            className="d-block w-100"
            src={img1}
            alt="I am Possible"/>
        </Carousel.Item>
        <Carousel.Item>
          <img 
            className="d-block w-100"
            src={img2}
            alt="I am Possible"/>
        </Carousel.Item>
        <Carousel.Item>
          <img 
            className="d-block w-100"
            src={img3}
            alt="I am Possible"/>
        </Carousel.Item>
        <Carousel.Item>
          <img 
            className="d-block w-100"
            src={img4}
            alt="I am Possible"/>
        </Carousel.Item>
      </Carousel>
    </div>
  )
}

export default CarouselComp
