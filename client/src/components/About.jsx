import React from 'react'
import Testimonies from './Testimonies.jsx'

const About = () => {
  return (
    <div>
        <Testimonies/>
        <section id="about" class="py-20 px-8 bg-slate-100">
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div class=" bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl  flex items-center justify-center text-9xl  p-2 ">
            <img src="https://fatherlandgazette.com/wp-content/uploads/2022/06/Bata-Drummer-2-683x1024.jpg" alt=""  className='h-96 object-contain'/>
        </div>

        <div>
            <h2 class="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Preserving Yoruba Heritage
            </h2>
            <p class="text-slate-700 mb-4 leading-relaxed">
                At ApexSore Drums, we are dedicated to preserving the rich musical heritage of the Yoruba people. Each drum is handcrafted by skilled artisans using traditional techniques passed down through generations.
            </p>
            <p class="text-slate-700 mb-4 leading-relaxed">
                Our drums are made from premium African hardwoods and authentic animal hides, ensuring authentic sound quality and durability. Whether you're a professional musician, cultural enthusiast, or collector, we have the perfect drum for you.
            </p>
            <p class="text-slate-700 mb-6 leading-relaxed">
                We ship nationwide across Nigeria and internationally, bringing the soul of Yoruba percussion to the world.
            </p>
            <a href="#contact" class="bg-slate-900 text-white px-10 py-4 rounded-lg text-lg font-bold hover:bg-slate-800 transition-colors inline-block shadow-lg hover:shadow-xl">
                Contact Us
            </a>
        </div>

    </div>
</section>
    </div>
  )
}

export default About