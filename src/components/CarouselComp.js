import React from 'react'
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Carousel from 'react-bootstrap/Carousel';
import img1 from '../../static/boy-studying.jpg';
import img2 from '../../static/studying-student.png';
import img3 from '../../static/college-student.png';

function CarouselComp() {

  const [width, setWidth] = useState(window.innerWidth);

  const updateDimensions = () => {
      setWidth(window.innerWidth);
  }

  useEffect(() => {
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div style={{alignContent:'center', padding: width/30 }}>
      <h4 style={{textAlign:'center'}}>Kiran Foundation</h4>
      <Carousel>
        <Carousel.Item>
          <img style={{maxHeight:(2/5)*window.innerWidth}}
            className="d-block w-100"
            src={img1}
            alt="First slide"
          />
          <Carousel.Caption>
            <div style={{height:width/10}}>
                <h3>First slide label</h3>
                <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
            </div>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img style={{maxHeight:(2/5)*window.innerWidth}}
            className="d-block w-100"
            src={img2}
            alt="Second slide"
          />
          <Carousel.Caption>
            <h3>Second slide label</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img style={{maxHeight:(2/5)*window.innerWidth}}
            className="d-block w-100"
            src={img3}
            alt="Third slide"
          />
          <Carousel.Caption>
            <h3>Kiran Shakti</h3>
            <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    </div>
  )
}

export default CarouselComp
