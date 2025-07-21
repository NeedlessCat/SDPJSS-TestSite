import React from "react";
import { assets } from "../assets/assets";

const About = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          ABOUT <span className="text-gray-700 font-medium">US</span>
        </p>
      </div>
      <div className="my-10 flex flex-col md:flex-row gap-12">
        <img
          className="w-full md:max-w-[360px] object-cover"
          src={assets.about}
          alt="About Us"
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600">
          <p>
            Welcome to PrasadHub, a platform dedicated to transforming the
            spirit of devotion into meaningful social change. Our mission is to
            bridge the gap between religious offerings and impactful community
            support by channeling donations into initiatives that uplift
            underprivileged families. At PrasadHub, we believe that every act of
            giving has the power to make a difference, whether it’s supporting
            education, improving healthcare, or organizing events that bring
            people together in harmony.{" "}
          </p>
          <p>
            Our journey began with the vision of creating a seamless way for
            individuals to contribute to causes that matter while honoring their
            faith and traditions. By leveraging modern technology and
            transparent processes, we ensure that every contribution creates a
            tangible impact. PrasadHub is not just about donations; it’s about
            building a compassionate community where devotion meets purpose, and
            where small acts of generosity collectively lead to big changes in
            society.
          </p>
        </div>
      </div>
      <div className="mt-16 bg-primary py-10 px-4 md:px-8 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Our Values
        </h2>
        <p className="text-sm text-gray-200 max-w-4xl mx-auto">
          Our values are rooted in compassion, transparency, and empowerment. We
          believe in fostering a culture of giving that transcends boundaries,
          where every contribution is treated with integrity and directed toward
          meaningful change. Guided by the principles of inclusivity and
          community upliftment, we strive to create a platform that unites
          devotion with purpose. Our commitment to accountability ensures that
          every donor trusts the impact of their support, as we work together to
          build a society that thrives on kindness, generosity, and collective
          progress.
        </p>
      </div>
    </div>
  );
};

export default About;
