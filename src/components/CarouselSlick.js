import React from 'react';
import { useState, useEffect } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {FcLeft,FcRight } from "react-icons/fc";

const hotelCards = [
    {
      imageSrc:
        'https://images.unsplash.com/photo-1559508551-44bff1de756b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80',
      title: 'Studio Room',
      description: 'Lorem ipsum dolor sit amet, consectur dolori',
      pricingText: 'USD 50/Day',
      features: ['Free Wifi', 'Free breakfast','Discounted Meals'],
    },
    {
      imageSrc:
        'https://images.unsplash.com/photo-1616940844649-535215ae4eb1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
      title: 'Deluxe Room',
      description: 'Lorem ipsum dolor sit amet, consectur dolori',
      pricingText: 'USD 80/Day',
      features: ['Free Wifi', 'Free breakfast','Discounted Meals'],
    },
    {
      imageSrc:
        'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=872&q=80',
      title: 'King Room',
      description: 'Lorem ipsum dolor sit amet, consectur dolori',
      pricingText: 'USD 150/Day',
      features: ['Free Wifi', 'Free breakfast', 'Discounted Meals'],
    },
    {
      imageSrc:
        'https://images.unsplash.com/photo-1461092746677-7b4afb1178f6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
      title: 'Royal Suite',
      description: 'Lorem ipsum dolor sit amet, consectur dolori',
      pricingText: 'USD 299/Day',
      features: [
        'Free Wifi',
        'Free breakfast',
        'Discounted Meals',
      ],
    },
    {
        imageSrc:
          'https://images.unsplash.com/photo-1559508551-44bff1de756b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80',
        title: 'Studio Room',
        description: 'Lorem ipsum dolor sit amet, consectur dolori',
        pricingText: 'USD 50/Day',
        features: ['Free Wifi', 'Free breakfast','Discounted Meals'],
      },
      {
        imageSrc:
          'https://images.unsplash.com/photo-1559508551-44bff1de756b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80',
        title: 'Studio Room',
        description: 'Lorem ipsum dolor sit amet, consectur dolori',
        pricingText: 'USD 50/Day',
        features: ['Free Wifi', 'Free breakfast','Discounted Meals'],
      }
  ]

var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1
}

function CarouselSlick() {
    const  isBrowser = typeof window !== "undefined";
    const [width, setWidth] = isBrowser ? useState(window.innerWidth) : useState(1080);

    const updateDimensions = () => {
            setWidth(window.innerWidth);
    }

    useEffect(() => {
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    const [sliderRef, setSliderRef] = useState(null)

    return (
        <div className='content'>
            <button onClick={sliderRef?.slickPrev} style={{borderRadius:'20px'}}>
                <FcLeft/>
            </button>
            <button onClick={sliderRef?.slickNext} style={{borderRadius:'20px'}}>
                <FcRight/>
            </button>
            <Slider ref={setSliderRef} {...settings}>
                {hotelCards.map((card,index)=>{
                    return (
                        <div key={index}>
                            <h2>{card.title}</h2>
                            <img src={card.imageSrc} alt={card.title} width={width/(3.1)} height={width/5}/>
                            <p>{card.description}</p>
                            <ul>
                                {card.features.map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                ))}
                            </ul>
                            <button className='btn' style={{color:'blue'}}>Buy Now</button>
                        </div>
                    );
                })}
            </Slider>
        </div>    
    )
}

export default CarouselSlick