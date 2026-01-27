import React from 'react'
import { useEffect, useState } from 'react'
import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import TrustBar from "../components/TrustBar"
import FeaturedCategories from "../components/FeaturedCategories"
import Services from "../components/Services"
import Products from "../components/Products"
import About from "../components/About"
import ArtisanSpotlight from "../components/ArtisanSpotlight"
import Newsletter from "../components/Newsletter"
import GlobalMission from "../components/GlobalMission"
import Contact from "../components/Contact"
import Footer from "../components/Footer"

const Homepage = () => {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  return (
    <div>
      <Navbar scrolled={scrolled} />
      <Hero />
      <TrustBar />
      <FeaturedCategories />
      <Services />
      <Products />
      <ArtisanSpotlight />
      <Newsletter />
      <GlobalMission />
      <About />
      <Contact />
      <Footer />
    </div>
  )
}

export default Homepage